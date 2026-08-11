// TimerFace Rush — game
// Carregado como script clássico para compartilhar o estado do jogo.

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
    const duracao = Math.max(0.001, (Date.now() - state.tempo_inicio) / 1000);
    const resultadoRanking = registrarResultadoRanking(state.tempo_total, duracao, state.pontuacao);
    mostrarVitoriaFinalUI();
    pararCapturasMelhoresMomentos();
    esconderComando();
    pararTodosAudios();
    tocarAudioResultado('vitoria');
    pararEventosAleatorios();
    limparTodosIntervalos();
    state.timer_ativo = false;
    state.etapa = "FINALIZADO";
    const resultado = document.getElementById('resultadoFinal');
    if (resultado) {
        const colocacao = resultadoRanking?.posicao ? ` · ${resultadoRanking.posicao}º no ranking` : '';
        const recorde = resultadoRanking?.novoRecorde ? ' · NOVO RECORDE!' : '';
        resultado.textContent = `${formatarTempoRanking(duracao)} · ${state.pontuacao.toLocaleString('pt-BR')} pontos${colocacao}${recorde}`;
    }
    atualizarStatusUI();
    mostrarMensagem('🏆', 'VOCÊ VENCEU!', `${state.desafios.length} desafios concluídos no nível ${state.dificuldade}!`);
    setTimeout(mostrarMelhoresMomentos, 1800);
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
    const intervals = ['timer_interval','bomba_interval','dados_interval','matematica_interval','stroop_interval','acao_interval','captura_interval','timelapse_interval'];
    intervals.forEach(key => {
        if (state[key]) {
            clearInterval(state[key]);
            state[key] = null;
        }
    });
}

function esconderTodosOverlays() {
    const ids = ['targetOverlay','smileOverlay','perguntaOverlay','bombaOverlay','dadosOverlay','matematicaOverlay','stroopOverlay','acaoOverlay','eventoOverlay','explosaoOverlay','vitoriaFinalOverlay','melhoresMomentosOverlay'];
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
    state.acao_atual = null;
    state.acao_frames = 0;
    state.gesto_mao_alvo = null;
    state.gesto_mao_frames = 0;
    state.historico_expressoes = [];
    state.expressao_alvo = null;
    state.expressao_atual = "NEUTRO";
    state.iniciando_desafios = false;
    state.rosto_detectado = false;
    state.deteccao_estavel = false;
    state.ultima_face_detectada = 0;
    state.ultima_boca = 0;
    state.ultimo_olho = 0;
    state.ultima_sobrancelha = 0;
    state.tempo_expressao_inicio = 0;
    state.expressao_progresso_ms = 0;
    state.expressao_ultimo_frame = 0;
    state.tempo_sorriso_inicio = 0;
    state.sorriso_progresso_ms = 0;
    state.sorriso_ultimo_frame = 0;
    state.desafios = [];
    state.desafio_indice = -1;
    state.pontuacao = 0;
    state.combo = 0;
    state.stroop_bloqueado = false;
    state.melhores_momentos = [];
    historicoFaceMesh = [];
    historicoExpressoes = [];
    ultimaInferenciaMao = 0;
    frameCount = 0;
    limparTodosIntervalos();
    atualizarPontuacaoUI();
}

// ---------- INICIALIZAÇÃO ----------
function iniciarComExpressao() {
    resetarEstado();
    configurarPartida();
    // Um ciclo novo impede inferências da partida anterior de alterarem o progresso atual.
    if (state.camera_ativa && (faceMeshModel || state.manualFallback)) reiniciarDetectorCamera();
    const alvo = EXPRESSOES_DESBLOQUEIO[Math.floor(Math.random() * EXPRESSOES_DESBLOQUEIO.length)];
    state.expressao_alvo = alvo;
    state.etapa = "EXPRESSAO";
    iniciarCapturasMelhoresMomentos();
    const partidaAtual = state.partida_id;
    setTimeout(() => {
        if (state.partida_id !== partidaAtual || state.etapa !== 'EXPRESSAO') return;
        if (!state.ultima_face_detectada) {
            console.warn('Detector sem rosto na nova partida; reiniciando o ciclo de inferência.');
            reiniciarDetectorCamera();
        }
    }, 2500);
    state.tempo_expressao_inicio = 0;
    state.expressao_progresso_ms = 0;
    state.expressao_ultimo_frame = performance.now();
    document.getElementById('targetEmoji').textContent = EXPRESSOES[alvo].emoji;
    document.getElementById('targetName').textContent = alvo;
    document.getElementById('targetDica').textContent = `💡 ${EXPRESSOES[alvo].dica}`;
    document.getElementById('targetBar').style.width = '0%';
    document.getElementById('targetTime').textContent = `0/${CONFIG.TEMPO_EXPRESSAO}s`;
    showOverlay('targetOverlay');
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

    document.getElementById('respostaInputOverlay').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') enviarRespostaOverlay();
    });
    document.getElementById('respostaMatematica').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') enviarRespostaMatematica();
    });

    inicializarRanking();
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
window.reproduzirTimelapse = reproduzirTimelapse;
window.baixarTimelapse = baixarTimelapse;
window.fecharMelhoresMomentos = fecharMelhoresMomentos;

window.addEventListener('beforeunload', function() {
    pararCamera();
    pararTodosAudios();
    pararEventosAleatorios();
    limparTodosIntervalos();
});
