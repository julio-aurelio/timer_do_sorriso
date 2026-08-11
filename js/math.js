// TimerFace Rush — math

// ---------- SEQUÊNCIA MATEMÁTICA ----------
function iniciarSequenciaMatematica() {
    console.log('🧮 INICIANDO SEQUÊNCIA MATEMÁTICA!');
    state.etapa = "MATEMATICA";
    mostrarComando('🧮 MEMÓRIA MATEMÁTICA', 'Memorize os números que aparecem, some todos e digite o resultado.');
    state.matematica_indice_atual = 0;
    state.matematica_resultado = 0;
    state.matematica_tempo_restante = CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.QUANTIDADE_NUMEROS * CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.TEMPO_NUMERO + 3;
    state.matematica_numeros = [];
    for (let i = 0; i < CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.QUANTIDADE_NUMEROS; i++) {
        state.matematica_numeros.push(Math.floor(Math.random() * 9) + 1);
    }
    mostrarMatematicaUI();
    atualizarStatusUI();
    document.getElementById('respostaMatematica').value = '';
    document.getElementById('respostaMatematica').focus();
    state.matematica_indice_atual = 0;
    mostrarProximoNumeroMatematica();
    atualizarMatematicaTempoUI(Math.ceil(state.tempo_restante));
    mostrarMensagem('🧮', 'SEQUÊNCIA MATEMÁTICA!', 'Some todos os números!');
}

function mostrarProximoNumeroMatematica() {
    if (state.matematica_indice_atual >= state.matematica_numeros.length) {
        document.getElementById('sequenciaDisplay').textContent = '❓ QUAL O RESULTADO?';
        document.getElementById('sequenciaProgresso').style.width = '100%';
        return;
    }
    const numero = state.matematica_numeros[state.matematica_indice_atual];
    state.matematica_resultado += numero;
    document.getElementById('sequenciaDisplay').textContent = `${numero}`;
    document.getElementById('sequenciaProgresso').style.width =
        `${(state.matematica_indice_atual / state.matematica_numeros.length) * 100}%`;
    state.matematica_indice_atual++;
    agendarPartida(() => {
        mostrarProximoNumeroMatematica();
    }, CONFIG.DIFICULDADE.SEQUENCIA_MATEMATICA.TEMPO_NUMERO * 1000);
}

function enviarRespostaMatematica() {
    if (state.aguardando_reinicio) return;
    if (state.matematica_indice_atual < state.matematica_numeros.length) {
        mostrarMensagem('⚠️', 'Aguarde!', 'Os números ainda estão sendo mostrados...');
        return;
    }
    const valor = document.getElementById('respostaMatematica').value.trim();
    const resposta = Number(valor);
    if (!valor || !Number.isSafeInteger(resposta)) {
        mostrarMensagem('⚠️', 'Digite um número inteiro válido!', '');
        return;
    }
    if (resposta === state.matematica_resultado) {
        registrarAcerto(130);
        clearInterval(state.matematica_interval);
        state.matematica_interval = null;
        esconderMatematicaUI();
        mostrarMensagem('✅', 'ACERTOU!', `Resultado: ${state.matematica_resultado}`);
        agendarPartida(() => proximaEtapa(), 700);
    } else {
        clearInterval(state.matematica_interval);
        state.matematica_interval = null;
        reiniciarAposErro(`❌ Resultado correto é ${state.matematica_resultado}! Você errou!`);
    }
}
