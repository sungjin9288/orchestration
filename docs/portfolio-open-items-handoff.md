# Portfolio Open Items Handoff

## Status

- Date: 2026-06-22
- Latest local evidence refresh head: `main@967d39b`
- Purpose: keep the remaining portfolio handoff work executable without widening product, provider, deployment, or release scope.
- Boundary: this is an operator checklist. It does not upload files, create public URLs, run configured OpenAI calls, or change runtime behavior.

## Current Open Items

Run `node scripts/portfolio-share-status.mjs` to summarize current package readiness, verified-link state, optional local static page status, optional live-provider env visibility, and remaining blockers without uploading files or running configured live calls.

| Item | Current evidence | Blocker | Completion evidence |
|---|---|---|---|
| External share target | `docs/external-share-verification-plan.md` defines target options and reviewer-equivalent access checks; `docs/portfolio-share-copy-template.md` defines claim-safe release and reviewer copy | A human must choose and upload to a target | Verified reviewer-facing URL plus downloaded checksum match recorded in `links.md` |
| Local static share page | Optional pre-upload staging can be checked with `PORTFOLIO_LOCAL_SHARE_PAGE_DIR=<path-to-local-share-page> node scripts/portfolio-share-status.mjs` | Local page or bundle readiness is not reviewer access proof and does not create a public URL | `readiness.localSharePageReady=true`; if uploading the static-site zip, also `readiness.localSharePageBundleReady=true` |
| Configured-env optional live smoke | `docs/live-provider-verification-note.md` records `skipped_missing_env` for `main@967d39b` because required OpenAI env values were not visible | Required OpenAI env values must be visible in the current execution context | Pass/fail/skipped output from the full optional live smoke set, recorded without secret values |

## External Share Checklist

Use this only after selecting a target such as GitHub Release asset, private attachment, Notion attachment, portfolio site download, or local-only handoff.

1. Run `node scripts/portfolio-rebuild-package.mjs`.
2. Run `node scripts/portfolio-prepublish-check.mjs` and the remaining pre-publish checks in `docs/portfolio-share-handoff.md`.
3. Run `node scripts/portfolio-share-status.mjs` to confirm package readiness and currently open human/env blockers.
4. If a local static page is the upload source, run `PORTFOLIO_LOCAL_SHARE_PAGE_DIR=<path-to-local-share-page> node scripts/portfolio-share-status.mjs`.
5. Upload exactly `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`, or upload the generated static-site zip only when `localSharePageBundleReady=true`.
6. Open the uploaded artifact from a reviewer-equivalent session.
7. Download the uploaded artifact into a temporary location.
8. Compare its SHA-256 with `docs/portfolio-share-handoff.md`.
9. Use `docs/portfolio-share-copy-template.md` for release notes, attachment notes, portfolio-site snippets, or reviewer messages.
10. Confirm the destination copy does not imply a running hosted product or measured user outcome.
11. Update `links.md` only after the access and checksum checks pass.

Do not put an unverified URL into `links.md`.

The rebuild script and pre-publish checker depend on the ignored local zip and expanded package directory under `_portfolio_export/`. If those files are missing, regenerate the package first; do not treat that missing local artifact as an aggregate runtime failure.

## Configured-Env Live Smoke Checklist

Use this only when both required OpenAI env values are visible to the current process or the process is relaunched into an environment that exposes them.

1. Confirm env visibility with a boolean-only check. Do not print secret values.
2. Run the optional live smoke set:

```bash
node scripts/smoke-provider-live-slice-02.mjs
node scripts/smoke-provider-live-slice-03.mjs
node scripts/smoke-provider-live-slice-05.mjs
node scripts/smoke-provider-live-slice-06.mjs
node scripts/smoke-provider-live-slice-07.mjs
node scripts/smoke-qa-live-slice-04.mjs
node scripts/smoke-qa-live-slice-05.mjs
node scripts/smoke-qa-live-slice-06.mjs
node scripts/smoke-qa-live-slice-07.mjs
```

3. Classify each result as `pass`, `fail`, or `skipped`.
4. Record exact non-secret output in `docs/live-provider-verification-note.md`.
5. Keep configured-env live verification non-blocking unless a future source-of-truth decision changes that gate.

## Stop Conditions

Stop and do not update public-facing links when:

- the share target is not selected
- reviewer-equivalent access cannot be verified
- the downloaded checksum differs from `docs/portfolio-share-handoff.md`
- required OpenAI env values are not visible
- a live smoke output includes sensitive material that needs redaction before documentation

## Next Human Decision

Choose one of the following:

- share target first: select/upload/verify a reviewer-facing package URL
- local static page first: verify `PORTFOLIO_LOCAL_SHARE_PAGE_DIR` readiness and, when applicable, generated bundle readiness, then use it only as an upload source
- configured-env live first: expose the required OpenAI env values to this execution context and rerun the optional live smoke set
- local-only for now: keep both items open and do not add public links or live pass claims
