# Specsmith

Premium AI Prompt Creator — modern, Apple-level web app for crafting, optimizing, and managing AI prompts.

Built for Arena AI Agent Mode and deployed on Vercel, using the simplest reliable architecture for each build.

## Features

- **Prompt builder** — role, context, task, steps, constraints, format, tone, examples & notes, assembled into a clean structured prompt in real time.
- **Quality coach** — a 0–100 score with a live checklist of prompt-engineering best practices.
- **Template gallery** — eight production-grade starting points (code review, blog writer, analyst, tutor, image brief, strategist, support, UX copy).
- **Library** — save, search, duplicate, and delete prompts; everything persists locally in your browser (nothing leaves your device).
- **Export anywhere** — copy to clipboard, download as `.md`/`.txt`, or export/import the whole library as JSON.
- **Light & dark themes**, keyboard shortcuts (`⌘/Ctrl + S` to save), fully responsive.

## Run locally

Pure static site — no build step, no dependencies:

```bash
python3 -m http.server 3000
# or: npx serve
```

Open http://localhost:3000.

## Deploy

Push to Vercel (framework preset: **Other**, output: root) — or host the folder on any static host.
