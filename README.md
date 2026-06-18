# Juan Kniazev · Professional portfolio

Multilingual professional portfolio designed for recruiters and employers. The public site prioritizes verified experience, selected case studies and three shareable professional focuses:

- Delivery / ERP
- Software / .NET
- Data / Automation

## Stack

- Next.js and TypeScript
- Versioned JSON content validated with Zod
- React PDF for ATS-friendly CV generation
- GitHub OAuth and Git Data API for the private editorial CMS
- Vercel production and pull-request previews
- GitHub Pages redirect to the production URL

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Public routes:

- `/es`
- `/en`
- `/fr`
- `/{language}?focus=delivery|software|data`

Private CMS:

- `/admin`

## Canonical content

All public facts live in `content/data`. Updating these files updates the site and the three generated CVs.

```text
profile.json
experience.json
education.json
projects.json
cvVariants.json
```

Run:

```bash
npm run validate:content
npm run generate:cvs
```

Generated files:

- `public/cv/Juan-Kniazev-CV-Project-Management-ERP.pdf`
- `public/cv/Juan-Kniazev-CV-DotNet-Integrations.pdf`
- `public/cv/Juan-Kniazev-CV-Data-Automation.pdf`

## GitHub OAuth CMS

Create a GitHub OAuth App with:

- Homepage URL: your Vercel production URL
- Callback URL: `https://your-domain/api/auth/github/callback`

Configure Vercel environment variables using `.env.example`.

The CMS:

1. Authenticates the configured GitHub user.
2. Stores the GitHub token inside an encrypted HttpOnly cookie.
3. Saves browser drafts to local storage.
4. Validates canonical content server-side.
5. Creates or updates `content/update-YYYY-MM-DD`.
6. Creates a pull request so Vercel can provide a preview.

No personal access token is entered in the browser.

## Deployment

Import the repository into Vercel using the Hobby plan. Set `PORTFOLIO_PRODUCTION_URL` as a GitHub Actions repository variable so the existing GitHub Page redirects to the final Vercel URL.

## Quality gates

```bash
npm run check
```

CI validates content and assets, runs lint and tests, generates all CVs, builds Next.js and audits production dependencies.
