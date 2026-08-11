// TimerFace Rush — fallback facial

// ---------- FALLBACK COM ANÁLISE DE REGIÕES (OLHOS, BOCA, SOBRANCELHAS) ----------
function iniciarDeteccaoManual() {
    if (deteccaoAtiva) return;
    deteccaoAtiva = true;
    const geracao = ++deteccaoGeracao;
    state.manualFallback = true;
    // O detector alternativo não usa landmarks para calibrar um rosto neutro.
    calibracaoFacial.amostras = 20;
    calibracaoFacial.pronta = true;
    atualizarCardExpressaoInicial();
    console.log('⚠️ Fallback com análise de regiões ativado');
    detectarManual(geracao);
}

function capturarMelhorMomento() {
    const video = getVideoElement();
    const partidaEmAndamento = state.etapa !== 'INICIAL' && state.etapa !== 'FINALIZADO';
    if (!partidaEmAndamento || !video || video.readyState < 2 || !video.videoWidth) return;
    const largura = Math.min(640, video.videoWidth);
    const altura = Math.round(largura * video.videoHeight / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    const contexto = canvas.getContext('2d');
    contexto.translate(largura, 0);
    contexto.scale(-1, 1);
    contexto.drawImage(video, 0, 0, largura, altura);
    state.melhores_momentos.push(canvas.toDataURL('image/jpeg', 0.72));
}

function iniciarCapturasMelhoresMomentos() {
    if (state.captura_interval) clearInterval(state.captura_interval);
    state.melhores_momentos = [];
    capturarMelhorMomento();
    state.captura_interval = setInterval(capturarMelhorMomento, 3000);
}

function pararCapturasMelhoresMomentos() {
    if (!state.captura_interval) return;
    clearInterval(state.captura_interval);
    state.captura_interval = null;
}

function reproduzirTimelapse() {
    const fotos = state.melhores_momentos;
    if (!fotos.length) return;
    if (state.timelapse_interval) clearInterval(state.timelapse_interval);
    let indice = 0;
    const imagem = document.getElementById('timelapseImagem');
    const contador = document.getElementById('timelapseContador');
    const mostrarFrame = () => {
        imagem.src = fotos[indice];
        contador.textContent = `${indice + 1}/${fotos.length}`;
        indice = (indice + 1) % fotos.length;
    };
    mostrarFrame();
    if (fotos.length > 1) state.timelapse_interval = setInterval(mostrarFrame, 220);
}

function mostrarMelhoresMomentos() {
    if (!state.melhores_momentos.length) return;
    showOverlay('melhoresMomentosOverlay');
    reproduzirTimelapse();
}

function fecharMelhoresMomentos() {
    if (state.timelapse_interval) clearInterval(state.timelapse_interval);
    state.timelapse_interval = null;
    hideOverlay('melhoresMomentosOverlay');
}

function carregarImagem(src) {
    return new Promise((resolve, reject) => {
        const imagem = new Image();
        imagem.onload = () => resolve(imagem);
        imagem.onerror = reject;
        imagem.src = src;
    });
}

async function baixarTimelapse() {
    if (!state.melhores_momentos.length || !window.MediaRecorder) {
        document.getElementById('timelapseAviso').textContent = 'Seu navegador não oferece exportação de vídeo.';
        return;
    }
    const primeira = await carregarImagem(state.melhores_momentos[0]);
    const canvas = document.createElement('canvas');
    canvas.width = primeira.naturalWidth;
    canvas.height = primeira.naturalHeight;
    const contexto = canvas.getContext('2d');
    const opcoes = MediaRecorder.isTypeSupported?.('video/webm;codecs=vp8')
        ? { mimeType: 'video/webm;codecs=vp8' }
        : {};
    const gravador = new MediaRecorder(canvas.captureStream(12), opcoes);
    const partes = [];
    gravador.ondataavailable = evento => { if (evento.data.size) partes.push(evento.data); };
    const concluido = new Promise(resolve => gravador.onstop = resolve);
    gravador.start();
    for (const foto of state.melhores_momentos) {
        const imagem = await carregarImagem(foto);
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
        await new Promise(resolve => setTimeout(resolve, 220));
    }
    gravador.stop();
    await concluido;
    const url = URL.createObjectURL(new Blob(partes, { type: 'video/webm' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `timerface-rush-${Date.now()}.webm`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function detectarManual(geracao = deteccaoGeracao) {
    if (geracao !== deteccaoGeracao || !state.camera_ativa) {
        deteccaoAtiva = false; 
        return; 
    }
    const agora = performance.now();
    const intervaloMinimo = window.innerWidth < 768 ? 150 : 110;
    if (agora - ultimaInferenciaManual < intervaloMinimo) {
        state.animation_id = requestAnimationFrame(() => detectarManual(geracao));
        return;
    }
    ultimaInferenciaManual = agora;
    state.animation_id = requestAnimationFrame(() => detectarManual(geracao));
    const video = getVideoElement();
    const { canvas, ctx } = getCanvasContext();
    
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        try {
            state.ultima_deteccao = Date.now();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const w = canvas.width;
            const h = canvas.height;
            
            // ====== DEFINE AS REGIÕES DO ROSTO ======
            // Região central onde o rosto deve estar
            const centroX = w / 2;
            const centroY = h / 2;
            const raioBusca = Math.min(w, h) * 0.35;
            
            // Extrai pixels da região central
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            
            // Encontra a região com mais cor de pele
            let totalSkin = 0;
            let skinSumX = 0, skinSumY = 0;
            
            // Amostragem eficiente - pula pixels para performance
            const mobile = window.innerWidth < 768;
            const step = mobile ? 6 : 4;
            const minimoPixelsPele = mobile ? 70 : 140;
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    const idx = (y * w + x) * 4;
                    const r = data[idx], g = data[idx+1], b = data[idx+2];
                    
                    // Detecção de pele melhorada (para tons variados)
                    const maxCor = Math.max(r, g, b);
                    const minCor = Math.min(r, g, b);
                    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
                    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
                    const regraRGB = (
                        r > 60 && g > 30 && b > 20 &&
                        r > g && r > b &&
                        Math.abs(r - g) > 10 &&
                        maxCor - minCor > 15
                    );
                    const regraYCbCr = cb >= 75 && cb <= 135 && cr >= 125 && cr <= 180 && (r + g + b) > 90;
                    const isSkin = regraRGB || regraYCbCr;
                    
                    if (isSkin) {
                        const dist = Math.sqrt((x - centroX)**2 + (y - centroY)**2);
                        if (dist < raioBusca) {
                            totalSkin++;
                            skinSumX += x;
                            skinSumY += y;
                        }
                    }
                }
            }
            
            // Se encontrou pele suficiente
            if (totalSkin > minimoPixelsPele) {
                state.rosto_detectado = true;
                state.ultima_face_detectada = Date.now();
                
                // Centro do rosto
                const cx = skinSumX / totalSkin;
                const cy = skinSumY / totalSkin;
                // ====== ANALISA AS REGIÕES FACIAIS ======
                // Tamanho estimado do rosto
                const faceSize = Math.min(w, h) * 0.3;
                const eyeY = cy - faceSize * 0.15;
                const mouthY = cy + faceSize * 0.3;
                const browY = cy - faceSize * 0.3;
                const eyeSpacing = faceSize * 0.2;
                
                // 1. ANALISA A BOCA (região abaixo do centro)
                const mouthX = cx;
                const mouthW = faceSize * 0.25;
                const mouthH = faceSize * 0.1;
                const mouthData = getRegionData(ctx, mouthX - mouthW/2, mouthY - mouthH/2, mouthW, mouthH);
                
                // 2. ANALISA OS OLHOS (região acima do centro)
                const eyeW = faceSize * 0.15;
                const eyeH = faceSize * 0.06;
                const eyeLData = getRegionData(ctx, cx - eyeSpacing - eyeW/2, eyeY - eyeH/2, eyeW, eyeH);
                const eyeRData = getRegionData(ctx, cx + eyeSpacing - eyeW/2, eyeY - eyeH/2, eyeW, eyeH);
                const eyeAvg = (eyeLData.mean + eyeRData.mean) / 2;
                
                // 3. ANALISA AS SOBRANCELHAS
                const browW = faceSize * 0.2;
                const browH = faceSize * 0.04;
                const browLData = getRegionData(ctx, cx - eyeSpacing - browW/2, browY - browH/2, browW, browH);
                const browRData = getRegionData(ctx, cx + eyeSpacing - browW/2, browY - browH/2, browW, browH);
                const browAvg = (browLData.mean + browRData.mean) / 2;
                
                // Brilho relativo para normalização
                const faceMean = getRegionData(ctx, cx - faceSize/2, cy - faceSize/2, faceSize, faceSize).mean;
                
                // ====== CLASSIFICAÇÃO DE EXPRESSÃO ======
                // Normaliza os valores
                const mouthBrightness = mouthData.mean / (faceMean || 1);
                const eyeBrightness = eyeAvg / (faceMean || 1);
                const browBrightness = browAvg / (faceMean || 1);
                const mouthStd = mouthData.stdDev / 30;
                
                let expressao = "NEUTRO";
                let confianca = 0;
                
                // FELIZ: boca mais clara (sorriso mostra dentes), contraste alto
                if (mouthBrightness > 1.1 && mouthStd > 0.3) {
                    expressao = "FELIZ";
                    confianca = Math.min(1, (mouthBrightness - 1.0) * 3 + mouthStd);
                }
                // BRAVO: sobrancelhas mais escuras (franzidas), olhos mais escuros
                else if (browBrightness < 0.9 && eyeBrightness < 0.9) {
                    expressao = "BRAVO";
                    confianca = Math.min(1, (1 - browBrightness) * 4 + (1 - eyeBrightness) * 2);
                }
                // TRISTE: olhos mais claros (abertos), boca escura
                else if (eyeBrightness > 1.05 && mouthBrightness < 0.95) {
                    expressao = "TRISTE";
                    confianca = Math.min(1, (eyeBrightness - 1.0) * 4 + (1 - mouthBrightness) * 2);
                }
                
                if (confianca < 0.3) expressao = "NEUTRO";
                
                // Suavização com histórico
                frameCount++;
                historicoExpressoes.push(expressao);
                if (historicoExpressoes.length > 12) historicoExpressoes.shift();
                
                const freq = {};
                historicoExpressoes.forEach(e => freq[e] = (freq[e] || 0) + 1);
                let maxFreq = 0, stable = "NEUTRO";
                for (const [e, c] of Object.entries(freq)) {
                    if (c > maxFreq) { maxFreq = c; stable = e; }
                }
                if (maxFreq / historicoExpressoes.length > 0.5) {
                    state.expressao_atual = stable;
                }
                
                // Debug
                if (frameCount % 15 === 0) {
                    console.log(`📊 Expr: ${state.expressao_atual} | Boca: ${mouthBrightness.toFixed(2)} | Olho: ${eyeBrightness.toFixed(2)} | Sobr: ${browBrightness.toFixed(2)} | Conf: ${confianca.toFixed(2)}`);
                }
                
                atualizarUIExpressao(state.expressao_atual);
                verificarFluxoExpressao(state.expressao_atual);
                document.getElementById('expressaoDetectada').textContent =
                    `${EMOJIS_EXPRESSOES[state.expressao_atual] || '😐'} ${state.expressao_atual}`;
                
                // ====== DESENHA O ROSTO E REGIÕES ======
                // Círculo do rosto
                ctx.beginPath();
                ctx.arc(cx, cy, faceSize * 0.5, 0, 2 * Math.PI);
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Olhos
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - eyeSpacing - eyeW/2, eyeY - eyeH/2, eyeW, eyeH);
                ctx.strokeRect(cx + eyeSpacing - eyeW/2, eyeY - eyeH/2, eyeW, eyeH);
                
                // Boca
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 2;
                ctx.strokeRect(mouthX - mouthW/2, mouthY - mouthH/2, mouthW, mouthH);
                
                // Sobrancelhas
                ctx.strokeStyle = '#00ccff';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - eyeSpacing - browW/2, browY - browH/2, browW, browH);
                ctx.strokeRect(cx + eyeSpacing - browW/2, browY - browH/2, browW, browH);
                
                // Info
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.fillText(`👤 Rosto: ${Math.round(faceSize)}px`, 10, 30);
                ctx.fillText(`😊 ${state.expressao_atual} (${Math.round(confianca * 100)}%)`, 10, 50);
                ctx.fillText(`Boca: ${mouthBrightness.toFixed(2)} | Olho: ${eyeBrightness.toFixed(2)}`, 10, 70);
                ctx.fillText(`Sobr: ${browBrightness.toFixed(2)} | Pele: ${totalSkin}px`, 10, 90);
                
            } else {
                state.rosto_detectado = false;
                state.expressao_atual = "NADA";
                document.getElementById('expressaoDetectada').textContent = '👤 NENHUM ROSTO';
                
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('👤 Coloque o rosto no centro da tela', canvas.width/2, canvas.height/2 - 20);
                ctx.font = '16px Arial';
                ctx.fillText('⚠️ Certifique-se que o rosto está bem iluminado', canvas.width/2, canvas.height/2 + 30);
                ctx.textAlign = 'left';
            }
        } catch(e) { 
            console.error('Fallback erro:', e); 
        }
    }
}

function getRegionData(ctx, x, y, w, h) {
    const canvas = ctx.canvas;
    x = Math.max(0, Math.min(Math.round(x), canvas.width));
    y = Math.max(0, Math.min(Math.round(y), canvas.height));
    w = Math.max(1, Math.min(Math.round(w), canvas.width - x));
    h = Math.max(1, Math.min(Math.round(h), canvas.height - y));
    
    try {
        const imageData = ctx.getImageData(x, y, w, h);
        const data = imageData.data;
        let sum = 0, sumSq = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
            const brilho = (data[i] + data[i+1] + data[i+2]) / 3;
            sum += brilho;
            sumSq += brilho * brilho;
            count++;
        }
        const mean = sum / count;
        const stdDev = Math.sqrt(Math.max(0, (sumSq / count) - mean * mean));
        return { mean, stdDev, count };
    } catch(e) {
        return { mean: 128, stdDev: 0, count: 0 };
    }
}
