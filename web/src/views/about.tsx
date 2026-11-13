import { JournalCta } from "@/components/journal-cta";
import { TransitionLink } from "@/components/page-transition";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import type { Locale } from "@/lib/i18n";
import { getJournalPosts } from "@/lib/journal";
import { pageMetadata } from "@/lib/page-metadata";
import { socialLinks } from "@/lib/site-config";

export const aboutMetadata = (locale: Locale) => pageMetadata({ locale, path: "/about", title: "About" });

const COPY = {
  pt: {
    lead: "Sou o Pedro Quadros, diretor e filmmaker baseado em São Paulo. Meu trabalho transita entre música, moda, pessoas e os lugares por onde acabo passando.",
    statement: "“Me interesso por momentos reais, pelas pessoas por trás deles e por tudo aquilo que acontece no meio do caminho.”",
    services: [
      { name: "DIREÇÃO CRIATIVA", desc: "Conceito, roteiro e linguagem visual, do primeiro briefing à aprovação final." },
      { name: "CAMPANHAS DE MARCA", desc: "Ideia, produção e entrega da campanha completa, como a da Umbro, montada do zero em 30 dias." },
      { name: "DIREÇÃO DE IMAGEM", desc: "A identidade em vídeo de DJs e artistas, acompanhando a carreira e não só um lançamento." },
      { name: "FILMAGEM", desc: "Clipes, campanhas, eventos e conteúdo, com a equipe certa montada para cada projeto." },
      { name: "FESTIVAIS E TOURS", desc: "Cobertura de shows, festivais e turnês, com after movie e postcards em toda entrega." },
      { name: "PRODUÇÃO EXECUTIVA", desc: "Orçamento, equipe, cronograma e logística, do planejamento ao último dia de set." },
      { name: "EDIÇÃO E REAL TIME", desc: "Montagem e finalização, inclusive durante o evento, para o conteúdo sair enquanto a festa acontece." },
      { name: "FOTOGRAFIA", desc: "Bastidores, eventos e retratos." },
    ],
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
    lead: "I’m Pedro Quadros, a director and filmmaker based in São Paulo. My work moves between music, fashion, people and the places I end up passing through.",
    statement: "“I’m interested in real moments, in the people behind them and in everything that happens along the way.”",
    services: [
      { name: "CREATIVE DIRECTION", desc: "Concept, script and visual language, from the first brief to final sign-off." },
      { name: "BRAND CAMPAIGNS", desc: "Idea, production and delivery of the full campaign, like Umbro’s, built from scratch in 30 days." },
      { name: "IMAGE DIRECTION", desc: "The video identity of DJs and artists, following the career and not just one release." },
      { name: "FILMING", desc: "Music videos, campaigns, events and content, with the right crew put together for each project." },
      { name: "FESTIVALS AND TOURS", desc: "Coverage of shows, festivals and tours, with an aftermovie and postcards in every delivery." },
      { name: "EXECUTIVE PRODUCTION", desc: "Budget, crew, schedule and logistics, from planning to the last day on set." },
      { name: "EDITING AND REAL TIME", desc: "Editing and finishing, even during the event, so the content goes out while the party is still on." },
      { name: "PHOTOGRAPHY", desc: "Behind the scenes, events and portraits." },
    ],
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
  const sets = getJournalPosts(locale)
    .filter((post) => post.type === "set")
    .sort((a, b) => b.date.localeCompare(a.date));
  const [featured] = sets;
  const soundcloud = socialLinks.find((social) => social.label === "SoundCloud");

  return (
    <main className="site-page about-page">
      <SiteNav />
      <div className="ab-layout">
        <div className="ab-portrait">
          <img
            alt={ui.about.portraitAlt}
            decoding="async"
            fetchPriority="high"
            sizes="(max-width: 900px) 100vw, 50vw"
            src="/images/about/pedro.webp"
            srcSet="/images/about/pedro-640.webp 640w, /images/about/pedro.webp 1000w"
          />
        </div>

        <div className="ab-content">
          <section aria-labelledby="ab-about" className="ab-section ab-intro">
            <div className="ab-kicker">
              <h1 id="ab-about">{ui.about.about}</h1>
              <span>{ui.about.role}</span>
            </div>
            <p className="ab-lead">{copy.lead}</p>
            <blockquote className="ab-quote">{copy.statement}</blockquote>
            <div className="ab-history">
              <span className="ab-label">{ui.about.soFar}</span>
              {copy.history.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>

          <section aria-labelledby="ab-services" className="ab-section">
            <h2 className="ab-label" id="ab-services">{ui.about.services}</h2>
            <ul className="ab-services">
              {copy.services.map((service) => (
                <li className="ab-service" key={service.name}>
                  <span className="ab-service__name">{service.name}</span>
                  <span className="ab-service__desc">{service.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {featured ? (
            <section aria-labelledby="ab-floor" className="ab-section">
              <h2 className="ab-label" id="ab-floor">{ui.about.onTheFloor}</h2>
              <div className="ab-sets">
                <TransitionLink aria-label={`${ui.about.watchSet}: ${featured.title}`} className="ab-set-feature" href={featured.href}>
                  <img alt="" className="ab-set-feature__cover" decoding="async" loading="lazy" src={featured.thumbnail.src} />
                  <span className="ab-set-feature__text">
                    <span className="ab-set-feature__kicker">DJ SET{featured.credit ? ` · ${featured.credit}` : ""}</span>
                    <span className="ab-set-feature__title">{featured.title}</span>
                    <span className="ab-set-feature__meta">{featured.duration}</span>
                  </span>
                  <span aria-hidden="true" className="ab-set-feature__play">
                    <svg height="20" viewBox="0 0 24 24" width="20"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
                  </span>
                </TransitionLink>
                <ol className="ab-set-list">
                  {sets.map((set, index) => (
                    <li key={set.slug}>
                      <TransitionLink className="ab-set-row" href={set.href}>
                        <span className="ab-set-row__n">{index + 1}</span>
                        <span className="ab-set-row__title">
                          <span>{set.title}</span>
                          {set.credit ? <span className="ab-set-row__credit">{set.credit}</span> : null}
                        </span>
                        <span className="ab-set-row__len">{set.duration}</span>
                      </TransitionLink>
                    </li>
                  ))}
                </ol>
              </div>
              {soundcloud ? (
                <a className="ab-soundcloud" href={soundcloud.href} rel="noreferrer" target="_blank">{ui.about.soundcloud}</a>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
      <JournalCta />
      <SiteFooter />
    </main>
  );
}
