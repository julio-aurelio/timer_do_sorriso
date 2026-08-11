// TimerFace Rush — ranking local

const RANKING_STORAGE_KEY = 'timerface-rush-ranking-v1';
const JOGADOR_STORAGE_KEY = 'timerface-rush-jogador';
const TEMPOS_RANKING = [15, 30, 60];
const LIMITE_RANKING = 10;

function lerRankingLocal() {
    try {
        const dados = JSON.parse(localStorage.getItem(RANKING_STORAGE_KEY) || '{}');
        return dados && typeof dados === 'object' ? dados : {};
    } catch (_) {
        return {};
    }
}

function salvarRankingLocal(ranking) {
    try {
        localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(ranking));
        return true;
    } catch (error) {
        console.warn('Não foi possível salvar o ranking local:', error);
        return false;
    }
}

function normalizarNomeJogador(nome) {
    const limpo = String(nome || '').trim().replace(/\s+/g, ' ').slice(0, 18);
    return limpo || 'Jogador';
}

function obterNomeJogador() {
    const input = document.getElementById('playerName');
    const nome = normalizarNomeJogador(input?.value);
    if (input) input.value = nome;
    try { localStorage.setItem(JOGADOR_STORAGE_KEY, nome); } catch (_) {}
    return nome;
}

function formatarTempoRanking(segundos) {
    return `${Number(segundos).toFixed(2).replace('.', ',')}s`;
}

function registrarResultadoRanking(categoria, duracao, pontuacao = 0) {
    const tempoCategoria = Number(categoria);
    if (!TEMPOS_RANKING.includes(tempoCategoria) || !Number.isFinite(duracao) || duracao <= 0) return null;

    const nome = obterNomeJogador();
    const chave = String(tempoCategoria);
    const ranking = lerRankingLocal();
    const anteriores = Array.isArray(ranking[chave]) ? ranking[chave] : [];
    const nomeNormalizado = nome.toLocaleLowerCase('pt-BR');
    const resultadoAnterior = anteriores.find(item =>
        normalizarNomeJogador(item.nome).toLocaleLowerCase('pt-BR') === nomeNormalizado
    );
    const novoRecorde = !resultadoAnterior || duracao < Number(resultadoAnterior.tempo);

    if (novoRecorde) {
        ranking[chave] = anteriores
            .filter(item => normalizarNomeJogador(item.nome).toLocaleLowerCase('pt-BR') !== nomeNormalizado)
            .concat({ nome, tempo: Number(duracao.toFixed(3)), pontuacao, data: new Date().toISOString() })
            .sort((a, b) => a.tempo - b.tempo || b.pontuacao - a.pontuacao)
            .slice(0, LIMITE_RANKING);
        salvarRankingLocal(ranking);
    }

    const listaAtual = ranking[chave] || anteriores;
    const posicao = listaAtual.findIndex(item =>
        normalizarNomeJogador(item.nome).toLocaleLowerCase('pt-BR') === nomeNormalizado
    ) + 1;
    atualizarRankingUI(tempoCategoria);
    return { posicao: posicao || null, novoRecorde, tempo: novoRecorde ? duracao : resultadoAnterior?.tempo };
}

function atualizarRankingUI(categoria = obterTempoSelecionado()) {
    const titulo = document.getElementById('rankingTitulo');
    const lista = document.getElementById('rankingLista');
    if (!titulo || !lista) return;

    const tempoCategoria = TEMPOS_RANKING.includes(Number(categoria)) ? Number(categoria) : 30;
    const ranking = lerRankingLocal();
    const resultados = Array.isArray(ranking[String(tempoCategoria)]) ? ranking[String(tempoCategoria)] : [];
    titulo.textContent = `🏆 Ranking ${tempoCategoria}s`;
    lista.replaceChildren();

    if (!resultados.length) {
        const vazio = document.createElement('li');
        vazio.className = 'text-center text-sm text-gray-500 py-3';
        vazio.textContent = 'Nenhum tempo registrado. Seja o primeiro!';
        lista.appendChild(vazio);
        return;
    }

    resultados.forEach((resultado, indice) => {
        const item = document.createElement('li');
        item.className = 'flex items-center gap-2 py-2 border-b border-gray-100 last:border-0';

        const posicao = document.createElement('span');
        posicao.className = 'w-7 text-center font-black text-purple-700';
        posicao.textContent = indice < 3 ? ['🥇', '🥈', '🥉'][indice] : `${indice + 1}º`;

        const nome = document.createElement('span');
        nome.className = 'flex-1 min-w-0 truncate text-sm font-semibold text-gray-700';
        nome.textContent = normalizarNomeJogador(resultado.nome);

        const tempo = document.createElement('span');
        tempo.className = 'font-black tabular-nums text-sm text-emerald-600';
        tempo.textContent = formatarTempoRanking(resultado.tempo);

        item.append(posicao, nome, tempo);
        lista.appendChild(item);
    });
}

function inicializarRanking() {
    const input = document.getElementById('playerName');
    if (input) {
        try { input.value = normalizarNomeJogador(localStorage.getItem(JOGADOR_STORAGE_KEY)); }
        catch (_) { input.value = 'Jogador'; }
        input.addEventListener('change', () => {
            obterNomeJogador();
            atualizarRankingUI();
        });
    }
    atualizarRankingUI();
}

function salvarNomeRanking() {
    const nome = obterNomeJogador();
    atualizarRankingUI();
    mostrarMensagem('✅', 'Nome salvo!', `${nome} será usado nos próximos resultados.`);
}
