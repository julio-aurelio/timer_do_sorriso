# TimerFace Rush

TimerFace Rush é um jogo web de desafios rápidos controlados pela câmera. O jogador precisa reproduzir expressões faciais, fazer gestos com a mão e concluir minijogos antes que o relógio chegue a zero.

O reconhecimento acontece diretamente no navegador. A câmera não é transmitida para um servidor do projeto.

## Funcionalidades

- Desbloqueio da partida com uma expressão facial: feliz, bravo ou triste.
- Reconhecimento facial por 52 blendshapes do MediaPipe Face Landmarker.
- Reconhecimento treinado dos gestos de joia, paz e mão aberta com MediaPipe Gesture Recognizer.
- Rastreamento temporal para estabilizar expressões e evitar falsos positivos.
- Categorias fixas de 15, 30 e 60 segundos.
- Ranking local separado por categoria, guardando o melhor tempo de cada jogador.
- Pontuação, combos e níveis de dificuldade automáticos.
- Efeitos sonoros de suspense, vitória e derrota.
- Captura local dos melhores momentos da partida, com opção de reprodução e download.
- Layout responsivo para computadores e dispositivos móveis.

## Desafios

Durante uma partida, o jogo sorteia minijogos sem repetir sempre a mesma ordem:

- **Sorriso relâmpago:** mantenha um sorriso pelo período indicado.
- **Pergunta surpresa:** responda corretamente a uma pergunta de conhecimentos gerais.
- **Desarme a bomba:** resolva a charada e corte o fio correto.
- **Par ou ímpar:** observe dois dados e classifique a soma.
- **Memória matemática:** memorize os números apresentados e informe o resultado.
- **Teste de Stroop:** escolha a cor da palavra, ignorando o texto escrito.
- **Mímica facial:** reproduza a expressão solicitada.
- **Gesto com a mão:** faça joia, paz ou mostre a mão aberta.

## Tecnologias

- HTML5, CSS3 e JavaScript.
- Tailwind CSS 3.4.
- MediaPipe Face Landmarker para landmarks e blendshapes faciais.
- MediaPipe Gesture Recognizer para classificação e landmarks das mãos.
- Canvas API para o processamento visual.
- MediaDevices API para acesso à webcam.
- Web Audio API e elementos HTML de áudio.

Os modelos do MediaPipe são carregados por CDN. Portanto, é necessário acesso à internet na primeira execução.

## Requisitos

- Node.js 18 ou mais recente para instalar dependências e gerar o build.
- Navegador moderno com suporte a WebAssembly e `getUserMedia`.
- Webcam disponível e permissão de câmera concedida.
- HTTPS em produção ou `localhost` durante o desenvolvimento.

Chrome e Edge são os navegadores recomendados. Uma câmera bem iluminada e posicionada de frente melhora o reconhecimento.

## Executando localmente

Clone o repositório e instale as dependências:

```bash
npm install
```

Gere os arquivos de produção:

```bash
npm run build
```

Para executar o código-fonte diretamente, inicie um servidor HTTP na raiz do projeto. Por exemplo, com Python:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

Não abra `index.html` diretamente pelo explorador de arquivos. Navegadores restringem câmera e módulos externos quando a página usa o protocolo `file://`.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run build:css` | Compila e minifica o Tailwind em `css/tailwind.css`. |
| `npm run build` | Compila o CSS e copia a aplicação para `dist/`. |

## Estrutura do projeto

```text
timer/
├── assets/                 # Ícone e áudios principais
├── audios_derrota/         # Efeitos reproduzidos nas derrotas
├── audios_vitoria/         # Efeitos reproduzidos nas vitórias
├── css/
│   ├── style.css           # Estilos próprios do jogo
│   ├── tailwind-input.css  # Entrada do Tailwind
│   └── tailwind.css        # CSS compilado
├── js/
│   ├── actions.js          # Ações faciais, gestos e eventos
│   ├── audio.js            # Reprodução e controle dos áudios
│   ├── bomb.js             # Desafio da bomba
│   ├── camera.js           # Inicialização e encerramento da webcam
│   ├── config.js           # Configurações e dados estáticos
│   ├── dice.js             # Desafio dos dados
│   ├── game.js             # Fluxo, reinício e inicialização da partida
│   ├── math.js             # Desafio de memória matemática
│   ├── questions.js        # Perguntas e fluxo de derrota
│   ├── ranking.js          # Ranking persistido no navegador
│   ├── state.js            # Estado compartilhado da aplicação
│   ├── stroop.js           # Teste de Stroop
│   ├── timer.js            # Cronômetro e progresso das expressões
│   ├── ui.js               # Elementos, mensagens e overlays
│   ├── vision.js           # Modelos e classificação por blendshapes
│   ├── vision-fallback.js  # Detector facial simplificado de emergência
│   └── vision-runtime.js   # Loop de inferência da câmera
├── scripts/build.mjs       # Montagem da pasta de produção
├── index.html              # Interface e ordem de carregamento dos scripts
├── package.json
└── vercel.json
```

Os arquivos JavaScript são carregados como scripts clássicos e compartilham o estado global do jogo. A ordem declarada no final de `index.html` é intencional e deve ser preservada.

## Reconhecimento facial

O Face Landmarker retorna coeficientes normalizados para movimentos específicos do rosto. O jogo combina esses coeficientes para classificar as expressões:

- **Feliz:** sorriso e contração das bochechas.
- **Bravo:** sobrancelhas abaixadas, olhos apertados e nariz franzido.
- **Triste:** cantos da boca abaixados e parte interna das sobrancelhas levantada.

Durante o desbloqueio, apenas feliz, bravo e triste podem ser sorteados. Neutro e ausência de rosto são estados internos do detector, não desafios.

Se o Face Landmarker não puder ser carregado, o projeto tenta ativar o detector simplificado presente em `vision-fallback.js`.

## Privacidade

- O vídeo é processado localmente no dispositivo.
- O projeto não possui backend para receber imagens da câmera.
- Os melhores momentos permanecem na memória do navegador durante a sessão.
- Nome e melhores tempos do ranking ficam salvos no `localStorage` do navegador.
- Um arquivo só é salvo quando o jogador escolhe explicitamente a opção de download.
- O microfone não é solicitado.

## Publicação na Vercel

O projeto já possui um `vercel.json` configurado. Ao importar o repositório na Vercel, use:

- **Build command:** `npm run build`
- **Output directory:** `dist`

A Vercel fornece HTTPS automaticamente, requisito necessário para a câmera em produção.

## Solução de problemas

### A câmera não abre

- Confirme a permissão de câmera no navegador.
- Feche outros aplicativos que estejam usando a webcam.
- Use `localhost` no desenvolvimento ou HTTPS em produção.
- Recarregue a página depois de alterar a permissão.

### O modelo fica carregando

- Confirme que o dispositivo possui acesso à internet.
- Verifique se extensões de privacidade estão bloqueando `jsDelivr` ou os arquivos do MediaPipe.
- Abra o console do navegador e procure mensagens relacionadas a WebAssembly ou WebGL.

### A expressão demora para ser reconhecida

- Ilumine o rosto de frente.
- Evite luz forte atrás da cabeça.
- Mantenha o rosto inteiro visível e olhe para a câmera.
- Faça a expressão de maneira marcada, principalmente ao abaixar as sobrancelhas na expressão de bravo.

### O gesto da mão não aparece

- Mostre a mão inteira, incluindo o pulso.
- Mantenha a palma voltada para a câmera.
- Evite que a mão fique sobre o rosto ou fora do enquadramento.
