// TimerFace Rush — bomb

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
