import { useState } from "react";
import type { Report } from "../types";
import { useStr, formatEur } from "../i18n";
import { Button, CheckIcon } from "./ui";

const OWNER_EMAIL = "kostinmihail40@gmail.com";

type Status = "idle" | "sending" | "ok" | "error";

export function ContactForm({ report }: { report: Report }) {
  const s = useStr();
  const f = s.report.form;
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const recPkg =
    report.packages.find((p) => p.id === report.recommendedPackage)?.name ?? "-";
  const priceTag =
    formatEur(
      report.packages.find((p) => p.id === report.recommendedPackage)?.priceFrom ??
        0,
    ) + (report.recommendedPackage === "support" ? s.report.perMonthWord : "");

  const summary = [
    `${f.fScore}: ${report.score}/100 (${report.zoneLabel})`,
    `${f.fProfile}: ${report.profileLine}`,
    `${f.fPath}: ${report.recommendation.title}`,
    `${f.fPackage}: ${recPkg} (${s.report.fromWord} ${priceTag})`,
    "",
    `${f.fRisks}:`,
    ...report.risks.map((r) => `- [${s.report.sev[r.severity]}] ${r.title}`),
  ].join("\n");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: f.emailSubject,
          Name: name || "-",
          Contact: contact,
          Comment: comment || "-",
          Audit_result: summary,
        }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="print-block rounded-xl2 border-2 border-ok/40 bg-surface p-6 text-center md:p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ok text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-[1.45rem] font-extrabold text-ink">
          {f.okTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[1.05rem] leading-relaxed text-ink">
          {f.okBody}
        </p>
      </div>
    );
  }

  const mailtoHref =
    `mailto:${OWNER_EMAIL}?subject=` +
    encodeURIComponent(f.emailSubject) +
    "&body=" +
    encodeURIComponent(
      `${f.nameLabel}: ${name}\n${f.contactLabel}: ${contact}\n${f.commentLabel}: ${comment}\n\n${summary}`,
    );

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={f.nameLabel}
          value={name}
          onChange={setName}
          placeholder={f.namePlaceholder}
          autoComplete="name"
        />
        <Field
          label={f.contactLabel}
          required
          value={contact}
          onChange={setContact}
          placeholder={f.contactPlaceholder}
          autoComplete="email"
        />
      </div>
      <label className="block">
        <span className="mb-1.5 block font-display text-[1rem] font-bold text-ink">
          {f.commentLabel}{" "}
          <span className="font-medium text-ink-2">{f.commentOptional}</span>
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={f.commentPlaceholder}
          className="w-full resize-y rounded-xl border-2 border-line bg-paper px-4 py-3 text-[1.05rem] text-ink placeholder:text-ink-2/70 focus:border-accent focus:outline-none"
        />
      </label>

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={!contact.trim() || status === "sending"}>
          {status === "sending" ? f.submitting : f.submit}
        </Button>
        {status === "error" && (
          <p className="text-[0.98rem] font-medium text-risk-high">
            {f.errorPrefix}
            <a className="font-bold underline" href={mailtoHref}>
              {f.errorLink}
            </a>
            .
          </p>
        )}
        <p className="text-center text-[0.9rem] text-ink-2">{f.consent}</p>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-display text-[1rem] font-bold text-ink">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        type="text"
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-line bg-paper px-4 py-3 text-[1.05rem] text-ink placeholder:text-ink-2/70 focus:border-accent focus:outline-none"
      />
    </label>
  );
}
