# Links

- GitHub: 접근 검증 필요 — repo는 `https://github.com/sungjin9288/orchestration`에 존재하고 push가 활성이나 reviewer 접근은 미검증. 2026-07-04 익명(비인증) 접근 확인 시 HTTP 404였다(즉 private). 다음 액션: 소유자가 GitHub에서 repo를 public으로 전환한 뒤 익명 접근이 200인지 재확인해 이 줄을 검증됨으로 갱신하거나, 별도 공유 대상에 evidence package를 업로드한다.
- Demo: 없음
- 발표자료: 없음
- Notion: 없음
- Figma: 없음
- 영상 시연: 없음 (외부 공유 URL 미검증)
- 블로그: 없음
- 기타 참고 링크: 없음
- 비고: 코드측 공개 준비는 완료됐다 — `node scripts/portfolio-prepublish-check.mjs`가 checksum 일치, 필수 항목 존재, 금지 항목·secret 패턴·hosted-app 거짓 주장 부재를 모두 통과했고(2026-07-04 실행), `node scripts/portfolio-share-status.mjs`는 `packagePrepublishReady: true`로 남은 blocker 2개를 모두 human/environment owner로 태그한다(외부 공유 대상 업로드·접근 검증, 그리고 OPENAI live 키). 현재 repo에는 접근 검증된 public URL, hosted demo, 발표자료 링크가 기록되어 있지 않다. local screencast artifact는 `output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm`에 있고, screencast 포함 local package는 `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`에 생성되어 있으나 둘 다 외부 공유 URL은 아니다. 검증된 package URL이 생기면 `Demo`는 계속 `없음`으로 두고, `영상 시연` 또는 `기타 참고 링크`에 reviewer-equivalent access check date와 checksum match를 함께 기록한다. 외부 공유 전 handoff 기준은 `docs/portfolio-share-handoff.md`, target 선택 및 접근 검증 절차는 `docs/external-share-verification-plan.md`, claim-safe copy 기준은 `docs/portfolio-share-copy-template.md`에 기록했다.
