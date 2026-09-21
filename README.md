# naveenkumarvaradha.github.io

Personal portfolio site for **Naveenkumar Varadharaj** — ERP Techno-Functional Consultant (Datatex / WFX ERP platforms, apparel & textile supply chain) who also builds full-stack side projects. Live at **[naveenkumarvaradha.github.io](https://naveenkumarvaradha.github.io/)**.

## Stack

A single static page — no build step, no framework, no bundler:

- Plain HTML5 + vanilla JS (`script.js`)
- [Tailwind CSS](https://tailwindcss.com/) via the play CDN, with a small custom theme (`ink`/`gold`/`teal`/`mist` palette, Space Grotesk + Inter + JetBrains Mono)
- Hosted directly by GitHub Pages from this repo — pushing to `main` is the deploy

## Structure

```
index.html    All page markup and content, in sections (id-anchored, single page)
style.css     Custom styles layered on top of Tailwind's utility classes
script.js     Nav scroll/reveal behavior, mobile menu toggle, cursor glow effect
assets/       Resume PDF and other static assets
preview.ps1   Zero-dependency local static file server for previewing (Windows/PowerShell)
```

## Sections

| # | Section | Content |
|---|---|---|
| 01 | About | Bio / summary |
| 02 | Experience | ERP consulting roles and engagements |
| 03 | Skills | Technical + domain skill set |
| 04 | Key Projects | Selected engagements (ERP implementations) |
| 05 | Outside the ERP desk | Side projects — currently building, e.g. [CourierApp](https://github.com/naveenkumarvaradha/CourierApp) |
| — | Contact | LinkedIn, email, resume download |

## Running locally

No Node/Python required — `preview.ps1` is a small zero-dependency static file server:

```powershell
.\preview.ps1          # binds the first free port from a small candidate list
.\preview.ps1 -Port 8080
```

Then open the printed `http://localhost:<port>/` URL. Since the page has no build step, editing `index.html`/`style.css`/`script.js` and refreshing the browser is the entire iteration loop.

## Deploying

GitHub Pages serves this repo's `main` branch directly — there's nothing to build or publish separately. A push to `main` is live within a minute or two.
