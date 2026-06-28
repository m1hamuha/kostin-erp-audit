// Domain model for the ERP / Business Systems Health Audit.

export type Lang = "en" | "uk";

export type Severity = "high" | "med" | "low";

// What the business runs today.
export type SystemId =
  | "odoo"
  | "1c"
  | "bas"
  | "quickbooks"
  | "sap"
  | "spreadsheets"
  | "other";

export type MarketId = "us" | "eu" | "ua" | "other";

export type SizeId = "1-5" | "6-20" | "21-50" | "51-200" | "200+";

// The recommended direction the report points to.
export type PathKind =
  | "migrate-urgent" // 1C/BAS in Ukraine — legal ban, mandatory migration
  | "migrate" // 1C/BAS in a foreign market — wrong fit, plan a migration
  | "implement" // spreadsheets / nothing — first real ERP
  | "replace" // SAP / QuickBooks — consolidate onto Odoo
  | "optimize"; // already on Odoo — improve & extend

export interface Answers {
  system: SystemId | "";
  market: MarketId | "";
  size: SizeId | "";
  integrations: string[]; // ids; may include "none"
  pains: string[]; // ids
  painText: string; // free text
}

export interface Risk {
  id: string;
  title: string;
  severity: Severity;
  what: string; // plain-language: what it means
  why: string; // why it matters / the consequence
}

export interface Stage {
  n: number;
  title: string;
  items: string[];
}

export interface Recommendation {
  title: string;
  body: string;
}

export interface Pkg {
  id: "implementation" | "custom" | "support";
  name: string;
  tagline: string;
  deliverables: string[];
  priceFrom: number; // USD
  perMonth?: boolean;
  timeline: string;
}

export interface Report {
  score: number; // 0..100 health score
  zone: "red" | "amber" | "green";
  zoneLabel: string;
  verdict: string; // one-line headline verdict
  summary: string; // 2-4 sentence summary
  profileLine: string; // "1C · Ukraine · 21–50 users"
  pathKind: PathKind;
  recommendation: Recommendation;
  risks: Risk[]; // sorted high → low
  plan: Stage[];
  packages: Pkg[];
  recommendedPackage: Pkg["id"];
}
