# Jev site builder

Point at a blank page. Say what belongs there. [Jev](https://docs.typesafe.ai/)
picks the component and the page places it at the pointer.

The builder sends one state and fourteen typed questions to Jev in one call.
Jev returns structured values, not text: an intent, a block, a colour, a size,
a place. The page applies them.

## Run it

```bash
npm install
cp .env.example .env   # add TYPESAFE_API_KEY
npm run dev            # the builder,    http://localhost:5173
npm run reference      # a finished page, http://localhost:5174/reference.html
```

The reference page is a second product with its own copy. It shares only the
design system with the builder.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the builder |
| `npm run reference` | Start the reference page |
| `npm run build` | Type-check and build |
| `npm run lint` | Run oxlint |
| `npm run check` | Run the command self-checks |

## Layout

```
src/blocks/      the block catalog (20 sections)
src/components/  the design system
src/lib/         Jev calls, command shapes, text and colour helpers
server/          the Vite plugin that proxies Jev with the API key
```

Stack: React 19, Vite, Tailwind 4, TypeScript.
