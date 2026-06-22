# Portfolio Share Copy Template

## Status

- Date: 2026-06-22
- Purpose: provide claim-safe copy for sharing the local portfolio evidence package after a target is selected.
- Package: `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`
- Checksum source: copy the current SHA-256 from `docs/portfolio-share-handoff.md` after the final package rebuild.
- Boundary: this copy describes a downloadable evidence package and recorded walkthrough. It must not imply a hosted app, public deployment, live service, measured adoption, or measured user outcome.

## Before Pasting

Do not publish or paste the copy below until all checks pass:

1. Run `node scripts/portfolio-prepublish-check.mjs` and the pre-publish checks in `docs/portfolio-share-handoff.md`.
2. Upload exactly `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`.
3. Open the uploaded link from a reviewer-equivalent browser or account.
4. Download the uploaded artifact and run `node scripts/portfolio-verify-uploaded-artifact.mjs --file <downloaded-file>`.
5. Confirm the destination page text says the artifact is downloadable evidence, not a running hosted app.
6. Keep `links.md` without verified external URLs until access and checksum verification pass.

## GitHub Release Body

```md
Title: Orchestration 1.0 Portfolio Evidence Package - 2026-06-22

This release asset is a downloadable portfolio evidence package for Orchestration 1.0, a local-first personal PoC for an AI-assisted development workflow control plane.

Included evidence:

- README, case study, project card, resume bullets, and interview story
- local UI screenshots
- local workflow evidence logs and state transition examples
- recorded local walkthrough screencast
- external share verification and open-item handoff notes

Scope boundary:

- This is not a running hosted app.
- This does not claim public deployment, user adoption, or measured business outcomes.
- Optional live OpenAI smoke evidence is recorded separately and remains non-blocking when required env values are not visible.

Artifact:

- File: orchestration_portfolio_pack_2026-06-22_screencast.zip
- SHA-256: <current-package-sha256-from-docs/portfolio-share-handoff.md>
- Access verified: <YYYY-MM-DD>
```

## Private Attachment Note

```md
Sharing the Orchestration 1.0 portfolio evidence package for review.

This package contains the README, case study, screenshots, local evidence logs, and a recorded local walkthrough. It is meant to show the implemented local-first workflow and documentation evidence without implying a running hosted app.

Please use the package checksum below to confirm the downloaded file:

- File: orchestration_portfolio_pack_2026-06-22_screencast.zip
- SHA-256: <current-package-sha256-from-docs/portfolio-share-handoff.md>
- Access verified: <YYYY-MM-DD>
```

## Portfolio Site Snippet

```md
Orchestration 1.0 is a local-first personal PoC for an AI-assisted development workflow control plane. The downloadable evidence package includes the case study, screenshots, local workflow evidence, and a recorded walkthrough.

Download: <verified-download-url>
Checksum: <current-package-sha256-from-docs/portfolio-share-handoff.md>
Access verified: <YYYY-MM-DD>

Note: this is a downloadable evidence package, not a hosted running app.
```

## Reviewer Message

```md
I am sharing a downloadable evidence package for Orchestration 1.0.

It includes the README, case study, screenshots, local workflow evidence, and a recorded local walkthrough. The project is presented as a local-first personal PoC, and the package does not claim a hosted app or measured user outcome.

Package URL: <verified-download-url>
SHA-256: <current-package-sha256-from-docs/portfolio-share-handoff.md>
Access verified: <YYYY-MM-DD>
```

## `links.md` Update Snippet

Use this only after reviewer-equivalent access and checksum verification pass.

```md
- GitHub: <verified-repo-or-release-url> (access verified: <YYYY-MM-DD>)
- Demo: 없음
- 영상 시연: <verified-download-url> (access verified: <YYYY-MM-DD>, checksum matched)
- 기타 참고 링크: <optional-release-or-page-url> (access verified: <YYYY-MM-DD>)
```

If the destination is a package download rather than a running app, keep `Demo: 없음`. Leave `GitHub`, `영상 시연`, and `기타 참고 링크` as `없음` until each URL has been opened from a reviewer-equivalent context.

## Copy Review Checklist

- The copy says `downloadable evidence package` or equivalent.
- The copy does not imply a hosted app, public deployment, measured adoption, or measured business outcome.
- The copy uses the current package checksum from `docs/portfolio-share-handoff.md`.
- The copied URL was opened from a reviewer-equivalent context before updating `links.md`.
- The downloaded file passed `node scripts/portfolio-verify-uploaded-artifact.mjs --file <downloaded-file>`.
