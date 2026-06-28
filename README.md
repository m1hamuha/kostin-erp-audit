# ERP Health Audit

A bilingual (English / Ukrainian) online tool that audits a company's business
system and recommends an [Odoo](https://www.odoo.com) path. Answer a few simple
questions and get an instant, branded report: a health score, prioritized risks,
a recommended path, a staged plan, and three service packages with an estimate.

Positioned for three markets: **US**, **Europe**, and **Ukraine**.

## Key logic

- If the current system is **1C or BAS** and the market is **Ukraine**, the report
  flags the **legal ban** (sanctioned January 2026 - mandatory migration) and
  recommends a safe, staged migration to Odoo.
- For 1C/BAS in foreign markets, spreadsheets, SAP, or QuickBooks it recommends the
  right Odoo path (migrate / implement / consolidate); for existing Odoo it
  recommends optimization.

## Service packages

Implementation · Custom development · Support & care - each with concrete
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

Builds to `/docs` (GitHub Pages serves `main` -> `/docs`, with `.nojekyll`):

```bash
npm run build
```

## Buy + onboarding flow

Each package has a **Get started** button. It opens a "What happens next" panel
with a clear 4-step pipeline (choose and pay, tell us about your setup, we start
within a few business days, you get your deliverables). Inside it the buyer can
pay (PayPal or bank transfer) and fill a short intake form. The intake and
bank-transfer forms post to `kostinmihail40@gmail.com` via FormSubmit, so you
get an email for every request. No backend.

## Payment setup

All payment values live in **one file**: `src/paymentConfig.ts`. Until you fill
them in, the site stays fully working: the PayPal buttons show a calm "use bank
transfer" message and the bank-transfer option is always available. Nothing
breaks. After editing, run `npm run build` and push.

Paste these three values into `src/paymentConfig.ts`:

| In the file | What to paste | Where to get it in PayPal |
| --- | --- | --- |
| `paypalClientId` | Your **live Client ID** | PayPal Dashboard, **Apps & Credentials**, switch to **Live**, open (or create) your app, copy **Client ID** |
| `supportPlanId` | The **subscription Plan ID** for Support & care (240 EUR / month). It starts with `P-` | PayPal Dashboard, **Pay & Get Paid > Subscriptions**, create a **Product**, then a **Plan** priced 240 EUR / month, copy the **Plan ID** |
| `paymentLinks.implementation` / `paymentLinks.custom` | *(optional)* a ready-made PayPal link for each one-time package | PayPal Dashboard, **Pay & Get Paid > More > Payment Links** (or your PayPal.me link). Leave empty to use only the buttons |

How each package charges:

- **Implementation** and **Custom development**: a one-time PayPal payment of the
  package "from" price (1,800 EUR / 1,200 EUR), in EUR.
- **Support & care**: a PayPal **subscription** at 240 EUR / month, using
  `supportPlanId`.

When you create the subscription plan, set the failed-payment handling to
**retry, then cancel after 3 failed attempts**. PayPal then chases failed
renewals for you automatically.

## Analytics / ad tracking

All tracking IDs live in **one file**: `src/analyticsConfig.ts`. Until you paste
an ID the site loads nothing extra (empty = no-op, no errors, no cookies). After
editing, run `npm run build` and push.

| In the file | What to paste | Where to get it |
| --- | --- | --- |
| `GA4_MEASUREMENT_ID` | Your GA4 **Measurement ID** (looks like `G-XXXXXXXXXX`) | Google Analytics, **Admin > Data streams**, open your web stream, copy **Measurement ID** |
| `META_PIXEL_ID` | Your Meta **Pixel ID** (a long number) | Meta **Events Manager > Data sources**, open your Pixel, **Settings**, copy the **Pixel ID** |

Events fired automatically (so you can build ad audiences and conversions):

- `audit_started` - visitor begins the questionnaire
- `audit_completed` - report is shown
- `lead_captured` - email submitted on the report (also sent to Meta as **Lead**)
- `plan_chosen` - a plan is picked (Meta **AddToCart**)
- `begin_checkout` - the buy flow opens (Meta **InitiateCheckout**)

For Meta ad optimization, set your campaign to optimize for **Lead** or
**InitiateCheckout**, which map to the events above.

## Dunning (failed payments)

PayPal subscriptions auto-retry failed renewals and can be set to cancel after 3
failed attempts (see above), so most of this is handled for you. For the two
moments you may want to email a customer yourself, reuse these:

**1. Payment failed, gentle retry**

> Subject: A small problem with your payment
>
> Hi {name},
>
> Your last payment for {package} did not go through. It happens, usually an
> expired card or a temporary bank block. Your service is still running for now.
>
> You can fix it in a minute here: {payment link}. If anything looks off, just
> reply to this email and we will sort it out together.
>
> Thanks,
> Mykhailo

**2. Final notice, before pause**

> Subject: Last reminder about your payment
>
> Hi {name},
>
> We have tried your payment for {package} a few times and it still has not gone
> through, so the plan is about to pause. To keep everything running without a
> gap, please update your payment here: {payment link}.
>
> If you would rather pay by bank transfer instead, reply to this email and we
> will send you the details.
>
> Thanks,
> Mykhailo

Contact: kostinmihail40@gmail.com
