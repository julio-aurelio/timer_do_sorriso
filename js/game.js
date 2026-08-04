// ============================================================
// GAME.JS - TODA A LÓGICA DO JOGO EM UM ÚNICO ARQUIVO
// ============================================================

// ---------- CONFIGURAÇÕES ----------
const CONFIG = {
    TEMPO_PADRAO: 30,
    TEMPO_MIN: 1,
    TEMPO_MAX: 3600,
    TEMPO_EXPRESSAO: 2,
    TEMPO_SORRISO: 3,
    TEMPO_BOMBA: 15,
    TOTAL_PERGUNTAS: 1,
    LIMITE_SUSPENSE: 20,
    DIFICULDADE: {
        TEMPO_RESPOSTA: 5,
        DADOS: { ATIVO: true, TEMPO: 5, QUANTIDADE_RODADAS: 1 },
        SEQUENCIA_MATEMATICA: { ATIVO: true, TEMPO_NUMERO: 2, QUANTIDADE_NUMEROS: 5 },
        STROOP: { ATIVO: true, TEMPO: 5, QUANTIDADE_RODADAS: 3 },
        ACAO_ESPECIAL: { ATIVO: true, TEMPO: 5, QUANTIDADE_ACOES: 1 },
        EVENTOS: { ATIVO: true, QUANTIDADE_POR_PARTIDA: 3, INTERVALO_MINIMO: 8, INTERVALO_MAXIMO: 15 }
    }
};

const PERGUNTAS = [
    { id: 1, pergunta: "Qual a capital do Brasil?", respostas: ["brasilia", "brasília"], dica: "Começa com B" },
    { id: 2, pergunta: "Quantos planetas tem no sistema solar?", respostas: ["8", "oito"], dica: "É um número par" },
    { id: 3, pergunta: "Qual o maior oceano do mundo?", respostas: ["pacífico", "pacifico"], dica: "Começa com P" },
    { id: 4, pergunta: "Em que ano o homem pisou na lua?", respostas: ["1969"], dica: "Termina com 9" },
    { id: 5, pergunta: "Qual a fórmula da água?", respostas: ["h2o", "H2O"], dica: "2 hidrogênios e 1 oxigênio" },
    { id: 6, pergunta: "Qual é o maior planeta do sistema solar?", respostas: ["júpiter", "jupiter"], dica: "Começa com J" },
    { id: 7, pergunta: "Qual a montanha mais alta do mundo?", respostas: ["monte everest", "Everest"], dica: "Está no Himalaia" },
    { id: 8, pergunta: "Qual o país mais populoso do mundo?", respostas: ["índia", "india"], dica: "Fica na Ásia" },
    { id: 9, pergunta: "Qual a moeda oficial dos Estados Unidos?", respostas: ["dólar", "dolar"], dica: "Começa com D" },
    { id: 10, pergunta: "Qual a língua mais falada do mundo?", respostas: ["mandarim", "chinês"], dica: "É da China" },
    { id: 11, pergunta: "Quanto é 7 x 8?", respostas: ["56"], dica: "É um número par" },
    { id: 12, pergunta: "Qual a cor do céu em um dia limpo?", respostas: ["azul"], dica: "É a cor do mar" },
    { id: 13, pergunta: "Qual o animal terrestre mais rápido do mundo?", respostas: ["chita", "guepardo"], dica: "Vive na África" },
    { id: 14, pergunta: "Qual a capital da França?", respostas: ["paris"], dica: "Cidade do amor" },
    { id: 15, pergunta: "Qual a estação do ano mais quente?", respostas: ["verão", "verao"], dica: "Faz calor" },
    { id: 16, pergunta: "Qual o menor país do mundo?", respostas: ["vaticano"], dica: "Fica na Itália" },
    { id: 17, pergunta: "Quanto é 12 x 15?", respostas: ["180"], dica: "Multiplique 12 por 15" },
    { id: 18, pergunta: "Qual a capital da Austrália?", respostas: ["camberra"], dica: "Não é Sydney" },
    { id: 19, pergunta: "Qual o elemento mais abundante no universo?", respostas: ["hidrogênio", "hidrogenio"], dica: "H" },
    { id: 20, pergunta: "Em que ano terminou a Segunda Guerra Mundial?", respostas: ["1945"], dica: "Termina com 5" }
];

const EXPRESSOES = {
    "FELIZ": { emoji: "😊", dica: "SORRIA mostrando os dentes!" },
    "BRAVO": { emoji: "😠", dica: "FRANZA A TESTA e aperte os olhos!" },
    "TRISTE": { emoji: "😢", dica: "ABRA BEM OS OLHOS e faça boca de triste!" }
};

const EMOJIS_EXPRESSOES = {
    'FELIZ': '😊', 'BRAVO': '😠', 'TRISTE': '😢', 'NEUTRO': '😐', 'NADA': '👤'
};

const CHARADAS = [
    { texto: "Sou quente como o fogo, mas não queimo. Sou usado em semáforos. Qual fio sou?", dica: "Pare!", cor: "vermelho" },
    { texto: "Sou a cor do céu em um dia limpo, também sou a cor da esperança. Qual fio sou?", dica: "Olhe para cima!", cor: "azul" },
    { texto: "Sou a cor da natureza e da vida. Quem me corta, comete um erro. Qual fio sou?", dica: "Pense na floresta!", cor: "verde" },
    { texto: "Sou a cor do sol e da riqueza. Muitos me procuram, mas poucos me encontram. Qual fio sou?", dica: "Ouro!", cor: "amarelo" }
];

const CORES_STROOP = [
    { nome: 'VERMELHO', cor: '#ff0000' },
    { nome: 'AZUL', cor: '#0066ff' },
    { nome: 'VERDE', cor: '#00cc00' },
    { nome: 'AMARELO', cor: '#ffcc00' },
    { nome: 'ROXO', cor: '#9900ff' },
    { nome: 'LARANJA', cor: '#ff6600' }
];

const ACOES_ESPECIAIS = [
    { id: 'boca', emoji: '👄', texto: 'ABRA BEM A BOCA', acao: 'boca' },
    { id: 'sobrancelhas', emoji: '🙄', texto: 'LEVANTE AS SOBRANCELHAS', acao: 'sobrancelhas' },
    { id: 'careta', emoji: '😜', texto: 'FAÇA UMA CARETA', acao: 'careta' }
];

const EVENTOS_ALEATORIOS = [
    { id: 'tempestade', emoji: '⚡', texto: 'TEMPESTADE!', descricao: 'Tela escureceu por 3 segundos!', duracao: 3, tipo: 'atrapalha' },
    { id: 'luz', emoji: '💡', texto: 'LUZ!', descricao: 'As cores dos fios ficaram visíveis!', duracao: 5, tipo: 'ajuda' },
    { id: 'tempo_extra', emoji: '⏰', texto: 'TEMPO EXTRA!', descricao: 'Ganhou +3 segundos!', duracao: 0, tipo: 'ajuda' },
    { id: 'falha', emoji: '💥', texto: 'FALHA!', descricao: 'Perdeu -3 segundos!', duracao: 0, tipo: 'atrapalha' }
];

// ---------- ESTADO GLOBAL ----------
const state = {
    etapa: "INICIAL",
    tempo_total: 30,
    tempo_restante: 30,
    tempo_inicio: 0,
    timer_ativo: false,
    timer_interval: null,

    expressao_alvo: null,
    expressao_atual: "NEUTRO",
    historico_expressoes: [],
    tempo_expressao_inicio: 0,
    tempo_sorriso_inicio: 0,

    perguntas_ativas: [],
    pergunta_atual_index: 0,
    perguntas_respondidas: 0,
    aguardando_reinicio: false,

    bomba_ativa: false,
    bomba_timer: 15,
    bomba_interval: null,
    bomba_cor_correta: null,
    fios_cortados: [],
    bomba_desarmada: false,
    bomba_explodiu: false,

    dados_valor1: 0,
    dados_valor2: 0,
    dados_soma: 0,
    dados_tempo_restante: 0,
    dados_interval: null,

    matematica_numeros: [],
    matematica_indice_atual: 0,
    matematica_resultado: 0,
    matematica_tempo_restante: 0,
    matematica_interval: null,

    stroop_rodada_atual: 0,
    stroop_cor_correta: '',
    stroop_tempo_restante: 0,
    stroop_interval: null,
    stroop_bloqueado: false,

    acao_atual: null,
    acao_tempo_restante: 0,
    acao_interval: null,
    acao_executada: false,
    acao_frames: 0,
    gesto_mao_alvo: null,
    gesto_mao_frames: 0,

    desafios: [],
    desafio_indice: -1,
    dificuldade: 'MÉDIO',
    pontuacao: 0,
    combo: 0,
    partida_id: 0,

    eventos_interval: null,

    camera_ativa: false,
    animation_id: null,

    som_tocando: false,
    suspense_tocando: false,
    audio_context: null,
    volume_atual: 0.3,
    
    rosto_detectado: false,
    ultima_deteccao: Date.now(),
    deteccao_estavel: false,
    manualFallback: false,
    modelo_carregado: false,
    
    // Para análise de expressão
    ultima_boca: 0,
    ultimo_olho: 0,
    ultima_sobrancelha: 0
};

// ---------- FUNÇÕES DE UI PADRONIZADAS ----------
function showOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.add('show');
    el.style.display = 'flex';
}

function hideOverlay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    el.classList.remove('show');
    el.style.display = 'none';
}

function mostrarLoading(msg) {
    const overlay = document.getElementById('loadingOverlay');
    document.getElementById('loadingMessage').textContent = msg;
    overlay.classList.remove('hidden');
    overlay.classList.add('show');
    overlay.style.display = 'flex';
}

function esconderLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('show');
    overlay.style.display = 'none';
}

function mostrarMensagem(icon, texto, detalhe = '') {
    const card = document.getElementById('mensagemCard');
    card.classList.remove('hidden');
    document.getElementById('mensagemIcon').textContent = icon;
    document.getElementById('mensagemTexto').textContent = texto;
    document.getElementById('mensagemDetalhe').textContent = detalhe;
}

function esconderMensagem() {
    document.getElementById('mensagemCard').classList.add('hidden');
}

function mostrarComando(titulo, texto) {
    const painel = document.getElementById('comandoDesafio');
    if (!painel) return;
    document.getElementById('comandoTitulo').textContent = titulo;
    document.getElementById('comandoTexto').textContent = texto;
    painel.classList.remove('hidden');
}

function esconderComando() {
    document.getElementById('comandoDesafio')?.classList.add('hidden');
}

function atualizarStatusUI() {
    const etapaMap = {
        'INICIAL': '⏸️ INICIAL', 'TIMER': '⏱️ TIMER', 'SORRISO': '😊 SORRISO',
        'PERGUNTA': '🤔 PERGUNTA', 'BOMBA': '💣 BOMBA', 'DADOS': '🎲 DADOS',
        'MATEMATICA': '🧮 MATEMÁTICA', 'STROOP': '🌀 STROOP', 'ACAO': '👀 AÇÃO',
        'MAO': '🖐️ GESTO',
        'FINALIZADO': '🎉 FINALIZADO', 'EXPLODIU': '💥 EXPLODIU'
    };
    const etapa = etapaMap[state.etapa] || state.etapa;
    const progresso = state.timer_ativo && state.desafios.length
        ? ` · ${Math.min(state.desafio_indice + 1, state.desafios.length)}/${state.desafios.length}`
        : '';
    document.getElementById('etapaDisplay').textContent = etapa + progresso;
}

function atualizarUIExpressao(expressao) {
    const emoji = EMOJIS_EXPRESSOES[expressao] || '😐';
    document.getElementById('expressaoDisplay').textContent = `${emoji} ${expressao}`;
    document.getElementById('expressaoAtualDisplay').textContent = emoji;
}

function atualizarTimerUI() {
    const mins = Math.floor(state.tempo_restante / 60);
    const secs = Math.floor(state.tempo_restante % 60);
    document.getElementById('tempoDisplay').textContent =
        state.timer_ativo ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : '--:--';
    const restante = Math.ceil(state.tempo_restante);
    if (state.etapa === 'DADOS') atualizarDadosTempoUI(restante);
    if (state.etapa === 'MATEMATICA') atualizarMatematicaTempoUI(restante);
    if (state.etapa === 'STROOP') atualizarStroopTempoUI(restante);
    if (state.etapa === 'ACAO' || state.etapa === 'MAO') atualizarAcaoTempoUI(restante);
}

function atualizarCameraStatus(ativa) {
    const dot = document.getElementById('cameraStatus');
    dot.className = `status-dot ${ativa ? 'active' : 'inactive'}`;
}

function atualizarSomUI(tocando) {
    document.getElementById('somDisplay').textContent = tocando ? '🔊' : '🔇';
}

function resetarProgressoPerguntasUI() {
    const bolinhas = document.querySelectorAll('.progresso-perguntas .bolinha');
    bolinhas.forEach((b, i) => {
        b.className = 'bolinha pendente';
        b.textContent = i + 1;
    });
}

function resetarSmileUI() {
    document.getElementById('smileBar').style.width = '0%';
    document.getElementById('smileTime').textContent = `0/${CONFIG.TEMPO_SORRISO}s`;
}

function atualizarIndicadorRosto(detectado) {
    document.getElementById('guiaFacial')?.classList.toggle('detectado', detectado);
}

// Atalhos para overlays
const mostrarBombaUI = () => showOverlay('bombaOverlay');
const esconderBombaUI = () => hideOverlay('bombaOverlay');
const mostrarExplosaoUI = () => showOverlay('explosaoOverlay');
const esconderExplosaoUI = () => hideOverlay('explosaoOverlay');
const mostrarPerguntaUI = () => showOverlay('perguntaOverlay');
const esconderPerguntaUI = () => hideOverlay('perguntaOverlay');
const mostrarSmileUI = () => showOverlay('smileOverlay');
const esconderSmileUI = () => hideOverlay('smileOverlay');
const mostrarDadosUI = () => showOverlay('dadosOverlay');
const esconderDadosUI = () => hideOverlay('dadosOverlay');
const mostrarMatematicaUI = () => showOverlay('matematicaOverlay');
const esconderMatematicaUI = () => hideOverlay('matematicaOverlay');
const mostrarStroopUI = () => showOverlay('stroopOverlay');
const esconderStroopUI = () => hideOverlay('stroopOverlay');
const mostrarAcaoUI = () => showOverlay('acaoOverlay');
const esconderAcaoUI = () => hideOverlay('acaoOverlay');
const mostrarVitoriaFinalUI = () => showOverlay('vitoriaFinalOverlay');
const esconderVitoriaFinalUI = () => hideOverlay('vitoriaFinalOverlay');

function mostrarEventoUI(emoji, texto, descricao) {
    document.getElementById('eventoEmoji').textContent = emoji;
    document.getElementById('eventoTexto').textContent = texto;
    document.getElementById('eventoDescricao').textContent = descricao;
    showOverlay('eventoOverlay');
}
function esconderEventoUI() { hideOverlay('eventoOverlay'); }

function atualizarBombaTimerUI() {
    const timerEl = document.getElementById('bombaTimer');
    timerEl.textContent = state.bomba_timer;
    timerEl.className = `bomba-timer ${state.bomba_timer <= 5 ? 'critico' : ''}`;
}

function mostrarSuspenseUI() {
    document.getElementById('suspenseIndicator').classList.add('show');
}
function esconderSuspenseUI() {
    document.getElementById('suspenseIndicator').classList.remove('show');
}

function atualizarDadosUI(v1, v2, soma) {
    const dados = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    document.getElementById('dado1').textContent = dados[v1-1];
    document.getElementById('dado2').textContent = dados[v2-1];
    document.getElementById('somaDados').textContent = `SOMA: ${soma}`;
}
function atualizarDadosTempoUI(tempo) {
    document.getElementById('dadosTempo').textContent = `⏱️ Tempo: ${tempo}s`;
}
function atualizarAcaoUI(acao) {
    document.getElementById('acaoEmoji').textContent = acao.emoji;
    document.getElementById('acaoTexto').textContent = acao.texto;
    document.getElementById('acaoProgresso').style.width = '0%';
    document.getElementById('acaoStatus').textContent = '⏳ Aguardando ação...';
}
function atualizarAcaoTempoUI(tempo) {
    document.getElementById('acaoTempo').textContent = `⏱️ Tempo: ${tempo}s`;
}
function atualizarAcaoProgressoUI(p) {
    document.getElementById('acaoProgresso').style.width = `${p}%`;
}
function atualizarAcaoStatusUI(s) {
    document.getElementById('acaoStatus').textContent = s;
}
function atualizarStroopUI(palavra, cor, rodada, total) {
    document.getElementById('stroopPalavra').textContent = palavra;
    document.getElementById('stroopPalavra').style.color = cor;
    document.getElementById('stroopProgresso').textContent = `Rodada ${rodada} de ${total}`;
}
function atualizarStroopTempoUI(tempo) {
    document.getElementById('stroopTempo').textContent = `⏱️ Tempo: ${tempo}s`;
}
function atualizarMatematicaTempoUI(tempo) {
    document.getElementById('matematicaTempo').textContent = `⏱️ Tempo: ${tempo}s`;
}
function atualizarProgressoPerguntasUI() {
    const bolinhas = document.querySelectorAll('.progresso-perguntas .bolinha');
    bolinhas.forEach((b, i) => {
        if (i < state.perguntas_respondidas) {
            b.className = 'bolinha concluida';
            b.textContent = '✓';
        } else if (i === state.pergunta_atual_index) {
            b.className = 'bolinha ativa';
            b.textContent = i + 1;
        } else {
            b.className = 'bolinha pendente';
            b.textContent = i + 1;
        }
    });
}

// ---------- ÁUDIO ----------
let suspenseAudioElement = null;
let timerAudioElement = null;
let resultadoAudioElement = null;
let ultimoTimerAudio = '';
let ultimoResultadoAudio = '';
const TIMER_AUDIOS = ['assets/timerAudio.wav', 'assets/timerAudio2.mp3', 'assets/timerAudio3.mp3'];
const AUDIOS_VITORIA = [
    'audios_vitoria/acabou.mp3', 'audios_vitoria/ai-que-delicia-mickey.mp3',
    'audios_vitoria/bora-bill.mp3',
    'audios_vitoria/comedy-male-yelling-yee-ha-sound-effects-free-download-mp3cut.mp3',
    'audios_vitoria/hmmmm-eu-gosto-e-assim-amostradinho_043431.mp3'
];
const AUDIOS_DERROTA = [
    'audios_derrota/apaga-essa-peste-ai_092732.mp3', 'audios_derrota/faaah_203440.mp3',
    'audios_derrota/nao-consegue-ne_233542.mp3',
    'audios_derrota/que-show-da-xuxa-e-esse_035822.mp3'
];

function sortearSemRepetir(lista, ultimo) {
    const opcoes = lista.length > 1 ? lista.filter(item => item !== ultimo) : lista;
    return opcoes[Math.floor(Math.random() * opcoes.length)];
}

function initAudio() {
    suspenseAudioElement = document.getElementById('suspenseAudio');
    if (suspenseAudioElement) suspenseAudioElement.load();
    document.addEventListener('click', () => {
        if (!state.audio_context) {
            try {
                state.audio_context = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) {}
        }
    }, { once: true });
}

function iniciarSomTimer() {
    if (state.som_tocando) return;
    ultimoTimerAudio = sortearSemRepetir(TIMER_AUDIOS, ultimoTimerAudio);
    timerAudioElement = new Audio(ultimoTimerAudio);
    timerAudioElement.loop = true;
    timerAudioElement.volume = 0.5;
    state.som_tocando = true;
    atualizarSomUI(true);
    timerAudioElement.play().catch(() => tocarTimerFallback());
}

function tocarTimerFallback() {
    if (!state.audio_context) return;
    state.som_tocando = true;
    function beep() {
        if (!state.som_tocando) return;
        try {
            const osc = state.audio_context.createOscillator();
            const gain = state.audio_context.createGain();
            osc.connect(gain);
            gain.connect(state.audio_context.destination);
            osc.frequency.value = 440;
            osc.type = 'square';
            gain.gain.value = 0.3;
            osc.start();
            setTimeout(() => osc.stop(), 300);
            setTimeout(beep, 500);
        } catch(e) {}
    }
    beep();
}

function pararSomTimer() {
    state.som_tocando = false;
    if (timerAudioElement) {
        timerAudioElement.pause();
        timerAudioElement.currentTime = 0;
    }
    atualizarSomUI(false);
}

function tocarAudioResultado(tipo) {
    const lista = tipo === 'vitoria' ? AUDIOS_VITORIA : AUDIOS_DERROTA;
    const escolhido = sortearSemRepetir(lista, ultimoResultadoAudio);
    ultimoResultadoAudio = escolhido;
    if (resultadoAudioElement) {
        resultadoAudioElement.pause();
        resultadoAudioElement.currentTime = 0;
    }
    resultadoAudioElement = new Audio(escolhido);
    resultadoAudioElement.volume = 0.75;
    resultadoAudioElement.play().catch(() => {});
}

function pararAudioResultado() {
    if (!resultadoAudioElement) return;
    resultadoAudioElement.pause();
    resultadoAudioElement.currentTime = 0;
    resultadoAudioElement = null;
}

function iniciarSuspense() {
    if (state.suspense_tocando) return;
    pararSomTimer();
    if (suspenseAudioElement) {
        suspenseAudioElement.currentTime = 0;
        suspenseAudioElement.loop = true;
        suspenseAudioElement.volume = 0.5;
        suspenseAudioElement.play().catch(() => {});
        state.suspense_tocando = true;
        atualizarSomUI(true);
        mostrarSuspenseUI();
        return;
    }
    state.suspense_tocando = true;
    atualizarSomUI(true);
    mostrarSuspenseUI();
}

function pararSuspense() {
    state.suspense_tocando = false;
    if (suspenseAudioElement) {
        suspenseAudioElement.pause();
        suspenseAudioElement.currentTime = 0;
    }
    esconderSuspenseUI();
}

function pararTodosAudios() {
    pararSomTimer();
    pararSuspense();
}

// ---------- CÂMERA ----------
let videoElement = null;
let canvasElement = null;
let ctx = null;

function initCameraElements() {
    videoElement = document.getElementById('video-frame');
    canvasElement = document.getElementById('detection-canvas');
    ctx = canvasElement.getContext('2d', { willReadFrequently: true });
}

async function iniciarCamera() {
    try {
        if (!videoElement || !canvasElement || !ctx) throw new Error('Elementos da câmera não foram inicializados.');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não oferece acesso à câmera.');
        if (videoElement.srcObject) {
            state.camera_ativa = true;
            return true;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        videoElement.srcObject = stream;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('A câmera demorou demais para iniciar.')), 10000);
            videoElement.onloadedmetadata = () => {
                clearTimeout(timeout);
                Promise.resolve(videoElement.play()).then(resolve).catch(reject);
            };
        });
        state.camera_ativa = true;
        atualizarCameraStatus(true);
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        return true;
    } catch (error) {
        console.error('Câmera erro:', error);
        if (videoElement?.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        state.camera_ativa = false;
        atualizarCameraStatus(false);
        return false;
    }
}

function pararCamera() {
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(t => t.stop());
        videoElement.srcObject = null;
    }
    state.camera_ativa = false;
    if (state.animation_id) {
        cancelAnimationFrame(state.animation_id);
        state.animation_id = null;
    }
}

function getVideoElement() { return videoElement; }
function getCanvasContext() { return { canvas: canvasElement, ctx: ctx }; }

// ---------- DETECÇÃO FACIAL MELHORADA COM ANÁLISE DE REGIÕES ----------
let faceMeshModel = null;
let handPoseModel = null;
let handPoseCarregando = null;
let deteccaoAtiva = false;
let frameCount = 0;
let historicoExpressoes = [];

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
    if (handPoseModel) return handPoseModel;
    if (handPoseCarregando) return handPoseCarregando;
    if (typeof handpose === 'undefined') return null;
    handPoseCarregando = handpose.load({ maxContinuousChecks: 2, detectionConfidence: 0.75 })
        .then(modelo => {
            handPoseModel = modelo;
            console.log('✅ Detector de mãos carregado');
            return modelo;
        })
        .catch(error => {
            console.error('❌ Detector de mãos indisponível:', error);
            handPoseCarregando = null;
            return null;
        });
    return handPoseCarregando;
}

function dedoEstendido(pontos, ponta, articulacao) {
    return pontos[ponta][1] < pontos[articulacao][1] - 6;
}

function classificarGestoMao(pontos) {
    if (!Array.isArray(pontos) || pontos.length < 21 || !pontos.every(pontoValido)) return 'NADA';
    const indicador = dedoEstendido(pontos, 8, 6);
    const medio = dedoEstendido(pontos, 12, 10);
    const anelar = dedoEstendido(pontos, 16, 14);
    const mindinho = dedoEstendido(pontos, 20, 18);
    const palma = distancia(pontos[0], pontos[9]);
    const polegarParaCima = pontos[4][1] < pontos[2][1] - palma * 0.45;
    if (polegarParaCima && !indicador && !medio && !anelar && !mindinho) return 'JOIA';
    if (indicador && medio && !anelar && !mindinho) return 'PAZ';
    if (indicador && medio && anelar && mindinho) return 'MAO_ABERTA';
    return 'NADA';
}

async function detectarGestoMao(video, ctx) {
    if (state.etapa !== 'MAO') return;
    const modelo = handPoseModel || await carregarHandPose();
    if (!modelo) {
        atualizarAcaoStatusUI('⏳ Carregando detector de mãos...');
        return;
    }
    const maos = await modelo.estimateHands(video, true);
    if (!Array.isArray(maos) || !maos.length) {
        state.gesto_mao_frames = 0;
        atualizarAcaoStatusUI('👋 Coloque uma mão inteira dentro da câmera');
        atualizarAcaoProgressoUI(0);
        return;
    }
    const pontos = maos[0].landmarks;
    const gesto = classificarGestoMao(pontos);
    pontos.forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15'; ctx.fill();
    });
    if (gesto === state.gesto_mao_alvo) state.gesto_mao_frames++;
    else state.gesto_mao_frames = 0;
    const progresso = limitar((state.gesto_mao_frames / 10) * 100, 0, 100);
    atualizarAcaoProgressoUI(progresso);
    atualizarAcaoStatusUI(gesto === 'NADA' ? '🔎 Ajuste a mão conforme o desenho' : `Detectado: ${gesto}`);
    if (state.gesto_mao_frames >= 10) {
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
    inclinacaoSobrancelhas: 0
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

function atualizarGuiaFacial(expressaoAlvo = null, expressaoDetectada = state.expressao_atual, progresso = null) {
    const guia = document.getElementById('guiaFacial');
    if (!guia) return;
    const dicas = {
        FELIZ: ['😊', 'Faça um sorriso', 'Levante os cantos da boca; mostrar os dentes ajuda.'],
        BRAVO: ['😠', 'Faça cara de bravo', 'Abaixe e aproxime as sobrancelhas; aperte um pouco os olhos.'],
        TRISTE: ['😢', 'Faça cara de triste', 'Abaixe os cantos da boca e levante a parte interna das sobrancelhas.']
    };
    const alvo = EXPRESSOES_VALIDAS.has(expressaoAlvo) && dicas[expressaoAlvo] ? expressaoAlvo : null;
    const conteudo = alvo ? dicas[alvo] : ['🙂', 'Centralize o rosto', 'Olhe de frente e mantenha o rosto dentro da moldura.'];
    guia.dataset.expressao = alvo || 'NEUTRO';
    document.getElementById('guiaEmoji').textContent = conteudo[0];
    document.getElementById('guiaTitulo').textContent = conteudo[1];
    document.getElementById('guiaDica').textContent = conteudo[2];
    document.getElementById('guiaStatus').textContent = !calibracaoFacial.pronta
        ? `Calibrando rosto neutro... ${Math.min(calibracaoFacial.amostras, 20)}/20`
        : alvo && expressaoDetectada === alvo
            ? 'Certo! Continue segurando a expressão.'
            : `Detectado: ${expressaoDetectada || 'NADA'}`;
    if (progresso !== null) document.getElementById('guiaBarra').style.width = `${limitar(progresso, 0, 100)}%`;
}

function obterExpressaoGuiaAtual() {
    if (state.etapa === 'EXPRESSAO') return state.expressao_alvo;
    if (state.etapa === 'SORRISO') return 'FELIZ';
    if (state.etapa === 'ACAO') {
        if (state.acao_atual?.acao === 'boca') return 'FELIZ';
        if (state.acao_atual?.acao === 'sobrancelhas') return 'BRAVO';
        if (state.acao_atual?.acao === 'careta') return 'TRISTE';
    }
    return null;
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
    historicoFaceMesh = historicoFaceMesh.filter(item => agora - item.instante <= 650).slice(-10);

    const votos = {};
    let pesoTotal = 0;
    historicoFaceMesh.forEach((item, indice) => {
        const recencia = (indice + 1) / historicoFaceMesh.length;
        const peso = (0.35 + item.confianca) * recencia;
        votos[item.expressao] = (votos[item.expressao] || 0) + peso;
        pesoTotal += peso;
    });

    const [melhor = 'NEUTRO', peso = 0] = Object.entries(votos).sort((a, b) => b[1] - a[1])[0] || [];
    return pesoTotal > 0 && peso / pesoTotal >= 0.56 ? melhor : 'NEUTRO';
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

    const metricas = {
        bocaAberta: aberturaBoca / alturaRosto,
        bocaLarga: larguraBoca / larguraRosto,
        olhosAbertos: aberturaOlhos,
        sobrancelhas: distanciaSobrancelhas,
        curvaturaBoca,
        inclinacaoSobrancelhas
    };

    atualizarCalibracao(metricas);
    if (!calibracaoFacial.pronta) {
        return { expressao: 'NEUTRO', confianca: 1, metricas };
    }

    const delta = {};
    Object.keys(metricas).forEach(chave => delta[chave] = metricas[chave] - calibracaoFacial[chave]);

    const scores = {
        FELIZ: limitar(delta.curvaturaBoca / 0.024) * 0.55 + limitar(delta.bocaLarga / 0.12) * 0.30 + limitar(delta.bocaAberta / 0.09) * 0.15,
        BRAVO: limitar(delta.inclinacaoSobrancelhas / 0.048) * 0.50 + limitar(-delta.sobrancelhas / 0.06) * 0.35 + limitar(-delta.olhosAbertos / 0.16) * 0.15,
        TRISTE: limitar(-delta.curvaturaBoca / 0.021) * 0.55 + limitar(delta.sobrancelhas / 0.055) * 0.25 + limitar(delta.olhosAbertos / 0.16) * 0.20
    };
    const ordenados = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [expressao, melhorScore] = ordenados[0];
    const margem = melhorScore - ordenados[1][1];
    const confianca = limitar(melhorScore * 0.8 + limitar(margem / 0.25) * 0.2);

    if (melhorScore < 0.34 || margem < 0.06 || confianca < 0.34) {
        return { expressao: 'NEUTRO', confianca: 1 - confianca, metricas };
    }
    return { expressao, confianca, metricas };
}

async function carregarFaceMesh() {
    try {
        console.log('🧠 Carregando FaceMesh...');
        mostrarLoading('Carregando modelo FaceMesh...');

        let modelo = null;
        let tentativas = 0;
        const maxTentativas = 3;

        while (tentativas < maxTentativas && !modelo) {
            try {
                if (typeof faceLandmarksDetection === 'undefined') {
                    console.warn(`⏳ FaceMesh não disponível (tentativa ${tentativas+1}/${maxTentativas}). Aguardando...`);
                    await new Promise(res => setTimeout(res, 2000));
                    tentativas++;
                    continue;
                }
                
                await tf.ready();
                const pacote = faceLandmarksDetection.SupportedPackages.mediapipeFacemesh;
                const loadPromise = faceLandmarksDetection.load(pacote, { maxFaces: 1 });
                
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout ao carregar FaceMesh')), 15000);
                });
                
                const modeloCarregado = await Promise.race([loadPromise, timeoutPromise]);
                modelo = {
                    estimateFaces: input => modeloCarregado.estimateFaces({ input, predictIrises: false })
                };
                break;
            } catch (e) {
                console.warn(`⚠️ Falha ao carregar (tentativa ${tentativas+1}):`, e.message);
                tentativas++;
                await new Promise(res => setTimeout(res, 2000));
            }
        }

        if (modelo) {
            faceMeshModel = modelo;
            state.modelo_carregado = true;
            console.log('✅ FaceMesh carregado com sucesso!');
            esconderLoading();
            if (state.camera_ativa) {
                iniciarDeteccaoFaceMesh();
            } else {
                const check = setInterval(() => {
                    if (state.camera_ativa) {
                        clearInterval(check);
                        iniciarDeteccaoFaceMesh();
                    }
                }, 500);
            }
        } else {
            throw new Error('Não foi possível carregar FaceMesh após ' + maxTentativas + ' tentativas.');
        }

    } catch (error) {
        console.error('❌ Erro FaceMesh:', error);
        esconderLoading();
        console.log('🔄 Ativando fallback com análise de regiões...');
        mostrarMensagem('⚠️', 'FaceMesh indisponível', 'Usando detecção por regiões faciais');
        iniciarDeteccaoManual();
    }
}

// ---------- FALLBACK COM ANÁLISE DE REGIÕES (OLHOS, BOCA, SOBRANCELHAS) ----------
function iniciarDeteccaoManual() {
    if (deteccaoAtiva) return;
    deteccaoAtiva = true;
    state.manualFallback = true;
    console.log('⚠️ Fallback com análise de regiões ativado');
    detectarManual();
}

function detectarManual() {
    if (!state.camera_ativa) { 
        deteccaoAtiva = false; 
        return; 
    }
    state.animation_id = requestAnimationFrame(detectarManual);
    const video = getVideoElement();
    const { canvas, ctx } = getCanvasContext();
    
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        try {
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
            let skinPixels = [];
            let totalSkin = 0;
            let skinSumX = 0, skinSumY = 0;
            
            // Amostragem eficiente - pula pixels para performance
            const step = 3;
            for (let y = 0; y < h; y += step) {
                for (let x = 0; x < w; x += step) {
                    const idx = (y * w + x) * 4;
                    const r = data[idx], g = data[idx+1], b = data[idx+2];
                    
                    // Detecção de pele melhorada (para tons variados)
                    const isSkin = (
                        r > 60 && g > 30 && b > 20 &&
                        r > g && r > b &&
                        Math.abs(r - g) > 10 &&
                        (r + g + b) > 150
                    );
                    
                    if (isSkin) {
                        const dist = Math.sqrt((x - centroX)**2 + (y - centroY)**2);
                        if (dist < raioBusca) {
                            skinPixels.push({x, y, r, g, b});
                            totalSkin++;
                            skinSumX += x;
                            skinSumY += y;
                        }
                    }
                }
            }
            
            // Se encontrou pele suficiente
            if (skinPixels.length > 200) {
                state.rosto_detectado = true;
                atualizarIndicadorRosto(true);
                
                // Centro do rosto
                const cx = skinSumX / totalSkin;
                const cy = skinSumY / totalSkin;
                const raio = Math.sqrt(skinPixels.reduce((s, p) => s + (p.x - cx)**2 + (p.y - cy)**2, 0) / totalSkin);
                
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
                ctx.fillText(`Sobr: ${browBrightness.toFixed(2)} | Pele: ${skinPixels.length}px`, 10, 90);
                
            } else {
                state.rosto_detectado = false;
                atualizarIndicadorRosto(false);
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

// ---------- FACEMESH DETECÇÃO PRINCIPAL ----------
function iniciarDeteccaoFaceMesh() {
    if (deteccaoAtiva) return;
    deteccaoAtiva = true;
    console.log('🎯 Detecção FaceMesh ativada');
    detectarComFaceMesh();
}

async function detectarComFaceMesh() {
    if (!state.camera_ativa || !faceMeshModel) {
        deteccaoAtiva = false;
        return;
    }
    const video = getVideoElement();
    const { canvas, ctx } = getCanvasContext();
    if (!video || !canvas || !ctx) {
        deteccaoAtiva = false;
        return;
    }
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const predictions = await faceMeshModel.estimateFaces(video);
            if (state.etapa === 'MAO') await detectarGestoMao(video, ctx);
            
            if (Array.isArray(predictions) && predictions.length > 0 && validarLandmarks(predictions[0].scaledMesh)) {
                const landmarks = predictions[0].scaledMesh;
                const box = predictions[0].boundingBox;
                
                state.rosto_detectado = true;
                atualizarIndicadorRosto(true);
                
                // Desenha bounding box
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 2;
                if (box && pontoValido(box.topLeft) && pontoValido(box.bottomRight)) {
                    ctx.strokeRect(box.topLeft[0], box.topLeft[1],
                        box.bottomRight[0] - box.topLeft[0],
                        box.bottomRight[1] - box.topLeft[1]);
                }
                
                // Desenha pontos
                PONTOS_VISUAIS.forEach(idx => {
                    const [x, y] = landmarks[idx];
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = '#00ffff';
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
                
                const resultado = classificarExpressao(landmarks);
                const { expressao, confianca, metricas } = resultado;
                frameCount++;
                state.expressao_atual = estabilizarExpressao(expressao, confianca);
                atualizarGuiaFacial(obterExpressaoGuiaAtual(), state.expressao_atual);
                
                if (frameCount % 30 === 0) {
                    console.log('📊 Expressão:', state.expressao_atual, metricas, `confiança: ${confianca.toFixed(2)}`);
                }
                
                atualizarUIExpressao(state.expressao_atual);
                verificarFluxoExpressao(state.expressao_atual);
                document.getElementById('expressaoDetectada').textContent =
                    `${EMOJIS_EXPRESSOES[state.expressao_atual] || '😐'} ${state.expressao_atual}`;
                
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.fillText(`Boca: ${(metricas?.bocaAberta ?? 0).toFixed(3)}`, 10, 30);
                ctx.fillText(`Conf: ${(confianca * 100).toFixed(0)}%`, 10, 50);
                ctx.fillText(`Expr: ${state.expressao_atual}`, 10, 70);
                
            } else {
                state.rosto_detectado = false;
                atualizarIndicadorRosto(false);
                state.expressao_atual = "NADA";
                document.getElementById('expressaoDetectada').textContent = '👤 NENHUM ROSTO';
                verificarFluxoExpressao("NADA");
                atualizarGuiaFacial(obterExpressaoGuiaAtual(), 'NADA', 0);
            }
        } catch (error) {
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
        state.animation_id = requestAnimationFrame(detectarComFaceMesh);
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
    atualizarIndicadorRosto(true);
    return true;
}

// ---------- EXPRESSÕES (verificação de fluxo) ----------
function verificarFluxoExpressao(expressao) {
    if (expressao === "NEUTRO" || expressao === "NADA") return;
    console.log('🔄 FLUXO - Etapa:', state.etapa, 'Expressão:', expressao);
    switch(state.etapa) {
        case "EXPRESSAO": verificarExpressaoAlvo(expressao); break;
        case "SORRISO": verificarSorriso(expressao); break;
        case "ACAO": verificarAcaoEspecial(expressao); break;
    }
}

function verificarExpressaoAlvo(expressao) {
    if (expressao === state.expressao_alvo) {
        if (state.tempo_expressao_inicio === 0) state.tempo_expressao_inicio = Date.now();
        const tempoPassado = (Date.now() - state.tempo_expressao_inicio) / 1000;
        const progresso = Math.min((tempoPassado / CONFIG.TEMPO_EXPRESSAO) * 100, 100);
        document.getElementById('targetBar').style.width = `${progresso}%`;
        document.getElementById('targetTime').textContent = `${Math.floor(tempoPassado)}/${CONFIG.TEMPO_EXPRESSAO}s`;
        atualizarGuiaFacial(state.expressao_alvo, expressao, progresso);
        if (tempoPassado >= CONFIG.TEMPO_EXPRESSAO) {
            state.tempo_expressao_inicio = 0;
            hideOverlay('targetOverlay');
            iniciarTimerReal();
        }
    } else {
        state.tempo_expressao_inicio = 0;
        document.getElementById('targetBar').style.width = '0%';
        document.getElementById('targetTime').textContent = `0/${CONFIG.TEMPO_EXPRESSAO}s`;
        atualizarGuiaFacial(state.expressao_alvo, expressao, 0);
    }
}

function verificarSorriso(expressao) {
    if (expressao === "FELIZ") {
        if (state.tempo_sorriso_inicio === 0) state.tempo_sorriso_inicio = Date.now();
        const tempoPassado = (Date.now() - state.tempo_sorriso_inicio) / 1000;
        const progresso = Math.min((tempoPassado / CONFIG.TEMPO_SORRISO) * 100, 100);
        document.getElementById('smileBar').style.width = `${progresso}%`;
        document.getElementById('smileTime').textContent = `${Math.floor(tempoPassado)}/${CONFIG.TEMPO_SORRISO}s`;
        atualizarGuiaFacial('FELIZ', expressao, progresso);
        if (tempoPassado >= CONFIG.TEMPO_SORRISO) {
            esconderSmileUI();
            state.tempo_sorriso_inicio = 0;
            registrarAcerto(100);
            proximaEtapa();
        }
    } else {
        state.tempo_sorriso_inicio = 0;
        document.getElementById('smileBar').style.width = '0%';
        document.getElementById('smileTime').textContent = `0/${CONFIG.TEMPO_SORRISO}s`;
        atualizarGuiaFacial('FELIZ', expressao, 0);
    }
}

// ---------- TIMER ----------
let tempoSelecionado = CONFIG.TEMPO_PADRAO;

function validarTempo(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return tempoSelecionado;
    return Math.round(limitar(numero, CONFIG.TEMPO_MIN, CONFIG.TEMPO_MAX));
}

function obterTempoSelecionado() {
    const input = document.getElementById('customTime');
    const tempo = validarTempo(input?.value);
    tempoSelecionado = tempo;
    if (input) {
        input.value = String(tempo);
        input.setCustomValidity('');
    }
    return tempo;
}

function normalizarResposta(valor) {
    return String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLocaleLowerCase('pt-BR')
        .replace(/\s+/g, ' ');
}

function setTimer(segundos) {
    tempoSelecionado = validarTempo(segundos);
    document.getElementById('customTime').value = tempoSelecionado;
    document.querySelectorAll('.btn-tempo').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
    });
    document.querySelector(`.btn-tempo[data-tempo="${tempoSelecionado}"]`)?.classList.add('border-blue-500', 'bg-blue-50');
}

function iniciarTimerReal() {
    state.tempo_total = obterTempoSelecionado();
    state.tempo_restante = state.tempo_total;
    state.etapa = "JOGANDO";
    state.timer_ativo = true;
    state.tempo_inicio = Date.now();
    iniciarSomTimer();
    atualizarTimerUI();
    atualizarStatusUI();
    if (CONFIG.DIFICULDADE.EVENTOS.ATIVO) {
        setTimeout(() => iniciarEventosAleatorios(), 3000);
    }
    if (state.timer_interval) clearInterval(state.timer_interval);
    state.timer_interval = setInterval(() => {
        const elapsed = (Date.now() - state.tempo_inicio) / 1000;
        state.tempo_restante = Math.max(0, state.tempo_total - elapsed);
        atualizarTimerUI();
        if (state.tempo_restante <= CONFIG.LIMITE_SUSPENSE && state.tempo_restante > 0 && !state.suspense_tocando && state.tempo_total > 30) {
            iniciarSuspense();
        }
        if (state.tempo_restante <= 0) {
            clearInterval(state.timer_interval);
            state.timer_interval = null;
            state.timer_ativo = false;
            pararSuspense();
            encerrarPorTempo();
        }
    }, 100);
    mostrarMensagem('🎮', `${state.dificuldade}: valendo!`, `${state.desafios.length} desafios em ${state.tempo_total}s`);
    proximaEtapa();
}

function pararTimer() {
    limparTodosIntervalos();
    resetarEstado();
    pararTodosAudios();
    esconderTodosOverlays();
    document.getElementById('btnIniciar').disabled = false;
    document.getElementById('btnIniciar').classList.remove('opacity-50', 'cursor-not-allowed');
    resetarProgressoPerguntasUI();
    resetarSmileUI();
    document.querySelectorAll('.fio-btn').forEach(btn => {
        btn.disabled = false;
        btn.className = `fio-btn fio-${btn.dataset.cor}`;
    });
    atualizarStatusUI();
    mostrarMensagem('⏹️', 'Timer parado!', '');
}

function iniciarSorriso() {
    state.etapa = "SORRISO";
    state.tempo_sorriso_inicio = 0;
    mostrarSmileUI();
    resetarSmileUI();
    atualizarGuiaFacial('FELIZ', state.expressao_atual, 0);
    mostrarComando('😊 SORRISO', 'Sorria e mantenha a expressão até completar a barra.');
    atualizarStatusUI();
    mostrarMensagem('😊', 'DESAFIO DO SORRISO!', 'Mantenha o sorriso por 3 segundos!');
}

// ---------- PERGUNTAS ----------
function iniciarPerguntas() {
    state.etapa = "PERGUNTA";
    state.aguardando_reinicio = false;
    const embaralhadas = [...PERGUNTAS].sort(() => Math.random() - 0.5);
    state.perguntas_ativas = embaralhadas.slice(0, CONFIG.TOTAL_PERGUNTAS);
    state.pergunta_atual_index = 0;
    state.perguntas_respondidas = 0;
    mostrarComando('🤔 PERGUNTA SURPRESA', 'Leia a pergunta e digite a resposta correta.');
    mostrarPergunta();
}

function mostrarPergunta() {
    if (state.pergunta_atual_index >= state.perguntas_ativas.length) {
        finalizarPerguntasComSucesso();
        return;
    }
    const pergunta = state.perguntas_ativas[state.pergunta_atual_index];
    document.getElementById('perguntaEmoji').textContent = '🤔';
    document.getElementById('perguntaTextoOverlay').textContent = pergunta.pergunta;
    document.getElementById('dicaTextoOverlay').textContent = `💡 ${pergunta.dica}`;
    document.getElementById('statusSomPergunta').textContent = '🔊 SOM TOCANDO';
    document.getElementById('statusSomPergunta').className = 'status-som tocando';
    document.getElementById('tentativasOverlay').textContent = `📝 Pergunta ${state.pergunta_atual_index + 1} de ${CONFIG.TOTAL_PERGUNTAS}`;
    document.getElementById('erroOverlay').style.display = 'none';
    document.getElementById('respostaInputOverlay').value = '';
    document.getElementById('respostaInputOverlay').focus();
    document.getElementById('btnEnviarOverlay').disabled = false;
    atualizarProgressoPerguntasUI();
    mostrarPerguntaUI();
    mostrarMensagem('🤔', `Pergunta ${state.pergunta_atual_index + 1} de ${CONFIG.TOTAL_PERGUNTAS}`, '🔊 O som continua!');
    atualizarStatusUI();
}

function enviarRespostaOverlay() {
    if (state.aguardando_reinicio) return;
    const input = document.getElementById('respostaInputOverlay');
    const resposta = normalizarResposta(input.value).slice(0, 100);
    if (!resposta) {
        document.getElementById('erroOverlay').textContent = '⚠️ Digite uma resposta!';
        document.getElementById('erroOverlay').style.display = 'block';
        return;
    }
    const perguntaAtual = state.perguntas_ativas[state.pergunta_atual_index];
    if (!perguntaAtual || !Array.isArray(perguntaAtual.respostas)) {
        console.error('Pergunta atual inválida:', perguntaAtual);
        mostrarMensagem('❌', 'Não foi possível validar a pergunta.', 'Reinicie a partida.');
        return;
    }
    if (perguntaAtual.respostas.some(item => normalizarResposta(item) === resposta)) {
        state.perguntas_respondidas++;
        state.pergunta_atual_index++;
        atualizarProgressoPerguntasUI();
        if (state.pergunta_atual_index >= state.perguntas_ativas.length) {
            finalizarPerguntasComSucesso();
        } else {
            document.getElementById('respostaInputOverlay').value = '';
            document.getElementById('erroOverlay').style.display = 'none';
            mostrarMensagem('✅', 'Acertou! Próxima pergunta!', `Pergunta ${state.pergunta_atual_index + 1} de ${CONFIG.TOTAL_PERGUNTAS}`);
            setTimeout(() => mostrarPergunta(), 500);
        }
    } else {
        reiniciarAposErro("❌ Resposta errada!");
    }
}

function finalizarPerguntasComSucesso() {
    registrarAcerto(120);
    esconderPerguntaUI();
    const bolinhas = document.querySelectorAll('.progresso-perguntas .bolinha');
    bolinhas.forEach(b => { b.className = 'bolinha concluida'; b.textContent = '✓'; });
    atualizarStatusUI();
    mostrarMensagem('✅', 'PERGUNTA CONCLUÍDA!', 'Próximo desafio...');
    agendarPartida(() => proximaEtapa(), 700);
}

function reiniciarAposErro(mensagem) {
    encerrarComDerrota('DESAFIO INCORRETO!', mensagem.replace(/Timer vai reiniciar\.?/gi, '').trim());
}

function encerrarComDerrota(titulo, motivo) {
    if (!state.timer_ativo && state.etapa === 'DERROTA') return;
    state.aguardando_reinicio = true;
    state.timer_ativo = false;
    state.etapa = 'DERROTA';
    limparTodosIntervalos();
    pararTodosAudios();
    tocarAudioResultado('derrota');
    pararEventosAleatorios();
    esconderTodosOverlays();
    esconderComando();
    esconderComando();
    document.getElementById('derrotaTitulo').textContent = titulo;
    document.getElementById('derrotaMotivo').textContent = `${motivo} Pontuação: ${state.pontuacao.toLocaleString('pt-BR')}`;
    mostrarExplosaoUI();
    atualizarStatusUI();
}

// ---------- BOMBA ----------
function iniciarBomba() {
    console.log('💣 INICIANDO BOMBA!');
    state.bomba_ativa = true;
    state.bomba_explodiu = false;
    state.bomba_desarmada = false;
    state.bomba_timer = CONFIG.TEMPO_BOMBA;
    state.fios_cortados = [];
    state.etapa = "BOMBA";
    mostrarComando('💣 DESARME A BOMBA', 'Leia a charada e corte somente o fio da cor correta.');
    const charada = CHARADAS[Math.floor(Math.random() * CHARADAS.length)];
    state.bomba_cor_correta = charada.cor;
    document.getElementById('charadaTexto').textContent = charada.texto;
    document.getElementById('charadaDica').textContent = `💡 ${charada.dica}`;
    document.getElementById('bombaTimer').textContent = CONFIG.TEMPO_BOMBA;
    document.getElementById('bombaStatus').textContent = '🤔 Leia a charada e escolha o fio!';
    document.querySelectorAll('.fio-btn').forEach(btn => {
        btn.disabled = false;
        btn.className = `fio-btn fio-${btn.dataset.cor}`;
    });
    mostrarBombaUI();
    atualizarStatusUI();
    if (state.bomba_interval) clearInterval(state.bomba_interval);
    state.bomba_interval = setInterval(() => {
        state.bomba_timer--;
        atualizarBombaTimerUI();
        if (state.bomba_timer <= 0) bombaExplodir();
    }, 1000);
    mostrarMensagem('💣', 'BOMBA ATIVADA!', '🔊 Leia a charada e corte o fio correto!');
}

function cortarFio(cor) {
    if (!state.bomba_ativa || state.bomba_desarmada || state.bomba_explodiu) return;
    if (state.fios_cortados.includes(cor)) return;
    state.fios_cortados.push(cor);
    const btn = document.querySelector(`.fio-btn[data-cor="${cor}"]`);
    btn.classList.add('cortado');
    btn.disabled = true;
    if (cor === state.bomba_cor_correta) {
        btn.classList.add('correto');
        bombaDesarmar();
    } else {
        btn.classList.add('errado');
        setTimeout(() => bombaExplodir(), 500);
    }
}

function bombaDesarmar() {
    console.log('🎉 BOMBA DESARMADA!');
    state.bomba_desarmada = true;
    state.bomba_ativa = false;
    registrarAcerto(160);
    if (state.bomba_interval) {
        clearInterval(state.bomba_interval);
        state.bomba_interval = null;
    }
    document.getElementById('bombaStatus').textContent = '🎉 BOMBA DESARMADA COM SUCESSO!';
    document.querySelectorAll('.fio-btn').forEach(btn => btn.disabled = true);
    esconderBombaUI();
    mostrarMensagem('✅', 'BOMBA DESARMADA!', 'Avançando...');
    agendarPartida(() => proximaEtapa(), 800);
}

function bombaExplodir() {
    if (state.bomba_explodiu) return;
    console.log('💥 BOMBA EXPLODIU!');
    state.bomba_explodiu = true;
    state.bomba_ativa = false;
    if (state.bomba_interval) {
        clearInterval(state.bomba_interval);
        state.bomba_interval = null;
    }
    encerrarComDerrota('BOOOOM!', 'A bomba explodiu!');
}

function reiniciarAposExplosao() {
    esconderExplosaoUI();
    esconderBombaUI();
    esconderTodosOverlays();
    limparTodosIntervalos();
    resetarEstado();
    document.querySelectorAll('.fio-btn').forEach(btn => {
        btn.disabled = false;
        btn.className = `fio-btn fio-${btn.dataset.cor}`;
    });
    document.getElementById('btnIniciar').disabled = false;
    document.getElementById('btnIniciar').classList.remove('opacity-50', 'cursor-not-allowed');
    esconderComando();
    mostrarMensagem('🎮', 'Pronto para outra partida?', 'Escolha o tempo e clique em Iniciar Jogo.');
}

// ---------- DADOS ----------
function iniciarDados() {
    console.log('🎲 INICIANDO DADOS!');
    state.etapa = "DADOS";
    mostrarComando('🎲 PAR OU ÍMPAR', 'Some os dois dados e escolha se o resultado é PAR ou ÍMPAR.');
    state.dados_tempo_restante = CONFIG.DIFICULDADE.DADOS.TEMPO;
    mostrarDadosUI();
    atualizarStatusUI();
    rolarDados();
    atualizarDadosTempoUI(Math.ceil(state.tempo_restante));
    mostrarMensagem('🎲', 'DADOS ROLADOS!', 'A soma é PAR ou ÍMPAR?');
}

function rolarDados() {
    state.dados_valor1 = Math.floor(Math.random() * 6) + 1;
    state.dados_valor2 = Math.floor(Math.random() * 6) + 1;
    state.dados_soma = state.dados_valor1 + state.dados_valor2;
    atualizarDadosUI(state.dados_valor1, state.dados_valor2, state.dados_soma);
    atualizarDadosTempoUI(state.dados_tempo_restante);
}

function responderDados(resposta) {
    if (state.aguardando_reinicio) return;
    const isPar = state.dados_soma % 2 === 0;
    const correta = isPar ? 'par' : 'impar';
    if (resposta === correta) {
        registrarAcerto(80);
        clearInterval(state.dados_interval);
        state.dados_interval = null;
        esconderDadosUI();
        mostrarMensagem('✅', 'ACERTOU!', `${state.dados_soma} é ${isPar ? 'PAR' : 'ÍMPAR'}!`);
        agendarPartida(() => proximaEtapa(), 700);
    } else {
        clearInterval(state.dados_interval);
        state.dados_interval = null;
        reiniciarAposErro(`❌ ${state.dados_soma} é ${isPar ? 'PAR' : 'ÍMPAR'}!`);
    }
}

// ---------- SEQUÊNCIA MATEMÁTICA ----------
function iniciarSequenciaMatematica() {
    console.log('🧮 INICIANDO SEQUÊNCIA MATEMÁTICA!');
    state.etapa = "MATEMATICA";
    mostrarComando('🧮 MEMÓRIA MATEMÁTICA', 'Memorize os números que aparecem, some todos e digite o resultado.');
    state.matematica_indice_atual = 0;
    state.matematica_resultado = 0;
    state.matematica_tempo_restante = CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.QUANTIDADE_NUMEROS * CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.TEMPO_NUMERO + 3;
    state.matematica_numeros = [];
    for (let i = 0; i < CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.QUANTIDADE_NUMEROS; i++) {
        state.matematica_numeros.push(Math.floor(Math.random() * 9) + 1);
    }
    mostrarMatematicaUI();
    atualizarStatusUI();
    document.getElementById('respostaMatematica').value = '';
    document.getElementById('respostaMatematica').focus();
    state.matematica_indice_atual = 0;
    mostrarProximoNumeroMatematica();
    atualizarMatematicaTempoUI(Math.ceil(state.tempo_restante));
    mostrarMensagem('🧮', 'SEQUÊNCIA MATEMÁTICA!', 'Some todos os números!');
}

function mostrarProximoNumeroMatematica() {
    if (state.matematica_indice_atual >= state.matematica_numeros.length) {
        document.getElementById('sequenciaDisplay').textContent = '❓ QUAL O RESULTADO?';
        document.getElementById('sequenciaProgresso').style.width = '100%';
        return;
    }
    const numero = state.matematica_numeros[state.matematica_indice_atual];
    state.matematica_resultado += numero;
    document.getElementById('sequenciaDisplay').textContent = `${numero}`;
    document.getElementById('sequenciaProgresso').style.width =
        `${(state.matematica_indice_atual / state.matematica_numeros.length) * 100}%`;
    state.matematica_indice_atual++;
    agendarPartida(() => {
        mostrarProximoNumeroMatematica();
    }, CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.TEMPO_NUMERO * 1000);
}

function enviarRespostaMatematica() {
    if (state.aguardando_reinicio) return;
    if (state.matematica_indice_atual < state.matematica_numeros.length) {
        mostrarMensagem('⚠️', 'Aguarde!', 'Os números ainda estão sendo mostrados...');
        return;
    }
    const valor = document.getElementById('respostaMatematica').value.trim();
    const resposta = Number(valor);
    if (!valor || !Number.isSafeInteger(resposta)) {
        mostrarMensagem('⚠️', 'Digite um número inteiro válido!', '');
        return;
    }
    if (resposta === state.matematica_resultado) {
        registrarAcerto(130);
        clearInterval(state.matematica_interval);
        state.matematica_interval = null;
        esconderMatematicaUI();
        mostrarMensagem('✅', 'ACERTOU!', `Resultado: ${state.matematica_resultado}`);
        agendarPartida(() => proximaEtapa(), 700);
    } else {
        clearInterval(state.matematica_interval);
        state.matematica_interval = null;
        reiniciarAposErro(`❌ Resultado correto é ${state.matematica_resultado}! Você errou!`);
    }
}

// ---------- STROOP ----------
function iniciarStroop() {
    state.etapa = "STROOP";
    mostrarComando('🌀 COR VERSUS PALAVRA', 'Clique na COR da tinta. Ignore o nome escrito na palavra.');
    state.stroop_rodada_atual = 0;
    state.stroop_tempo_restante = CONFIG.DIFICULDADE.STROOP.TEMPO;
    state.stroop_bloqueado = false;
    const totalRodadas = CONFIG.DIFICULDADE.STROOP.QUANTIDADE_RODADAS;
    mostrarStroopUI();
    atualizarStatusUI();
    mostrarProximaRodadaStroop();
    atualizarStroopTempoUI(Math.ceil(state.tempo_restante));
    mostrarMensagem('🌀', 'TESTE DE STROOP!', 'Responda a COR da palavra, não o texto!');
}

function mostrarProximaRodadaStroop() {
    const totalRodadas = CONFIG.DIFICULDADE.STROOP.QUANTIDADE_RODADAS;
    if (state.stroop_rodada_atual >= totalRodadas) {
        clearInterval(state.stroop_interval);
        state.stroop_interval = null;
        esconderStroopUI();
        mostrarMensagem('✅', 'STROOP CONCLUÍDO!', 'Todas as cores foram identificadas!');
        agendarPartida(() => proximaEtapa(), 700);
        return;
    }
    const palavraIndex = Math.floor(Math.random() * CORES_STROOP.length);
    let corIndex;
    do {
        corIndex = Math.floor(Math.random() * CORES_STROOP.length);
    } while (corIndex === palavraIndex);
    const palavra = CORES_STROOP[palavraIndex];
    const cor = CORES_STROOP[corIndex];
    state.stroop_cor_correta = cor.nome.toLowerCase();
    state.stroop_bloqueado = false;
    state.stroop_rodada_atual++;
    atualizarStroopUI(palavra.nome, cor.cor, state.stroop_rodada_atual, totalRodadas);
    renderizarOpcoesStroop();
    state.stroop_tempo_restante = CONFIG.DIFICULDADE.STROOP.TEMPO;
    atualizarStroopTempoUI(state.stroop_tempo_restante);
}

function renderizarOpcoesStroop() {
    const container = document.getElementById('stroopOpcoes');
    if (!container) return;
    container.replaceChildren();
    embaralhar(CORES_STROOP).forEach(opcao => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'stroop-btn py-3 rounded-xl font-bold';
        botao.style.backgroundColor = opcao.cor;
        botao.textContent = opcao.nome;
        botao.addEventListener('click', () => responderStroop(opcao.nome.toLowerCase()));
        container.appendChild(botao);
    });
}

function responderStroop(resposta) {
    if (state.aguardando_reinicio || state.stroop_bloqueado || state.etapa !== 'STROOP') return;
    state.stroop_bloqueado = true;
    document.querySelectorAll('.stroop-btn').forEach(botao => botao.disabled = true);
    if (resposta === state.stroop_cor_correta) {
        const pontos = registrarAcerto(60);
        mostrarMensagem('✅', `ACERTOU! +${pontos}`, `A cor era ${state.stroop_cor_correta.toUpperCase()}`);
        agendarPartida(() => mostrarProximaRodadaStroop(), 250);
    } else {
        state.combo = 0;
        atualizarPontuacaoUI();
        clearInterval(state.stroop_interval);
        state.stroop_interval = null;
        reiniciarAposErro(`❌ A cor era ${state.stroop_cor_correta.toUpperCase()}! Você errou!`);
    }
}

// ---------- AÇÃO ESPECIAL ----------
function iniciarAcaoEspecial() {
    state.etapa = "ACAO";
    mostrarComando('🎭 MÍMICA FACIAL', 'Faça com o rosto exatamente a ação mostrada no centro da tela.');
    state.acao_executada = false;
    state.acao_frames = 0;
    state.acao_tempo_restante = CONFIG.DIFICULDADE.ACAO_ESPECIAL.TEMPO;
    const acao = ACOES_ESPECIAIS[Math.floor(Math.random() * ACOES_ESPECIAIS.length)];
    state.acao_atual = acao;
    const alvoGuia = acao.acao === 'boca' ? 'FELIZ' : acao.acao === 'sobrancelhas' ? 'BRAVO' : 'TRISTE';
    atualizarGuiaFacial(alvoGuia, state.expressao_atual, 0);
    mostrarAcaoUI();
    atualizarStatusUI();
    atualizarAcaoUI(acao);
    atualizarAcaoTempoUI(state.acao_tempo_restante);
    atualizarAcaoTempoUI(Math.ceil(state.tempo_restante));
    mostrarMensagem('👀', 'AÇÃO ESPECIAL!', acao.texto);
}

function verificarAcaoEspecial(expressao) {
    if (state.etapa !== "ACAO" || state.acao_executada) return;
    const acao = state.acao_atual;
    if (!acao) return;
    let executou = false;
    switch(acao.acao) {
        case 'boca': if (expressao === "FELIZ") executou = true; break;
        case 'sobrancelhas': if (expressao === "BRAVO") executou = true; break;
        case 'careta': if (expressao === "BRAVO" || expressao === "TRISTE") executou = true; break;
        default:
            if (expressao !== "NEUTRO" && expressao !== "NADA") executou = true;
    }
    state.acao_frames = executou ? state.acao_frames + 1 : 0;
    atualizarAcaoProgressoUI(limitar((state.acao_frames / 10) * 100, 0, 100));
    if (executou) atualizarAcaoStatusUI('✅ Expressão certa — segure a careta!');
    else atualizarAcaoStatusUI('🔎 Faça uma careta mais marcada');
    if (state.acao_frames >= 10) {
        state.acao_executada = true;
        registrarAcerto(110);
        clearInterval(state.acao_interval);
        state.acao_interval = null;
        atualizarAcaoStatusUI('✅ AÇÃO EXECUTADA!');
        atualizarAcaoProgressoUI(100);
        mostrarMensagem('✅', 'AÇÃO EXECUTADA!', 'Ótimo trabalho!');
        agendarPartida(() => {
            esconderAcaoUI();
            proximaEtapa();
        }, 700);
    }
}

function iniciarGestoMao() {
    state.etapa = 'MAO';
    state.gesto_mao_frames = 0;
    const gesto = GESTOS_MAO[Math.floor(Math.random() * GESTOS_MAO.length)];
    state.gesto_mao_alvo = gesto.id;
    mostrarComando('🖐️ GESTO COM A MÃO', `${gesto.texto}. Mantenha a palma voltada para a câmera.`);
    atualizarAcaoUI(gesto);
    atualizarAcaoStatusUI('👋 Coloque a mão inteira dentro da câmera');
    atualizarAcaoTempoUI(Math.ceil(state.tempo_restante));
    mostrarAcaoUI();
    atualizarStatusUI();
    carregarHandPose();
}

// ---------- EVENTOS ALEATÓRIOS ----------
let eventosAgendados = [];
const ETAPAS_PERMITIDAS_EVENTOS = ['TIMER', 'BOMBA', 'DADOS', 'MATEMATICA', 'STROOP', 'ACAO', 'MAO'];

function iniciarEventosAleatorios() {
    if (!CONFIG.DIFICULDADE.EVENTOS.ATIVO) return;
    if (state.eventos_interval) return;
    const quantidade = CONFIG.DIFICULDADE.EVENTOS.QUANTIDADE_POR_PARTIDA;
    eventosAgendados = [];
    for (let i = 0; i < quantidade; i++) {
        const delay = Math.floor(Math.random() *
            (CONFIG.DIFICULDADE.EVENTOS.INTERVALO_MAXIMO - CONFIG.DIFICULDADE.EVENTOS.INTERVALO_MINIMO) +
            CONFIG.DIFICULDADE.EVENTOS.INTERVALO_MINIMO);
        eventosAgendados.push({ delay, executado: false });
    }
    let eventosExecutados = 0;
    state.eventos_interval = setInterval(() => {
        if (!ETAPAS_PERMITIDAS_EVENTOS.includes(state.etapa)) return;
        for (let i = 0; i < eventosAgendados.length; i++) {
            if (!eventosAgendados[i].executado) {
                eventosAgendados[i].executado = true;
                eventosExecutados++;
                executarEventoAleatorio();
                break;
            }
        }
        if (eventosExecutados >= eventosAgendados.length) {
            clearInterval(state.eventos_interval);
            state.eventos_interval = null;
        }
    }, 5000);
}

function pararEventosAleatorios() {
    if (state.eventos_interval) {
        clearInterval(state.eventos_interval);
        state.eventos_interval = null;
    }
    eventosAgendados = [];
    esconderEventoUI();
}

function executarEventoAleatorio() {
    const evento = EVENTOS_ALEATORIOS[Math.floor(Math.random() * EVENTOS_ALEATORIOS.length)];
    mostrarEventoUI(evento.emoji, evento.texto, evento.descricao);
    switch(evento.id) {
        case 'tempestade':
            document.body.classList.add('flash-active');
            setTimeout(() => document.body.classList.remove('flash-active'), evento.duracao * 1000);
            break;
        case 'luz':
            document.querySelectorAll('.fio-btn').forEach(btn => {
                btn.style.opacity = '1';
                btn.style.filter = 'brightness(1.5)';
            });
            setTimeout(() => {
                document.querySelectorAll('.fio-btn').forEach(btn => {
                    btn.style.opacity = '';
                    btn.style.filter = '';
                });
            }, evento.duracao * 1000);
            break;
        case 'silencio':
            pararSomTimer();
            setTimeout(() => iniciarSomTimer(), evento.duracao * 1000);
            break;
        case 'alarme':
            break;
        case 'tempo_extra':
            state.tempo_restante += 3;
            atualizarTimerUI();
            mostrarMensagem('⏰', 'TEMPO EXTRA!', '+3 segundos!');
            break;
        case 'falha':
            state.tempo_restante = Math.max(0, state.tempo_restante - 3);
            atualizarTimerUI();
            mostrarMensagem('💥', 'FALHA!', '-3 segundos!');
            break;
    }
    setTimeout(() => esconderEventoUI(), Math.max(evento.duracao * 1000, 2000));
}

// ---------- FLUXO DO JOGO ----------
const DESAFIOS_DISPONIVEIS = ['SORRISO', 'PERGUNTA', 'BOMBA', 'DADOS', 'MATEMATICA', 'STROOP', 'ACAO', 'MAO'];
const NOMES_DESAFIOS = {
    SORRISO: 'Sorriso relâmpago',
    PERGUNTA: 'Pergunta surpresa',
    BOMBA: 'Desarme a bomba',
    DADOS: 'Par ou ímpar',
    MATEMATICA: 'Memória matemática',
    STROOP: 'Cor versus palavra',
    ACAO: 'Mímica facial',
    MAO: 'Gesto com a mão'
};

function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function gerarSequenciaDesafios(quantidade) {
    const sequencia = [];
    while (sequencia.length < quantidade) {
        const lote = embaralhar(DESAFIOS_DISPONIVEIS);
        if (sequencia.length && lote[0] === sequencia[sequencia.length - 1] && lote.length > 1) {
            [lote[0], lote[1]] = [lote[1], lote[0]];
        }
        sequencia.push(...lote);
    }
    return sequencia.slice(0, quantidade);
}

function configurarPartida() {
    const tempo = obterTempoSelecionado();
    let quantidade;
    if (tempo <= 15) {
        quantidade = 4;
        state.dificuldade = 'HARD';
        CONFIG.TEMPO_SORRISO = 1;
        CONFIG.TEMPO_BOMBA = 4;
        CONFIG.DIFICULDADE.DADOS.TEMPO = 2;
        CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.TEMPO_NUMERO = 0.4;
        CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.QUANTIDADE_NUMEROS = 3;
        CONFIG.DIFICULDADE.STROOP.TEMPO = 2;
        CONFIG.DIFICULDADE.STROOP.QUANTIDADE_RODADAS = 1;
        CONFIG.DIFICULDADE.ACAO_ESPECIAL.TEMPO = 2;
    } else if (tempo <= 30) {
        quantidade = 9;
        state.dificuldade = 'MÉDIO';
        CONFIG.TEMPO_SORRISO = 1.5;
        CONFIG.TEMPO_BOMBA = 7;
        CONFIG.DIFICULDADE.DADOS.TEMPO = 4;
        CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.TEMPO_NUMERO = 0.7;
        CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.QUANTIDADE_NUMEROS = 3;
        CONFIG.DIFICULDADE.STROOP.TEMPO = 3;
        CONFIG.DIFICULDADE.STROOP.QUANTIDADE_RODADAS = 2;
        CONFIG.DIFICULDADE.ACAO_ESPECIAL.TEMPO = 3;
    } else {
        quantidade = 15;
        state.dificuldade = 'FÁCIL';
        CONFIG.TEMPO_SORRISO = 3;
        CONFIG.TEMPO_BOMBA = 15;
        CONFIG.DIFICULDADE.DADOS.TEMPO = 5;
        CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.TEMPO_NUMERO = 1.2;
        CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.QUANTIDADE_NUMEROS = 4;
        CONFIG.DIFICULDADE.STROOP.TEMPO = 5;
        CONFIG.DIFICULDADE.STROOP.QUANTIDADE_RODADAS = 3;
        CONFIG.DIFICULDADE.ACAO_ESPECIAL.TEMPO = 5;
    }
    state.desafios = gerarSequenciaDesafios(quantidade);
    state.desafio_indice = -1;
    console.log(`🎲 Partida ${state.dificuldade}:`, state.desafios);
}

function proximaEtapa() {
    if (!state.timer_ativo || state.tempo_restante <= 0) return;
    state.desafio_indice++;
    if (state.desafio_indice >= state.desafios.length) {
        finalizarJogo();
        return;
    }
    const proxima = state.desafios[state.desafio_indice];
    const progresso = `${state.desafio_indice + 1}/${state.desafios.length}`;
    console.log(`🔄 Desafio ${progresso}: ${proxima}`);
    mostrarMensagem('🎯', `Desafio ${progresso}`, NOMES_DESAFIOS[proxima] || proxima);
    switch(proxima) {
        case 'SORRISO': iniciarSorriso(); break;
        case 'PERGUNTA': iniciarPerguntas(); break;
        case 'BOMBA': iniciarBomba(); break;
        case 'DADOS': iniciarDados(); break;
        case 'MATEMATICA': iniciarSequenciaMatematica(); break;
        case 'STROOP': iniciarStroop(); break;
        case 'ACAO': iniciarAcaoEspecial(); break;
        case 'MAO': iniciarGestoMao(); break;
        default: console.error('❌ Etapa não implementada:', proxima);
    }
}

function encerrarPorTempo() {
    encerrarComDerrota('TEMPO ESGOTADO!', `Você chegou ao desafio ${Math.min(state.desafio_indice + 1, state.desafios.length)} de ${state.desafios.length}.`);
}

function finalizarJogo() {
    console.log('🏆 VITÓRIA FINAL!');
    mostrarVitoriaFinalUI();
    esconderComando();
    pararTodosAudios();
    tocarAudioResultado('vitoria');
    pararEventosAleatorios();
    limparTodosIntervalos();
    state.timer_ativo = false;
    state.etapa = "FINALIZADO";
    const resultado = document.getElementById('resultadoFinal');
    if (resultado) resultado.textContent = `${state.pontuacao.toLocaleString('pt-BR')} pontos · ${state.dificuldade}`;
    atualizarStatusUI();
    mostrarMensagem('🏆', 'VOCÊ VENCEU!', `${state.desafios.length} desafios concluídos no nível ${state.dificuldade}!`);
}

function reiniciarJogoComErro(mensagem) {
    console.log(`❌ Erro: ${mensagem}`);
    pararTodosAudios();
    pararEventosAleatorios();
    limparTodosIntervalos();
    esconderTodosOverlays();
    resetarEstado();
    document.getElementById('btnIniciar').disabled = false;
    document.getElementById('btnIniciar').classList.remove('opacity-50', 'cursor-not-allowed');
    setTimeout(() => {
        iniciarTimer();
        mostrarMensagem('🔄', 'Timer reiniciado!', mensagem);
    }, 1500);
}

function limparTodosIntervalos() {
    const intervals = ['timer_interval','bomba_interval','dados_interval','matematica_interval','stroop_interval','acao_interval','eventos_interval'];
    intervals.forEach(key => {
        if (state[key]) {
            clearInterval(state[key]);
            state[key] = null;
        }
    });
}

function esconderTodosOverlays() {
    const ids = ['smileOverlay','perguntaOverlay','bombaOverlay','dadosOverlay','matematicaOverlay','stroopOverlay','acaoOverlay','eventoOverlay','explosaoOverlay','vitoriaFinalOverlay'];
    ids.forEach(id => hideOverlay(id));
}

function resetarEstado() {
    pararAudioResultado();
    state.partida_id++;
    state.etapa = "INICIAL";
    state.timer_ativo = false;
    state.tempo_restante = state.tempo_total;
    state.pergunta_atual_index = 0;
    state.perguntas_respondidas = 0;
    state.aguardando_reinicio = false;
    state.bomba_ativa = false;
    state.bomba_desarmada = false;
    state.bomba_explodiu = false;
    state.fios_cortados = [];
    state.acao_executada = false;
    state.historico_expressoes = [];
    state.expressao_atual = "NEUTRO";
    state.desafios = [];
    state.desafio_indice = -1;
    state.pontuacao = 0;
    state.combo = 0;
    state.stroop_bloqueado = false;
    historicoFaceMesh = [];
    limparTodosIntervalos();
    atualizarPontuacaoUI();
}

// ---------- INICIALIZAÇÃO ----------
function iniciarComExpressao() {
    resetarEstado();
    configurarPartida();
    const expressoes = Object.keys(EXPRESSOES);
    const alvo = expressoes[Math.floor(Math.random() * expressoes.length)];
    state.expressao_alvo = alvo;
    state.etapa = "EXPRESSAO";
    state.tempo_expressao_inicio = 0;
    document.getElementById('targetEmoji').textContent = EXPRESSOES[alvo].emoji;
    document.getElementById('targetName').textContent = alvo;
    document.getElementById('targetDica').textContent = `💡 ${EXPRESSOES[alvo].dica}`;
    document.getElementById('targetBar').style.width = '0%';
    document.getElementById('targetTime').textContent = `0/${CONFIG.TEMPO_EXPRESSAO}s`;
    showOverlay('targetOverlay');
    atualizarGuiaFacial(alvo, state.expressao_atual, 0);
    document.getElementById('btnIniciar').disabled = true;
    document.getElementById('btnIniciar').classList.add('opacity-50', 'cursor-not-allowed');
    mostrarMensagem('🎯', `Faça a expressão: ${EXPRESSOES[alvo].emoji} ${alvo}`, `💡 ${EXPRESSOES[alvo].dica}`);
    atualizarStatusUI();
}

function fecharVitoriaFinal() {
    hideOverlay('vitoriaFinalOverlay');
    pararTimer();
    mostrarMensagem('🏁', 'Jogo finalizado!', 'Você completou todas as etapas! 🎉');
}

// ----- DOM CONTENT LOADED -----
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aplicação Timer do Sorriso...');
    initAudio();
    initCameraElements();

    mostrarLoading('Inicializando sistema de detecção...');
    
    iniciarCamera().then(success => {
        if (success) {
            console.log('✅ Câmera iniciada!');
            atualizarCameraStatus(true);
            carregarFaceMesh();
        } else {
            console.log('⚠️ Falha na câmera');
            atualizarCameraStatus(false);
            mostrarMensagem('❌', 'Câmera não disponível!', 'Verifique as permissões');
            esconderLoading();
            iniciarDeteccaoManual();
        }
    });

    document.getElementById('customTime').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') iniciarTimer();
    });
    document.getElementById('customTime').addEventListener('change', function() {
        this.value = obterTempoSelecionado();
    });
    document.getElementById('respostaInputOverlay').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') enviarRespostaOverlay();
    });
    document.getElementById('respostaMatematica').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') enviarRespostaMatematica();
    });

    setTimer(CONFIG.TEMPO_PADRAO);
    console.log('✅ Aplicação inicializada com sucesso!');
});

// Inicia a partida pela expressão de desbloqueio
function iniciarTimer() {
    if (!state.camera_ativa) {
        mostrarMensagem('❌', 'Câmera não está ativa!', '');
        iniciarCamera();
        return;
    }
    iniciarComExpressao();
}

// EXPORTA FUNÇÕES GLOBAIS
window.setTimer = setTimer;
window.iniciarTimer = iniciarTimer;
window.pararTimer = pararTimer;
window.enviarRespostaOverlay = enviarRespostaOverlay;
window.responderDados = responderDados;
window.iniciarDados = iniciarDados;
window.enviarRespostaMatematica = enviarRespostaMatematica;
window.iniciarSequenciaMatematica = iniciarSequenciaMatematica;
window.responderStroop = responderStroop;
window.iniciarStroop = iniciarStroop;
window.iniciarAcaoEspecial = iniciarAcaoEspecial;
window.cortarFio = cortarFio;
window.reiniciarAposExplosao = reiniciarAposExplosao;
window.bombaDesarmar = bombaDesarmar;
window.fecharVitoriaFinal = fecharVitoriaFinal;
window.testarExpressao = testarExpressao;

window.addEventListener('beforeunload', function() {
    pararCamera();
    pararTodosAudios();
    pararEventosAleatorios();
    limparTodosIntervalos();
});
