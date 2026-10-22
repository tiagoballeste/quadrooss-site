import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "About" };

const history = [
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
];

export default function AboutPage() {
  return (
    <main className="cargo-page about-page">
      <CargoNav />
      <section className="ab-hero">
        <BrandLogo className="ab-hero-logo" priority />
        <div className="ab-hero-grad" />
        <div className="ab-hero-text">
          <span className="ab-role">DIRETOR / FILMMAKER / DJ / PRODUTOR EXECUTIVO</span>
          <p className="ab-lead">
            Sou o Pedro Quadros, diretor e filmmaker baseado em São Paulo.<br />
            Meu trabalho transita entre música, moda, pessoas e os lugares por onde acabo passando.
          </p>
          <span className="ab-scroll">ROLAR PARA EXPLORAR ↓</span>
        </div>
      </section>
      <section className="ab-statement">
        <h2>“Me interesso por momentos reais, pelas pessoas por trás deles e por tudo aquilo que acontece no meio do caminho.”</h2>
      </section>
      <section className="ab-history">
        <span className="caption">ATÉ AQUI</span>
        {history.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
      <SiteFooter />
    </main>
  );
}
