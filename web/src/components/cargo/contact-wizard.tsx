"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { siteConfig } from "@/lib/site-config";

const steps = [
  ["Seu nome", "Como você gostaria de ser chamado?", "name", "text"],
  ["Seu contato", "Qual é o melhor e-mail para retornarmos?", "email", "email"],
  ["Sobre o projeto", "Conta um pouco sobre a ideia, o escopo e o prazo.", "message", "textarea"],
  ["Último passo", "Se quiser, anexe referências e materiais do projeto.", "files", "file"],
] as const;

export function ContactWizard({ theme = "dark" }: { theme?: "dark" | "light" }) {
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

    const subject = `Novo projeto — ${values.name}`;
    const body = [
      `Nome: ${values.name}`,
      `E-mail: ${values.email}`,
      "",
      "Sobre o projeto:",
      values.message,
      "",
      values.files.length > 0
        ? `Arquivos para anexar: ${values.files.join(", ")}`
        : "Arquivos para anexar: nenhum",
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
          <h2>Mensagem preparada.</h2>
          <p>Revise os dados no seu aplicativo de e-mail e conclua o envio.</p>
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
              Voltar
            </button>
          )}
          <button className="msf-btn" type="submit">
            <span className="msf-btn-label">
              {step === steps.length - 1 ? "Enviar" : "Continuar"}
            </span>
            <span className="msf-btn-icon">↗</span>
          </button>
        </div>
      </form>
      <div className="msf-foot">
        <span>Ou fale diretamente:</span>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </div>
    </section>
  );
}
