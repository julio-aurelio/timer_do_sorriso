// TimerFace Rush — config
// Carregado como script clássico para compartilhar o estado do jogo.

// ---------- CONFIGURAÇÕES ----------
const CONFIG = {
    TEMPO_PADRAO: 30,
    TEMPO_MIN: 1,
    TEMPO_MAX: 3600,
    TEMPO_EXPRESSAO: 5,
    TEMPO_SORRISO: 3,
    TEMPO_BOMBA: 15,
    BONUS_POR_DESAFIO: 15,
    TOTAL_PERGUNTAS: 1,
    LIMITE_SUSPENSE: 20,
    DIFICULDADE: {
        TEMPO_RESPOSTA: 5,
        DADOS: { ATIVO: true, TEMPO: 5, QUANTIDADE_RODADAS: 1 },
        SEQUENCIA_MATEMATICA: { ATIVO: true, TEMPO_NUMERO: 2, QUANTIDADE_NUMEROS: 5 },
        STROOP: { ATIVO: true, TEMPO: 5, QUANTIDADE_RODADAS: 3 },
        ACAO_ESPECIAL: { ATIVO: true, TEMPO: 5, QUANTIDADE_ACOES: 1 }
    }
};

const PERGUNTAS = [
    { id: 1, pergunta: "Qual a capital do Brasil?", respostas: ["brasilia", "brasília"], dica: "Começa com B" },
    { id: 2, pergunta: "Quantos planetas tem no sistema solar?", respostas: ["8", "oito"], dica: "É um número par" },
    { id: 3, pergunta: "Qual o maior oceano do mundo?", respostas: ["pacífico", "pacifico"], dica: "Começa com P" },
    { id: 4, pergunta: "Em que ano o homem pisou na lua?", respostas: ["1969"], dica: "Termina com 9" },
    { id: 5, pergunta: "Qual a fórmula da água?", respostas: ["h2o", "H2O"], dica: "2 hidrogênios e 1 oxigênio" },
    { id: 6, pergunta: "Qual é o maior planeta do sistema solar?", respostas: ["júpiter", "jupiter"], dica: "Começa com J" },
    { id: 7, pergunta: "Qual a montanha mais alta do mundo?", respostas: ["monte everest", "Everest"], dica: "Está no Himalaia" },
    { id: 8, pergunta: "Qual o país mais populoso do mundo?", respostas: ["índia", "india"], dica: "Fica na Ásia" },
    { id: 9, pergunta: "Qual a moeda oficial dos Estados Unidos?", respostas: ["dólar", "dolar"], dica: "Começa com D" },
    { id: 10, pergunta: "Qual a língua mais falada do mundo?", respostas: ["mandarim", "chinês"], dica: "É da China" },
    { id: 11, pergunta: "Quanto é 7 x 8?", respostas: ["56"], dica: "É um número par" },
    { id: 12, pergunta: "Qual a cor do céu em um dia limpo?", respostas: ["azul"], dica: "É a cor do mar" },
    { id: 13, pergunta: "Qual o animal terrestre mais rápido do mundo?", respostas: ["chita", "guepardo"], dica: "Vive na África" },
    { id: 14, pergunta: "Qual a capital da França?", respostas: ["paris"], dica: "Cidade do amor" },
    { id: 15, pergunta: "Qual a estação do ano mais quente?", respostas: ["verão", "verao"], dica: "Faz calor" },
    { id: 16, pergunta: "Qual o menor país do mundo?", respostas: ["vaticano"], dica: "Fica na Itália" },
    { id: 17, pergunta: "Quanto é 12 x 15?", respostas: ["180"], dica: "Multiplique 12 por 15" },
    { id: 18, pergunta: "Qual a capital da Austrália?", respostas: ["camberra"], dica: "Não é Sydney" },
    { id: 19, pergunta: "Qual o elemento mais abundante no universo?", respostas: ["hidrogênio", "hidrogenio"], dica: "H" },
    { id: 20, pergunta: "Em que ano terminou a Segunda Guerra Mundial?", respostas: ["1945"], dica: "Termina com 5" }
];

const EXPRESSOES = {
    "FELIZ": { emoji: "😊", dica: "SORRIA mostrando os dentes!" },
    "BRAVO": { emoji: "😠", dica: "FRANZA A TESTA e aperte os olhos!" },
    "TRISTE": { emoji: "😢", dica: "ABRA BEM OS OLHOS e faça boca de triste!" }
};

// O desbloqueio nunca usa estados de detecção como NEUTRO ou NADA.
const EXPRESSOES_DESBLOQUEIO = ['FELIZ', 'BRAVO', 'TRISTE'];

const EMOJIS_EXPRESSOES = {
    'FELIZ': '😊', 'BRAVO': '😠', 'TRISTE': '😢', 'NEUTRO': '😐', 'NADA': '👤'
};

const CHARADAS = [
    { texto: "Sou quente como o fogo, mas não queimo. Sou usado em semáforos. Qual fio sou?", dica: "Pare!", cor: "vermelho" },
    { texto: "Sou a cor do céu em um dia limpo, também sou a cor da esperança. Qual fio sou?", dica: "Olhe para cima!", cor: "azul" },
    { texto: "Sou a cor da natureza e da vida. Quem me corta, comete um erro. Qual fio sou?", dica: "Pense na floresta!", cor: "verde" },
    { texto: "Sou a cor do sol e da riqueza. Muitos me procuram, mas poucos me encontram. Qual fio sou?", dica: "Ouro!", cor: "amarelo" }
];

const CORES_STROOP = [
    { nome: 'VERMELHO', cor: '#ff0000' },
    { nome: 'AZUL', cor: '#0066ff' },
    { nome: 'VERDE', cor: '#00cc00' },
    { nome: 'AMARELO', cor: '#ffcc00' },
    { nome: 'ROXO', cor: '#9900ff' },
    { nome: 'LARANJA', cor: '#ff6600' }
];

const ACOES_ESPECIAIS = [
    { id: 'sorriso', emoji: '😁', texto: 'FAÇA UM SORRISO BEM EXAGERADO', acao: 'feliz' },
    { id: 'bravo', emoji: '😠', texto: 'FRANZA A TESTA E FAÇA CARA DE BRAVO', acao: 'bravo' },
    { id: 'triste', emoji: '☹️', texto: 'ABAIXE OS CANTOS DA BOCA', acao: 'triste' }
];

const EVENTOS_ALEATORIOS = [
    { id: 'tempestade', emoji: '⚡', texto: 'TEMPESTADE!', descricao: 'Tela escureceu por 3 segundos!', duracao: 3, tipo: 'atrapalha' },
    { id: 'luz', emoji: '💡', texto: 'LUZ!', descricao: 'As cores dos fios ficaram visíveis!', duracao: 5, tipo: 'ajuda' },
    { id: 'tempo_extra', emoji: '⏰', texto: 'TEMPO EXTRA!', descricao: 'Ganhou +3 segundos!', duracao: 0, tipo: 'ajuda' },
    { id: 'falha', emoji: '💥', texto: 'FALHA!', descricao: 'Perdeu -3 segundos!', duracao: 0, tipo: 'atrapalha' }
];
