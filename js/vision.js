// TimerFace Rush — vision

// ---------- DETECÇÃO FACIAL MELHORADA COM ANÁLISE DE REGIÕES ----------
let faceMeshModel = null;
let handsModel = null;
let handsCarregando = null;
let handsResultado = null;
let handsProcessando = false;
let ultimaInferenciaMao = 0;
let deteccaoAtiva = false;
let deteccaoGeracao = 0;
let frameCount = 0;
let historicoExpressoes = [];
let ultimaInferenciaFace = 0;
let ultimaInferenciaManual = 0;

// Pontos chave para FaceMesh
const PONTOS = {
    BOCA_SUPERIOR: 13, BOCA_INFERIOR: 14,
    BOCA_ESQ: 61, BOCA_DIR: 291,
    OLHO_ESQ_EXT: 33, OLHO_ESQ_INT: 133,
    OLHO_ESQ_SUP: 159, OLHO_ESQ_INF: 145,
    OLHO_DIR_EXT: 263, OLHO_DIR_INT: 362,
    OLHO_DIR_SUP: 386, OLHO_DIR_INF: 374,
    SOBRANCELHA_ESQ: 55, SOBRANCELHA_DIR: 285,
    SOBRANCELHA_ESQ_EXT: 46, SOBRANCELHA_DIR_EXT: 276,
    SOBRANCELHA_INTERNA_ESQ: 107, SOBRANCELHA_INTERNA_DIR: 336,
    BOCHECHA_ESQ: 117, BOCHECHA_DIR: 350,
    NARIZ_PONTA: 1,
    QUEIXO: 152
};
const PONTOS_VISUAIS = [0, 33, 133, 159, 145, 263, 362, 386, 374, 46, 276, 13, 14, 61, 291, 1, 152];
const EXPRESSOES_VALIDAS = new Set(['FELIZ', 'BRAVO', 'TRISTE', 'NEUTRO', 'NADA']);
let historicoFaceMesh = [];
const GESTOS_MAO = [
    { id: 'JOIA', emoji: '👍', texto: 'FAÇA UM JOIA' },
    { id: 'PAZ', emoji: '✌️', texto: 'FAÇA O SINAL DE PAZ' },
    { id: 'MAO_ABERTA', emoji: '✋', texto: 'MOSTRE A MÃO ABERTA' }
];

async function carregarHandPose() {
    if (handsModel) return handsModel;
    if (handsCarregando) return handsCarregando;
    if (typeof Hands === 'undefined') return null;
    handsCarregando = Promise.resolve().then(() => {
        const modelo = new Hands({
            locateFile: arquivo => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${arquivo}`
        });
        modelo.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.55, minTrackingConfidence: 0.5 });
        modelo.onResults(resultado => {
            handsResultado = resultado;
            handsProcessando = false;
        });
        handsModel = modelo;
        console.log('✅ MediaPipe Hands carregado');
        return modelo;
    }).catch(error => {
        console.error('❌ Detector de mãos indisponível:', error);
        handsCarregando = null;
        return null;
    });
    return handsCarregando;
}

function dedoEstendido(pontos, ponta, articulacao) {
    const pulso = pontos[0];
    return distancia(pontos[ponta], pulso) > distancia(pontos[articulacao], pulso) * 1.1;
}

function classificarGestoMao(pontos) {
    if (!Array.isArray(pontos) || pontos.length < 21 || !pontos.every(pontoValido)) return 'NADA';
    const indicador = dedoEstendido(pontos, 8, 6);
    const medio = dedoEstendido(pontos, 12, 10);
    const anelar = dedoEstendido(pontos, 16, 14);
    const mindinho = dedoEstendido(pontos, 20, 18);
    const palma = distancia(pontos[0], pontos[9]);
    const polegarAberto = distancia(pontos[4], pontos[0]) > distancia(pontos[2], pontos[0]) * 1.12;
    const polegarParaCima = polegarAberto && pontos[4][1] < pontos[0][1] - palma * 0.25;
    if (polegarParaCima && !indicador && !medio && !anelar && !mindinho) return 'JOIA';
    if (indicador && medio && !anelar && !mindinho) return 'PAZ';
    if (indicador && medio && anelar && mindinho) return 'MAO_ABERTA';
    return 'NADA';
}

async function detectarGestoMao(video, ctx) {
    if (state.etapa !== 'MAO') return;
    const modelo = handsModel || await carregarHandPose();
    if (!modelo) {
        atualizarAcaoStatusUI('⏳ Carregando detector de mãos...');
        return;
    }
    const agora = performance.now();
    if (!handsProcessando && agora - ultimaInferenciaMao > 65) {
        ultimaInferenciaMao = agora;
        handsProcessando = true;
        modelo.send({ image: video }).catch(() => { handsProcessando = false; });
    }
    const maos = handsResultado?.multiHandLandmarks;
    if (!Array.isArray(maos) || !maos.length) {
        state.gesto_mao_frames = 0;
        atualizarAcaoStatusUI('👋 Coloque uma mão inteira dentro da câmera');
        atualizarAcaoProgressoUI(0);
        return;
    }
    const pontos = maos[0].map(p => [p.x * ctx.canvas.width, p.y * ctx.canvas.height, p.z]);
    const gesto = classificarGestoMao(pontos);
    pontos.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15'; ctx.fill();
    });
    if (gesto === state.gesto_mao_alvo) state.gesto_mao_frames++;
    else state.gesto_mao_frames = Math.max(0, state.gesto_mao_frames - 0.25);
    const progresso = limitar((state.gesto_mao_frames / 3) * 100, 0, 100);
    atualizarAcaoProgressoUI(progresso);
    atualizarAcaoStatusUI(gesto === 'NADA' ? '🔎 Ajuste a mão conforme o desenho' : `Detectado: ${gesto}`);
    if (state.gesto_mao_frames >= 3) {
        state.gesto_mao_frames = 0;
        registrarAcerto(140);
        esconderAcaoUI();
        mostrarMensagem('✅', 'GESTO RECONHECIDO!', 'Mandou bem!');
        proximaEtapa();
    }
}
const calibracaoFacial = {
    amostras: 0,
    pronta: false,
    bocaLarga: 0,
    bocaAberta: 0,
    olhosAbertos: 0,
    sobrancelhas: 0,
    curvaturaBoca: 0,
    inclinacaoSobrancelhas: 0,
    proximidadeSobrancelhas: 0
};

function numeroFinito(valor) {
    return typeof valor === 'number' && Number.isFinite(valor);
}

function atualizarPontuacaoUI() {
    const pontos = document.getElementById('pontosDisplay');
    const combo = document.getElementById('comboDisplay');
    if (pontos) pontos.textContent = state.pontuacao.toLocaleString('pt-BR');
    if (combo) combo.textContent = state.combo >= 2 ? `🔥 COMBO x${state.combo}` : '';
}

function registrarAcerto(pontosBase = 100) {
    state.combo++;
    const bonusCombo = 1 + Math.min(state.combo - 1, 5) * 0.15;
    const bonusNivel = state.dificuldade === 'HARD' ? 1.5 : state.dificuldade === 'MÉDIO' ? 1.2 : 1;
    const pontos = Math.round(pontosBase * bonusCombo * bonusNivel);
    state.pontuacao += pontos;
    atualizarPontuacaoUI();
    return pontos;
}

function agendarPartida(callback, atraso) {
    const partida = state.partida_id;
    return setTimeout(() => {
        if (partida === state.partida_id && state.etapa !== 'INICIAL') callback();
    }, atraso);
}

function pontoValido(ponto) {
    return Array.isArray(ponto) && ponto.length >= 2 && numeroFinito(ponto[0]) && numeroFinito(ponto[1]);
}

function distancia(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function limitar(valor, minimo = 0, maximo = 1) {
    return Math.min(maximo, Math.max(minimo, valor));
}

function validarLandmarks(landmarks) {
    if (!Array.isArray(landmarks) || landmarks.length < 468) return false;
    return Object.values(PONTOS).every(indice => pontoValido(landmarks[indice]));
}

function estabilizarExpressao(expressao, confianca) {
    const agora = performance.now();
    historicoFaceMesh.push({ expressao, confianca: limitar(confianca), instante: agora });
    historicoFaceMesh = historicoFaceMesh.filter(item => agora - item.instante <= 420).slice(-7);

    const votos = {};
    let pesoTotal = 0;
    historicoFaceMesh.forEach((item, indice) => {
        const recencia = (indice + 1) / historicoFaceMesh.length;
        const peso = (0.35 + item.confianca) * recencia;
        votos[item.expressao] = (votos[item.expressao] || 0) + peso;
        pesoTotal += peso;
    });

    const [melhor = 'NEUTRO', peso = 0] = Object.entries(votos).sort((a, b) => b[1] - a[1])[0] || [];
    return pesoTotal > 0 && peso / pesoTotal >= 0.43 ? melhor : expressao;
}

function atualizarCalibracao(metricas) {
    if (calibracaoFacial.pronta) return;
    calibracaoFacial.amostras++;
    const n = calibracaoFacial.amostras;
    Object.keys(metricas).forEach(chave => {
        calibracaoFacial[chave] += (metricas[chave] - calibracaoFacial[chave]) / n;
    });
    calibracaoFacial.pronta = n >= 20;
}

function classificarExpressao(landmarks) {
    if (!validarLandmarks(landmarks)) return { expressao: 'NADA', confianca: 0, metricas: null };

    const larguraRosto = distancia(landmarks[PONTOS.BOCHECHA_ESQ], landmarks[PONTOS.BOCHECHA_DIR]);
    const alturaRosto = distancia(landmarks[PONTOS.NARIZ_PONTA], landmarks[PONTOS.QUEIXO]);
    if (larguraRosto < 40 || alturaRosto < 35) return { expressao: 'NADA', confianca: 0, metricas: null };

    const larguraBoca = distancia(landmarks[PONTOS.BOCA_ESQ], landmarks[PONTOS.BOCA_DIR]);
    const aberturaBoca = distancia(landmarks[PONTOS.BOCA_SUPERIOR], landmarks[PONTOS.BOCA_INFERIOR]);
    const aberturaOlhoEsq = distancia(landmarks[PONTOS.OLHO_ESQ_SUP], landmarks[PONTOS.OLHO_ESQ_INF]);
    const aberturaOlhoDir = distancia(landmarks[PONTOS.OLHO_DIR_SUP], landmarks[PONTOS.OLHO_DIR_INF]);
    const larguraOlhoEsq = distancia(landmarks[PONTOS.OLHO_ESQ_EXT], landmarks[PONTOS.OLHO_ESQ_INT]);
    const larguraOlhoDir = distancia(landmarks[PONTOS.OLHO_DIR_EXT], landmarks[PONTOS.OLHO_DIR_INT]);
    const aberturaOlhos = ((aberturaOlhoEsq / larguraOlhoEsq) + (aberturaOlhoDir / larguraOlhoDir)) / 2;
    const distanciaSobrancelhas = (
        distancia(landmarks[PONTOS.SOBRANCELHA_ESQ], landmarks[PONTOS.OLHO_ESQ_SUP]) +
        distancia(landmarks[PONTOS.SOBRANCELHA_DIR], landmarks[PONTOS.OLHO_DIR_SUP])
    ) / (2 * alturaRosto);
    const centroBocaY = (landmarks[PONTOS.BOCA_SUPERIOR][1] + landmarks[PONTOS.BOCA_INFERIOR][1]) / 2;
    const cantosBocaY = (landmarks[PONTOS.BOCA_ESQ][1] + landmarks[PONTOS.BOCA_DIR][1]) / 2;
    const curvaturaBoca = (centroBocaY - cantosBocaY) / alturaRosto;
    const sobrancelhasInternasY = (landmarks[PONTOS.SOBRANCELHA_ESQ][1] + landmarks[PONTOS.SOBRANCELHA_DIR][1]) / 2;
    const sobrancelhasExternasY = (landmarks[PONTOS.SOBRANCELHA_ESQ_EXT][1] + landmarks[PONTOS.SOBRANCELHA_DIR_EXT][1]) / 2;
    const inclinacaoSobrancelhas = (sobrancelhasInternasY - sobrancelhasExternasY) / alturaRosto;
    const proximidadeSobrancelhas = distancia(
        landmarks[PONTOS.SOBRANCELHA_INTERNA_ESQ], landmarks[PONTOS.SOBRANCELHA_INTERNA_DIR]
    ) / larguraRosto;

    const metricas = {
        bocaAberta: aberturaBoca / alturaRosto,
        bocaLarga: larguraBoca / larguraRosto,
        olhosAbertos: aberturaOlhos,
        sobrancelhas: distanciaSobrancelhas,
        curvaturaBoca,
        inclinacaoSobrancelhas,
        proximidadeSobrancelhas
    };

    atualizarCalibracao(metricas);
    if (!calibracaoFacial.pronta) {
        return { expressao: 'NEUTRO', confianca: 1, metricas };
    }

    const delta = {};
    Object.keys(metricas).forEach(chave => delta[chave] = metricas[chave] - calibracaoFacial[chave]);

    const scores = {
        FELIZ: limitar(delta.curvaturaBoca / 0.024) * 0.55 + limitar(delta.bocaLarga / 0.12) * 0.30 + limitar(delta.bocaAberta / 0.09) * 0.15,
        BRAVO: limitar(delta.inclinacaoSobrancelhas / 0.028) * 0.38 + limitar(-delta.proximidadeSobrancelhas / 0.045) * 0.30 + limitar(-delta.sobrancelhas / 0.035) * 0.20 + limitar(-delta.olhosAbertos / 0.12) * 0.12,
        TRISTE: limitar(-delta.curvaturaBoca / 0.021) * 0.55 + limitar(delta.sobrancelhas / 0.055) * 0.25 + limitar(delta.olhosAbertos / 0.16) * 0.20
    };
    const ordenados = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [expressao, melhorScore] = ordenados[0];
    const margem = melhorScore - ordenados[1][1];
    const confianca = limitar(melhorScore * 0.8 + limitar(margem / 0.25) * 0.2);

    if (melhorScore < (expressao === 'BRAVO' ? 0.18 : 0.24) || margem < 0.015 || confianca < 0.20) {
        return { expressao: 'NEUTRO', confianca: 1 - confianca, metricas };
    }
    return { expressao, confianca, metricas };
}

// Classificação semântica a partir dos 52 coeficientes treinados pelo
// Face Landmarker. Cada expressão combina unidades de ação independentes.
function classificarBlendshapes(categorias = []) {
    const blend = Object.fromEntries(categorias.map(item => [item.categoryName, item.score]));
    const media = (...nomes) => nomes.reduce((total, nome) => total + (blend[nome] || 0), 0) / nomes.length;

    const sorriso = media('mouthSmileLeft', 'mouthSmileRight');
    const bochechas = media('cheekSquintLeft', 'cheekSquintRight');
    const sobrancelhasBaixas = media('browDownLeft', 'browDownRight');
    const olhosApertados = media('eyeSquintLeft', 'eyeSquintRight');
    const narizFranzido = media('noseSneerLeft', 'noseSneerRight');
    const bocaTriste = media('mouthFrownLeft', 'mouthFrownRight');
    const sobrancelhaInterna = blend.browInnerUp || 0;

    const scores = {
        FELIZ: sorriso * 0.72 + bochechas * 0.28,
        BRAVO: sobrancelhasBaixas * 0.55 + olhosApertados * 0.25 + narizFranzido * 0.20,
        TRISTE: bocaTriste * 0.67 + sobrancelhaInterna * 0.33
    };

    // No desbloqueio, prioriza a ação pedida quando ela já atingiu um sinal
    // convincente. Isso evita que pequenas ativações simultâneas disputem o alvo.
    if (state.etapa === 'EXPRESSAO' && EXPRESSOES_DESBLOQUEIO.includes(state.expressao_alvo)) {
        const limiaresDesbloqueio = { FELIZ: 0.22, BRAVO: 0.18, TRISTE: 0.22 };
        const scoreAlvo = scores[state.expressao_alvo];
        if (scoreAlvo >= limiaresDesbloqueio[state.expressao_alvo]) {
            return { expressao: state.expressao_alvo, confianca: limitar(scoreAlvo + 0.15), metricas: scores };
        }
    }
    const [expressao, melhorScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    const limiar = expressao === 'BRAVO' ? 0.26 : 0.30;
    if (melhorScore < limiar) return { expressao: 'NEUTRO', confianca: 1 - melhorScore, metricas: scores };
    return { expressao, confianca: limitar(melhorScore), metricas: scores };
}

async function carregarFaceMesh() {
    try {
        console.log('🧠 Carregando Face Landmarker com blendshapes...');
        mostrarLoading('Carregando reconhecimento de expressões...');
        if (!window.MediaPipeVision) {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('MediaPipe Tasks não carregou')), 15000);
                window.addEventListener('mediapipe-vision-ready', () => { clearTimeout(timeout); resolve(); }, { once: true });
            });
        }
        const { FaceLandmarker, FilesetResolver } = window.MediaPipeVision;
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
        );
        const opcoes = {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
            outputFaceBlendshapes: true
        };
        try {
            faceMeshModel = await FaceLandmarker.createFromOptions(vision, opcoes);
        } catch (gpuError) {
            console.warn('GPU indisponível; usando CPU para o Face Landmarker.', gpuError);
            opcoes.baseOptions.delegate = 'CPU';
            faceMeshModel = await FaceLandmarker.createFromOptions(vision, opcoes);
        }
        state.modelo_carregado = true;
        esconderLoading();
        if (state.camera_ativa) iniciarDeteccaoFaceMesh();
        console.log('✅ Face Landmarker carregado com 52 blendshapes');
    } catch (error) {
        console.error('❌ Erro Face Landmarker:', error);
        esconderLoading();
        mostrarMensagem('⚠️', 'Modelo facial indisponível', 'Usando detecção simplificada de emergência');
        iniciarDeteccaoManual();
    }
}
