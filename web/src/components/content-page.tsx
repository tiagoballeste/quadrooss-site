import { SiteFooter } from "@/components/site-footer";

type ContentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  index: string;
};

export function ContentPage({ eyebrow, title, description, index }: ContentPageProps) {
  return (
    <main className="content-page">
      <section className="content-page__hero">
        <p className="eyebrow">{eyebrow}</p>
        <span className="content-page__index">{index}</span>
        <h1>{title}</h1>
        <p className="content-page__description">{description}</p>
      </section>
      <section className="content-page__placeholder">
        <p>Conteúdo da exportação do Cargo pronto para migração e redesign.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
