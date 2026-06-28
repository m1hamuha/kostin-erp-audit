# ERP Health Audit

A bilingual (English / Ukrainian) online tool that audits a company's business
system and recommends an [Odoo](https://www.odoo.com) path. Answer a few simple
questions and get an instant, branded report: a health score, prioritized risks,
a recommended path, a staged plan, and three service packages with an estimate.

Positioned for three markets: **US**, **Europe**, and **Ukraine**.

## Key logic

- If the current system is **1C or BAS** and the market is **Ukraine**, the report
  flags the **legal ban** (sanctioned January 2026 — mandatory migration) and
  recommends a safe, staged migration to Odoo.
- For 1C/BAS in foreign markets, spreadsheets, SAP, or QuickBooks it recommends the
  right Odoo path (migrate / implement / consolidate); for existing Odoo it
  recommends optimization.

## Service packages

Implementation · Custom development · Support & care — each with concrete
deliverables, a "from" price, and a timeline (all marked as estimates).

## Stack

Vite + React + TypeScript + Tailwind CSS. The questionnaire feeds a rules engine
(`src/generateReport.ts`) that produces the report. All copy lives in `src/i18n.ts`.

## Develop

```bash
npm install
npm run dev
```

## Build & deploy

Builds to `/docs` (GitHub Pages serves `main` → `/docs`, with `.nojekyll`):

```bash
npm run build
```

Contact: kostinmihail40@gmail.com
