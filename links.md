# Links

- GitHub: `https://github.com/sungjin9288/orchestration` — reviewer 접근 검증됨. 2026-07-04 익명(비인증) 접근 확인 시 HTTP 200(3회 일관)이었고 GitHub API도 `private: false`, `visibility: public`을 반환했다. reviewer가 로그인 없이 소스·커밋 이력을 열람할 수 있다.
- Demo: 없음
- 발표자료: 없음
- Notion: 없음
- Figma: 없음
- 영상 시연: 없음 (외부 공유 URL 미검증)
- 블로그: 없음
- 기타 참고 링크: 없음
- 비고: 코드측 공개 준비와 GitHub source 접근 검증은 완료됐다 — `node scripts/portfolio-prepublish-check.mjs`가 checksum 일치, 필수 항목 존재, 금지 항목·secret 패턴·hosted-app 거짓 주장 부재를 모두 통과했고(2026-07-04 실행), GitHub repo URL은 2026-07-04 public 전환 후 reviewer 접근 검증됨(위 GitHub 줄). `node scripts/portfolio-share-status.mjs`는 GitHub source 접근과 별도 evidence package URL을 분리해서 보고한다. hosted demo·발표자료 링크는 여전히 기록되어 있지 않고, 별도 screencast package download URL은 선택 후속 항목이다. local screencast artifact는 `output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm`에 있고, screencast 포함 local package는 `_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip`에 생성되어 있으나 둘 다 외부 공유 URL은 아니다. 검증된 package URL이 생기면 `Demo`는 계속 `없음`으로 두고, `영상 시연` 또는 `기타 참고 링크`에 reviewer-equivalent access check date와 checksum match를 함께 기록한다. 외부 공유 전 handoff 기준은 `docs/portfolio-share-handoff.md`, target 선택 및 접근 검증 절차는 `docs/external-share-verification-plan.md`, claim-safe copy 기준은 `docs/portfolio-share-copy-template.md`에 기록했다.
