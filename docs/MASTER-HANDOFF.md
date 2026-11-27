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


## Batch 1 live Supabase audit — 2026-10-06
Supabase is now ACTIVE_HEALTHY; the database is reachable and the live audit was completed.

### Live schema verified
- Public archive schema is present and RLS is enabled on the exposed public tables.
- Core entities verified include profiles, archive categories, levels, courses, sessions, semesters, documents, projects, administrations, executives, meetings, meeting/event document relationships, events, media, alumni, membership records, announcements, activity logs, download logs, handover records, site settings and website files.
- Storage buckets are private. Verified buckets include archive-documents (50 MB), avatars, event-media, executive-photos, gallery, project-files and website-files.
- Storage object policies currently restrict the listed archive buckets to active admin/super-admin roles through the database role helper.
- Database migrations are present through 20260907235329_finalize_nams_storage_and_security.

### Live security findings
1. HIGH PRIORITY: public.current_role() is a SECURITY DEFINER function in the exposed public schema and is executable by anonymous/authenticated roles. It reads active profile roles and is used by RLS policies. Its privilege surface should be reduced; it should not be an unrestricted public RPC.
2. HIGH PRIORITY: public.handle_new_user() is also SECURITY DEFINER and executable by anonymous/authenticated roles. It is a trigger helper and should not be exposed as a callable public RPC.
3. Supabase security advisor reports pg_trgm installed in the public schema. Move the extension to a non-exposed schema where compatible.
4. Supabase Auth leaked-password protection is disabled and should be enabled before production.
5. Several tables have multiple permissive SELECT policies because admin-management policies use broad ALL plus separate public-read policies. This is flagged by the advisor and should be simplified to explicit command-specific policies so the authorization model is easier to audit.
6. Storage buckets remain private, matching the product requirement.
7. The admin-account-management Edge Function is ACTIVE and JWT verification is enabled. Its server-side caller check validates the bearer token with Supabase Auth, requires an active admin/super-admin profile, restricts super-admin creation/assignment to super-admin callers, and globally signs out an admin when deactivated.
8. Public URL Edge Functions get-public-file-url and get-public-media-url have JWT verification disabled and require a dedicated security review of their function-body authorization before release.

### Live performance findings
- Supabase performance advisor reports 26 unindexed foreign keys across the archive schema.
- RLS policies on documents/projects/alumni/download_logs use auth calls in a way that can trigger per-row re-evaluation; these should be changed to the (select auth.uid()) pattern where applicable.
- Additional advisor findings include unused-index notices that should be reviewed after the archive has representative data; do not remove indexes blindly.
- The schema should receive targeted FK/index hardening in Batch 8 rather than ad-hoc indexing.

### Batch 1 gap matrix
| Area | State | Action |
|---|---|---|
| Supabase availability | Healthy | Complete |
| Core archive schema | Present | Reconcile with admin UI in Batch 2 |
| RLS enabled | Yes on public tables | Simplify/audit policies in Batch 7 |
| Storage buckets | Private | Keep; verify each bucket lifecycle in Batch 3 |
| Storage object authorization | Admin-gated | Test signed/public access paths in Batch 3/7 |
| Admin account Edge Function | JWT + role checks | Keep; harden CORS and audit edge cases |
| Public URL Edge Functions | JWT disabled | Inspect and harden before release |
| Security advisor | Findings present | Remediate in Batch 7 |
| Performance advisor | 26 FK index findings + RLS initplan findings | Remediate in Batch 8 |
| Admin CMS coverage | Incomplete | Batch 2 |
| Browser QA | Not yet run | Batch 9 |

## Batch 1 verification
- Supabase project status verified as ACTIVE_HEALTHY.
- Live table/column/foreign-key/RLS state inspected.
- Live PostgreSQL policies inspected.
- Storage buckets and storage.objects policies inspected.
- Database SECURITY DEFINER functions inspected.
- admin-account-management Edge Function inspected; JWT verification confirmed enabled.
- Supabase security and performance advisors executed.
- No production schema mutation was performed during this audit.

## Batch 1 blockers / user action
- No immediate user action is required to continue.
- Production release is blocked until the identified security findings are remediated and verified.
- Before enabling any public/member login in future versions, authorization claims and RLS must be re-audited.

## Resulting state
- Batch 1 live audit: COMPLETE.
- Next batch: Batch 2 — Finish Admin CMS.
- The next implementation should first reconcile the live schema with the existing admin modules and close missing management surfaces without introducing unnecessary migrations.


## Batch 2 — Admin CMS completion — 2026-10-06
### Changes made
- Expanded the generic admin CMS with management for archive categories, academic levels, courses, academic sessions, semesters and website files.
- Added these modules to the administrator dashboard under a dedicated Archive structure group.
- Added website-file upload support using the existing private `website-files` bucket with a 50 MB client-side limit and restricted MIME allowlist.
- Preserved the existing activity-log mechanism and administrator-authenticated writes.
- Added live-schema-aware ordering because levels, sessions and semesters do not all expose `created_at`.
- Prevented an archive category from selecting itself as its parent in the edit form.
- No database migration was required.

### Affected files
- `src/pages/admin/AdminModulePage.jsx`
- `src/pages/admin/AdminDashboard.jsx`
- `docs/MASTER-HANDOFF.md`

### Live data reconciliation
- `archive_categories`: 17 records
- `levels`: 5 records
- `courses`: 0 records
- `sessions`: 0 records
- `semesters`: 2 records
- `website_files`: 0 records

The empty courses/sessions/website-files tables are expected to be populated by future administrators; the new CMS surfaces are now available for that handover workflow.

### Verification
- Re-read the modified GitHub files after each sequential update.
- Reconciled the new module fields against live PostgreSQL column definitions.
- Verified the target tables exist and queried live record counts.
- Confirmed no schema mutation was needed.
- Playwright/browser execution is not available through the connected toolset, so responsive/browser regression testing remains pending for the dedicated QA batch.

### Remaining Batch 2 work / gaps
- Specialized executive management still does not expose appointment letters, portfolios or attendance as first-class admin relationships; these can be represented through documents today but should receive a more deliberate CMS workflow.
- Meeting management does not yet provide attendance/notice/agenda/minutes/resolution editing as a single workflow; relationship managers exist for meeting documents.
- Constitution/policy taxonomy is now manageable through categories/documents, but dedicated editorial presets may improve future-admin usability.
- These are product/CMS workflow gaps, not missing database primitives.

### User action
No immediate user action is required. Future administrators will need to populate courses and academic sessions before academic classification can be fully useful.

### Resulting state
Batch 2 core CMS structure: **implemented**.
Next: **Batch 3 — Document + Media Lifecycle**.


## Batch 3 — Document + Media Lifecycle — 2026-10-06
### Changes made
- Audited the complete private-storage delivery path for archive documents and public media.
- Hardened get-public-file-url to accept only the archive-documents bucket, verify the document is published/public and that the requested path exactly matches the database record, and create a short-lived signed URL.
- Added server-side download logging for public document URL issuance through download_logs.
- Hardened get-public-media-url so record types map to their intended buckets: media images to gallery, media videos to event-media, executives to executive-photos, and event cover images to event-media.
- Preserved publication/visibility checks and exact path matching for public media.
- Kept all relevant buckets private; public access remains controlled through short-lived signed URLs.

### Affected files / services
- Supabase Edge Function: get-public-file-url version 2
- Supabase Edge Function: get-public-media-url version 2
- src/pages/ArchivePage.jsx remains the public consumer of the document delivery contract.
- docs/MASTER-HANDOFF.md

### Verification
- Inspected live Storage bucket inventory and storage.objects authorization policies.
- Inspected both public URL Edge Functions before modification.
- Deployed version 2 of both Edge Functions; deployment responses reported ACTIVE.
- Confirmed download_logs exists and currently contains 0 rows; no production document download has yet exercised the new logging path.
- Confirmed no storage buckets were made public and no schema migration was required.
- Browser/Playwright end-to-end execution remains unavailable through connected tools and is therefore pending Batch 9.

### Security notes
- The functions intentionally retain JWT verification disabled because they serve public archive content without requiring user login; authorization is implemented inside the function body using server-side database lookups and exact record/path checks.
- CORS remains permissive (*) because the endpoints are public-content delivery endpoints. No secrets are exposed to the browser.
- The service-role key is server-side only in the Edge Functions.
- Upload MIME/type and size checks still occur in the admin client and should receive deeper server-side/content validation in Batch 7 if the storage policy architecture permits it.

### User action
No immediate user action is required.

### Resulting state
Batch 3 lifecycle hardening: COMPLETE for public delivery and download logging.
Next: Batch 4 — Public Archive Completion.


## Batch 4 — Public Archive Completion — 2026-10-06
### Changes made
- Reconciled the public archive taxonomy with the live archive_categories table instead of relying on hard-coded category UUIDs for academic and past-question browsing.
- Added data-driven category-slug filtering for Constitution/Policies, Academic Resources, Past Questions, Annual Reports, Financial Records and Handover Notes.
- Added public Alumni Directory browsing using the existing public alumni table and visibility field.
- Added public routes for /reports, /financial-records, /handover-notes and /alumni.
- Made administration listing records open their executive-council detail route (/executives/:administrationId) so the administration/session -> executive list relationship is navigable.
- Corrected the homepage current-administration query to use the live session_id relationship and sessions(name) rather than the stale non-existent administrations.session field.

### Affected files
- src/App.jsx
- src/pages/ArchivePage.jsx
- src/pages/HomePage.jsx
- docs/MASTER-HANDOFF.md

### Live archive reconciliation
- archive_categories contains 17 public categories including Constitution, Academic Resources, Policies, Executive Council, Past Questions, Minutes, Project Library, Events, Reports, Financial Records, Media Gallery, Alumni, Handover Notes, Membership Records, Downloads and Website Files.
- At the time of this batch, the core public content tables are empty: documents 0, projects 0, events 0, media 0, meetings 0, administrations 0, executives 0, announcements 0. The UI therefore correctly renders empty-state messaging rather than fabricated records.

### Verification
- Re-read all modified GitHub files after each update.
- Reconciled category slugs against live PostgreSQL category records.
- Reconciled homepage administration/session query against live table columns and foreign keys.
- Confirmed no database migration was required.
- Browser/Playwright execution is unavailable through the connected toolset; responsive and end-to-end browser verification remains pending Batch 9.

### Remaining public-archive gaps
- Search still depends on the existing search_public_documents RPC and does not yet include alumni/media/announcements as searchable resource types.
- /downloads?category=... does not currently apply a query-string category filter; dedicated category routes now exist for reports/financial/handover records.
- Public meeting detail currently exposes attached published documents but does not yet present document-type labels/order in the UI.
- Media display currently renders images through the public media function; video playback/download presentation needs a dedicated UX pass.
- Public alumni/session filtering and richer executive profile/appointment/portfolio presentation remain candidates for later product polish.
- RLS/security findings from Batch 1 remain scheduled for Batch 7; no broad security-policy rewrite was introduced in Batch 4.

### User action
No immediate user action is required. Administrators will need to populate sessions/courses and publish archive records before these public sections contain live content.

### Resulting state
Batch 4 public archive completion: COMPLETE for core taxonomy/routes.
Next: Batch 5 — Homepage + Brand Completion.


## Batch 5 — Homepage + Brand Completion — 2026-10-06
### Changes made
- Kept the existing NAMS visual system and restrained microbiology motion; no new animation dependency or 3D rewrite was introduced.
- Made the homepage consume the live `site_identity` setting for the institution name/title and tagline, with safe fallbacks.
- Expanded the homepage repository overview from six to eight archive areas so Alumni/Community and Downloads/Website Files are represented alongside the existing core areas.
- Added a clear repository-level CTA and a continuity statement reinforcing the archive's multi-administration purpose.
- Improved the search shortcut label to communicate both Mac and Windows/Linux conventions.
- Preserved the required TEAM NEXUS footer hierarchy and existing official logo asset path.

### Affected files
- `src/pages/HomePage.jsx`
- `src/homepage-polish.css` (new)
- `src/main.jsx`
- `docs/MASTER-HANDOFF.md`

### Verification
- Re-read the current homepage, app shell, brand layer, route styles, and package manifest from GitHub before editing.
- Confirmed the official logo asset exists at `Public/MCB Class 29 official group 20260904_180458.jpg`.
- Confirmed the existing brand layer already provides restrained scientific motion, responsive scaling and `prefers-reduced-motion` handling.
- Confirmed Supabase project status is `ACTIVE_HEALTHY`.
- No database schema or storage changes were required.
- Browser/Playwright execution is still unavailable in the connected toolset; visual/responsive browser verification remains pending Batch 9.

### Blockers / risks
- The homepage can only display real administration/news content after administrators populate and publish the corresponding records; the current empty-state behavior is intentional.
- The repository currently has a Three.js dependency, but the homepage's existing scientific visual is CSS-based. Batch 5 deliberately avoids introducing an unnecessary runtime 3D scene.

### User action
No immediate user action is required.

### Resulting state
Batch 5 homepage/brand completion: IMPLEMENTED.
Next: Batch 6 — Admin UX + Accessibility.


### Batch 5 follow-up — public footer settings
- Wired the existing `site_settings.footer_credits` record into the global public footer.
- Preserved the required TEAM NEXUS heading and the existing attribution text as fallbacks, so an unset/partial configuration cannot blank the credits.
- No schema change was required.

### Additional affected file
- `src/App.jsx`

### Verification
- Re-read `AdminSettings.jsx` to confirm `footer_credits` is an existing managed setting.
- Re-read the updated `src/App.jsx` from GitHub after the change.
- No browser automation is available; runtime rendering remains pending Batch 9.


## Batch 6 — Admin UX + Accessibility — 2026-10-06
### Changes made
- Added an explicit accessible title to the admin login page.
- Marked the dashboard module search area as a search landmark and corrected its keyboard shortcut label to support Mac and Windows/Linux.
- Added modal dialog semantics to the generic admin CRUD form.
- Added Escape-to-close behavior and a keyboard focus trap for CRUD modals, preventing Tab navigation from escaping into the page behind the dialog.
- Added initial modal focus handling and stronger visible focus states for admin controls.
- Increased action-button and form-control touch targets for mobile usability.
- Added mobile table overflow handling and a single-column module layout for narrow screens.
- Kept the existing admin architecture, Supabase flows and storage rules unchanged.

### Affected files
- `src/pages/admin/AdminLogin.jsx`
- `src/pages/admin/AdminDashboard.jsx`
- `src/pages/admin/AdminModulePage.jsx`
- `src/admin.css`
- `docs/MASTER-HANDOFF.md`

### Verification
- Corrected initial CRUD focus so the first configured text/select/date/etc. control receives focus regardless of module field naming.
- Re-read all principal admin surfaces and current admin CSS from GitHub before editing.
- Confirmed there is no GitHub Actions workflow currently present in `.github/workflows`.
- No schema, auth policy, storage, or dependency changes were made.
- Browser/Playwright is unavailable in the current connected toolset, so keyboard/focus/responsive behavior cannot yet be runtime-verified.


## Batch 7 — Security Hardening — 2026-10-06
### Changes made
- Re-audited the live Supabase security posture before changing anything.
- Revoked EXECUTE for anonymous/public and authenticated callers on the internal public.current_role() and public.handle_new_user() helper functions. These remain available to the database/security-definer/trigger execution paths that require them, but are no longer exposed as callable public RPC functions.
- Moved the pg_trgm extension from the exposed public schema into the non-exposed extensions schema.
- Updated RLS policies for alumni, projects, download logs and documents to use the Supabase (select auth.uid()) initialization-plan pattern where applicable.
- Added the corresponding reproducible migration at supabase/migrations/20261006150000_batch7_security_hardening.sql.
- Re-ran the Supabase security advisor after the changes.

### Affected files / services
- supabase/migrations/20261006150000_batch7_security_hardening.sql
- Live Supabase PostgreSQL/RLS configuration for the NAMS project.

### Verification
- Before remediation, live inspection confirmed both helper functions were SECURITY DEFINER and had EXECUTE granted to PUBLIC, anon and authenticated.
- After remediation, the functions no longer appear as security-advisor findings and the pg_trgm extension reports schema extensions.
- Security advisor now reports only one remaining warning: auth_leaked_password_protection (Supabase Auth leaked-password protection is disabled).
- The performance advisor no longer reports the previous auth_rls_initplan finding for documents/alumni/projects/download logs.
- The performance advisor still reports 26 unindexed foreign keys and unused-index notices; those are intentionally deferred to Batch 8 rather than mixed into this security batch.
- Browser/Playwright remains unavailable, so browser-level authorization and upload regression testing remains pending Batch 9.

### Remaining security issue / required user action
**User action is required before production release:** enable Supabase Auth leaked-password protection in the NAMS project's Authentication/password-security settings. This is a dashboard-level Auth configuration and is not safely changed by the database SQL interface used here.
Exact next step: open the NAMS Supabase project → Authentication → Password Security → enable Leaked Password Protection, then confirm the setting is enabled.

### Security scope intentionally deferred
- Multiple permissive SELECT-policy advisor notices remain because the existing policy architecture combines public-read policies with broad admin ALL policies. No blanket policy rewrite was performed in this batch because changing policy roles/commands without browser/auth regression tests risks altering legitimate public/admin behavior. This should be addressed as part of the final RLS review/release gate.
- Server-side content/MIME validation for uploaded files still needs a dedicated implementation review.
- Public get-public-file-url / get-public-media-url functions intentionally keep JWT verification disabled for public archive delivery; their body-level record/path authorization was previously hardened in Batch 3 and remains subject to end-to-end testing in Batch 9.

### Resulting state
Batch 7 targeted security hardening: IMPLEMENTED and verified against live Supabase.
Production release remains blocked until leaked-password protection is enabled and remaining RLS/upload/browser checks are completed.

### Next steps
1. User enables leaked-password protection in Supabase Auth.
2. Batch 8 — Database Performance + Integrity.
3. Batch 9 — Automated + Manual QA, including browser authorization/upload tests when a browser tool is available.
4. Final RLS simplification/release gate after QA evidence.


## Batch 8 — Database Performance + Integrity — 2026-10-06
### Changes made
- Audited the live PostgreSQL foreign keys, indexes, table statistics and index scan counters before changing the schema.
- Added targeted covering indexes for previously unindexed foreign keys across activity logs, administrations, alumni, announcements, archive categories, courses, documents, downloads, event/meeting documents, events, handovers, media, meetings, membership records, projects, site settings and website files.
- Added a standalone projects(level_id) index after the Supabase advisor identified that the existing (session_id, level_id) composite index did not satisfy standalone foreign-key coverage.
- Refreshed planner statistics with ANALYZE on the principal archive tables.
- Added the reproducible migration supabase/migrations/20261006160000_batch8_performance_integrity.sql.
- Deliberately did not remove unused indexes: all core content tables currently have zero rows and index scan counters therefore do not represent production workload.
- Deliberately did not add speculative CHECK/UNIQUE constraints to historical/editorial fields without first defining the intended archive rules.

### Affected files / services
- supabase/migrations/20261006160000_batch8_performance_integrity.sql
- Live Supabase PostgreSQL indexes/statistics for the NAMS project.

### Verification
- Initial performance advisor reported 26 unindexed foreign keys.
- After the index pass and final projects(level_id) index, the unindexed-foreign-key advisor finding is cleared.
- The advisor now reports unused-index notices plus the existing multiple-permissive-RLS-policy warning; unused indexes are expected while the archive has no representative data.
- Live table statistics confirmed core archive tables are still at zero rows.
- Planner statistics were refreshed with ANALYZE.
- Browser/Playwright remains unavailable; database-level performance work was verified through live PostgreSQL/advisor inspection.

### Remaining issues
- The performance advisor still reports 67 unused indexes. These should not be dropped yet because the archive is empty/pre-production; revisit after representative data and real browsing/admin traffic exist.
- Multiple permissive RLS policies remain and should be consolidated during the final RLS/security release review, with browser authorization regression tests.
- Auth leaked-password protection from Batch 7 still requires dashboard configuration by the user.
- More domain-specific integrity constraints may be appropriate after editorial workflows are populated and tested.

### User action
No new action is required for Batch 8.
Previously requested action remains: enable Supabase Auth -> Password Security -> Leaked Password Protection.

### Resulting state
Batch 8 database performance hardening: IMPLEMENTED and live-verified.
The original 26 unindexed foreign-key findings are cleared. No existing indexes were deleted.

### Next steps
1. Batch 9 — Automated + Manual QA.
2. During QA, exercise real archive queries and admin workflows, then reassess index usage.
3. Perform final RLS policy consolidation only after authorization behavior is covered by runtime tests.
4. Continue toward Batch 10 — Production/Netlify Readiness.


## Batch 9 — Automated + Manual QA — 2026-10-06
### QA scope
- Re-read the current master handoff and repository entry points before testing.
- Audited the production route map in src/App.jsx, package scripts/dependencies, main stylesheet imports, and admin page surface.
- Confirmed the repository currently has no configured test/lint script and no GitHub Actions workflow.
- Confirmed no Playwright/browser/preview runner is available in the connected toolset, so true browser rendering, responsive screenshots, keyboard traversal and upload UI execution could not be performed.

### Concrete regression found and fixed
- Batch 7 had revoked EXECUTE on public.current_role() while RLS policies still called that function directly.
- Live impersonation as anon reproduced permission denied for function current_role during a public archive query. This was a real authorization/read regression.
- Fixed by adding extensions.current_role() as a SECURITY DEFINER wrapper that is executable by anon/authenticated but is not exposed in the public schema, and updating all affected RLS policies to call the wrapper.
- Kept public.current_role() non-executable by API roles, preserving the original security objective.
- Updated the reproducible Batch 7 migration with the wrapper and policy rewrite so the fix is represented in source control.

### Live authorization verification
- Anonymous public read regression test now succeeds: 17 public archive categories are readable and the public-facing core content tables return only their currently allowed rows (all core content tables are presently empty).
- Anonymous write protection was tested against site_settings; the transaction was rejected by RLS with new row violates row-level security policy.
- This validates the critical public-read/admin-write boundary at the database layer after the helper-function fix.
- Supabase security advisor still reports leaked-password protection as the only security warning plus the expected multiple-permissive-policy findings; no new helper-function exposure finding was introduced.
- Supabase performance advisor remains at the expected unused-index notices; Batch 8's unindexed-FK finding remains cleared.

### Static application QA
- package.json contains vite build as the production build command, but there is no test/lint command.
- src/App.jsx route handling covers the declared public routes plus dynamic academic, past-question, event, meeting, executive and news paths; /search intentionally falls through to SearchPage.
- Main entry imports the expected global/feature CSS files.
- Admin directory contains the expected login/dashboard/module/document/handover/settings/activity/admin-management surfaces.
- No verified browser runtime build was claimed because the repository cannot be executed through the current connected toolset.

### Remaining QA blockers
- Browser QA is still required: public navigation, every archive detail route, admin login/session expiry, CRUD create/edit/delete, modal keyboard behavior, file uploads/replacements/deletions, signed downloads/media, mobile breakpoints, accessibility tree, loading/error/empty/success states.
- A local/CI npm run build should be executed before production release when a runnable environment is available.
- Automated tests/CI should be added or configured before release if the project is expected to have ongoing multi-administration maintenance.
- Auth leaked-password protection remains a user dashboard action from Batch 7.
- Final RLS policy consolidation remains pending; the current architecture is intentionally left behaviorally stable until browser authorization tests are available.

### Resulting state
Batch 9 database/static QA: PARTIALLY COMPLETE — critical regression found and fixed; browser/runtime QA remains blocked by tooling.
No unverified claim of browser test success was made.

### Next steps
1. User enables leaked-password protection.
2. Obtain/run a browser-capable QA environment and execute the remaining UI matrix.
3. Batch 10 — Production/Netlify Readiness, including build/deploy configuration and environment-variable review.
4. Revisit final RLS policy consolidation after browser authorization evidence.


## GitHub Pages deployment preparation — 2026-10-06

### Changes made
- Added `vite.config.js` with React plugin and `base: '/NAMS-FUTA/'` for project Pages hosting.
- Added `.github/workflows/deploy.yml` to build and publish `dist` through GitHub Pages on pushes to `main` and manual workflow dispatch.
- Updated `src/App.jsx` to normalize the GitHub Pages repository subpath and preserve the existing custom client-side routing/navigation model.
- Updated the brand logo asset path to use the Vite base URL.
- Updated `index.html` to keep the standard Vite source entry portable.
- The workflow uses `npm install` because the repository currently has no `package-lock.json`; `npm ci` would fail without a lockfile.

### Affected files
- `vite.config.js`
- `.github/workflows/deploy.yml`
- `src/App.jsx`
- `index.html`

### Verification
- GitHub repository state inspected before changes.
- Confirmed `package.json` exposes `npm run build` and the React/Vite dependencies required by the workflow.
- Confirmed no `vite.config.*` existed before this deployment setup.
- Confirmed no existing GitHub Actions workflow existed before this setup.
- Confirmed deployment workflow syntax/content and repository paths after writing.
- Browser/runtime verification and actual GitHub Pages build are still pending; this environment has no browser/Playwright runner and no repository lockfile.

### User action required
1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open **Actions → Deploy NAMS FUTA to GitHub Pages** and wait for the workflow to finish.
5. Then open the deployed Pages URL and begin Batch 9 browser QA.

Expected Pages URL:
`https://darealnovaking.github.io/NAMS-FUTA/`

### Current blockers / risks
- No `package-lock.json`: deployment uses `npm install` rather than deterministic `npm ci`. A lockfile should be introduced before final production release.
- GitHub Pages browser QA is still pending.
- Supabase leaked-password protection still requires manual enablement.
- Public SPA routing and all deep links must be verified from the deployed site.

### Next steps
1. User enables GitHub Pages → GitHub Actions and waits for the deployment workflow.
2. User tests the deployed public/admin flows and reports any failures.
3. Continue Batch 9 with browser/runtime evidence and defect fixes.
4. Complete production-readiness work before final release.


## GitHub Pages deployment debugging — 2026-10-06

### Failure reproduced
- After the user switched Settings → Pages → Source to GitHub Actions, the existing deployment workflow was triggered by the latest push.
- Latest run #5 for commit a4bbfd11ff4a9b735d6129de284440fa829d9b1f completed with failure.
- GitHub Actions job inspection showed the build job failed specifically at Setup Node.js; dependency installation, Vite build, Pages artifact upload, and deployment were never reached.
- Repository is now public, confirmed by the workflow run metadata.

### Root cause and fix
- The workflow used actions/setup-node@v4 with cache: npm while the repository has no package-lock.json.
- Removed the npm cache requirement from .github/workflows/deploy.yml, keeping Node 20 and npm install.
- This is the smallest safe CI fix; deterministic lockfile adoption remains recommended before final production release.

### Affected file
- .github/workflows/deploy.yml

### Verification
- Inspected the actual failed GitHub Actions run and job steps through GitHub.
- Confirmed failure occurred before npm install and before npm run build.
- Updated workflow and committed as 3dd2861fc024279c5045c17cf7416b25ea607ccf.
- The new commit should trigger a fresh Pages workflow automatically.

### User action
- No code action required. Open Actions → Deploy NAMS FUTA to GitHub Pages and monitor the newest run.
- If the new run is green, open the Pages URL and begin browser QA.

### Current status
- GitHub Pages source: GitHub Actions.
- Deployment: not yet verified successful after the CI fix.
- Browser QA: still pending until a successful deployment is available.

## GitHub Pages build failure — AdminModulePage syntax fix — 2026-10-06

- Run #8 (`37493375055`) was inspected directly through GitHub Actions logs.
- CI infrastructure is healthy: checkout, Node 20 setup, dependency installation, and Vite startup all succeeded; `npm install` added 75 packages and reported 0 vulnerabilities.
- Build failed at `src/pages/admin/AdminModulePage.jsx:61:202` with esbuild `Expected ")" but found ";"`.
- Root cause: the `edit()` handler had an unmatched closing parenthesis around `setForm(Object.fromEntries(...))`.
- Fixed the handler by computing `nextForm` separately and then calling `setForm(nextForm)`.
- Affected file: `src/pages/admin/AdminModulePage.jsx`.
- Fix commit: `9d2326528ec3665050621d00f77daf057f43ceef`.
- Verification performed: exact CI failure reproduced from GitHub Actions logs and offending source line inspected; fix committed. A fresh Pages workflow should trigger from the fix commit.
- Current status: deployment still not verified successful; browser QA remains blocked until a green Pages deployment exists.
- User action: none yet; wait for the new workflow run and report whether it is green or red.


## GitHub Pages Run #10 — second AdminModulePage syntax fix — 2026-10-06

- Run #10 (`37493777636`) reached the Vite production build successfully; CI checkout, Node 20, and `npm install` all passed.
- Build failed at `src/pages/admin/AdminModulePage.jsx:74:44` with `Expected ";" but found ")"`.
- Root cause: the file-field loop used assignment-style destructuring (`for(const[name,,type,,bucket]=cfg.fields)`) instead of iterating with `of`.
- Fixed to `for(const[name,,type,,bucket] of cfg.fields)`.
- Affected file: `src/pages/admin/AdminModulePage.jsx`.
- Fix commit: `261835d3de851ce3e31ebf461f12c026c9919d7b`.
- Verification: inspected the exact CI error and source lines; corrected the offending syntax. Fresh Pages workflow should trigger automatically.
- Current status: deployment not yet verified successful; browser QA remains pending.


## Production debugging pass — 2026-10-09
### Confirmed deployment defects
- The Vite base was hard-coded to `/NAMS-FUTA/`, so Netlify/root deployments would generate incorrect asset URLs and app links.
- GitHub Pages had a `404.html` route-capture fallback, but `src/App.jsx` never consumed `sessionStorage.spa-route`; direct nested URLs therefore lost the requested route after fallback.
- The admin module selector read the raw browser pathname. Under GitHub Pages' `/NAMS-FUTA/` prefix, it parsed the wrong segment and could fail to open the requested admin module.
- GitHub Pages and Netlify require different base paths; the repository now defaults Vite to root deployment and sets `VITE_BASE_PATH=/NAMS-FUTA/` only in the GitHub Pages workflow.
### Changes made
- `vite.config.js`: configurable `base`, defaulting to `/`.
- `.github/workflows/deploy.yml`: explicit GitHub Pages base path at build time.
- `src/App.jsx`: deployment-aware URL generation and path normalization; consumes/restores saved GitHub Pages SPA routes and restores the canonical browser URL.
- `src/pages/AdminPage.jsx`: normalizes admin module routing against Vite's base path.
- `public/404.html`: handles unavailable session storage without stopping fallback.
### Verification status
- GitHub connection permissions were confirmed: repository `DarealNovaking/NAMS-FUTA`, branch `main`, push permission `true`.
- Changes were committed to `main`; GitHub Actions deployment/build status and live browser behavior still require checking after the workflow runs.
- No local npm build or browser automation was run in this tool session; do not treat the site as production-verified until CI and live route checks pass.
### Next checks
1. Inspect the latest GitHub Pages workflow run and build logs.
2. Verify GitHub Pages homepage and direct `/NAMS-FUTA/admin` / `/NAMS-FUTA/admin/login` loads.
3. For Netlify, use root base path and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in site environment variables.
4. Verify administrator login, role/profile lookup, public data queries and Edge Function calls with browser console/network logs.

## Admin password recovery troubleshooting — 2026-10-10

### User-reported problem and resolution so far
- The administrator could not sign in because the password was forgotten. The deployed admin login initially did not visibly offer a working password-reset flow.
- Added a **Forgot password?** flow using Supabase Auth `resetPasswordForEmail`, plus a dedicated `/admin/reset-password` page for setting and confirming a new password.
- Initially, the reset form reported that authentication was not configured. Inspection found that the GitHub Pages workflow built the app without the Vite environment variables needed by `src/lib/supabase.js`.
- Updated `.github/workflows/deploy.yml` to supply the Supabase project URL and publishable client key during the production build. This is a publishable browser key, not a service-role secret.
- The user then received the reset email, confirming the request reached the email delivery flow.
- The first email link opened `localhost:3000`. The code was updated to use the explicit production reset URL rather than deriving it from the current origin.
- The user updated Supabase Authentication → URL Configuration so the production redirect was accepted. The user reports that the email link then opened the production reset page.
- The reset page then reported **“Auth session missing”** when attempting to set the password.
- Updated `src/pages/admin/AdminLogin.jsx` to establish a recovery session before enabling password entry. It handles Supabase PKCE `?code=` links with `exchangeCodeForSession`, supports access/refresh tokens in the URL hash with `setSession`, checks `getSession()`, and only enables password submission after a valid session is available.
- The user has hit the password-reset email rate limit for today. No successful password change has yet been confirmed. Do not send further reset requests until the rate limit clears.

### Commits and deployment evidence
- `0c1bc9dbdf5bdd77b7a0242b0f5b8e1d8045b74d` — Configure Supabase client in GitHub Pages build.
- `de3f17e593f1e7e79e4ce8fe06c8c91fb7b568e9` — Force password recovery links to production site.
- `b0b4d646077147cd9dbca613b2b9414eda385a2e` — Establish Supabase recovery session before password update.
- Latest recovery-session deployment run: https://github.com/DarealNovaking/NAMS-FUTA/actions/runs/38007244447 — completed successfully (2026-10-10).
- Production admin URL: https://darealnovaking.github.io/NAMS-FUTA/admin
- Production reset URL: https://darealnovaking.github.io/NAMS-FUTA/admin/reset-password
- Repository: `DarealNovaking/NAMS-FUTA`, branch `main`.

### Supabase URL Configuration notes
- Recommended **Site URL**: `https://darealnovaking.github.io/NAMS-FUTA/` (the general archive homepage).
- Required **Redirect URL allowlist entry**: `https://darealnovaking.github.io/NAMS-FUTA/admin/reset-password`.
- The user temporarily set the Site URL to the reset route because using the homepage naturally opens the general archive. Keep the distinction clear: Site URL is the default destination; the reset route should be explicitly allowlisted and passed as the recovery redirect.
- Since the user reports the link now opens the production reset page, avoid changing Supabase settings again without evidence it is necessary.

### Next session checklist
1. Do not request a reset email immediately; the user has reached the reset-email rate limit. Wait until Supabase permits another request.
2. Confirm the latest deployment is still green if needed; do not create another deployment unless a new defect is found.
3. Once rate limit clears, open the production admin page and request exactly one fresh reset email.
4. Open the newest email link. Wait for the reset page to finish verifying the recovery session.
5. Enter a new password (minimum 8 characters) and confirmation; submit once.
6. Verify the success notice and test sign-in at the production admin URL.
7. If the session still fails, capture the exact on-page error and inspect the Supabase Auth email template/link type and redirect settings. Do not ask the user to share the reset URL, access token, refresh token, password, or other secrets.
8. After password change succeeds, resume Phase 3 remaining work from the existing batches and continue updating this handoff after each meaningful batch.

### Current status
- GitHub Pages Supabase client configuration: deployed.
- Production redirect hardcoding: deployed.
- Recovery session establishment before `updateUser`: deployed.
- Reset email delivery: user confirmed email received.
- End-to-end password change: **PENDING**, blocked by the user's temporary reset-email rate limit.
- Immediate user action: none tonight; resume when the rate limit clears.


## Phase 3 hardening continuation — 2026-10-10

### Live database checks completed
- Confirmed RLS is enabled on all 23 inspected public tables: profiles, archive_categories, levels, sessions, semesters, courses, documents, administrations, alumni, announcements, events, executives, handover_records, activity_logs, download_logs, event_documents, meeting_documents, media, meetings, membership_records, projects, site_settings and website_files.
- Confirmed the public data tables generally use server-side policies that gate writes through `extensions.current_role()` to `admin` or `super_admin`; public read policies are separate and visibility-aware on documents, projects, alumni, media and announcements.
- Confirmed `site_settings` currently exposes only SELECT for the approved public keys (`site_identity`, `footer_credits`, `contact`, `about_nams`, `national_body`) and no client-facing write policy was present in the inspected policy listing.
- Confirmed `activity_logs` has SELECT restricted to admin/super_admin and INSERT constrained to the caller's own user ID, with no UPDATE/DELETE policy listed. This is client-facing append-only behavior, not protection against database owners/service-role access.
- Storage policy review found the listed archive-related buckets (`archive-documents`, `project-files`, `gallery`, `executive-photos`, `event-media`, `avatars`, `website-files`) are governed by authenticated admin/super_admin policies for read, upload, update and delete. Storage object deletion is therefore still available to privileged admins; deleting a storage object can orphan a database record or break a historical reference if the application cleanup sequence fails.
- Core history tables include `sessions`, `administrations`, `handover_records`; documents have a first-class `archived` status. Current write policies for core history tables include broad admin manage policies, so hard-delete prevention is not yet confirmed.
- The live role enum remains `student`, `admin`, `super_admin`. The existing policies and current app authorization are built around admin/super_admin. The proposed separate Content Administrator / Records Supervisor / Technical Custodian roles are NOT implemented. Do not add role enum values until all policies, UI permissions and privileged Edge Functions are migrated together.
- The handover table supports draft/completed records and checklist JSON, but a complete role-restricted sign-off and outgoing-admin revocation workflow still needs end-to-end verification.

### Important limits / follow-up
- A database migration attempting to split broad management policies into insert/update-only policies was blocked before execution. No such policy change should be assumed applied.
- No data was intentionally deleted or overwritten in this audit.
- Storage bucket visibility/configuration and each delete/replace UI path still require targeted verification. Current storage policies show privileged access boundaries, but do not prove all buckets are private or that old-file cleanup is atomic.
- Automated browser QA has not yet been executed. Phase 3 is not yet ready to declare complete.

### QA and release gate
1. Verify admin login and recovery end-to-end after the Supabase reset-email rate limit clears.
2. Test that direct access and API writes to site identity settings fail for ordinary admin users.
3. Test public, student-authenticated and admin visibility for documents/projects/alumni/media.
4. Test document upload, replacement, archive, restore/publish transitions, signed URL access and failed-upload cleanup.
5. Confirm deleting a document/media item cannot silently destroy the only historical file; verify metadata/file consistency after each action.
6. Confirm old administration/session records remain visible after creating a new administration; verify handover completion, audit logging and account revocation.
7. Test storage access as anonymous, student, admin and super_admin; confirm intended bucket privacy and no cross-bucket access.
8. Test public archive search/detail, announcements scheduling, event/meeting document relationships, mobile header/logo and locked footer attribution.
9. Check GitHub Actions deployment result and inspect browser console/network errors before calling QA passed.

### Current Phase 3 status
- Website identity/footer protection, removal of settings from the normal admin navigation, site-settings write-policy removal, and client-policy audit-log append-only restrictions were implemented in earlier hardening batches.
- This continuation completed a live policy/RLS inventory and documented the remaining risks. It did not implement granular admin roles or hard-delete safeguards because the proposed policy migration was blocked and must not be represented as deployed.
- Phase 3 remains **IN PROGRESS** pending a safe, tested preservation migration, role/handover decisions, storage bucket verification and end-to-end QA.


## Full Phase 3 QA pass — 2026-10-10

### Scope and evidence
This pass combined repository source review, GitHub Actions deployment verification, read-only Supabase schema/data/policy checks, and Supabase security/performance advisor results. Direct HTTP/browser testing of the live GitHub Pages site could not be completed from this execution environment: DNS resolution for the live domain failed in the shell, and the web fetcher returned cache misses. Therefore, this is a substantial static/database QA pass, not a claim that real-user browser QA has passed.

### Deployment
- Latest documentation commit: `71216e7b272b886f099527b49e33be0253376b2e`.
- GitHub Actions run `38062669206` completed with conclusion `success`.
- Workflow builds with Vite base path `/NAMS-FUTA/` and configured Supabase URL/publishable client key. No service-role key was found in the inspected workflow/client configuration.
- `package.json` defines a build script but no test or lint script. The dependency versions use caret ranges. The repository root listing did not show a lockfile in the inspected portion; dependency reproducibility needs confirmation.

### Live database checks
- RLS enabled on all 23 inspected public tables.
- All seven Storage buckets are configured private: `archive-documents`, `avatars`, `event-media`, `executive-photos`, `gallery`, `project-files`, `website-files`. Bucket-level file-size and MIME restrictions are configured.
- Storage object policies allow authenticated `admin`/`super_admin` accounts to read, upload, update and delete objects in those buckets. This is a privileged capability; file deletion/replacement and database cleanup must be tested together.
- One active admin/super_admin profile exists in the database.
- No orphaned references were found in the tested checks for document category/session/level, administration session, executive administration, event-document document, or meeting-document document references.
- The `search_public_documents(search_query text, result_limit integer)` RPC exists and is SECURITY INVOKER, so caller RLS should remain in effect.
- The current database has 17 archive categories but **zero rows** in each of the following inspected tables: documents, sessions, administrations, executives, events, meetings, projects, announcements and handover_records. About/contact settings are present but their key content fields are blank. This means the live archive currently lacks institutional content; it is not a populated archive ready for acceptance.
- No data was modified as part of these checks.

### Findings — must address before release
1. **P0/P1 — Empty institutional archive.** Populate and verify approved seed/historical data (sessions, administrations, executive records, documents and other content) before content completeness can pass. Do not fabricate historical records.
2. **P1 — Destructive admin CRUD.** Generic admin modules expose Delete actions; broad admin manage policies permit hard deletes for several institutional tables. A failed migration attempt did not change this. Establish safe archive/soft-delete and hard-delete authorization, especially for sessions, administrations, handovers and linked records, before relying on long-term preservation.
3. **P1 — End-to-end QA not completed.** Browser-level navigation, responsive layout, form interactions, Auth flows, signed URLs, uploads, replacements and failure handling remain unverified because the live site could not be fetched from this environment. Manually run the QA checklist below from a browser.
4. **P1 — Password recovery still needs human end-to-end confirmation.** Previous handoff says the reset link reached the production page but the password change had not been confirmed; rate limit was reached. Do not declare administrator access fully recovered until a password change and fresh sign-in succeed.
5. **P1 — Admin role separation not implemented.** Only `student`, `admin`, `super_admin` are currently supported. Content Administrator / Records Supervisor / Technical Custodian remains a design requirement, not a deployed capability.
6. **P2 — Leaked password protection disabled.** Supabase security advisor reports `auth_leaked_password_protection` warning. Enable it in Supabase Auth password security settings.
7. **P2 — RLS performance lints.** Advisor flags repeated auth-function evaluation in `activity_logs` insert policy and multiple permissive policies on numerous tables. Optimize policies only after regression testing; do not blindly drop policies that intentionally combine public reads with admin writes.
8. **P2 — Storage cleanup risks.** Admin UI deletes database records and then removes file objects (or removes uploaded files after an error). This is not atomic; test failure scenarios and prioritize archival/soft-delete for historical files.
9. **P2 — No automated project test/lint scripts.** Add reproducible build/static checks and browser regression tests; pin dependencies with a lockfile if one is not already committed.

### Manual browser QA required
- Public home and logo load; header/footer links stay under the GitHub Pages base path.
- Open every public route directly in a fresh tab and reload: about, constitution, academics and level subroutes, past questions and course subroutes, projects/details, events/details, gallery, meetings/details, executives/administrations, library, downloads, news/details, reports, financial records, handover notes, alumni, contact, search.
- Verify missing/empty data shows friendly empty states and no console errors.
- Search terms, filters, query-string search and no-result behavior.
- Admin login, invalid credentials, inactive/non-admin profile rejection, refresh persistence, logout, direct protected URLs, and password recovery/reset/sign-in.
- Create/edit/publish/unpublish/archive/restore a test document; verify visibility with anonymous and authenticated users; verify signed URL expiry and file replacement cleanup. Use a clearly labeled disposable test record and remove it after testing only if safe.
- Test upload MIME/size boundaries and failed upload/save paths; ensure neither orphaned files nor records occur.
- Test all admin modules' create/edit/delete behaviors, especially sessions, administrations, handovers, event/meeting relations and media.
- Verify site identity settings cannot be changed through UI or direct API by an ordinary admin.
- Test anonymous/student/admin access against private Storage and private membership data.
- Check mobile widths, keyboard navigation, labels, focus, dialog dismissal, contrast, and 404/deep-link refresh behavior.
- Verify footer attribution remains locked and correct.

### Current QA result
- Repository/deployment checks: PASS for latest workflow run.
- Database structural/security spot checks: PARTIAL PASS (RLS enabled, private buckets and core references checked).
- Content readiness: FAIL (core archive tables empty; about/contact content fields blank).
- Preservation/hard-delete safety: FAIL / unresolved.
- Security advisor: WARN (leaked-password protection disabled; RLS performance warnings).
- Browser end-to-end QA: BLOCKED / NOT RUN in this environment.
- Overall: **NOT QA-READY**. Do not label Phase 3 complete until P1 findings are addressed and browser end-to-end checks pass.


## Phase 1 reconciliation — 2026-11-27

### Scope and safety
This checkpoint reconciles the existing handoff against the current `main` branch, live Supabase metadata/schema, current deployment workflow, and a read-only production browser smoke test. It is an inventory/reconciliation pass only.
- No application code was changed.
- No database schema, data, RLS policy, storage bucket/object, Edge Function, Auth setting, or deployment setting was changed.
- The only intended repository write in this batch is this handoff update.

### Current source-of-truth state
- Repository: `DarealNovaking/NAMS-FUTA`
- Branches: `main` only.
- Latest branch commit observed: `0a1757058809266cd924706d559852fc3078fcfc` — `Scope admin return link to repository base path` (2026-10-10 15:58:28 UTC).
- Supabase project: `NAMS`, ref `amswykapebeevhstmvii`, region `eu-west-1`, PostgreSQL 17.6.1.166.
- Supabase status: `ACTIVE_HEALTHY`.
- Supabase API URL returned by the project integration: `https://amswykapebeevhstmvii.supabase.co`.
- Frontend build workflow sets `VITE_SUPABASE_URL` to the same project URL. The deployed frontend target therefore matches the intended NAMS Supabase project at the source-configuration level.
- The frontend key in the workflow is a publishable/anon client key, not a service-role key. No service-role key is present in the inspected browser configuration.

### Migration history — critical repository/database divergence
Live Supabase reports these 12 applied migrations, in order:
1. `20260904231135_initial_nams_archive_schema`
2. `20260907234156_expand_nams_archive_for_handover`
3. `20260907234337_harden_public_archive_and_admin_security`
4. `20260907234350_add_nams_archive_metadata_and_search_v2`
5. `20260907234545_harden_public_archive_visibility_and_storage`
6. `20260907234553_harden_auth_profile_defaults`
7. `20260907234601_add_admin_account_state`
8. `20260907234627_tighten_public_schedule_and_archive_indexes`
9. `20260907235329_finalize_nams_storage_and_security`
10. `20261010140744_protect_site_identity_from_content_admins`
11. `20261010144503_make_activity_logs_append_only`
12. `20261104062436_preservation_and_taxonomy_write_access`

The current GitHub `supabase/migrations/` directory contains only:
- `20261006150000_batch7_security_hardening.sql`
- `20261006160000_batch8_performance_integrity.sql`

Neither of those two repository filenames appears in the live applied migration list. Therefore:
- The 12 production-applied migration records are not represented by the current migration files in GitHub.
- The two migration files currently in GitHub are not recorded as applied in the live migration list.
- The repository is not presently a reliable, reproducible migration history for the production database.
- Do not run `supabase db push`, apply either repository migration, reset the database, or create replacement migrations until every live migration has been reconciled with the actual schema/policies/functions and the intended deployment baseline.
- The next migration-reconciliation task must recover historical SQL where possible from Git history/backups, inspect the live catalog for the final definitions, identify whether the two Batch 7/8 files were superseded or never applied, and produce a verified baseline plus a documented migration plan. Never invent old migration SQL and present it as the original.

### Deployment configuration — authoritative target identified
The active repository workflow is `.github/workflows/deploy.yml`:
- Workflow name: `Deploy NAMS FUTA to GitHub Pages`.
- Trigger: push to `main` and manual dispatch.
- Build: Node 20, `npm install`, `npm run build`.
- Vite base path: `/NAMS-FUTA/`.
- Deploy target: GitHub Pages.
- Latest workflow run observed: run `52`, ID `38065763495`, commit `0a1757058809266cd924706d559852fc3078fcfc`, conclusion `success` (2026-10-10 15:58 UTC).
- A previous near-simultaneous run for an intermediate commit was cancelled as the later push superseded it; the final run for the current head succeeded.
- Production URL recorded in the handoff and used in the browser test: `https://darealnovaking.github.io/NAMS-FUTA/`.

Configuration drift:
- `README.md` still says Hosting: Netlify.
- `netlify.toml` and `vercel.json` remain in the repository as alternate/stale deployment configuration.
- GitHub Pages is the actual configured deployment target in the current workflow and latest successful run. README should be corrected and unused deployment configs should be retained or removed only after confirming the user's intended hosting choice; do not switch hosting based on stale documentation.
- The workflow currently uses `npm install`, package dependencies use caret ranges, and the repository tree contains no npm lockfile. Builds are therefore less reproducible than they should be. Add/commit a lockfile and move CI to `npm ci` in a separate controlled implementation task after verifying the intended package state.
- The workflow's Supabase URL matches the live project URL. The actual deployed bundle's runtime environment was not independently introspected, but the latest workflow built the current branch using the matching value.

### Production browser smoke test — PASS (limited scope)
A read-only browser run against the deployed site completed successfully:
- Homepage loads over HTTPS at `https://darealnovaking.github.io/NAMS-FUTA/`.
- Browser-visible page title: `NAMS FUTA Digital Archive`.
- Main heading: `Institutional memory, built to last.`.
- No blank page or visible runtime error in the tested views.
- Primary navigation and the footer's public navigation links were present.
- Direct navigation to `/NAMS-FUTA/search` rendered the search interface.
- Search route reload/deep-link fallback worked; no 404 was observed.
- Run result: completed, 5 browser steps, run ID `cc9dd780-cbfe-46dc-b53f-dce54f2557a8`.

This is a limited public smoke test only. It does not prove that every public route works, that search returns correct data, that authentication works, that admin CRUD is correct, or that uploads/signed URLs work. Admin/authenticated flows were deliberately not touched.

### Live schema and content baseline
- Live public schema contains 23 tables, and all 23 report RLS enabled.
- Direct SQL row counts (used as the reliable count check; the compact table-list response incorrectly showed zero estimates for populated tables):
  - `archive_categories`: 17
  - `levels`: 5
  - `semesters`: 2
  - `profiles`: 2
  - `site_settings`: 9
  - `sessions`, `courses`, `documents`, `projects`, `administrations`, `executives`, `announcements`, `events`, `media`, `alumni`, `membership_records`, `download_logs`, `activity_logs`, `website_files`, `meetings`, `meeting_documents`, `event_documents`, `handover_records`: 0 each.
- The public site can render its structure, but the substantive institutional archive is still unpopulated. Categories, levels and semester reference data exist; the actual sessions, courses, documents, administrations, executives, events, meetings and other institutional content do not yet exist in the live database.
- Do not fabricate NAMS historical records or academic resources to fill these tables.

### Frontend-to-schema reconciliation snapshot
Current public/admin source files were checked for direct table/RPC usage:
- `HomePage.jsx`: `site_settings`, `administrations`, `announcements`.
- `ArchivePage.jsx`: `site_settings`, `archive_categories`, `levels`, `courses`, `administrations`, `executives`, `media`, `event_documents`, `documents`, `meeting_documents`.
- `SearchPage.jsx`: RPC `search_public_documents`.
- `AdminModulePage.jsx`: `activity_logs`, `documents`, `administrations`, plus module-configured tables.
- `AdminDocuments.jsx`: `documents`, `archive_categories`, `levels`, `courses`, `sessions`, `semesters`, `activity_logs`.
- `AdminHandover.jsx`: `handover_records`, `administrations`, `activity_logs`.
The inspected table names exist in the live schema. This is a table-name-level compatibility check, not yet a complete column-by-column query contract test. Phase 1 still needs a systematic extraction of every module's selected/inserted/updated columns and comparison against live columns, constraints and enum values.

### Phase 1 status
- [x] Read the existing master handoff and preserve its history.
- [x] Verify current repository branch/head and key deployment files.
- [x] Verify live Supabase project status and API URL.
- [x] List all live applied migration records.
- [x] Enumerate current repository migration files and identify the mismatch.
- [x] Confirm the workflow deploys the current branch head successfully to GitHub Pages.
- [x] Confirm the workflow's Supabase URL matches the live NAMS project.
- [x] Run a read-only production homepage/search/deep-link smoke test.
- [x] Obtain direct SQL counts for all 23 public tables.
- [ ] Recover/reconcile the full production migration history and establish a reproducible schema baseline.
- [ ] Resolve deployment documentation/configuration drift (README says Netlify; workflow deploys GitHub Pages).
- [ ] Add reproducible dependency installation (lockfile + npm ci) after confirming package/dependency state.
- [ ] Complete column-level frontend query/write contract comparison across every admin module and public page.
- [ ] Reconcile all known Nov 27 findings from the broader audit with the current handoff, including media bucket routing and website-files MIME allowlist mismatches.

### Phase 1 blockers and next exact actions
1. **Migration baseline is the highest-priority blocker.** Recover historical migration SQL from Git history/backups where available. Compare all 12 live migration versions with the two repository files. Inspect the current live schema/catalog and document the final state without mutating production. Produce a baseline/recovery plan before any migration execution.
2. Complete the column-level frontend/schema compatibility matrix for all public pages and admin modules.
3. Correct the README's deployment description to GitHub Pages and decide whether Netlify/Vercel configs are intentionally supported or obsolete. Keep GitHub Pages as the current production target unless the user explicitly chooses otherwise.
4. Add package-lock and deterministic CI only after checking package compatibility and confirming that this change will not alter the production build unexpectedly.
5. Reconcile media upload/serving and website-files MIME mismatches already found in the Nov 27 audit; these belong to the integration-fix stage after Phase 1 establishes the baseline.

### Resulting state
- Phase 1: **IN PROGRESS — source/deployment/live-state inventory is substantially verified; migration history and full frontend/schema contract remain unresolved.**
- Production site: **operational for the limited homepage/search smoke test**.
- Production database: **ACTIVE_HEALTHY; schema exists, but institutional content tables are largely empty**.
- Production schema changes: **none made in this reconciliation**.
- Next work: **migration-history recovery and column-level contract reconciliation**, not new features and not production migrations.


## Phase 1 continuation — migration evidence and frontend/schema contract — 2026-11-27

### Migration-history investigation: clarified result
The initial finding is now more precise: the absence of Batch 7/8 versions from the Supabase migration ledger does **not** mean their SQL changes were never applied. The live catalog confirms their effects.

**Live migration ledger (12 entries):**
- `20260904231135_initial_nams_archive_schema`
- `20260907234156_expand_nams_archive_for_handover`
- `20260907234337_harden_public_archive_and_admin_security`
- `20260907234350_add_nams_archive_metadata_and_search_v2`
- `20260907234545_harden_public_archive_visibility_and_storage`
- `20260907234553_harden_auth_profile_defaults`
- `20260907234601_add_admin_account_state`
- `20260907234627_tighten_public_schedule_and_archive_indexes`
- `20260907235329_finalize_nams_storage_and_security`
- `20261010140744_protect_site_identity_from_content_admins`
- `20261010144503_make_activity_logs_append_only`
- `20261104062436_preservation_and_taxonomy_write_access`

**Repository migration history:**
- The current `supabase/migrations/` directory contains only Batch 7 and Batch 8 SQL.
- GitHub's path-specific commit history for `supabase/migrations/` contains four commits, all relating to those two batches and their refinements. No tracked SQL for the initial September schema/expansion/security/search migrations or the Oct 10 / Nov 4 ledger entries was found in the repository's migration history.
- The two tracked files are `20261006150000_batch7_security_hardening.sql` and `20261006160000_batch8_performance_integrity.sql`.
- Neither timestamp/name appears in the live migration ledger. Treat this as migration-ledger divergence. The exact reason (manual SQL execution, history repair/reset, or another workflow) is not established by the available evidence.

**Live catalog proves Batch 7 effects are present:**
- `pg_trgm` is installed in schema `extensions`, not `public`.
- `public.current_role()` and `public.handle_new_user()` have EXECUTE ACL only for `postgres` and `service_role` (not `PUBLIC`, `anon`, or `authenticated`).
- `extensions.current_role()` exists as SECURITY DEFINER and is executable by `anon` and `authenticated`, matching its intended use inside RLS policies.
- The policies use the extensions wrapper.
Therefore Batch 7's important live effects are present despite its missing migration-ledger entry.

**Live catalog proves Batch 8 effects are present:**
- All 26 indexes represented by the Batch 8 SQL and its follow-up project-level FK index commit exist in `public`, including `projects_level_id_idx`.
- The first Batch 8 file contains 25 index definitions; a later Git commit adds `projects_level_id_idx`, bringing the live total to 26.
Therefore Batch 8's index changes are also present despite the missing migration-ledger entry.

**What remains unrecoverable from GitHub at this point:**
- The original SQL for the first nine September migrations is not in the repository's migration directory or its path-specific history.
- SQL for the Oct 10 and Nov 4 live migrations is also not tracked in the repository.
- The Supabase migration ledger stores version/name metadata, not the original SQL text.
- A live schema/catalog baseline can be reconstructed from the database, but it must not be labelled as the original historical migration SQL.
- No production migration was applied and no migration ledger was edited during this investigation.

**Safe migration-recovery approach:**
1. Preserve the 12 live migration records as observed.
2. Preserve the two existing Batch 7/8 SQL files and their Git history; do not rename or delete them.
3. Recover the missing historical SQL only from an actual backup, export, developer machine, or other verifiable source if available.
4. If original SQL cannot be recovered, generate a fresh, clearly labelled baseline from the current live schema and document that it is a reconstruction, not the historical source.
5. Reconcile the baseline against live policies, functions, triggers, indexes, extensions, enums, grants, storage configuration and Edge Functions before allowing any migration command to target production.

### Frontend-to-live-schema contract review
The current public pages and admin modules were checked against the live 23-table schema and function signatures. No configured admin-module field was found that is absent from its corresponding live table. Key confirmations:
- `AdminModulePage.jsx` field configurations for archive categories, levels, courses, sessions, semesters, website files, projects, events, media, meetings, event documents, meeting documents, administrations, executives, announcements, alumni and membership records match the corresponding live column names.
- `projects.research_area`, `membership_records.full_name/matric_number/membership_number/email/phone`, `events.event_category`, `media.media_type`, and the archive/ownership columns used by the frontend all exist live.
- `AdminDocuments.jsx` document fields and its category/level/course/session/semester joins match the live schema.
- `AdminActivity.jsx`, `AdminHandover.jsx`, `AdminLogin.jsx`, and `AdminDashboard.jsx` use columns that exist in the live schema.
- `SearchPage.jsx` calls `search_public_documents(search_query, result_limit)`; the live function signature is `search_query text, result_limit integer` and its return columns match the document search UI. It only returns published public documents.
- The public archive pages use tables and columns that exist in the live schema.
This is a static contract comparison, not a successful authenticated CRUD test. No admin account was used and no records were inserted, updated or deleted.

### Newly confirmed frontend/RLS/storage integration blockers
These are now confirmed against both the deployed source and live database. Keep them as Phase 2 implementation work; do not silently patch production during this read-only phase.

1. **Generic admin delete conflicts with hard-delete protection (high priority).**
   - Live `prevent_hard_delete` triggers exist on 17 tables: administrations, alumni, announcements, archive_categories, courses, documents, events, executives, handover_records, levels, media, meetings, membership_records, projects, semesters, sessions and website_files.
   - The trigger rejects deletes unless the database role is privileged or the current profile role is `super_admin`.
   - `AdminModulePage.jsx` exposes a generic Delete action that issues a direct `.delete()` for every module. Ordinary `admin` users can therefore see a delete control that the database will reject for these 17 tables.
   - The generic module should use an explicit archive/soft-delete workflow for archiveable records, or hide/limit permanent deletion to the intended super-admin path. Do not remove the database protection just to make the UI button work.

2. **Document deletion can remove the stored file before the protected database delete fails (high priority).**
   - `AdminDocuments.jsx` first calls Storage `.remove()` for the document file, then issues `documents.delete()`.
   - The live `documents` table has the hard-delete trigger. For a non-super-admin admin, the database delete is rejected after the file has already been removed, leaving a live document row that points to a missing object.
   - Replace this flow with archive/soft-delete semantics and a deliberate file-retention/purge policy. Never delete the object before the row transition is confirmed.

3. **Media upload bucket and public media serving disagree (high priority).**
   - `AdminModulePage.jsx` uploads all `media` module files to `event-media`.
   - The active `get-public-media-url` Edge Function requires videos to use `event-media` and non-video media to use `gallery`.
   - Therefore newly uploaded image/flyer media stored in `event-media` cannot pass the public serving function's bucket validation. Event cover images are a separate supported `event` record path.
   - Decide one canonical storage rule and align upload, existing object migration (if any), and serving function together.

4. **Website file MIME allowlist mismatch (confirmed).**
   - The frontend accepts SVG, CSS, JavaScript, JSON, WOFF/WOFF2 fonts and ZIP in addition to PDF/images/text.
   - The live private `website-files` bucket permits only PDF, JPEG, PNG, WebP and plain text, with a 50 MB limit.
   - The frontend's broader types will be rejected by Storage. Align the UI allowlist with the intended bucket allowlist, or deliberately update bucket policy after security review.

5. **Public quick-access setting is stored but hidden by RLS.**
   - A `quick_access` row exists in `site_settings`.
   - `HomePage.jsx` requests `quick_access`, but the live public SELECT policy allows only `site_identity`, `footer_credits`, `contact`, `about_nams` and `national_body`.
   - Public clients cannot read the stored quick-access row and the homepage falls back to its hard-coded quick-access list.
   - Decide whether `quick_access` is intended to be public; if yes, add it to the narrowly scoped read policy in a tested migration.

6. **Site settings write policy is absent.**
   - The only live `site_settings` policy is the public SELECT policy described above. No INSERT or UPDATE policy exists.
   - `AdminSettings.jsx` contains an `upsert` implementation, which would be blocked by RLS if it were exposed.
   - Current `AdminPage.jsx` deliberately renders a protected-settings message for `/admin/settings` rather than mounting `AdminSettings.jsx`; the component is currently unreachable. Keep this distinction clear. If settings editing is later re-enabled, design a narrowly scoped role policy or secure server-side workflow first.

7. **Event archived status is not equivalent to the archive timestamp.**
   - The generic event editor offers status values `draft`, `published`, and `archived`, but it only writes the `status` field and does not set `archived_at`.
   - The live public event SELECT policy excludes rows with `archived_at` set and excludes `draft`/`unpublished` statuses, but does not exclude `status='archived'`.
   - Selecting the UI's Archived status alone can therefore leave the event publicly selectable. Align status handling and public policy in a tested change.

### Deployment documentation update
- Updated `README.md` Hosting from Netlify to GitHub Pages.
- Added the active production URL and current GitHub Actions deployment workflow/trigger/build/base-path details.
- Explicitly documented that `netlify.toml` and `vercel.json` remain as alternate-host configuration files and are not used by the active GitHub Pages workflow.
- README documentation commit: `4bbfb8936385615a237437af3b0b54f30d9d04a2`.
- This README commit triggered GitHub Actions run #54; it was still in progress at the time this checkpoint was written. Run #53 for the prior handoff-only commit completed successfully.

### Dependency reproducibility
- `package.json` uses caret version ranges.
- No package lockfile exists in the current repository tree.
- The current workflow uses `npm install`, not `npm ci`.
- A lockfile plus deterministic CI should be introduced after a controlled dependency resolution/build check. No dependency files were changed in this phase.

### Updated Phase 1 checklist
- [x] Read and reconcile existing handoff against the current live state.
- [x] Confirm the GitHub Pages production deployment and latest previously successful run.
- [x] Confirm deployed workflow's Supabase URL points to the live NAMS project.
- [x] Verify the current migration ledger and GitHub migration-path history.
- [x] Compare Batch 7 live security effects against its tracked SQL.
- [x] Compare Batch 8 live index effects against its tracked SQL and follow-up commit.
- [x] Complete static frontend table/column/RPC contract comparison.
- [x] Identify concrete RLS, hard-delete, storage bucket and MIME integration mismatches.
- [x] Correct README hosting documentation to GitHub Pages.
- [ ] Recover original SQL for the first nine September migrations and Oct 10 / Nov 4 migrations, or establish a clearly labelled reconstructed schema baseline from live catalog evidence.
- [ ] Complete reproducible dependency/build check and decide lockfile + `npm ci` implementation.
- [ ] Confirm GitHub Actions run #54 result after README update.
- [ ] Re-run production public smoke test after the README deployment run completes (documentation-only change; no frontend bundle behavior expected to change).
- [ ] Record a verified baseline and migration recovery plan before any database migration execution.

### Current Phase 1 status
**IN PROGRESS — static schema contract and current deployment configuration are now substantially reconciled. The primary unresolved item is the missing historical migration SQL / reproducible baseline.** The newly confirmed UI/RLS/storage issues are documented for Phase 2 implementation. No production database changes, data changes, storage changes, Edge Function deployments, or auth/policy changes were made in this continuation.


### Phase 1 addendum — quick-access data shape and deployment run status
A further source/data comparison found that the homepage quick-access configuration has a second mismatch beyond its RLS visibility:
- Stored `site_settings.quick_access.value` is an object shaped as `{ items: [{ path, label }, ...] }`.
- `HomePage.jsx` treats `settings.quick_access` as a bare array, then reads each item's `href` rather than `path`.
- Therefore simply adding `quick_access` to the public SELECT allowlist would still not activate the stored links. A future fix must align all three layers: public SELECT policy, stored JSON shape, and homepage parsing/path mapping. Until then, the existing hard-coded fallback is what users see.

Deployment:
- Run #53 (handoff checkpoint only): successful.
- Run #54 (README hosting correction): build, configure-pages and artifact preparation steps completed successfully; GitHub Actions cancelled the run when the newer handoff commit triggered run #55. The deploy job was cancelled, so #54 is not counted as a completed deployment.
- Run #55 (latest handoff commit `89c085c0c411e7046087df492e5f8952cd7d6955`): build job was in progress at the time of this addendum.
- No application code changed in either documentation commit. A successful run on the latest head remains the deployment verification gate.


## Critical correction — original SQL recovered from live migration ledger — 2026-11-27

The earlier Phase 1 note stating that the migration ledger contained only version/name metadata and that the original SQL was unrecoverable was incorrect. Direct inspection of `supabase_migrations.schema_migrations` showed that the table also stores a `statements text[]` column. All 12 recorded production migrations have one stored SQL statement each.

### Recovery completed
- Retrieved all 12 original migration statements directly from the live NAMS database's `supabase_migrations.schema_migrations.statements`.
- Each statement was archived under `docs/recovered-migrations/` using its exact original version and migration name.
- Re-fetched all 12 files from GitHub and compared each byte-for-byte (UTF-8 text) with the SQL statement returned by the live database. **All 12 exact-match checks passed.**
- Each stored migration has one statement. The ledger's `rollback` array is null for all 12 records.
- The recovered SQL archive is intentionally outside `supabase/migrations/`. It is a recovery archive, not yet the active CLI migration directory.
- No recovered SQL was executed. No production schema, data, policy, storage, Edge Function, Auth setting, or migration-ledger row was changed.

### Recovered files
- `docs/recovered-migrations/20260904231135_initial_nams_archive_schema.sql`
- `docs/recovered-migrations/20260907234156_expand_nams_archive_for_handover.sql`
- `docs/recovered-migrations/20260907234337_harden_public_archive_and_admin_security.sql`
- `docs/recovered-migrations/20260907234350_add_nams_archive_metadata_and_search_v2.sql`
- `docs/recovered-migrations/20260907234545_harden_public_archive_visibility_and_storage.sql`
- `docs/recovered-migrations/20260907234553_harden_auth_profile_defaults.sql`
- `docs/recovered-migrations/20260907234601_add_admin_account_state.sql`
- `docs/recovered-migrations/20260907234627_tighten_public_schedule_and_archive_indexes.sql`
- `docs/recovered-migrations/20260907235329_finalize_nams_storage_and_security.sql`
- `docs/recovered-migrations/20261010140744_protect_site_identity_from_content_admins.sql`
- `docs/recovered-migrations/20261010144503_make_activity_logs_append_only.sql`
- `docs/recovered-migrations/20261104062436_preservation_and_taxonomy_write_access.sql`
- Recovery instructions and warnings: `docs/recovered-migrations/README.md`

Recovery commit: `d8a523b465d770dabe2ef8713aa12e7073e1c4da`.

### Current migration reconciliation — what is now known
- The 12 live ledger entries now have their exact original SQL preserved in GitHub's recovery archive.
- The two existing active-directory files, Batch 7 and Batch 8, still have no matching version rows in the live migration ledger, even though their effects are present in the live catalog.
- Do not put the 12 recovered files into `supabase/migrations/` while leaving the two unledgered Batch 7/8 files unresolved; that would create a misleading or unsafe pending-migration set.
- Do not directly insert rows into `supabase_migrations.schema_migrations` or replay the Batch 7/8 SQL against production.
- The next migration-management decision is whether to use the supported Supabase CLI migration-repair workflow to mark Batch 7/8 as already applied after a full equivalence review, or to preserve them as separately documented manual SQL and construct a canonical migration stream for new environments. This is a production migration-metadata decision and must be handled deliberately, not with ad hoc SQL.
- A clean new-environment replay must include the Batch 7/8 effects in the correct order; simply applying the 12 recovered ledger files alone would omit those live changes.

### Updated Phase 1 status
- [x] Recover original SQL for all 12 recorded production migrations.
- [x] Verify all 12 recovered SQL files exactly match the live ledger statements.
- [x] Preserve the recovered statements in a non-executable archive with clear warnings.
- [ ] Reconcile the two live-but-unledgered Batch 7/8 SQL files with the canonical migration stream using a supported, controlled process.
- [ ] Complete deterministic dependency installation review (no lockfile; workflow still uses `npm install`).
- [ ] Verify the latest GitHub Pages workflow run triggered by the recovery commit, then re-run the public smoke test.
- [ ] Once migration-stream reconciliation is agreed and complete, establish a clean-environment replay test without touching production.

**Current Phase 1 status: migration SQL recovery is complete; active migration-stream reconciliation remains open.** The earlier statement that historical SQL could not be recovered is superseded by this correction.


### Latest verification — recovery commit deployed and smoke-tested
- Recovery/handoff correction commit: `c95091be6c375a6b3d3fd5f586377ea03fb31358`.
- GitHub Actions run #58: **SUCCESS** for commit `c95091be6c375a6b3d3fd5f586377ea03fb31358`; build, artifact upload and GitHub Pages deployment all completed successfully.
- Post-deployment browser smoke run: `0b5f36bd-2913-4f98-8770-691465b3bb24`.
- Homepage HTTPS load: PASS.
- Direct `/NAMS-FUTA/search` route: PASS.
- Search deep-link reload: PASS.
- No 404, blank page or visible JavaScript failure in the tested views.
- No database or application source code changes were included in this recovery batch; only documentation and archived SQL files were committed.

**Phase 1 now has exact source SQL for all 12 ledgered migrations preserved and verified.** The remaining migration-stream gap is the two already-live Batch 7/8 SQL changes that are absent from the live ledger. Do not run a migration push until that discrepancy is reconciled through a supported migration-management process. Dependency lockfile/CI reproducibility is also still open.
