# Portfolio project checkpoint

Last updated: 2026-06-18

## Completed

- Audited previous CVs and portfolio.
- Redesigned the portfolio with an editorial case-study approach and compact proof-oriented hero.
- Migrated the application from Vite to Next.js.
- Added Spanish, English, and French routes.
- Centralized profile, experience, education, projects, and CV variants under validated canonical JSON content.
- Added a private GitHub-backed CMS with OAuth, browser drafts, image uploads, and pull-request publishing.
- Added three generated ATS-friendly CV variants.
- Added content validation, tests, linting, production build checks, sitemap, robots, and CI.
- Completed desktop, mobile, route, accessibility, and PDF visual QA.
- Audited `.gitignore` and strengthened exclusions for environment files, build output, temporary files, Vercel state, certificates, and private keys.
- Scanned versionable files for secrets; none were found.
- Created and merged PR #1 into `main`.
- Deleted/disabled the old GitHub Pages site.

## Current deployment state

- Hosting strategy: Vercel with a future custom domain.
- The user attempted to buy a domain through Vercel and Cloudflare, but both rejected the payment method.
- Domain purchase is postponed; it can be bought from any registrar later and connected to Vercel through DNS.

## Pending

1. Confirm the current Vercel production deployment and its exact `vercel.app` URL.
2. Remove the obsolete GitHub Pages redirect workflow if it is still present on `main`.
3. Create/configure the production GitHub OAuth App using the active Vercel URL.
4. Add production environment variables in Vercel.
5. Test `/admin`, GitHub authentication, content editing, image upload, and PR creation.
6. Buy a custom domain when payment is available.
7. Connect the domain to Vercel.
8. Update `NEXT_PUBLIC_SITE_URL`, OAuth homepage/callback, sitemap, canonical URLs, and documentation to the final domain.

## Repository

- GitHub: `kniazev77/portfolio`
- Local checkout: `C:\Users\juank\OneDrive\Documentos\Busqueda de Trabajo\portfolio-audit`
- Main implementation PR: https://github.com/kniazev77/portfolio/pull/1
