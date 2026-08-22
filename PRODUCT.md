# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** High school students — especially juniors and seniors — balancing schoolwork, a sport or serious hobby, and college preparation.

They use Seldom as a daily workspace: track tasks and goals, log training or practice, manage deadlines and applications, reflect in a journal, and get AI help grounded in their own data.

**Secondary (inferred from product shape):** Student-athletes are the core persona; the performance tab is customizable (passion, sidebar label) so adjacent hobbies (music, climbing, etc.) can use the same mechanics without being soccer-specific in copy.

## Product Purpose

Seldom is a personal control center for the student-athlete / college-prep journey. It unifies productivity (tasks, goals, calendar, journal), performance tracking (sessions, skills, recovery, progression), and junior/senior college prep (schools, deadlines, Common App workspace, financial planning) in one authenticated workspace.

**Success looks like:** a student opens one app each day, sees what matters now (briefing, deadlines, training load), logs work in structured modules, and gets AI guidance that references their actual logs — not generic advice.

## Positioning

Built for the **student-athlete / college-prep journey specifically** — not a generic productivity app. Neighboring tools typically split life across a task app, a training log, a college spreadsheet, and a chatbot with no shared context. Seldom’s mechanism is **one workspace where daily actions, performance data, and application milestones stay connected**, with AI modes (assistant, college advisor, training drills) that read the same underlying records.

## Operating Context

- **Local development:** `npm run dev:vercel` at `http://localhost:3000` (not Vite `:5173` alone) with Ollama on `localhost:11434`.
- **Production:** Deployed on Vercel (`https://seldom-nine.vercel.app` per `DEPLOY.md`); Supabase for auth and data.
- **AI today:** All chat/embeddings route through **Ollama** via serverless `/api/*`. Production requires a reachable `OLLAMA_BASE_URL` (tunnel, VPS, or similar). When offline, features degrade to stubs and clear user-facing errors.
- **Onboarding:** Welcome tutorial personalizes display name, performance passion/tab label, optional focus, and high-school year (controls Junior Prep visibility).
- **Reminders:** Browser notifications for tasks, goals, and college deadlines with configurable lead time (`Settings`).
- **Docs:** Setup and deploy guidance in `docs/` (`STARTUP.md`, `DEPLOY.md`, `FREE-OLLAMA-URL.md`, `ORACLE-OLLAMA-SETUP.md`, `SUPABASE-AUTH.md`).

## Capabilities and Constraints

**Confirmed capabilities**

| Area | What Seldom does |
|------|------------------|
| Core | Tasks, goals, journal, calendar, analytics dashboard |
| Performance | Session logging, skills (cap 12), heatmap, recovery/ACWR, progression, knowledge import |
| College | School list, deadlines, Common App workspace, essays/activities, planning (aid/scholarships), AI college advisor |
| AI | Seldom OS assistant, college advisor, soccer/training drill modes; semantic memory sidecar when services run |
| Personalization | Themes, custom nav tab colors, renameable performance tab, optional Junior Prep tab |
| Auth | Supabase email auth; per-user data isolation |

**Technical constraints**

- React 19 + Vite + Tailwind 4 SPA; Vercel serverless API routes.
- AI engine is **Ollama-only** in code today (`lib/ai/chat.ts`, `lib/ollama/service.ts`). Cloud providers (Groq, Gemini, etc.) are not integrated yet.
- Production AI depends on host-provided Ollama URL unless/until a managed provider is added.

**Terminology**

- **Seldom** — product name.
- **Seldom OS** / **Seldom AI** — assistant persona in UI and prompts.
- **Junior Prep** — college-prep section (sidebar label for `/college`).
- **Performance** — default sidebar label for the sport/hobby module (`/soccer` routes); user-renamable.

**Open product decisions**

- **Public-product AI model:** Target is a real product others can use **without the founder hosting everyone’s AI** — exact provider, billing, and per-user vs. shared backend are **not decided**.
- **Audience expansion:** Confirmed primary is HS students; whether to optimize explicitly for non-athlete students is undecided.

## Brand Commitments

- **Name:** Seldom (package description: “your personal control center for tasks, goals, journaling, and more”).
- **Voice:** Assistant speaks as **Seldom OS** — proactive, grounded in user data, concise and actionable; must not invent personal stats or deadlines (`config/prompts/assistant.json`).
- **Mark:** “S” monogram in brand blue on auth and sidebar (`SidebarBrand`, `AuthLayout`); no separate logo asset path committed in repo.
- **Honesty:** Empty states and onboarding state that data starts when the user adds it — no fabricated stats or pre-filled personal records.

## Evidence on Hand

| Asset | Location / note |
|-------|------------------|
| Live deployment | `https://seldom-nine.vercel.app` (documented in `DEPLOY.md`) |
| Onboarding copy | `config/prompts/app-tutorial.json`, tab intro prompts |
| Assistant system prompt | `config/prompts/assistant.json` |
| Deploy / AI setup docs | `docs/`, `vercel.env.example`, `.env.example` |

**Do not fabricate:** customer testimonials, case studies, press, pricing, user counts, or benchmark claims — none are in the repository.

## Product Principles

1. **One journey, one workspace** — School, sport, and college prep belong in connected modules, not separate silos.
2. **Ground AI in real records** — Never present invented personal data; say what’s missing and give labeled general guidance.
3. **Start empty, earn density** — Onboarding personalizes; modules stay honest until the user logs content.
4. **Respect the student’s season** — Junior Prep, reminders, and performance load adapt to where they are in high school and training.
5. **Ship for real use** — Local dev and Vercel production are first-class; AI availability must be understandable when the backend is offline.

## Accessibility & Inclusion

No product-specific accessibility standard or user-research requirement has been established yet. Web app uses semantic HTML patterns in places (dialogs, labels); formal WCAG target is **undecided**.
