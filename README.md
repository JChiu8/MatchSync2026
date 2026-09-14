# MatchSync

Framework baseline built with Bun, React Router 7 (SPA mode), Vite, React, strict TypeScript, Tailwind CSS v4, Base UI shadcn/ui, Convex, Zustand, next-themes, Lucide, and shadcn Sonner.

## Run in Codex

```sh
bun run start
```

On the first run, Convex asks you to log in. Choose **Login or create an account**, then select your personal Convex team. The command provisions/synchronizes that development deployment, configures Convex Auth keys once, and starts both Convex and Vite.

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Scripts

- `bun run start` — install, configure Convex/Auth if necessary, and run the whole app.
- `bun run dev` — run Convex and Vite after initial setup.
- `bun run build` — type-check and build the SPA.
- `bun run typecheck` — run strict TypeScript checks.
- `bun run lint` — lint the project.

Persisted application data belongs in Convex. `src/stores/ui-store.ts` is intentionally limited to ephemeral client UI state.
