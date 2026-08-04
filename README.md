# TimerFace Rush

Um jogo web de desafios rápidos com reconhecimento de expressões faciais, gestos de mão e minijogos contra o relógio.

## Desenvolvimento

```bash
npm install
npm run build
```

Abra `index.html` por um servidor HTTP local para permitir o acesso à câmera. O build de produção é gerado em `dist/`.

## Vercel

O projeto já inclui `vercel.json`. Na Vercel, importe o repositório e mantenha as configurações detectadas:

- Build command: `npm run build`
- Output directory: `dist`

A câmera exige HTTPS em produção, fornecido automaticamente pela Vercel.
