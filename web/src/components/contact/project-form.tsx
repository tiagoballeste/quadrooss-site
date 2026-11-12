"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site-config";

/*
 * The Contact page form: four steps (name, email, subject, message with
 * optional attachments), sent through FormSubmit straight to Pedro's inbox.
 * The email fields stay in Portuguese whatever the page's language; English
 * submissions get "(EN)" in the subject so he knows how to reply.
 */

const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,application/pdf,image/*,audio/*";
const FADE_MS = 180;

type StepKey = "name" | "email" | "subject" | "message";
type Step = {
  key: StepKey;
  type: "text" | "email" | "textarea";
  eyebrow: string;
  headline: string;
  subhead: string;
  placeholder: string;
};

const COPY = {
  pt: {
    steps: [
      { key: "name", type: "text", eyebrow: "ETAPA 01 DE 04", headline: "SALVEE. COMO POSSO TE CHAMAR?", subhead: "Sem formalidades nem pressão. Leva menos de um minuto, de verdade.", placeholder: "Seu nome ou o nome da sua marca..." },
      { key: "email", type: "email", eyebrow: "ETAPA 02 DE 04", headline: "ME PASSA SEU EMAIL?", subhead: "Zero spam. Só quero ter salvo para mantermos o contato alinhado.", placeholder: "Digite seu endereço de e-mail..." },
      { key: "subject", type: "text", eyebrow: "ETAPA 03 DE 04", headline: "QUAL É O ASSUNTO PRINCIPAL?", subhead: "Dê um título curto ou contexto rápido para a gente se situar.", placeholder: "Ex: Campanha de Lançamento / Videoclipe / Conteúdo Digital..." },
      { key: "message", type: "textarea", eyebrow: "ETAPA 04 DE 04", headline: "CONTE UM POUCO SOBRE A IDEIA.", subhead: "Diga o essencial que a gente desenrola a partir daí.", placeholder: "Mesmo uma linha já é suficiente para começarmos..." },
    ] as Step[],
    back: "← VOLTAR",
    next: "AVANÇAR →",
    send: "ENVIAR PROJETO →",
    sending: "ENVIANDO...",
    required: "Esse campo é necessário pra continuar.",
    invalidEmail: "Digite um e-mail válido.",
    attach: "Anexar arquivos",
    attachHint: "Opcional · PDF, imagem ou áudio · até 10 MB no total",
    tooBig: "Os anexos passam de 10 MB no total. Se for maior, manda um link (Drive, WeTransfer...) na mensagem.",
    rejected: "Só aceito PDF, imagem ou áudio: ",
    remove: "Remover",
    kinds: { image: "Imagem", audio: "Áudio", pdf: "PDF" },
    sentTitle: "Nos falamos em breve...",
    sentText: "Se for urgente, me chama no WhatsApp logo abaixo.",
    foot: "Prefere mandar um e-mail direto ou chamar no WhatsApp?",
    subject: "Novo projeto via site — ",
  },
  en: {
    steps: [
      { key: "name", type: "text", eyebrow: "STEP 01 OF 04", headline: "HEY. WHAT SHOULD I CALL YOU?", subhead: "No formalities, no pressure. It takes less than a minute, really.", placeholder: "Your name or your brand’s name..." },
      { key: "email", type: "email", eyebrow: "STEP 02 OF 04", headline: "WHAT’S YOUR EMAIL?", subhead: "Zero spam. I just want to have it so we can stay in touch.", placeholder: "Type your email address..." },
      { key: "subject", type: "text", eyebrow: "STEP 03 OF 04", headline: "WHAT’S IT ABOUT?", subhead: "Give it a short title or some quick context so I know where we’re starting.", placeholder: "E.g. Launch campaign / Music video / Digital content..." },
      { key: "message", type: "textarea", eyebrow: "STEP 04 OF 04", headline: "TELL ME A BIT ABOUT THE IDEA.", subhead: "Just the essentials, we’ll work it out from there.", placeholder: "Even one line is enough to get us started..." },
    ] as Step[],
    back: "← BACK",
    next: "NEXT →",
    send: "SEND PROJECT →",
    sending: "SENDING...",
    required: "This field is required to continue.",
    invalidEmail: "Enter a valid email.",
    attach: "Attach files",
    attachHint: "Optional · PDF, image or audio · up to 10 MB total",
    tooBig: "Attachments are over 10 MB in total. If it’s bigger, send a link (Drive, WeTransfer...) in the message.",
    rejected: "Only PDF, image or audio files: ",
    remove: "Remove",
    kinds: { image: "Image", audio: "Audio", pdf: "PDF" },
    sentTitle: "Talk soon...",
    sentText: "If it’s urgent, message me on WhatsApp below.",
    foot: "Rather send an email directly or message me on WhatsApp?",
    subject: "Novo projeto via site (EN) — ",
  },
} as const;

function fileKind(file: File, kinds: { image: string; audio: string; pdf: string }) {
  if (file.type.startsWith("image/")) return kinds.image;
  if (file.type.startsWith("audio/")) return kinds.audio;
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return kinds.pdf;
  return "";
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function ArrowIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export function ProjectForm({ locale }: { locale: Locale }) {
  const copy = COPY[locale];
  const steps = copy.steps;
  const [step, setStep] = useState(0);
  const [shownStep, setShownStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [answers, setAnswers] = useState<Record<StepKey, string>>({ name: "", email: "", subject: "", message: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const cleanup = useRef<number[]>([]);

  // Steps cross-fade: fade the card out, swap the content, fade it back in.
  useEffect(() => {
    if (step === shownStep) return;
    setVisible(false);
    const id = window.setTimeout(() => {
      setShownStep(step);
      setError("");
      requestAnimationFrame(() => setVisible(true));
    }, FADE_MS);
    return () => window.clearTimeout(id);
  }, [step, shownStep]);

  useEffect(() => {
    if (shownStep > 0) field.current?.focus({ preventScroll: true });
  }, [shownStep]);

  useEffect(() => {
    const timers = cleanup.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const current = steps[shownStep];
  const isLast = shownStep === steps.length - 1;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  const valid = () => {
    const value = answers[current.key].trim();
    if (!value) return false;
    return current.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const submit = () => {
    if (sending) return;
    setSending(true);

    // FormSubmit takes a plain form post; it goes to a hidden frame so the
    // visitor stays on the page.
    const sinkName = `msf-sink-${Date.now()}`;
    const sink = document.createElement("iframe");
    sink.name = sinkName;
    sink.style.display = "none";
    document.body.appendChild(sink);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://formsubmit.co/${siteConfig.email}`;
    form.enctype = "multipart/form-data";
    form.target = sinkName;
    form.style.display = "none";
    const hidden = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };
    hidden("_subject", copy.subject + answers.name);
    hidden("_captcha", "false");
    hidden("_template", "table");
    hidden("Nome", answers.name);
    hidden("email", answers.email);
    hidden("Assunto", answers.subject);
    hidden("Mensagem", answers.message);
    files.forEach((file, index) => {
      try {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        const input = document.createElement("input");
        input.type = "file";
        input.name = `anexo_${index + 1}`;
        input.files = transfer.files;
        form.appendChild(input);
      } catch {}
    });
    document.body.appendChild(form);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setVisible(false);
      cleanup.current.push(
        window.setTimeout(() => {
          setSent(true);
          requestAnimationFrame(() => setVisible(true));
        }, FADE_MS),
        window.setTimeout(() => {
          form.remove();
          sink.remove();
        }, 2000),
      );
    };
    sink.addEventListener("load", finish);
    cleanup.current.push(window.setTimeout(finish, 20000));
    form.submit();
  };

  const next = () => {
    if (!valid()) {
      setError(current.type === "email" ? copy.invalidEmail : copy.required);
      return;
    }
    if (isLast) submit();
    else setStep(shownStep + 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      next();
    }
  };

  const addFiles = (added: File[]) => {
    const rejected: string[] = [];
    let total = totalBytes;
    const accepted: File[] = [];
    let message = "";
    added.forEach((file) => {
      if (!fileKind(file, copy.kinds)) {
        rejected.push(file.name);
        return;
      }
      if (total + file.size > MAX_TOTAL_BYTES) {
        message = copy.tooBig;
        return;
      }
      total += file.size;
      accepted.push(file);
    });
    if (rejected.length) message = copy.rejected + rejected.join(", ");
    setFiles((list) => [...list, ...accepted]);
    setError(message);
  };

  const progress = sent ? 100 : (shownStep / (steps.length - 1)) * 100;

  return (
    <div className="msf-wrap ct-msf-wrap">
      <div className="msf-progress-track">
        <div className="msf-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="msf-card" style={{ opacity: visible ? 1 : 0, transition: "opacity .25s ease" }}>
        {sent ? (
          <div className="msf-success" role="status">
            <h2>{copy.sentTitle}</h2>
            <p>{copy.sentText}</p>
          </div>
        ) : (
          <>
            <span className="msf-eyebrow">{current.eyebrow}</span>
            <h2 className="msf-headline">{current.headline}</h2>
            <p className="msf-subhead">{current.subhead}</p>
            <div className="msf-field">
              {current.type === "textarea" ? (
                <textarea
                  aria-label={current.headline}
                  className="msf-textarea"
                  placeholder={current.placeholder}
                  ref={field}
                  value={answers[current.key]}
                  onChange={(event) => {
                    setAnswers((all) => ({ ...all, [current.key]: event.target.value }));
                    setError("");
                  }}
                />
              ) : (
                <input
                  aria-label={current.headline}
                  className="msf-input"
                  placeholder={current.placeholder}
                  ref={field}
                  type={current.type}
                  value={answers[current.key]}
                  onChange={(event) => {
                    setAnswers((all) => ({ ...all, [current.key]: event.target.value }));
                    setError("");
                  }}
                  onKeyDown={onKeyDown}
                />
              )}

              {current.key === "message" ? (
                <div className="msf-attach">
                  <div className="msf-attach-row">
                    <button
                      className="msf-attach-btn"
                      type="button"
                      onClick={() => {
                        if (picker.current) picker.current.value = "";
                        picker.current?.click();
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span>{copy.attach}</span>
                    </button>
                    <span className="msf-attach-hint">{copy.attachHint}</span>
                  </div>
                  <ul className="msf-files">
                    {files.map((file, index) => (
                      <li className="msf-file" key={`${file.name}-${index}`}>
                        <span className="msf-file-kind">{fileKind(file, copy.kinds)}</span>
                        <span className="msf-file-name">{file.name}</span>
                        <span className="msf-file-size">{formatSize(file.size)}</span>
                        <button
                          aria-label={`${copy.remove} ${file.name}`}
                          className="msf-file-remove"
                          type="button"
                          onClick={() => {
                            setFiles((list) => list.filter((_, position) => position !== index));
                            setError("");
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="msf-error" role="alert">
                {error}
              </div>
            </div>

            <div className="msf-nav">
              {shownStep > 0 ? (
                <button className="msf-back" type="button" onClick={() => setStep(shownStep - 1)}>
                  {copy.back}
                </button>
              ) : null}
              <button className="msf-btn" disabled={sending} type="button" onClick={next}>
                <span className="msf-btn-label">{sending ? copy.sending : isLast ? copy.send : copy.next}</span>
                <span className="msf-btn-icon">
                  <ArrowIcon className="msf-arrow-1" />
                  <ArrowIcon className="msf-arrow-2" />
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      <input
        accept={ACCEPT}
        hidden
        multiple
        ref={picker}
        type="file"
        onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
      />

      <div className="msf-foot">
        <span>{copy.foot}</span>
        <span>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          {" · "}
          <a href={siteConfig.phone.whatsapp} rel="noopener noreferrer" target="_blank">
            {siteConfig.phone.display}
          </a>
        </span>
      </div>
    </div>
  );
}
