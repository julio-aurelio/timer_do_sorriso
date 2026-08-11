// TimerFace Rush — loop de inferência

// ---------- FACEMESH DETECÇÃO PRINCIPAL ----------
function iniciarDeteccaoFaceMesh() {
    if (deteccaoAtiva) return;
    deteccaoAtiva = true;
    const geracao = ++deteccaoGeracao;
    console.log('🎯 Detecção FaceMesh ativada');
    detectarComFaceMesh(geracao);
}

async function detectarComFaceMesh(geracao = deteccaoGeracao) {
    if (geracao !== deteccaoGeracao || !state.camera_ativa || !faceMeshModel) {
        deteccaoAtiva = false;
        return;
    }
    const video = getVideoElement();
    const { canvas, ctx } = getCanvasContext();
    if (!video || !canvas || !ctx) {
        deteccaoAtiva = false;
        return;
    }
    const agora = performance.now();
    const intervaloMinimo = window.innerWidth < 768 ? 125 : 90;
    if (agora - ultimaInferenciaFace < intervaloMinimo) {
        state.animation_id = requestAnimationFrame(() => detectarComFaceMesh(geracao));
        return;
    }
    ultimaInferenciaFace = agora;
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // No desafio de mão, evita executar dois modelos pesados no mesmo frame.
            if (state.etapa === 'MAO') {
                await detectarGestoMao(video, ctx);
                state.ultima_deteccao = Date.now();
                if (geracao !== deteccaoGeracao) return;
                state.animation_id = requestAnimationFrame(() => detectarComFaceMesh(geracao));
                return;
            }
            
            const resultadoModelo = faceMeshModel.detectForVideo(video, agora);
            if (geracao !== deteccaoGeracao) return;
            state.ultima_deteccao = Date.now();
            if (resultadoModelo?.faceLandmarks?.length && resultadoModelo?.faceBlendshapes?.[0]?.categories?.length) {
                const landmarks = resultadoModelo.faceLandmarks[0].map(p => [p.x * canvas.width, p.y * canvas.height, p.z]);
                const categorias = resultadoModelo.faceBlendshapes[0].categories;
                
                state.rosto_detectado = true;
                state.ultima_face_detectada = Date.now();
                
                const resultado = classificarBlendshapes(categorias);
                const { expressao, confianca, metricas } = resultado;
                frameCount++;
                state.expressao_atual = estabilizarExpressao(expressao, confianca);
                
                if (frameCount % 30 === 0) {
                    console.log('📊 Expressão:', state.expressao_atual, metricas, `confiança: ${confianca.toFixed(2)}`);
                }
                
                atualizarUIExpressao(state.expressao_atual);
                verificarFluxoExpressao(state.expressao_atual);
                document.getElementById('expressaoDetectada').textContent =
                    `${EMOJIS_EXPRESSOES[state.expressao_atual] || '😐'} ${state.expressao_atual}`;
                
            } else {
                state.rosto_detectado = false;
                state.expressao_atual = "NADA";
                document.getElementById('expressaoDetectada').textContent = '👤 NENHUM ROSTO';
                verificarFluxoExpressao("NADA");
            }
        } catch (error) {
            if (geracao !== deteccaoGeracao) return;
            console.error('Erro detecção:', error);
            if (!state.manualFallback) {
                state.manualFallback = true;
                deteccaoAtiva = false;
                iniciarDeteccaoManual();
                return;
            }
        }
    }
    if (state.camera_ativa && faceMeshModel && !state.manualFallback) {
        state.animation_id = requestAnimationFrame(() => detectarComFaceMesh(geracao));
    }
}

function reiniciarDetectorCamera() {
    deteccaoGeracao++;
    if (state.animation_id) cancelAnimationFrame(state.animation_id);
    state.animation_id = null;
    deteccaoAtiva = false;
    historicoFaceMesh = [];
    historicoExpressoes = [];
    frameCount = 0;
    ultimaInferenciaFace = 0;
    ultimaInferenciaManual = 0;
    state.expressao_atual = 'NEUTRO';
    state.rosto_detectado = false;
    state.deteccao_estavel = false;
    state.ultima_face_detectada = 0;
    const { canvas, ctx } = getCanvasContext();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.camera_ativa) return;
    if (faceMeshModel) {
        state.manualFallback = false;
        iniciarDeteccaoFaceMesh();
    } else {
        iniciarDeteccaoManual();
    }
}

// Teste manual
function testarExpressao(expressao) {
    expressao = String(expressao || '').trim().toUpperCase();
    if (!EXPRESSOES_VALIDAS.has(expressao)) {
        console.warn('Expressão inválida. Use FELIZ, BRAVO, TRISTE, NEUTRO ou NADA.');
        return false;
    }
    console.log(`🧪 TESTE MANUAL: ${expressao}`);
    state.expressao_atual = expressao;
    atualizarUIExpressao(expressao);
    verificarFluxoExpressao(expressao);
    document.getElementById('expressaoDetectada').textContent =
        `${EMOJIS_EXPRESSOES[expressao] || '😐'} ${expressao}`;
    return true;
}
