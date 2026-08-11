// TimerFace Rush — audio

// ---------- ÁUDIO ----------
let suspenseAudioElement = null;
let timerAudioElement = null;
let resultadoAudioElement = null;
let ultimoTimerAudio = '';
let ultimoResultadoAudio = '';
const TIMER_AUDIOS = ['assets/timerAudio.wav', 'assets/timerAudio2.mp3', 'assets/timerAudio3.mp3','assets/timerAudio4.mp3'];
const AUDIOS_VITORIA = [
    'audios_vitoria/acabou.mp3', 'audios_vitoria/ai-que-delicia-mickey.mp3',
    'audios_vitoria/bora-bill.mp3',
    'audios_vitoria/comedy-male-yelling-yee-ha-sound-effects-free-download-mp3cut.mp3',
    'audios_vitoria/hmmmm-eu-gosto-e-assim-amostradinho_043431.mp3','efeitos-sonoros-brasil-sil-sil-rede-globo.mp3'
];
const AUDIOS_DERROTA = [
    'audios_derrota/apaga-essa-peste-ai_092732.mp3', 'audios_derrota/faaah_203440.mp3',
    'audios_derrota/nao-consegue-ne_233542.mp3',
    'audios_derrota/que-show-da-xuxa-e-esse_035822.mp3','deus-me-perdoe-fake-natty-1.mp3'
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
