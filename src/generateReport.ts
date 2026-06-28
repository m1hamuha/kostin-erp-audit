import type {
  Answers,
  Lang,
  Pkg,
  PathKind,
  Report,
  Risk,
  Severity,
  Stage,
} from "./types";
import { STR, summarize } from "./i18n";

const SEVERITY_PENALTY: Record<Severity, number> = {
  high: 18,
  med: 10,
  low: 5,
};

function has(list: string[], id: string): boolean {
  return list.includes(id);
}

function isBanned(system: string): boolean {
  return system === "1c" || system === "bas";
}

export function decidePath(a: Answers): PathKind {
  if (isBanned(a.system)) {
    return a.market === "ua" ? "migrate-urgent" : "migrate";
  }
  if (a.system === "spreadsheets") return "implement";
  if (a.system === "sap" || a.system === "quickbooks") return "replace";
  if (a.system === "odoo") return "optimize";
  return "implement"; // "other" / unknown
}

export function generateReport(a: Answers, lang: Lang): Report {
  const s = STR[lang];
  const R = s.risks;
  const risks: Risk[] = [];
  const path = decidePath(a);

  const bigOrg = a.size === "51-200" || a.size === "200+";
  const smallOrg = a.size === "1-5" || a.size === "6-20";

  const add = (id: keyof typeof R, severity: Severity) =>
    risks.push({ id, severity, ...R[id] });

  // --- Headline system-fit risk (the "battle" logic) ---
  if (path === "migrate-urgent") {
    add("legal-ban", "high");
  } else if (path === "migrate") {
    add("legacy-foreign", "high");
  } else if (a.system === "spreadsheets") {
    add("spreadsheets", bigOrg || !smallOrg ? "high" : "med");
  } else if (a.system === "sap" && smallOrg) {
    add("sap-overkill", "med");
  } else if (a.system === "quickbooks") {
    add("quickbooks-outgrown", bigOrg || has(a.pains, "scaling") ? "med" : "low");
  } else if (a.system === "odoo" && a.pains.length > 0) {
    add("odoo-optimize", "low");
  }

  // --- Integrations / disconnection ---
  const noIntegrations =
    a.integrations.length === 0 || has(a.integrations, "none");
  if (noIntegrations && a.system !== "spreadsheets") {
    add("no-integrations", "med");
  }

  // --- Pain-driven risks ---
  if (has(a.pains, "manual")) add("manual", "med");
  if (has(a.pains, "disconnected") && !noIntegrations) add("disconnected", "med");
  if (has(a.pains, "reporting")) add("reporting", "med");
  if (has(a.pains, "scaling")) add("scaling", bigOrg ? "high" : "med");
  if (has(a.pains, "errors")) add("errors", "high");
  if (has(a.pains, "compliance")) add("compliance", a.market === "ua" ? "high" : "med");
  if (has(a.pains, "support")) add("support", "med");
  if (has(a.pains, "cost")) add("cost", "low");

  // De-dupe (a risk id should appear once), keep highest severity.
  const order: Record<Severity, number> = { high: 0, med: 1, low: 2 };
  const byId = new Map<string, Risk>();
  for (const r of risks) {
    const prev = byId.get(r.id);
    if (!prev || order[r.severity] < order[prev.severity]) byId.set(r.id, r);
  }
  const unique = [...byId.values()].sort(
    (x, y) => order[x.severity] - order[y.severity],
  );

  // ---- Score ----
  let score = 100;
  for (const r of unique) score -= SEVERITY_PENALTY[r.severity];
  if (a.system === "odoo") score += 6; // bonus: already on the right platform
  score = Math.max(8, Math.min(98, Math.round(score)));

  const zone: Report["zone"] = score >= 75 ? "green" : score >= 50 ? "amber" : "red";
  const zoneLabel = s.report.zone[zone];
  const verdict = s.report.verdict[zone];
  const highCount = unique.filter((r) => r.severity === "high").length;
  const summary = summarize(lang, unique.length, highCount);

  const profileLine = [
    s.labels.system[(a.system || "other") as keyof typeof s.labels.system],
    a.market ? s.labels.market[a.market as keyof typeof s.labels.market] : null,
    a.size ? s.labels.size[a.size as keyof typeof s.labels.size] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const recommendation = s.recommendation[path];
  const plan = buildPlan(a, path, lang);
  const packages = buildPackages(lang);
  const recommendedPackage: Pkg["id"] =
    path === "optimize" ? (a.pains.length > 0 ? "custom" : "support") : "implementation";

  return {
    score,
    zone,
    zoneLabel,
    verdict,
    summary,
    profileLine,
    pathKind: path,
    recommendation,
    risks: unique,
    plan,
    packages,
    recommendedPackage,
  };
}

function buildPlan(a: Answers, path: PathKind, lang: Lang): Stage[] {
  const P = STR[lang].plan;
  const st = P.stages;

  // Build the integrations stage from the tools the buyer actually uses.
  const connectable = a.integrations.filter((i) => i !== "none");
  const intItems =
    connectable.length > 0
      ? connectable.map(
          (id) =>
            P.connectVerb +
            STR[lang].labels.integration[
              id as keyof (typeof STR)["en"]["labels"]["integration"]
            ],
        )
      : [P.integrateFallback];

  let chosen: { title: string; items: string[] }[];
  switch (path) {
    case "optimize":
      chosen = [
        st.audit,
        st.stabilize,
        { title: st.integrate.title, items: intItems },
        st.optimize,
        st.support,
      ];
      break;
    case "implement":
      chosen = [
        st.discovery,
        st.setup,
        st.implementData,
        { title: st.integrate.title, items: intItems },
        st.golive,
        st.support,
      ];
      break;
    default: // migrate-urgent | migrate | replace
      chosen = [
        st.discovery,
        st.setup,
        st.migrateData,
        { title: st.integrate.title, items: intItems },
        st.golive,
        st.support,
      ];
  }

  return chosen.map((c, i) => ({ n: i + 1, title: c.title, items: c.items }));
}

function buildPackages(lang: Lang): Pkg[] {
  return STR[lang].packages.map((p) => ({
    id: p.id as Pkg["id"],
    name: p.name,
    tagline: p.tagline,
    deliverables: p.deliverables,
    priceFrom: p.priceFrom,
    perMonth: p.perMonth,
    timeline: p.timeline,
  }));
}
