# (((quadrooss))) — portfólio

Exportação completa do site **https://852526.cargo.site**, feito no [Cargo](https://cargo.site) (Cargo 3).
Gerada em 07/10/2026 para passar o projeto para desenvolvimento.

> **Importante para quem for desenvolver:** o Cargo é uma plataforma fechada, então não existe um "código-fonte" que roda sozinho fora dele. Este repositório traz **tudo o que dá para tirar do Cargo**: o conteúdo de cada página, o CSS, todo o código personalizado (JS/HTML), as imagens e um snapshot do HTML de cada página já renderizado. Com isso dá para recriar o site em qualquer stack (Next.js, Astro, HTML estático etc.) ou continuar editando no Cargo.

## Estrutura

```
cargo/
  site.json                 informações do site e configurações de design
  site.css                  CSS global do site (Design → CSS)
  site-custom-html.raw.html HTML global do site, exatamente como está no Cargo
  custom-code/              o mesmo HTML global, separado em um arquivo por componente
  pages/<página>/
    content.html            conteúdo da página (markup do editor do Cargo)
    local.css               CSS local da página
    page.json               metadados da página e lista de imagens usadas
snapshot/                   HTML de cada página já renderizado no navegador (com o runtime do Cargo)
media/                      imagens do site em versão web (até 2000px) + manifest.json
```

### Páginas

| Página | URL | Pasta |
|---|---|---|
| Home | `/` (`home-page`) | `cargo/pages/home-page` |
| Work | `/work` | `cargo/pages/work` |
| Archive | `/archive` | `cargo/pages/archive` |
| Journal | `/journal` | `cargo/pages/journal` |
| About | `/about` | `cargo/pages/about` |
| Contact | `/contact` | `cargo/pages/contact` |

### Código personalizado (`cargo/custom-code/`)

No Cargo, todo o JS personalizado fica no **HTML global do site**. Cada componente é um `<iframe srcdoc="…">` invisível que executa o script e manipula a página principal (`window.parent.document`). Esse "bridge" foi usado porque o editor do Cargo não executa `<script>` direto no conteúdo.

| Arquivo | O que faz | Onde aparece |
|---|---|---|
| `01-domegallery.html` | Galeria em esfera 3D (porte vanilla do *DomeGallery* do React Bits) | Archive |
| `02-option-wheel.html` | Menu em roda (substitui o menu WORK/ARCHIVE/JOURNAL/ABOUT/CONTACT) | Home |
| `03-logo-loop.html` | Marquee horizontal de logos de clientes | Home |
| `04-scroll-reveal-about.html` | Revelação palavra por palavra ao rolar | About |
| `05-scrambled-text.html` | Texto que embaralha perto do cursor (seção "Até aqui") | About |
| `06-work-showcase-home.html` | Menu de funções com marquee no hover (Diretor / Editor / Filmmaker / Produtor executivo) + vitrine | Home |
| `07-contact-page.html` | Página de contato: título com ScrollReveal + formulário + rodapé | Contact |
| `08-multistep-contact-form.html` | Formulário em 4 etapas com anexos (envio via [FormSubmit](https://formsubmit.co) para cttquadrooss@gmail.com) | Contact e Home |
| `09-work-page.html` | Abas de categorias + player do Vimeo + **ficha técnica** de cada vídeo | Work |

**Ficha técnica:** em `09-work-page.html`, cada vídeo da lista `VIDEOS` tem um campo `ficha: [['Função', 'Nome'], …]`. Quando está vazio, a seção não aparece.

### Imagens (`media/`)

São as versões otimizadas que o Cargo entrega no site (WebP/JPG, até 2000px de largura). Os originais (~1,3 GB, incluindo HEIC) não entram no repositório por causa do tamanho. `media/manifest.json` liga cada arquivo ao `hash` usado no Cargo (o mesmo que aparece em `page.json` e nas URLs `freight.cargo.site/.../i/<hash>/<nome>`).

Os vídeos dos trabalhos estão no **Vimeo** (os IDs estão em `09-work-page.html`).

## Ver o snapshot localmente

```bash
npx serve snapshot
```

O snapshot ainda carrega fontes, imagens e o runtime a partir dos servidores do Cargo. Serve como referência visual e de estrutura, não como versão final para produção.
