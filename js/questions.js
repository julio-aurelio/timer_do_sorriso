// TimerFace Rush — questions

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
    pararCapturasMelhoresMomentos();
    limparTodosIntervalos();
    pararTodosAudios();
    tocarAudioResultado('derrota');
    pararEventosAleatorios();
    esconderTodosOverlays();
    esconderComando();
    document.getElementById('derrotaTitulo').textContent = titulo;
    document.getElementById('derrotaMotivo').textContent = `${motivo} Pontuação: ${state.pontuacao.toLocaleString('pt-BR')}`;
    mostrarExplosaoUI();
    atualizarStatusUI();
    setTimeout(mostrarMelhoresMomentos, 1800);
}
