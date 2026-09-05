# Specsmith

App-build prompt generator — turn a one-line app idea into a finished, copy-ready build prompt.

Describe an app in plain language and Specsmith interprets it into a complete, high-information prompt you can paste straight into an AI app builder such as Arena AI Agent Mode. No questionnaires, no prompt-writing advice — just *idea in, finished prompt out*.

## How it works

1. **Type an idea** — "a habit tracker with streaks" is enough.
2. **Generate** — Specsmith compiles a fresh isolated plan from the current idea, matches only justified domain rules, resolves the best expert role, preserves explicit workflow/platform instructions, and renders one canonical build prompt.
3. **Copy / download** — paste the finished prompt into your AI app builder.

Every generated app prompt now follows this global authority order:

1. Role
2. Product Mission / Objective
3. Idea Lock
4. Design & UX Standard
5. Target User
6. Primary Workflow
7. Screen Architecture
8. Screen-by-Screen Composition
9. Product Behavior & Calculations
10. Interaction & State Rules
11. Scope Lock / Forbidden Behavior
12. Implementation / Tool Guidance
13. Verification + Done When

Specsmith automatically resolves the most appropriate role from the current build idea. Explicit Android, iOS, web, or platform requirements always win over inference. When no platform is specified, Specsmith keeps its Arena-friendly self-contained web target rather than silently switching platforms.

Premium UI/UX is automatic, not a style toggle. Generated prompts require production-ready hierarchy, intentional spacing and typography, one obvious next action, coherent navigation, relevant polished states, purposeful restrained motion, and a first-screen quality gate that rejects generic prototype/dashboard/card-stack results.

Screen Architecture keeps the primary workflow dominant while supporting views and Settings remain secondary unless the product explicitly makes them primary. Screen-by-Screen Composition preserves each selected domain profile’s actual screen content instead of replacing it with generic layout filler.

The generator remains deterministic and private. Each run starts from a fresh plan, domain defaults cannot import prior-app features, and contamination checks keep previous generations out of the next result.

## Default build target

When the idea does not explicitly request a native target, generated builds default to premium, mobile-first multi-screen web apps at 360–430 px portrait, delivered as one self-contained `index.html` with inline HTML/CSS/JS and state-driven navigation. No fake device frame, unnecessary framework, AI API, or external service is added by default.

## Run locally

Pure static site — no build step, no dependencies:

```bash
python3 -m http.server 3000
# or: npx serve
```

Open http://localhost:3000.

Run the regression suite with:

```bash
node --test tests/*.test.cjs
```

## Deploy

Push to Vercel (framework preset: **Other**, output: root) — or host the folder on any static host.

## Privacy

Everything runs in your browser. Ideas, history, and generated prompts never leave your device.
