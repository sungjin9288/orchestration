# External Share Verification Plan

## Status

- Date: 2026-06-22
- Current state: no external share target has been selected, uploaded, or verified.
- Package to share: `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`
- Package checksum source: `docs/portfolio-share-handoff.md`
- Claim-safe share copy source: `docs/portfolio-share-copy-template.md`
- Boundary: this plan is for portfolio artifact sharing only. It does not create a hosted app, public demo server, or external release workflow.

## Target Decision Matrix

| Target | Best fit | Tradeoff | Required proof before adding to `links.md` |
|---|---|---|---|
| GitHub Release asset | The repository can publicly expose downloadable portfolio evidence | Public and durable, but package becomes easy to redistribute | Open asset from a signed-out or reviewer-equivalent browser, download it, and confirm checksum |
| Private Drive or iCloud link | Reviewer sharing should stay controlled | Permission settings can fail silently for reviewers | Open link outside the owner session, download the file, and confirm checksum |
| Notion attachment | Portfolio context already lives in Notion | Attachment access depends on page/share permissions | Open the shared page and attachment from a reviewer-equivalent session, then confirm checksum |
| Portfolio site download | A portfolio site already exists and can host static downloads | Needs page copy that does not imply hosted product behavior | Verify page access, download, checksum, and copy boundary |
| Local-only handoff | No external upload is approved yet | No reviewer-facing URL; user must send the file manually | Keep `links.md` with `Demo: 없음` and reference only local package path in repo notes |

## Local Static Page Preflight

If a local static page is used as the upload source for a portfolio-site download, verify it before upload:

```bash
PORTFOLIO_LOCAL_SHARE_PAGE_DIR=<path-to-local-share-page> node scripts/portfolio-share-status.mjs
```

Expected result:

- `localSharePage.configured=true`
- `readiness.localSharePageReady=true`
- the local page package checksum matches `docs/portfolio-share-handoff.md`
- the page has no unsupported public claim matches
- any local git repo state is treated as local staging evidence only, not as reviewer access proof

This preflight does not replace the reviewer-equivalent access check after upload.

## Recommended Default

Use GitHub Release asset when the repository is public and a durable downloadable artifact is acceptable.

Use a private Drive/iCloud/Notion attachment when reviewer access should be limited.

Keep local-only handoff when no external upload target has been explicitly selected.

## Verification Protocol

1. Run `node scripts/portfolio-rebuild-package.mjs`.
2. Run `node scripts/portfolio-prepublish-check.mjs` and the remaining pre-publish checks in `docs/portfolio-share-handoff.md`.
3. If a local static page is the upload source, run `PORTFOLIO_LOCAL_SHARE_PAGE_DIR=<path-to-local-share-page> node scripts/portfolio-share-status.mjs`.
4. Upload exactly `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`.
5. Open the uploaded link from a reviewer-equivalent context, not only the owner session.
6. Download the uploaded file into a temporary location.
7. Run `shasum -a 256 <downloaded-file>` and compare it with the checksum in `docs/portfolio-share-handoff.md`.
8. Use `docs/portfolio-share-copy-template.md` for the destination page, release body, or reviewer message.
9. Confirm the destination page or attachment text does not describe the package as a hosted app or measured user outcome.
10. Only after those checks pass, update `links.md` with the verified URL and note the access check date.

The rebuild script and pre-publish checker are repository-side artifact gates for the ignored local package. They prepare and confirm package contents before upload, but they do not replace reviewer-equivalent access verification and are not part of the aggregate repository smoke status.

## Link Recording Template

Use this format only after reviewer-equivalent access is verified.

```md
- Demo: 없음
- 영상 시연: <verified package or screencast URL> (access verified: YYYY-MM-DD, checksum matched)
- 기타 참고 링크: <optional release/page URL> (access verified: YYYY-MM-DD)
```

If the uploaded artifact is a downloadable package rather than a running app, keep `Demo: 없음` and record the URL under `영상 시연` or `기타 참고 링크`.

Until a URL passes reviewer-equivalent access and checksum verification, leave the corresponding `links.md` field as `없음` with a short 미검증 note instead of `추가 필요`.

## Do Not Record Yet

- Owner-only cloud links.
- Links that require an unknown login state.
- URLs that only open from the uploader's browser session.
- Pages that imply a running hosted app when only a downloadable local package exists.
- Copy that does not follow `docs/portfolio-share-copy-template.md` or an equivalent claim-safe wording.
- Files whose downloaded checksum does not match `docs/portfolio-share-handoff.md`.

## Next Action

The remaining human decision is target selection:

- choose `GitHub Release asset`, `Private Drive/iCloud link`, `Notion attachment`, `Portfolio site download`, or `Local-only handoff`
- upload only after the pre-publish checks pass
- verify reviewer-equivalent access before changing `links.md`
