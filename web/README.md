# Quadrooss — reconstrução independente

Aplicação independente em Next.js/React. A exportação original do Cargo permanece nas pastas `../cargo`, `../snapshot` e `../media` como fonte de conteúdo e referência.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Journal

Cada post é um arquivo Markdown em `content/journal/`. O nome do arquivo vira o endereço (`mochilao-europeu-09.md` → `/journal/mochilao-europeu-09`). No topo vão os dados; embaixo, o texto do post.

```md
---
title: "Uma última noite sem ter onde dormir"
type: "vlog"              # "vlog" ou "set"
series: "Mochilão Europeu" # opcional; agrupa os episódios no índice
episode: 9                # opcional
place: "Madrid"           # opcional
credit: "Quadrooss & Icaro" # opcional, usado nos sets
date: "2026-08-11"
duration: "24 min"
youtube: "https://youtu.be/gSXH2HshB7Q"
excerpt: "Primeiro parágrafo, usado no card e na abertura do post."
featured: true            # opcional; sem nenhum, o destaque é o post mais recente
---

Texto do post, em parágrafos.
```

- Post com texto ganha página própria. Post sem texto (como os sets) abre direto no YouTube.
- A thumbnail vem do próprio YouTube: no build, `scripts/prepare-media.mjs` baixa a maior versão disponível pelo ID do vídeo, recorta as faixas pretas e gera WebP em `public/media/journal/`. Sem internet no build, o site usa o endereço da thumbnail no YouTube.
- Os campos são validados no build (`src/lib/journal.ts`): faltou um obrigatório, o build para e diz em qual arquivo.
- O formato é o que CMS baseados em Git (Pages CMS, Sveltia, Decap) editam, então dá para ligar um depois sem mudar as páginas.

## Build e deploy (Cloudflare Pages)

O site é 100% estático. `npm run build` gera HTML, CSS, JS e imagens em `out/`, e o Cloudflare Pages publica essa pasta a cada push no `main`.

Configuração do projeto no Cloudflare Pages:

| Campo | Valor |
| --- | --- |
| Production branch | `main` |
| Framework preset | `Next.js (Static HTML Export)` |
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Variável `NODE_VERSION` | `22` (também definido em `.node-version`) |

O repositório inteiro é clonado no build, então o `prebuild` continua lendo as imagens de `../media`.

Como não existe servidor de imagens na exportação estática, `scripts/prepare-media.mjs` gera versões WebP de tudo que está em `public/images` em cada largura de `src/lib/image-sizes.json`, e `src/lib/image-loader.ts` aponta o `next/image` para esses arquivos. Ao adicionar uma imagem em `public/images`, não é preciso fazer mais nada: o build cria as variantes.

O que a exportação estática não aceita: rotas de API, Server Actions, `headers()`/`cookies()`, redirects e rewrites no `next.config.ts`. Cabeçalhos HTTP ficam em `public/_headers` e redirecionamentos, se um dia forem necessários, em `public/_redirects` (formato do Cloudflare Pages).

Para conferir localmente o que vai ao ar:

```bash
npm run build
npx serve out
```

## Page loader

O componente do loader está preparado, mas desativado até o MP4 final ser adicionado em `public/motion/page-loader.mp4` e o frame de corte para preto ser validado.

Para habilitá-lo localmente:

```bash
NEXT_PUBLIC_PAGE_LOADER=true npm run dev
```

O timing definitivo da passagem para `#000` deve ser medido no vídeo, não estimado.
