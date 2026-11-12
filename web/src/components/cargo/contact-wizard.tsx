"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { useLocale } from "@/components/use-locale";

const STEPS = {
  pt: [
    ["Seu nome", "Como você gostaria de ser chamado?", "name", "text"],
    ["Seu contato", "Qual é o melhor e-mail para retornarmos?", "email", "email"],
    ["Sobre o projeto", "Conta um pouco sobre a ideia, o escopo e o prazo.", "message", "textarea"],
    ["Último passo", "Se quiser, anexe referências e materiais do projeto.", "files", "file"],
  ],
  en: [
    ["Your name", "What should I call you?", "name", "text"],
    ["Your contact", "What's the best email to get back to you?", "email", "email"],
    ["About the project", "Tell me a bit about the idea, the scope and the timeline.", "message", "textarea"],
    ["Last step", "If you'd like, attach references and project materials.", "files", "file"],
  ],
} as const;

const COPY = {
  pt: {
    subject: (name: string) => `Novo projeto — ${name}`,
    name: "Nome",
    email: "E-mail",
    about: "Sobre o projeto:",
    files: "Arquivos para anexar",
    none: "nenhum",
    sentTitle: "Mensagem preparada.",
    sentText: "Revise os dados no seu aplicativo de e-mail e conclua o envio.",
    back: "Voltar",
    send: "Enviar",
    next: "Continuar",
    direct: "Ou fale diretamente:",
  },
  en: {
    subject: (name: string) => `New project: ${name}`,
    name: "Name",
    email: "Email",
    about: "About the project:",
    files: "Files to attach",
    none: "none",
    sentTitle: "Message ready.",
    sentText: "Check the details in your email app and send it.",
    back: "Back",
    send: "Send",
    next: "Continue",
    direct: "Or reach out directly:",
  },
} as const;

export function ContactWizard({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const locale = useLocale();
  const steps = STEPS[locale];
  const copy = COPY[locale];
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
    files: [] as string[],
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    const subject = copy.subject(values.name);
    const body = [
      `${copy.name}: ${values.name}`,
      `${copy.email}: ${values.email}`,
      "",
      copy.about,
      values.message,
      "",
      `${copy.files}: ${values.files.length > 0 ? values.files.join(", ") : copy.none}`,
    ].join("\n");

    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({
      ...current,
      files: Array.from(event.target.files ?? []).map((file) => file.name),
    }));
  };

  if (sent) {
    return (
      <section className={`msf-wrap msf-wrap--${theme}`}>
        <div className="msf-success">
          <h2>{copy.sentTitle}</h2>
          <p>{copy.sentText}</p>
        </div>
      </section>
    );
  }

  const [eyebrow, headline, name, type] = steps[step];

  return (
    <section className={`msf-wrap msf-wrap--${theme}`}>
      <div className="msf-progress-track">
        <span
          className="msf-progress-bar"
          style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <form className="msf-card" onSubmit={submit}>
        <span className="msf-eyebrow">{eyebrow}</span>
        <h2 className="msf-headline">{headline}</h2>
        <div className="msf-field">
          {type === "textarea" ? (
            <textarea
              className="msf-textarea"
              name={name}
              required
              value={values.message}
              onChange={(event) =>
                setValues((current) => ({ ...current, message: event.target.value }))
              }
            />
          ) : type === "file" ? (
            <input
              className="msf-file-input"
              name={name}
              type="file"
              multiple
              accept=".pdf,image/*,audio/*"
              onChange={selectFiles}
            />
          ) : (
            <input
              className="msf-input"
              name={name}
              type={type}
              required
              value={type === "email" ? values.email : values.name}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [name]: event.target.value,
                }))
              }
            />
          )}
        </div>
        <div className="msf-nav">
          {step > 0 && (
            <button
              className="msf-back"
              type="button"
              onClick={() => setStep((current) => current - 1)}
            >
              {copy.back}
            </button>
          )}
          <button className="msf-btn" type="submit">
            <span className="msf-btn-label">
              {step === steps.length - 1 ? copy.send : copy.next}
            </span>
            <span className="msf-btn-icon">↗</span>
          </button>
        </div>
      </form>
      <div className="msf-foot">
        <span>{copy.direct}</span>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </div>
    </section>
  );
}
