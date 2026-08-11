// TimerFace Rush — timer
// Carregado como script clássico para compartilhar o estado do jogo.

// ---------- EXPRESSÕES (verificação de fluxo) ----------
function verificarFluxoExpressao(expressao) {
    // Etapas faciais precisam receber também NEUTRO/NADA para reduzir o
    // progresso suavemente quando o modelo oscila entre frames.
    if (state.etapa === "EXPRESSAO") { verificarExpressaoAlvo(expressao); return; }
    if (state.etapa === "SORRISO") { verificarSorriso(expressao); return; }
    if (state.etapa === "ACAO") { verificarAcaoEspecial(expressao); return; }
    if (expressao === "NEUTRO" || expressao === "NADA") return;
    switch(state.etapa) {
        default: break;
    }
}

function atualizarProgressoTolerante(valorAtual, correto, deltaMs, totalMs) {
    // FaceMesh costuma rodar entre 3 e 15 FPS dependendo do celular.
    const deltaSeguro = limitar(deltaMs, 0, 350);
    const novoValor = correto
        ? valorAtual + deltaSeguro
        : valorAtual - deltaSeguro * 0.35;
    return limitar(novoValor, 0, totalMs);
}

function verificarExpressaoAlvo(expressao) {
    atualizarCardExpressaoInicial();
    if (state.iniciando_desafios) return;
    const agora = performance.now();
    const delta = state.expressao_ultimo_frame ? agora - state.expressao_ultimo_frame : 0;
    state.expressao_ultimo_frame = agora;
    const totalMs = CONFIG.TEMPO_EXPRESSAO * 1000;
    state.expressao_progresso_ms = atualizarProgressoTolerante(
        state.expressao_progresso_ms,
        expressao === state.expressao_alvo,
        delta,
        totalMs
    );
    const progresso = (state.expressao_progresso_ms / totalMs) * 100;
    const segundos = Math.min(CONFIG.TEMPO_EXPRESSAO, Math.floor(state.expressao_progresso_ms / 1000));
    document.getElementById('targetBar').style.width = `${progresso}%`;
    document.getElementById('targetTime').textContent = `${segundos}/${CONFIG.TEMPO_EXPRESSAO}s`;
    if (state.expressao_progresso_ms >= totalMs) {
        state.iniciando_desafios = true;
        hideOverlay('targetOverlay');
        iniciarTimerReal();
    }
}

function verificarSorriso(expressao) {
    const agora = performance.now();
    const delta = state.sorriso_ultimo_frame ? agora - state.sorriso_ultimo_frame : 0;
    state.sorriso_ultimo_frame = agora;
    const totalMs = CONFIG.TEMPO_SORRISO * 1000;
    state.sorriso_progresso_ms = atualizarProgressoTolerante(
        state.sorriso_progresso_ms, expressao === "FELIZ", delta, totalMs
    );
    const progresso = (state.sorriso_progresso_ms / totalMs) * 100;
    document.getElementById('smileBar').style.width = `${progresso}%`;
    document.getElementById('smileTime').textContent = `${Math.floor(state.sorriso_progresso_ms / 1000)}/${CONFIG.TEMPO_SORRISO}s`;
    if (state.sorriso_progresso_ms >= totalMs) {
        esconderSmileUI();
        state.sorriso_progresso_ms = 0;
        registrarAcerto(100);
        proximaEtapa();
    }
}

// ---------- TIMER ----------
let tempoSelecionado = CONFIG.TEMPO_PADRAO;

function validarTempo(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return tempoSelecionado;
    return Math.round(limitar(numero, CONFIG.TEMPO_MIN, CONFIG.TEMPO_MAX));
}

function atualizarCardExpressaoInicial() {
    if (state.etapa !== 'EXPRESSAO') return;
    const alvo = state.expressao_alvo;
    if (!EXPRESSOES[alvo]) return;
    document.getElementById('targetEmoji').textContent = EXPRESSOES[alvo].emoji;
    document.getElementById('targetName').textContent = alvo;
    document.getElementById('targetDica').textContent = `💡 ${EXPRESSOES[alvo].dica}`;
}

function obterTempoSelecionado() {
    return validarTempo(tempoSelecionado);
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
    document.querySelectorAll('.btn-tempo').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
    });
    document.querySelector(`.btn-tempo[data-tempo="${tempoSelecionado}"]`)?.classList.add('border-blue-500', 'bg-blue-50');
    atualizarRankingUI(tempoSelecionado);
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
    mostrarComando('⏱️ TIMER LIGADO', 'VALENDO! Prepare-se para o primeiro desafio...');
    agendarPartida(() => proximaEtapa(), 650);
}

function pararTimer() {
    limparTodosIntervalos();
    resetarEstado();
    if (state.camera_ativa) reiniciarDetectorCamera();
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
    state.sorriso_progresso_ms = 0;
    state.sorriso_ultimo_frame = 0;
    mostrarSmileUI();
    resetarSmileUI();
    mostrarComando('😊 SORRISO', 'Sorria e mantenha a expressão até completar a barra.');
    atualizarStatusUI();
    mostrarMensagem('😊', 'DESAFIO DO SORRISO!', 'Mantenha o sorriso por 3 segundos!');
}
