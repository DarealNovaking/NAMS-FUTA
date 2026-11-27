# Recovered production migration SQL

**Recovery source:** `supabase_migrations.schema_migrations.statements` in the live NAMS Supabase project.

**Snapshot date:** 2026-11-27  
**Project ref:** `amswykapebeevhstmvii`

These files preserve the SQL statements stored alongside the 12 migration records in the live database. They are exact recovered statements, not newly authored schema definitions.

## Important safety note

This folder is an archival recovery set, **not the active Supabase CLI migration directory**. Do not execute these files against the existing production database. The live project already records these 12 versions as applied.

The active `supabase/migrations/` directory separately contains Batch 7 and Batch 8 SQL files. Their live effects were verified in the database (helper ACLs, extension schema and 26 indexes), but those two version identifiers are absent from the live migration ledger. They must be reconciled deliberately before changing the active migration directory or running `supabase db push`.

## Recovered versions

- `20260904231135_initial_nams_archive_schema.sql`
- `20260907234156_expand_nams_archive_for_handover.sql`
- `20260907234337_harden_public_archive_and_admin_security.sql`
- `20260907234350_add_nams_archive_metadata_and_search_v2.sql`
- `20260907234545_harden_public_archive_visibility_and_storage.sql`
- `20260907234553_harden_auth_profile_defaults.sql`
- `20260907234601_add_admin_account_state.sql`
- `20260907234627_tighten_public_schedule_and_archive_indexes.sql`
- `20260907235329_finalize_nams_storage_and_security.sql`
- `20261010140744_protect_site_identity_from_content_admins.sql`
- `20261010144503_make_activity_logs_append_only.sql`
- `20261104062436_preservation_and_taxonomy_write_access.sql`

## Next controlled reconciliation

1. Compare each recovered file with the live catalog and the existing handoff.
2. Decide how to represent the Batch 7/8 changes that are live but not recorded in the migration ledger.
3. Only after that decision, promote the recovered SQL into the active migration directory and reconcile migration metadata in a controlled, explicitly approved step.
4. Never apply these historical statements to the current production database as a replay.
