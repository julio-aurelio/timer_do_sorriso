// TimerFace Rush — actions

// ---------- AÇÃO ESPECIAL ----------
function iniciarAcaoEspecial() {
    state.etapa = "ACAO";
    mostrarComando('🎭 MÍMICA FACIAL', 'Faça com o rosto exatamente a ação mostrada no centro da tela.');
    state.acao_executada = false;
    state.acao_frames = 0;
    state.acao_tempo_restante = CONFIG.DIFICULDADE.ACAO_ESPECIAL.TEMPO;
    const acao = ACOES_ESPECIAIS[Math.floor(Math.random() * ACOES_ESPECIAIS.length)];
    state.acao_atual = acao;
    const alvoGuia = acao.acao === 'feliz' ? 'FELIZ' : acao.acao === 'bravo' ? 'BRAVO' : 'TRISTE';
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
        case 'feliz': executou = expressao === "FELIZ"; break;
        case 'bravo': executou = expressao === "BRAVO"; break;
        case 'triste': executou = expressao === "TRISTE"; break;
        default:
            if (expressao !== "NEUTRO" && expressao !== "NADA") executou = true;
    }
    state.acao_frames = executou ? state.acao_frames + 1 : Math.max(0, state.acao_frames - 0.5);
    atualizarAcaoProgressoUI(limitar((state.acao_frames / 5) * 100, 0, 100));
    if (executou) atualizarAcaoStatusUI('✅ Expressão certa — segure a careta!');
    else atualizarAcaoStatusUI('🔎 Faça uma careta mais marcada');
    if (state.acao_frames >= 5) {
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
