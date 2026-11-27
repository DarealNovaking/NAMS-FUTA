# NAMS FUTA Digital Archive

A production-ready digital archive for the National Association of Microbiology Students (NAMS), Federal University of Technology, Akure.

## Vision

**Understanding the Microbial World**

The platform preserves academic resources, institutional records, projects, events, media, alumni information, membership records, downloads, and website files while providing a modern, accessible experience for students and administrators.

## Required archive

- Administration
  - Constitution
  - Policies
  - Executive Council
  - Minutes
  - Reports
  - Financial Records
  - Handover Notes
- Academic Resources
  - 100 Level
  - 200 Level
  - 300 Level
  - 400 Level
  - 500 Level
- Past Questions
- Project Library
- Events
- Media Gallery
- Alumni
- Membership Records
- Downloads
- Website Files

## Stack

- Frontend: modern React application
- Hosting: GitHub Pages (current production deployment)
- Backend: Supabase
- Database: PostgreSQL
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Source control: GitHub

## Product principles

- Institutional and professional visual language
- Microbiology-inspired 3D motion used with restraint
- Mobile-first usability
- Searchable archive
- Admin-controlled publishing and uploads
- Database-enforced authorization
- No public self-registration in V1
- Sensitive records protected by role and visibility
- Global footer credit: **Brought to you by TEAM NEXUS**


## Deployment

The active production deployment is managed by GitHub Actions and published to GitHub Pages:

- Production site: https://darealnovaking.github.io/NAMS-FUTA/
- Workflow: `.github/workflows/deploy.yml`
- Trigger: pushes to `main` or manual workflow dispatch
- Build command: `npm run build`
- Vite base path: `/NAMS-FUTA/`
- Backend: the NAMS Supabase project configured through the workflow's public frontend environment values

The repository still contains `netlify.toml` and `vercel.json` for alternate-host configuration, but those files are not used by the active GitHub Pages workflow. Do not assume they are production deployments.
