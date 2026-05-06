# DAG Builder

A browser-based causal diagram (DAG) editor that exports dagitty R code.
No installation required for end users — just open in a browser.

---
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20058009.svg)](https://doi.org/10.5281/zenodo.20058009)

## Quickstart (run locally)

**Requirements:** Node.js ≥ 18 — download from https://nodejs.org

```bash
# 1. Go into the project folder
cd dag-builder

# 2. Install dependencies (one time only)
npm install

# 3. Start the app
npm run dev
```

Then open http://localhost:5173 in your browser. Done.

---

## Build for sharing (optional)

To create a standalone folder you can host anywhere:

```bash
npm run build
```

This creates a `dist/` folder. You can:
- Drag `dist/` to **Netlify Drop** (netlify.com/drop) → get a public URL instantly
- Push to GitHub and enable **GitHub Pages** pointing to `dist/`
- ZIP and send to a colleague — they open `dist/index.html` directly

---

## Project structure

```
dag-builder/
├── index.html          # HTML entry point
├── package.json        # Dependencies
├── vite.config.js      # Build config
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Full application
```

---

## Features

- Edge-by-edge DAG construction (From → To with role assignment)
- 9 variable roles: Exposure, Outcome, Confounder, Mediator, Collider,
  Unmeasured, Proxy of unmeasured, Effect modifier, Selection bias
- Live DAG rendering with force-directed layout
- Structural validation warnings (e.g. Outcome → Exposure flagged)
- Effect modifiers shown in footnote (not as structural edges)
- Unmeasured nodes rendered with dashed borders
- R code export (dagitty + ggdag ready to paste)
- SVG download

---

## Citation

If used in a manuscript:
- Raj Subedi. (2026). rajsubediresearch/dag-builder: DAG Builder v1.0.0 (v1.0.0). Zenodo. https://doi.org/10.5281/zenodo.20058009
- Textor J et al. (2016). Robust causal inference using directed acyclic graphs:
  the R package 'dagitty'. Int J Epidemiol. 45(6):1887–1894.
