import type { Answers, Lang } from "./types";
import { STR } from "./i18n";

export interface Option {
  id: string;
  label: string;
  hint?: string;
}

export interface SingleStep {
  kind: "single";
  key: keyof Answers;
  title: string;
  subtitle?: string;
  options: Option[];
}

export interface MultiStep {
  kind: "multi";
  key: keyof Answers;
  title: string;
  subtitle?: string;
  options: Option[];
  noneId?: string; // selecting this clears the others
}

export interface PainStep {
  kind: "pains";
  title: string;
  subtitle?: string;
  options: Option[];
  textLabel: string;
  textPlaceholder: string;
}

export type Step = SingleStep | MultiStep | PainStep;

const SYSTEM_ORDER = [
  "odoo",
  "1c",
  "bas",
  "quickbooks",
  "sap",
  "spreadsheets",
  "other",
] as const;
const MARKET_ORDER = ["us", "eu", "ua", "other"] as const;
const SIZE_ORDER = ["1-5", "6-20", "21-50", "51-200", "200+"] as const;
const INTEGRATION_ORDER = [
  "bank",
  "ecommerce",
  "crm",
  "einvoice",
  "none",
] as const;
const PAIN_ORDER = [
  "manual",
  "disconnected",
  "reporting",
  "scaling",
  "errors",
  "compliance",
  "support",
  "cost",
] as const;

export function getSteps(lang: Lang): Step[] {
  const s = STR[lang];
  const L = s.labels;
  return [
    {
      kind: "single",
      key: "system",
      title: s.quiz.steps.system.title,
      subtitle: s.quiz.steps.system.subtitle,
      options: SYSTEM_ORDER.map((id) => ({
        id,
        label: L.system[id],
        hint: L.systemHint[id],
      })),
    },
    {
      kind: "single",
      key: "market",
      title: s.quiz.steps.market.title,
      subtitle: s.quiz.steps.market.subtitle,
      options: MARKET_ORDER.map((id) => ({ id, label: L.market[id] })),
    },
    {
      kind: "single",
      key: "size",
      title: s.quiz.steps.size.title,
      subtitle: s.quiz.steps.size.subtitle,
      options: SIZE_ORDER.map((id) => ({ id, label: L.size[id] })),
    },
    {
      kind: "multi",
      key: "integrations",
      title: s.quiz.steps.integrations.title,
      subtitle: s.quiz.steps.integrations.subtitle,
      noneId: "none",
      options: INTEGRATION_ORDER.map((id) => ({ id, label: L.integration[id] })),
    },
    {
      kind: "pains",
      title: s.quiz.steps.pains.title,
      subtitle: s.quiz.steps.pains.subtitle,
      textLabel: s.quiz.steps.pains.textLabel,
      textPlaceholder: s.quiz.steps.pains.textPlaceholder,
      options: PAIN_ORDER.map((id) => ({ id, label: L.pain[id] })),
    },
  ];
}

export const emptyAnswers: Answers = {
  system: "",
  market: "",
  size: "",
  integrations: [],
  pains: [],
  painText: "",
};
