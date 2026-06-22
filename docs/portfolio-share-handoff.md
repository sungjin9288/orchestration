# Portfolio Share Handoff

## Status

- Date: 2026-06-22
- Decision: local portfolio package is ready for external sharing, but no external URL has been published or verified.
- Boundary: this is a share handoff for reviewers. It does not change the product from local-first PoC to hosted deployment.

## Package

- Path: `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`
- Size: `3.7M` from `ls -lh`
- SHA-256: `64dd6a9d99a893a06eff27077e350dcb348b5c8e763be2b69e15a0ac655b16fb`
- Git state: excluded from repository commit by `.gitignore` rule `_portfolio_export/`
- Handoff location: this repository file records the post-package checksum; it is not part of the zip payload.

## Included Evidence

The package was checked with `unzip -l` and includes:

- `README.md`
- `docs/case-study.md`
- `docs/contribution-scope-note.md`
- `docs/external-share-verification-plan.md`
- `docs/portfolio-open-items-handoff.md`
- `docs/portfolio-share-copy-template.md`
- `docs/project-card.md`
- `docs/resume-bullets.md`
- `docs/interview-story.md`
- `docs/local-demo-checklist.md`
- `docs/live-provider-verification-note.md`
- `docs/public-demo-screencast-plan.md`
- `evidence/evidence_manifest.md`
- `evidence/screenshots/artifacts-surface.png`
- `evidence/screenshots/mission-surface.png`
- `evidence/screenshots/taskboard-surface.png`
- `output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm`

## Exclusions And Guardrails

- Do not include `.env`, API keys, tokens, passwords, personal data, customer/internal materials, `.git/`, `node_modules/`, virtualenv folders, or build output.
- Do not present the package as a hosted demo, public deployment, production system, or measured user outcome.
- Do not add a Demo URL to `README.md` or `links.md` until the uploaded link is accessible from a reviewer context.
- Use `docs/portfolio-share-copy-template.md` for release notes, attachment notes, portfolio-site snippets, and reviewer messages.
- Keep source code excluded from the portfolio zip unless a future package explicitly changes that review boundary.

## Candidate Share Targets

Detailed selection and reviewer-access checks are in `docs/external-share-verification-plan.md`.

| Target | Use when | Required check before recording as a link |
|---|---|---|
| GitHub Release asset | The repository can expose downloadable review artifacts | Open the release asset from a signed-out or reviewer-equivalent browser session |
| Drive/iCloud/Notion attachment | Private reviewer sharing is preferred | Confirm permission scope and open the link outside the owner session |
| Portfolio site download | A portfolio site already exists and can host static files | Verify download, checksum, and that the page does not imply hosted product behavior |

## Pre-Publish Checklist

Run these checks immediately before uploading the package:

```bash
node scripts/portfolio-rebuild-package.mjs
node scripts/portfolio-prepublish-check.mjs
ls -lh _portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip
shasum -a 256 _portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip
unzip -l _portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip
rg -n "sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY\\s*=|password\\s*=|token\\s*=|secret\\s*=|BEGIN (RSA|OPENSSH|PRIVATE) KEY" _portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast --glob '!*.png' --glob '!*.webm'
rg -n "production[-]ready|enterpris[e]|99[.]8|94[.]2|정확도[[:space:]]*95|요청[당]|상용[[:space:]]*운영|엔터프라이[즈]" README.md docs portfolio_manifest.md links.md
```

Expected handling:

- `node scripts/portfolio-rebuild-package.mjs` should regenerate the ignored local package and update this handoff checksum.
- `node scripts/portfolio-prepublish-check.mjs` should return `ok=true`.
- Secret-pattern grep should return no matches.
- README honesty grep should return no unsupported claim matches.
- If the package is uploaded, verify the reviewer-facing link before adding it to `links.md`.
- Destination copy should follow `docs/portfolio-share-copy-template.md` or equivalent claim-safe wording.

## Verification Boundary

- `node scripts/portfolio-prepublish-check.mjs` is a local artifact pre-upload gate for the ignored `_portfolio_export/` package and expanded package directory.
- It is intentionally separate from `node scripts/verification_status.mjs` because a fresh repository checkout can be valid while the ignored portfolio package is absent.
- Run `node scripts/portfolio-rebuild-package.mjs` first, then run the checker immediately before upload or reviewer handoff.
- If the checker fails because the zip or expanded package directory is missing, regenerate the package before treating the external share artifact as ready.
- Do not use a missing local portfolio package as evidence that the product runtime or aggregate repository verification failed.

## Remaining Open

- See `docs/portfolio-open-items-handoff.md` for the combined operator checklist.
- Select the external share target.
- Upload the package only after the target is selected.
- Verify reviewer access and checksum after upload.
- Record the verified URL in `links.md` and keep the unverified local package path separate from public links.
