# NAMS FUTA Digital Archive — Master Handoff

## Status
- Phase: Phase 3 — production completion / audit
- Batch: 1 — Repository + Supabase State Audit
- Audit date: 2026-10-06
- Repository: `DarealNovaking/NAMS-FUTA`
- Branch: `main`
- Baseline commit before this handoff: `024924f574d86b2ac3842ce2fdc97827a71a352c`
- Supabase project: `NAMS` / `amswykapebeevhstmvii`
- Supabase region: `eu-west-1`
- PostgreSQL reported version: 17.6.1.166

## Product purpose
Permanent, professional, data-driven institutional archive for the National Association of Microbiology Students (NAMS), Federal University of Technology, Akure. The archive must preserve academic resources, institutional records, administrations, executives, meetings, events, projects, media, alumni, membership records, announcements, downloads and website information across successive administrations.

## Current architecture observed
- React 19 + Vite frontend
- Supabase JS client
- Supabase Auth for administrator authentication
- PostgreSQL/Supabase tables and RLS expected for authorization
- Supabase Storage for private archive files
- Netlify deployment with SPA fallback
- Lucide React icons and Three.js dependency
- Client routing implemented in `src/App.jsx`
- Public archive implemented primarily through `src/pages/ArchivePage.jsx`
- Public search through `src/pages/SearchPage.jsx`
- Admin shell through `src/pages/AdminPage.jsx`
- Generic admin CRUD through `src/pages/admin/AdminModulePage.jsx`
- Specialized document, administrator, handover, settings and activity modules

## Verified repository state
Latest commit inspected:
`024924f574d86b2ac3842ce2fdc97827a71a352c` — "Load archive accessibility and responsive polish".

Recent work already present includes public archive search/detail relationships, administration/executive route handling, media replacement/cleanup, event/meeting document relationship managers, admin account management, handover continuity UI, document upload management, and public accessibility/responsive polish.

No existing `docs/MASTER-HANDOFF.md` was found in the repository search. This file establishes it as the source of truth from this point forward.

## Important frontend findings from Batch 1
### Positive
- Frontend uses the Supabase publishable/anon client only through Vite environment variables; no service-role key was found in the inspected client files.
- Admin profile authorization currently requires an active `admin` or `super_admin` role.
- Admin account creation is delegated to the `admin-account-management` Edge Function rather than directly creating privileged Auth users in the browser.
- Archive document files are intended to remain in private Storage and admin file opening uses short-lived signed URLs.
- File upload paths use generated UUIDs and sanitized filenames.
- Document upload validation enforces a 50 MB client-side maximum and explicit MIME types.
- Admin document lifecycle includes create/update/publish/archive/delete and old-file cleanup attempts.
- Netlify SPA fallback is configured for `/* -> /index.html`.
- Footer includes the required TEAM NEXUS credit and lower attribution lines.

### Risks / gaps requiring later batches
1. Supabase database state could not yet be inspected because the project was inactive when Batch 1 began and its database connection is still unavailable while the project is coming up.
2. The actual tables, columns, constraints, RLS policies, storage policies/buckets, RPCs, Edge Functions, Auth configuration and database advisors therefore remain unverified against the live project.
3. Client-side authorization checks must not be treated as the security boundary; live RLS and privileged function authorization still need verification.
4. `AdminModulePage.jsx` currently performs broad CRUD directly from the browser. Its security correctness depends on live RLS policies, which are not yet verified.
5. The generic admin module does not currently cover every required institutional entity. Batch 2 must reconcile the required archive model against the live schema and complete missing management surfaces.
6. Public archive queries contain hard-coded category UUIDs in `ArchivePage.jsx`; these must be reconciled with live category records and ideally replaced with stable data-driven lookup where appropriate.
7. Public archive visibility/status rules are implemented in frontend queries but must be verified/enforced server-side by RLS.
8. Document download/open logging and download-specific authorization still need live verification.
9. Package versions are not fully pinned because `package.json` uses caret ranges; dependency/lockfile state needs review before release.
10. Automated browser QA (Playwright) has not been run as part of this Batch 1 audit.

## Supabase blocker
At audit start, the NAMS Supabase project reported status `INACTIVE`. A restore was requested through the connected Supabase integration and succeeded; the project moved to `COMING_UP`. Subsequent database inspection attempts returned connection refused/time-out errors. No schema mutation was performed.

The live Supabase audit must resume once the project database is reachable.

## Verification performed
- GitHub repository metadata inspected successfully.
- Latest commit history inspected successfully.
- Key frontend/auth/admin/document/handover/settings/activity files inspected.
- Repository search confirmed no existing `MASTER-HANDOFF` file.
- Supabase project metadata inspected.
- Supabase restore action succeeded.
- Supabase database inspection was attempted but remains blocked by database availability.
- No production code/database schema changes were made during this audit.

## User action required
No code action is required from the user yet.

If the Supabase project remains stuck in `COMING_UP` or continues refusing connections, the user should open the NAMS Supabase project dashboard and confirm the project/database is online. After it is online, continue Batch 1 so the live schema/RLS/storage/Auth audit can be completed.

## Next steps
1. Re-check Supabase availability.
2. Inspect all public tables, columns, foreign keys, indexes, constraints and migrations.
3. Inspect RLS enablement and policies for every exposed table.
4. Inspect Storage buckets and object policies.
5. Inspect Edge Functions, especially `admin-account-management`.
6. Inspect relevant RPC/functions and grants.
7. Run Supabase security and performance advisors.
8. Reconcile live schema against frontend assumptions and required institutional archive entities.
9. Produce the authoritative Batch 1 gap matrix.
10. Move to Batch 2 only after the live-state audit is complete.

## Required archive model
The intended model includes profiles, documents, archive categories, levels, courses, sessions, semesters, projects, events, event media/media, administrations, executives, meetings, meeting documents, event documents, alumni, membership records, announcements, activity logs, download logs, handover records and site settings, plus any supporting relational tables required by the implementation.

## Security requirements
- Public browsing without general/member login in V1.
- Administrator access only through Supabase Auth plus database-enforced authorization.
- Roles: `super_admin`, `admin`; future student/member access reserved.
- No service-role/secret key in the browser.
- Private Storage for archive files.
- Short-lived signed URLs for controlled file access.
- RLS must enforce public/student/admin visibility and administrator authorization server-side.
- Prevent IDOR/BOLA, privilege escalation, unsafe storage access, XSS/injection, secret exposure and unauthorized metadata changes.
- Activity/download logs must be protected from tampering by unprivileged clients.

## Design/product requirements
- Professional, institutional, premium visual system.
- NAMS green/lime palette with restrained microbiology/science-inspired 3D motion.
- Mobile-first, responsive and accessible.
- Avoid generic/vibe-coded styling, excessive glassmorphism/neon, cartoonish visuals and unnecessary animation.
- Footer begins with "Brought to you by TEAM NEXUS".

## Handoff rule
Update this file after every meaningful implementation/audit batch with:
- changes made
- affected files
- verification performed
- blockers
- required user actions
- next steps
- resulting commit/state
