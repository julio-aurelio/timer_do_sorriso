// TimerFace Rush — state
// Carregado como script clássico para compartilhar o estado do jogo.

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
    expressao_progresso_ms: 0,
    expressao_ultimo_frame: 0,
    iniciando_desafios: false,
    tempo_sorriso_inicio: 0,
    sorriso_progresso_ms: 0,
    sorriso_ultimo_frame: 0,

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

    captura_interval: null,
    timelapse_interval: null,
    melhores_momentos: [],

    camera_ativa: false,
    animation_id: null,

    som_tocando: false,
    suspense_tocando: false,
    audio_context: null,
    volume_atual: 0.3,
    
    rosto_detectado: false,
    ultima_deteccao: Date.now(),
    ultima_face_detectada: 0,
    deteccao_estavel: false,
    manualFallback: false,
    modelo_carregado: false,
    
    // Para análise de expressão
    ultima_boca: 0,
    ultimo_olho: 0,
    ultima_sobrancelha: 0
};
