# Quadrooss — Design System

Este documento é o contrato entre as interfaces desenhadas no Figma e a implementação do site. O objetivo não é limitar a direção visual: é preservar hierarquia, proporção e ritmo, mantendo o comportamento consistente em diferentes telas e conteúdos.

## 1. Princípios

1. **A intenção visual vem antes do número isolado.** Medidas do Figma são traduzidas para tokens quando isso não altera hierarquia ou composição.
2. **Componentes recebem regras; páginas recebem composição.** Um card, botão ou label deve ser reutilizável. A organização desses componentes pode ser editorial e específica de cada página.
3. **Responsividade é contínua.** Desktop e mobile são marcos de uma mesma regra, não duas páginas independentes.
4. **Exceções são permitidas quando são intencionais.** Uma proporção autoral pode permanecer local. Uma repetição deve virar token ou componente.
5. **Conteúdo real faz parte do teste.** Textos longos, imagens ausentes, novas entradas e zoom não podem desmontar a interface.

## 2. Arquivos que governam o sistema

- `src/app/design-system.css`: tokens e primitivas globais.
- `src/app/globals.css`: estilos das experiências e componentes existentes.
- `src/lib/site-config.ts`: nome, wordmark, contato, redes e navegação.
- `src/components/cargo/`: componentes visuais do site.

Não duplique navegação, contato, cores ou escalas diretamente em páginas novas.

## 3. Cores semânticas

Use tokens pelo papel que desempenham, não pelo valor hexadecimal.

| Token | Uso |
| --- | --- |
| `--color-canvas` | Fundo principal do site |
| `--color-surface` | Seções sobre o canvas |
| `--color-surface-raised` | Células e blocos elevados |
| `--color-surface-media` | Placeholder ou fundo de mídia |
| `--color-surface-accent` | Superfície roxa autoral |
| `--color-text-primary` | Texto e ícones de maior contraste |
| `--color-text-soft` | Headings e textos suavizados |
| `--color-text-secondary` | Corpo e apoio com 70% de contraste |
| `--color-text-muted` | Texto secundário |
| `--color-text-subtle` | Captions, metadados e ajuda |
| `--color-border-default` | Divisores usuais |
| `--color-border-subtle` | Divisores mais discretos |

Novas cores devem primeiro ser justificadas como função semântica. Evite criar `--cinza-2` ou usar o hexadecimal diretamente em vários componentes.

## 4. Tipografia

### Famílias

- Família única: Helvetica Neue (`--font-sans`)
- Textos corridos, navegação, metadados e controles: Medium (`500`)
- Títulos grandes e displays: Bold (`700`)

### Escala

| Token | Papel principal |
| --- | --- |
| `--text-micro` | Informação excepcionalmente compacta |
| `--text-2xs` | Micro labels de 11 px |
| `--text-xs` | Captions de 12 px |
| `--text-sm` | Navegação e controles compactos |
| `--text-body-sm` | Texto de apoio e leitura compacta |
| `--text-body` | Corpo padrão |
| `--text-body-lg` | Corpo destacado ou texto do Hero |
| `--text-lead` | Apresentações e texto do About |
| `--text-heading-sm` | Títulos intermediários |
| `--text-heading` | Títulos de seção e formulário |
| `--text-heading-lg` | Títulos editoriais grandes |

Os tamanhos fluidos utilizam `clamp()`. Não substitua por `vw` puro: sem limites, textos ficam pequenos demais ou grandes demais.

### Regras

- Heading: use `--leading-tight` ou `--leading-snug`.
- Corpo: use `--leading-body`.
- Textos longos: use `--leading-reading`.
- Labels: `--tracking-label` e, quando apropriado, caixa alta.
- Evite caixas de texto com altura fixa.
- Limite o comprimento de leitura com `--reading-measure` ou um token de conteúdo.

## 5. Espaçamento

A base é 4 px. A escala disponível é:

`4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96, 100, 112, 120, 128 e 140 px`.

Os nomes representam múltiplos da base: `--space-1` = 4 px, `--space-6` = 24 px e `--space-24` = 96 px. A escala é intencionalmente seletiva; não invente um token intermediário sem repetição real.

### Como traduzir o Figma

- 15–17 px normalmente vira `--space-4` (16 px).
- 22–26 px normalmente vira `--space-6` (24 px).
- 29–35 px normalmente vira `--space-8` (32 px).
- Preserve o valor exato se ele definir uma composição ou sincronização de motion.
- Se um valor novo aparecer três ou mais vezes, avalie incorporá-lo à escala.

## 6. Grid e containers

### Gutter

`--page-gutter: clamp(24px, 4.2vw, 60px)`

O gutter deve alinhar cabeçalhos, textos e seções. Elementos full bleed, como vídeo, podem escapar dele deliberadamente.

### Colunas

- Amplo: 12 colunas.
- Intermediário: 8 colunas.
- Compacto: 4 colunas.

Use `.ds-grid` como referência. Um componente não precisa ocupar todas as colunas; use spans de acordo com a hierarquia.

### Larguras de conteúdo

| Token | Valor | Uso típico |
| --- | ---: | --- |
| `--content-xs` | 560 px | Corpo e descrições |
| `--content-sm` | 640 px | Texto destacado |
| `--content-md` | 680 px | Leitura longa |
| `--content-lg` | 720 px | Hero e formulários |
| `--content-xl` | 860 px | Feed e statement |
| `--content-2xl` | 1040 px | Índices e grids internos |

### Primitivas

- `.ds-container`: conteúdo centralizado com gutter.
- `.ds-grid`: grade responsiva de 12/8/4 colunas.
- `.ds-section`: seção com padding consistente.
- `.ds-section--large`: ritmo vertical ampliado.
- `.ds-full-bleed`: ocupa a largura disponível.
- `.ds-measure`: limita texto para leitura.

## 7. Breakpoints

- Compacto: até 700 px.
- Intermediário: 701–900 px.
- Amplo: acima de 900 px.

Esses são pontos compartilhados, não uma obrigação para toda interação. Um componente pode usar container query ou um breakpoint próprio quando o conteúdo provar que precisa mudar antes.

No Figma, crie normalmente:

1. Um frame amplo.
2. Um frame compacto.
3. Um frame intermediário apenas quando houver mudança estrutural que não possa ser inferida.

## 8. Componentes no Figma

- Use Auto Layout para grupos que crescem ou refluem.
- Use `Hug contents` em labels e botões.
- Use `Fill container` em áreas flexíveis.
- Defina min/max width quando o comportamento tiver limites.
- Crie propriedades independentes para `type`, `size` e `state`.
- Não destaque instâncias apenas para conseguir um layout específico; crie uma propriedade ou slot quando a necessidade for recorrente.
- Nomeie camadas pelo papel: `Title`, `Metadata`, `Media`, `Action`, não por aparência como `Texto branco`.

## 9. Imagens e vídeo

- Declare a proporção com `aspect-ratio` quando ela for parte do componente.
- Informe no Figma se o comportamento é `cover` ou `contain`.
- Mostre o ponto focal quando um crop diferente no mobile puder ocultar o assunto.
- Vídeos decorativos devem ser mudos, sem controles e respeitar movimento reduzido quando aplicável.
- Logos são balanceados opticamente; a caixa do arquivo não representa necessariamente seu tamanho aparente.

## 10. Motion

| Token | Duração | Uso |
| --- | ---: | --- |
| `--duration-fast` | 120 ms | Feedback imediato |
| `--duration-ui` | 200 ms | Hover e controles |
| `--duration-medium` | 350 ms | Overlays e fades |
| `--duration-slow` | 500 ms | Transições maiores |
| `--duration-reveal` | 600 ms | Revelações editoriais |

Curvas principais:

- `--ease-standard`: mudança discreta.
- `--ease-out`: expansão e entrada.
- `--ease-emphasized`: transição expressiva.
- `--ease-iris`: transição de página.

No handoff, descreva sempre: gatilho, estado inicial, estado final, distância/duração e relação com o scroll. O código deve ter alternativa para `prefers-reduced-motion`.

## 11. Interação e acessibilidade

- Área clicável preferencial: no mínimo `--target-min` (44 px).
- Nunca dependa apenas de hover.
- Estados de foco devem continuar visíveis.
- Texto e layout precisam funcionar com zoom e largura compacta.
- Todo controle precisa de nome acessível.
- Elementos decorativos usam `alt=""`; conteúdo informativo precisa de descrição.

## 12. Política de decisão Figma → código

Para cada medida nova:

1. **Já existe um token com a mesma função?** Use-o.
2. **Está próxima de um token e a diferença não altera a composição?** Normalize.
3. **É uma relação fluida entre dois frames?** Use `clamp()`, grid, flex ou container query.
4. **Repete-se como padrão novo?** Crie ou estenda um token/componente.
5. **É uma exceção autoral?** Preserve localmente e registre em comentário quando não for autoexplicativa.

## 13. Checklist de entrega de uma nova UI

- [ ] Frames amplo e compacto identificados.
- [ ] Fontes, pesos e estilos aplicados.
- [ ] Auto Layout usado onde o conteúdo pode variar.
- [ ] Gutter e alinhamentos visíveis.
- [ ] Proporções de mídia documentadas.
- [ ] Estados default, hover, focus e ativo definidos.
- [ ] Comportamento de textos longos considerado.
- [ ] Motion descrito por estados e gatilhos.
- [ ] Exceções visuais deliberadas sinalizadas.
- [ ] Componentes existentes reutilizados sempre que possível.

## 14. Validação antes de considerar uma página pronta

- Conferir em 320/375 px, 700 px, 900 px, 1280 px e 1440 px.
- Conferir navegação por teclado.
- Conferir zoom e reflow.
- Conferir movimento reduzido.
- Testar conteúdo maior que o mockup.
- Executar typecheck e build de produção.
- Revisar visualmente a página completa, não apenas o primeiro viewport.

## 15. Limites controlados do legado

- A galeria 3D de Archive mantém medidas ópticas e matemáticas próprias; ela consome o canvas e as superfícies do sistema, mas não deve ser forçada à grade editorial.
- A página Contact ainda usa um script Cargo para a lógica do formulário. A aparência é governada por regras escopadas em `globals.css`, e os dados de contato vêm de `site-config.ts`.
- A navegação por categorias de Work continua sendo montada pelo script legado, mas seus estilos pertencem ao design system. Não volte a inserir CSS dentro do script.

