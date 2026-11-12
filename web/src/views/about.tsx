import { BrandLogo } from "@/components/brand-logo";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const aboutMetadata = (locale: Locale) => pageMetadata({ locale, path: "/about", title: "About" });

const COPY = {
  pt: {
    lead: ["Sou o Pedro Quadros, diretor e filmmaker baseado em São Paulo.", "Meu trabalho transita entre música, moda, pessoas e os lugares por onde acabo passando."],
    statement: "“Me interesso por momentos reais, pelas pessoas por trás deles e por tudo aquilo que acontece no meio do caminho.”",
    history: [
  "Comecei minha trajetória profissional em 2022, junto com a faculdade de Publicidade e Comunicação.",
  "Ainda no início do curso, enquanto procurava minhas primeiras oportunidades no mercado, decidi criar um projeto próprio para falar sobre coisas que já faziam parte do meu universo: streetwear, moda, música e cultura.",
  "Foi assim que nasceu a Hidden References, inicialmente como uma mídia independente com o objetivo de apresentar pessoas e projetos que eu acreditava estarem movimentando a cultura, mas que ainda não recebiam a atenção que mereciam.",
  "O crescimento da Hidden acabou me levando naturalmente para outros lugares. Comecei a trabalhar com cobertura de eventos, fotografia e audiovisual, áreas pelas quais já tinha interesse e que rapidamente passaram a ocupar uma parte importante do meu trabalho.",
  "Ao mesmo tempo, comecei a entrar também na produção de eventos e experiências para marcas. Ao longo desse período, participei de projetos para NOWDays, Sopro, Above, Ciena Lab e Lykd Studios, passando por diferentes funções entre produção, execução e direção criativa.",
  "A Hidden também evoluiu junto comigo. O que começou como uma página de conteúdo se transformou em uma mídia de moda, produtora cultural e produtora audiovisual, abrindo espaço para desenvolver campanhas e projetos para marcas como Bem Bolado, Umbro e Champion.",
  "Foi principalmente através desses projetos que construí meu repertório e comecei a entender melhor como diferentes áreas se conectam. Comunicação, direção, produção, fotografia e audiovisual nunca apareceram para mim como caminhos completamente separados — cada projeto me fez aprender um pouco mais sobre o processo inteiro.",
  "Com o tempo, a Hidden References deu lugar à Heserved, uma nova fase desse mesmo caminho e do que quero construir daqui para frente.",
  "Hoje, meu trabalho transita entre direção, audiovisual, fotografia, música, moda e cultura, sempre com interesse especial pelas pessoas, pelos ambientes e pelos movimentos que existem ao redor de cada projeto.",
  "Este portfólio reúne um pouco desse percurso até aqui — trabalhos, pessoas, lugares e registros que ajudaram a construir meu olhar.",
],
  },
  en: {
    lead: ["I’m Pedro Quadros, a director and filmmaker based in São Paulo.", "My work moves between music, fashion, people and the places I end up passing through."],
    statement: "“I’m interested in real moments, in the people behind them and in everything that happens along the way.”",
    history: [
      "I started my professional path in 2022, alongside my degree in Advertising and Communication.",
      "Still early in the course, while looking for my first opportunities in the market, I decided to create a project of my own to talk about things that were already part of my world: streetwear, fashion, music and culture.",
      "That’s how Hidden References was born, at first as an independent media outlet aiming to showcase people and projects I believed were moving the culture, but weren’t yet getting the attention they deserved.",
      "Hidden’s growth naturally took me to other places. I started working with event coverage, photography and film, areas I was already interested in and that quickly became an important part of my work.",
      "At the same time, I also started getting into producing events and experiences for brands. During that period, I worked on projects for NOWDays, Sopro, Above, Ciena Lab and Lykd Studios, moving between production, execution and creative direction.",
      "Hidden grew along with me. What started as a content page became a fashion media outlet, a cultural production company and a film production company, opening the way to campaigns and projects for brands like Bem Bolado, Umbro and Champion.",
      "It was mainly through these projects that I built my repertoire and started to understand better how different areas connect. Communication, directing, production, photography and film never felt like completely separate paths to me: each project taught me a little more about the whole process.",
      "Over time, Hidden References gave way to Heserved, a new phase of the same path and of what I want to build from here on.",
      "Today, my work moves between directing, film, photography, music, fashion and culture, always with a special interest in the people, the places and the movements around each project.",
      "This portfolio gathers a bit of that journey so far: work, people, places and records that helped shape the way I see things.",
    ],
  },
} as const;

export function AboutView({ locale }: { locale: Locale }) {
  const ui = getUi(locale);
  const copy = COPY[locale];

  return (
    <main className="cargo-page about-page">
      <CargoNav />
      <section className="ab-hero">
        <BrandLogo className="ab-hero-logo" priority />
        <div className="ab-hero-grad" />
        <div className="ab-hero-text">
          <span className="ab-role">{ui.about.role}</span>
          <p className="ab-lead">
            {copy.lead[0]}<br />
            {copy.lead[1]}
          </p>
          <span className="ab-scroll">{ui.about.scroll}</span>
        </div>
      </section>
      <section className="ab-statement">
        <h2>{copy.statement}</h2>
      </section>
      <section className="ab-history">
        <span className="caption">{ui.about.soFar}</span>
        {copy.history.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
      <SiteFooter />
    </main>
  );
}
