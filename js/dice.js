// TimerFace Rush — dice

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
