# Ewin (redwood)

AI tutor for Nigerian secondary students preparing for **WAEC** and **JAMB**.

Ewin teaches one concept at a time, then asks a question to check understanding — Mathematics, Physics, Chemistry, Biology, English, Economics.

## Stack

- Next.js (App Router)
- Anthropic Claude (`/api/tutor`)
- Tailwind CSS v4

## Setup

```bash
npm install
# ANTHROPIC_API_KEY in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run lint` — ESLint
