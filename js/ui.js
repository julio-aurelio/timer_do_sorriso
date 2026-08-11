// TimerFace Rush — ui
// Carregado como script clássico para compartilhar o estado do jogo.

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
