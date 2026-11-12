# (((quadrooss))) — portfólio

Site de Pedro Quadros (Quadrooss), filmmaker e diretor criativo. A aplicação está em [`web/`](web/), em Next.js/React, exportada como site estático.

```bash
cd web
npm install
npm run dev
```

O site é publicado no **Cloudflare Pages** a partir do `main`: cada push dispara um build novo e atualiza o site. Configuração, idiomas, Journal e galerias estão documentados em [`web/README.md`](web/README.md).

## Estrutura

```
web/        aplicação Next.js (páginas, componentes, conteúdo do Journal e das galerias)
media/      fotos do Archive em versão web; o build gera as versões otimizadas
```

As fotos de `media/` alimentam o domo do Archive e as galerias. Os vídeos dos trabalhos estão no Vimeo; os dados do Work ficam em `web/src/data/work/`.
