# Orchestration 1.0 리팩토링 점검 마감 리포트

작성일: 2026-07-02

이 문서는 `docs/inspection-20260630.md`가 지목한 P0/P1 리팩토링 항목의 종료 상태를 실측 기준으로 기록한다. 모든 slice는 behavior-preserving이며 runtime authority(provider 호출, memory persistence, source mutation, commit, push 경계)를 변경하지 않았다.

## 1. 종료된 항목

| 항목 | 커밋 | 결과 실측 |
| --- | --- | --- |
| P0 coordinator git/diff 분리 | `c39b0a9` | `src/execution/execution-coordinator.js` 5,657 → 5,402 LOC. `src/execution/coordinator/git.js`(147), `diff.js`(127), `paths.js`(38) 신설. `module.exports` 표면 불변 |
| P0 ui/app.js harness execution token 분리 | `d8e16a8` | `ui/app.js` 19,242 → 19,169 LOC. `ui/harness-execution-tokens.js`(89) 신설. source-contract smoke 23개 서명 assertion repoint |
| P1 runtime-service proposal record 분리 | `4a828bc` | `src/runtime/runtime-service.js` 3,520 → 3,234 LOC. `src/runtime/proposal-records.js`(269), `src/runtime/normalizers.js`(69) 신설. source-text gate 2개 evidence source repoint |
| legacy smoke 기준선 복구 | `f77d542` | `scripts/smoke-execution-slice-04.mjs` 기대값을 현재 readiness reasons 계약으로 refresh. clean HEAD 실패였던 기존 문제 종료 |
| ui/app.js 2차 분리 (markdown 파싱) | `dd6db30` | `ui/app.js` 19,169 → 19,059 LOC. `ui/markdown-artifact-parsing.js`(118) 신설 |

각 slice 검증: `node --check` + focused smoke + `ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS=900000 node scripts/verification_status.mjs` (매 slice ok true, totalChecks 163, failures 0, stderr 0 bytes).

## 2. 현재 규모 실측

```bash
wc -l ui/app.js src/execution/execution-coordinator.js src/runtime/runtime-service.js
#  19059 ui/app.js
#   5402 src/execution/execution-coordinator.js
#   3234 src/runtime/runtime-service.js
find scripts -maxdepth 1 -type f -name 'smoke-*.mjs' | wc -l   # 849
find scripts -maxdepth 1 -type f -name '*-status.mjs' | wc -l  # 197
```

## 3. 확인된 운영 사실

- `scripts/smoke-qa-slice-02.mjs`의 간헐 실패는 stale Playwright 세션에 의한 환경성 문제로, 현재 트리에서 exit 0으로 통과한다. 코드 수정 대상이 아니다.
- source-text gate(예: `vnext-*-implementation-status.mjs`)는 함수 서명과 에러 문구를 특정 파일의 소스 텍스트로 고정하므로, 함수 이동 slice는 gate evidence source repoint를 같은 커밋에 포함해야 한다.
- aggregate(163체크) 밖의 smoke는 계약 변경 시 갱신 누락으로 썩을 수 있다. 실패 발견 시 `git stash`로 clean HEAD 재현을 먼저 확인하고 `git log -S`로 기대값의 출처를 판정한다.

## 4. 남은 항목

- source mutation dry-run preview: `DEC-065` planning-only. implementation decision 승인 전까지 계획과 smoke 설계만 유지하며 write path를 만들지 않는다.
- `ui/app.js`(19,059 LOC)는 여전히 최대 파일이다. 다음 후보는 parseXxxArtifact 계열(약 500+ LOC)이지만 상위 함수들이 state/render와 섞여 있어 경계 재조사가 선행되어야 한다.
- `smoke-execution-slice-04` 외 aggregate 밖 legacy smoke의 전수 상태 점검은 미실시로 남아 있다.

## 5. 확인 커맨드

```bash
git log --oneline 6857ac4..HEAD
wc -l ui/app.js src/execution/execution-coordinator.js src/runtime/runtime-service.js
node scripts/smoke-execution-slice-04.mjs
ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS=900000 node scripts/verification_status.mjs
```
