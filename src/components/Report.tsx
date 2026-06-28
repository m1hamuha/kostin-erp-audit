import type { Report, Risk, Pkg, SubScore, Impact } from "../types";
import { useLang, useStr, formatUsd } from "../i18n";
import { HealthScore } from "./HealthScore";
import { ContactForm } from "./ContactForm";
import { Button, cx, CheckIcon, ArrowIcon } from "./ui";

const SEV_STYLE: Record<Risk["severity"], { dot: string; chip: string }> = {
  high: { dot: "bg-risk-high", chip: "text-risk-high bg-risk-high/10" },
  med: { dot: "bg-risk-med", chip: "text-risk-med bg-risk-med/10" },
  low: { dot: "bg-risk-low", chip: "text-risk-low bg-risk-low/10" },
};

export function ReportView({
  report,
  onRestart,
}: {
  report: Report;
  onRestart: () => void;
}) {
  const { lang } = useLang();
  const s = useStr();
  const today = new Date().toLocaleDateString(lang === "uk" ? "uk-UA" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="report-root mx-auto max-w-content px-5 py-8 md:px-8 md:py-12">
      {/* Report header band */}
      <div className="print-block overflow-hidden rounded-xl2 bg-ink text-white shadow-lift">
        <div className="px-6 py-7 md:px-9 md:py-8">
          <p className="font-display text-[0.85rem] font-bold uppercase tracking-wider text-white/60">
            {s.report.kicker} · {today}
          </p>
          <h1 className="mt-2 font-display text-[1.9rem] font-extrabold leading-tight tracking-tight md:text-[2.5rem]">
            {s.report.title}
          </h1>
          <p className="mt-2 text-[1.05rem] font-medium text-white/80">
            {report.profileLine}
          </p>
        </div>
      </div>

      {/* Score + summary */}
      <div className="mt-6 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <HealthScore report={report} />
        </div>
        <div className="md:col-span-7">
          <div className="print-block h-full rounded-xl2 border border-line bg-surface p-6 shadow-card md:p-8">
            <h2 className="font-display text-[1.3rem] font-extrabold tracking-tight text-ink">
              {s.report.summaryTitle}
            </h2>
            <p className="mt-3 text-[1.12rem] leading-relaxed text-ink">
              {report.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Area sub-scores */}
      <SubScores subScores={report.subScores} />

      {/* Quantified impact — the "wow" */}
      <ImpactBlock impact={report.impact} />

      {/* Benchmark */}
      <section className="mt-6">
        <div className="print-block rounded-xl2 border border-line border-l-4 border-l-accent bg-accent-soft p-5 shadow-card md:p-6">
          <p className="font-display text-[0.8rem] font-bold uppercase tracking-wider text-accent">
            {s.report.benchmarkKicker}
          </p>
          <p className="mt-1.5 text-[1.12rem] font-semibold leading-relaxed text-ink">
            {report.benchmark}
          </p>
        </div>
      </section>

      {/* Recommended path */}
      <section className="mt-6">
        <div className="print-block rounded-xl2 border-2 border-accent/25 bg-accent-soft p-6 shadow-card md:p-8">
          <p className="font-display text-[0.85rem] font-bold uppercase tracking-wider text-accent">
            {s.report.recommendationTitle}
          </p>
          <h2 className="mt-2 font-display text-[1.5rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[1.9rem]">
            {report.recommendation.title}
          </h2>
          <p className="mt-3 max-w-3xl text-[1.12rem] leading-relaxed text-ink">
            {report.recommendation.body}
          </p>
        </div>
      </section>

      {/* Risks */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-[1.6rem] font-extrabold tracking-tight text-ink sm:text-[2rem]">
            {s.report.risksTitle}
          </h2>
          <span className="tnum shrink-0 text-[1rem] font-semibold text-ink-2">
            {report.risks.length}{" "}
            {report.risks.length === 1 ? s.report.issueOne : s.report.issueMany}
          </span>
        </div>

        {report.risks.length === 0 ? (
          <div className="mt-5 print-block rounded-xl2 border-2 border-ok/40 bg-surface p-6 text-[1.1rem] leading-relaxed text-ink">
            {s.report.noRisks}
          </div>
        ) : (
          <ol className="mt-5 grid gap-4">
            {report.risks.map((r, idx) => (
              <RiskRow key={r.id} risk={r} n={idx + 1} />
            ))}
          </ol>
        )}
      </section>

      {/* Plan */}
      <section className="mt-12">
        <h2 className="font-display text-[1.6rem] font-extrabold tracking-tight text-ink sm:text-[2rem]">
          {s.report.planTitle}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {report.plan.map((stage) => (
            <div
              key={stage.n}
              className="print-block rounded-xl2 border border-line bg-surface p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="tnum grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent font-display text-[1.1rem] font-extrabold text-white">
                  {stage.n}
                </span>
                <h3 className="font-display text-[1.2rem] font-bold leading-tight text-ink">
                  {stage.title}
                </h3>
              </div>
              <ul className="mt-4 space-y-2.5">
                {stage.items.map((it, k) => (
                  <li
                    key={k}
                    className="flex gap-2.5 text-[1.02rem] leading-relaxed text-ink"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Packages — What you get */}
      <section className="mt-12">
        <h2 className="font-display text-[1.6rem] font-extrabold tracking-tight text-ink sm:text-[2rem]">
          {s.report.packagesTitle}
        </h2>
        <p className="mt-2 text-[1.08rem] leading-relaxed text-ink-2">
          {s.report.packagesIntro}
        </p>
        <div className="mt-4 rounded-xl2 border border-line border-l-4 border-l-accent bg-accent-soft px-5 py-4">
          <p className="text-[1.08rem] font-bold leading-relaxed text-ink">
            {s.report.trustLine}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {report.packages.map((p) => (
            <PackageCard
              key={p.id}
              pkg={p}
              recommended={p.id === report.recommendedPackage}
            />
          ))}
        </div>
        <p className="mt-4 text-[1rem] leading-relaxed text-ink-2">
          {s.report.estimateNote}
        </p>
      </section>

      {/* CTA */}
      <section id="cta" className="mt-12 scroll-mt-24">
        <div className="print-block rounded-xl2 border-2 border-accent/25 bg-accent-soft p-6 shadow-card md:p-9">
          <div className="max-w-2xl">
            <h2 className="font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.1rem]">
              {s.report.ctaTitle}
            </h2>
            <p className="mt-3 text-[1.12rem] leading-relaxed text-ink">
              {s.report.ctaBody}
            </p>
          </div>
          <div className="mt-6 rounded-xl2 border border-line bg-surface p-5 md:p-7">
            <ContactForm report={report} />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="no-print mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="ghost" size="md" onClick={() => window.print()}>
          {s.report.print}
        </Button>
        <Button variant="subtle" size="md" onClick={onRestart}>
          {s.report.restart}
        </Button>
      </div>
    </div>
  );
}

function PackageCard({ pkg, recommended }: { pkg: Pkg; recommended: boolean }) {
  const s = useStr();
  return (
    <div
      className={cx(
        "print-block flex flex-col rounded-xl2 border bg-surface p-6 shadow-card",
        recommended ? "border-2 border-accent ring-2 ring-accent/15" : "border-line",
      )}
    >
      {recommended && (
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-display text-[0.78rem] font-bold uppercase tracking-wide text-white">
          <ArrowIcon className="h-3.5 w-3.5" />
          {s.report.recommendedBadge}
        </span>
      )}
      <h3 className="font-display text-[1.3rem] font-extrabold leading-tight text-ink">
        {pkg.name}
      </h3>
      <p className="mt-1.5 text-[1rem] leading-relaxed text-ink-2">{pkg.tagline}</p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[0.95rem] font-semibold text-ink-2">
          {s.report.fromWord}
        </span>
        <span className="tnum font-display text-[1.9rem] font-extrabold text-ink">
          {formatUsd(pkg.priceFrom)}
        </span>
        {pkg.perMonth && (
          <span className="font-display text-[1.05rem] font-bold text-ink-2">
            {s.report.perMonthWord}
          </span>
        )}
      </div>
      {pkg.priceNote && (
        <p className="mt-1.5 text-[0.98rem] font-semibold text-accent-ink">
          {pkg.priceNote}
        </p>
      )}
      <p className="mt-1 text-[0.95rem] font-semibold text-ink-2">
        {s.report.timelineLabel}: {pkg.timeline}
      </p>

      <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
        {pkg.deliverables.map((d, k) => (
          <li
            key={k}
            className="flex gap-2.5 text-[1rem] leading-relaxed text-ink"
          >
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function subColor(v: number): string {
  return v >= 75 ? "var(--ok)" : v >= 50 ? "var(--risk-med)" : "var(--risk-high)";
}

function SubScores({ subScores }: { subScores: SubScore[] }) {
  const s = useStr();
  return (
    <section className="mt-6">
      <div className="print-block rounded-xl2 border border-line bg-surface p-6 shadow-card md:p-8">
        <h2 className="font-display text-[1.3rem] font-extrabold tracking-tight text-ink">
          {s.report.subScoresTitle}
        </h2>
        <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {subScores.map((sc) => (
            <div key={sc.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[1.08rem] font-bold text-ink">
                  {sc.label}
                </span>
                <span
                  className="tnum font-display text-[1.15rem] font-extrabold"
                  style={{ color: subColor(sc.value) }}
                >
                  {sc.value}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${sc.value}%`, background: subColor(sc.value) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactBlock({ impact }: { impact: Impact }) {
  const r = useStr().report;
  const sub = r.impactSaveSub
    .replace("{hours}", String(impact.savedHoursMonth))
    .replace("{cost}", formatUsd(impact.savedCostMonth));
  const assumption = r.impactAssumption
    .replace("{rate}", formatUsd(impact.hourlyRate))
    .replace("{pct}", String(Math.round(impact.savingsPct * 100)));
  return (
    <section className="mt-6">
      <div className="print-block overflow-hidden rounded-xl2 bg-ink text-white shadow-lift">
        <div className="px-6 py-7 md:px-9 md:py-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-[0.85rem] font-bold uppercase tracking-wider text-white/70">
              {r.impactKicker}
            </p>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-display text-[0.78rem] font-bold uppercase tracking-wide text-white">
              {r.impactEstimate}
            </span>
          </div>
          <h2 className="mt-2 font-display text-[1.6rem] font-extrabold leading-tight tracking-tight text-white md:text-[2.05rem]">
            {r.impactTitle}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat
              value={String(impact.monthlyHours)}
              unit={r.impactHoursUnit}
              label={r.impactHoursLabel}
            />
            <Stat
              value={formatUsd(impact.monthlyCost)}
              unit={r.impactCostUnit}
              label={r.impactCostLabel}
            />
            <Stat
              value={formatUsd(impact.savedCostYear)}
              unit={r.impactSaveUnit}
              label={r.impactSaveLabel}
              sub={sub}
              highlight
            />
          </div>
          <p className="mt-5 text-[0.98rem] leading-relaxed text-white/75">
            {assumption}
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  unit,
  label,
  sub,
  highlight,
}: {
  value: string;
  unit: string;
  label: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-xl2 p-5",
        highlight ? "bg-accent" : "bg-white/10",
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="tnum font-display text-[2.4rem] font-extrabold leading-none text-white md:text-[2.9rem]">
          {value}
        </span>
        <span className="font-display text-[0.98rem] font-bold text-white/80">
          {unit}
        </span>
      </div>
      <p className="mt-2.5 text-[1.05rem] font-bold leading-snug text-white">
        {label}
      </p>
      {sub && (
        <p className="mt-1 text-[0.92rem] font-medium leading-snug text-white/85">
          {sub}
        </p>
      )}
    </div>
  );
}

function RiskRow({ risk, n }: { risk: Risk; n: number }) {
  const s = useStr();
  const sev = SEV_STYLE[risk.severity];
  return (
    <li className="print-block rounded-xl2 border border-line bg-surface p-5 shadow-card md:p-6">
      <div className="flex items-start gap-4">
        <span
          className={cx("mt-1 h-3.5 w-3.5 shrink-0 rounded-full", sev.dot)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink">
              {n}. {risk.title}
            </h3>
            <span
              className={cx(
                "rounded-full px-2.5 py-0.5 text-[0.8rem] font-bold",
                sev.chip,
              )}
            >
              {s.report.sev[risk.severity]}
            </span>
          </div>
          <p className="mt-2 text-[1.08rem] font-semibold leading-relaxed text-ink">
            {risk.what}
          </p>
          <p className="mt-1.5 text-[1.05rem] leading-relaxed text-ink-2">
            {risk.why}
          </p>
        </div>
      </div>
    </li>
  );
}
