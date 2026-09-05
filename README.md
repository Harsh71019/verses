# Verse

An immersive, animated quote experience built with React, TypeScript, Vite, and Framer Motion. Seven categories—Ambition, Peace, Resilience, Joy, Revenge, Hard Work, and Focus—each have a distinct visual world.

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run build
```

## Docker deployment

```bash
docker compose up -d --build
```

The production container serves the app through Nginx on host port `3009` and exposes `/healthz` for health checks.
