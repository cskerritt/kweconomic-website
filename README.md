# KWVRS (kwvrs.com)

Marketing site and intake automation for **Kincaid Wolstein Vocational and Rehabilitation Services** — nationwide vocational expert, life care planning, and forensic economics services. ~6,600 pre-rendered pages plus a DocuSign-based retainer-intake workflow.

## Two programs in this repo

| Program | Location | Run | Purpose |
|---------|----------|-----|---------|
| Public website | repo root | `node server.js` | serves pre-rendered `dist/` + form APIs |
| Workflow service | `workflow/` | `node workflow/server.js` | DocuSign PSAs, Supabase case DB, Asana, email digests |

## Quick start

```bash
npm install
npm run dev      # local dev (Vite, HMR)
npm run build    # sitemaps -> tsc -> vite build -> prerender (writes dist/)
node server.js   # serve the built site (port 3000)
npm test         # vitest
```

## Documentation

- **[docs/ENGINEERING_GUIDE.md](docs/ENGINEERING_GUIDE.md)** — full hand-off wiki: architecture, routing, the data layer, build/pre-render, the workflow service, deployment, runbook, and the accounts/secrets checklist. **Start here.**
- **[docs/system-architecture.svg](docs/system-architecture.svg)** — system + data-flow diagram (PNG: `docs/system-architecture.png`).
- **[workflow/README.md](workflow/README.md)** — workflow service detail.
- **[CLAUDE.md](CLAUDE.md)** — project rules, content/editorial invariants, design tokens.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS 4. Dependency-free Node `http` server. Deployed on Railway via Docker.
