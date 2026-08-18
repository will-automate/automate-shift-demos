# Automate Shift — Interactive Demos

Interactive React components showcasing the [Automate Shift](https://automateshift.com) Growth Ops system.

**Live demos:** [automateshift.com/demos](https://automateshift.com/demos/)

---

## What's included

| Component | Description |
|---|---|
| `GrowthOpsSimulator` | Pick an industry and tier, run a live workflow simulation, and inspect each automation node |
| `DayInTheLife` | Animated scroll through a full business day — with and without the automation system |

---

## Quick start

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Using the components in your own project

Both components are self-contained. Copy `src/components/GrowthOpsSimulator.tsx` and/or `src/components/DayInTheLife.tsx` into your project and install the peer deps:

```bash
npm install react react-dom lucide-react
```

### GrowthOpsSimulator

```tsx
import GrowthOpsSimulator from './components/GrowthOpsSimulator'

<GrowthOpsSimulator />
```

### DayInTheLife

```tsx
import DayInTheLife from './components/DayInTheLife'

// pricingBase links the CTA to the Automate Shift pricing page
<DayInTheLife pricingBase="https://automateshift.com" />
```

---

## Attribution

These components were built by [Automate Shift](https://automateshift.com).

When embedding on your site, please include a visible credit link to `https://automateshift.com` and add the following to your page `<head>` to establish the SEO/AEO relationship between our sites:

```html
<link rel="canonical" href="https://automateshift.com/demos/" />
```

---

## Tech stack

- [React 18](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [lucide-react](https://lucide.dev)
- TypeScript
