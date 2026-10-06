# Vikash Saravanan — Portfolio

A lightweight, responsive portfolio for full-stack software and AI systems engineering. Built with semantic HTML, self-hosted fonts, CSS animation, and progressive JavaScript.

## Develop and verify

```sh
npm ci
npm run dev
npm test
```

The local preview is at `http://127.0.0.1:5500`. Override `PORT` if needed. After editing, run `npm run build` and reload; the preview serves the generated `dist` directory.

## Content

- `index.html`: selected work, about, experience, expertise, achievements, education, certifications, and contact.
- `voiceshield.html`, `logic-voice.html`, `business-ai.html`: dedicated case studies. The project visuals are conceptual diagrams, not screenshots or live telemetry.
- `assets/docs/Vikash_Saravanan_Resume.pdf`: latest user-supplied résumé. The build also copies it to the former `assets/Vikash_Saravanan_Resume.pdf` path.
- `css/portfolio.css` and `js/portfolio.js`: layout, responsive menu, section reveals, portrait interaction, animated diagrams, scroll progress, copy email, and motion preference controls.

Professional claims follow the supplied resumes. The Lighthouse and seven-day figures describe a flagship client engagement, not this portfolio. The LIT title is Lead Full-Stack & AI Engineer. Only the public VoiceShield repository is linked; no private repository is exposed. Certification dates and credential identifiers are omitted because they were not supplied.

## Publishing

`npm run build` copies an explicit list of public files to `dist`. Legacy galleries, experiments, backend code, and configuration remain outside the published output. Vercel and GitHub Pages both publish this directory. GitHub Pages builds and tests on main pushes.

```sh
vercel link --project vikash-portfolio
vercel deploy
vercel deploy --prod
```

The Vercel configuration explicitly uses static hosting. No API keys or backend service are required. The older bridge server remains in repository history/source but is excluded from this deployment.

## Accessibility and verification

The site includes keyboard navigation, a skip link, visible focus, responsive navigation with Escape support, OS reduced-motion support, a persistent animation pause control, and readable content without JavaScript. Static smoke tests validate page links and anchors, published assets, the résumé alias, and service-worker core resources. Desktop/mobile layout and interactions are additionally checked in the browser.
