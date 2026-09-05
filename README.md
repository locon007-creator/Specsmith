# Specsmith

App-build prompt generator — turn a one-line app idea into a finished, copy-ready build prompt.

Describe an app in plain language and Specsmith interprets it into a complete, high-information prompt you can paste straight into an AI app builder such as Arena AI Agent Mode. No questionnaires, no prompt-writing advice — just *idea in, finished prompt out*.

## How it works

1. **Type an idea** — "a habit tracker with streaks" is enough.
2. **Generate** — Specsmith interprets the idea into purpose, target user, core workflow, screens, navigation, features, logic, persistence, interaction behavior, and visual direction.
3. **Copy / download** — paste the finished prompt into your AI app builder.

Generated prompts default to premium, mobile-first multi-screen web apps (360–430 px portrait) with Apple-level polish, delivered as one self-contained `index.html` with inline HTML/CSS/JS and state-driven navigation — unless the idea calls for something else.

## Run locally

Pure static site — no build step, no dependencies:

```bash
python3 -m http.server 3000
# or: npx serve
```

Open http://localhost:3000.

## Deploy

Push to Vercel (framework preset: **Other**, output: root) — or host the folder on any static host.

## Privacy

Everything runs in your browser. Ideas, history, and generated prompts never leave your device.
