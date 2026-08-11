// TimerFace Rush — stroop

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
