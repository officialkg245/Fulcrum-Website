## Fulcrum Site (Vite + React)

### Run locally

In one terminal:

```bash
npm run dev
```

In a second terminal:

```bash
npm run dev:api
```

The frontend calls the API via a Vite proxy at `/api/*`.

### LinkedIn “Latest posts” (auto-load)

1. Create a LinkedIn app in the LinkedIn Developer Portal.
2. Add this redirect URL in the app’s OAuth settings:
   - `http://localhost:5174/api/linkedin/callback`
3. Copy `.env.example` → `.env` and fill in:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`
4. Start the API server (`npm run dev:api`) and the frontend (`npm run dev`).
5. On the homepage “Latest on LinkedIn” section, click **Connect LinkedIn**.

Notes:
- LinkedIn permissions/scopes vary by app/product approval. If LinkedIn blocks post reads, we may need to adjust scopes/products in the app.
- For production hosting later, we’ll move the in-memory token/cache to a persistent store (KV/DB) and update the redirect URL.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
