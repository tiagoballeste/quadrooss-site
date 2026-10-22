# Quadrooss — reconstrução independente

Aplicação independente em Next.js/React. A exportação original do Cargo permanece nas pastas `../cargo`, `../snapshot` e `../media` como fonte de conteúdo e referência.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Page loader

O componente do loader está preparado, mas desativado até o MP4 final ser adicionado em `public/motion/page-loader.mp4` e o frame de corte para preto ser validado.

Para habilitá-lo localmente:

```bash
NEXT_PUBLIC_PAGE_LOADER=true npm run dev
```

O timing definitivo da passagem para `#000` deve ser medido no vídeo, não estimado.
