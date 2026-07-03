# Orchestration 1.0 2026-07-03 lane 마감 리포트

작성일: 2026-07-03

이 문서는 `docs/inspection-20260702.md` 마감 이후 진행된 lane(operator 승인 source mutation 구현 + 2차 모듈 추출 wave)의 종료 상태를 실측 기준으로 기록한다.

## 1. 종료된 항목

| 항목 | 커밋 | 결과 실측 |
| --- | --- | --- |
| provider smoke 현행 계약 재작성 | `5b2f2bc` | slice-01/03/04가 어댑터 개명·재시도 예산 인지형으로 전환, 각 2회 연속 통과 |
| source mutation 구현 slice (DEC-067) | `4834559` | `applyProposalSourceMutation`/rollback/quarantine 단일 경로, schemaVersion 6, aggregate 163→165체크 |
| coordinator 요청·결정 빌더 분리 | `1aea5e3` | coordinator 5,402→5,012 LOC |
| ui 스냅샷 빌더 + 공유 helper leaf 승격 | `cf31e2a` | app.js 18,573→18,217 LOC (초안의 app.js 역수입 순환을 실브라우저 부팅 파괴 결함으로 판정, 비순환 재구성) |
| coordinator artifact-content + markdown leaf | `96dc80e` | coordinator 4,637 LOC |
| runtime task-gate 닫힌 서브그래프(1·2차) | `0331b48`, `90d6c40` | runtime-service 3,498→3,135 LOC, task-gates.js 412 LOC leaf. 순수성 재감사로 5종 잔류 판정(1종은 store.readArtifact I/O) |
| 구조화 artifact 렌더러·관계 분리 + vm 밴드 복구 | `63cb7b5` | app.js 16,774 LOC. cf31e2a가 남긴 vm smoke 14개 조용한 실패를 발견·복구 |

각 slice 검증: `node --check` + focused/실브라우저 smoke + `ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS=900000 node scripts/verification_status.mjs` (ok true, totalChecks 165, failures 0, stderr 0 bytes).

## 2. 현재 규모 실측

```bash
wc -l ui/app.js src/execution/execution-coordinator.js src/runtime/runtime-service.js
#  16774 ui/app.js        (라운드 시작 19,335)
#   4637 src/execution/execution-coordinator.js   (시작 5,657)
#   3135 src/runtime/runtime-service.js           (시작 3,520)
find scripts -maxdepth 1 -name 'smoke-*.mjs' | wc -l   # 851
```

신설 leaf: `src/execution/coordinator/{git,diff,paths,execution-requests,decision-inputs,artifact-content,markdown}.js`, `src/runtime/{proposal-records,normalizers,task-gates}.js`, `ui/{harness-execution-tokens,markdown-artifact-parsing,artifact-parsing,task-detail-snapshots,task-summaries,artifact-structured-render,artifact-relations}.js`.

## 3. 확인된 운영 사실

- ES module 분리에서 app shell 역수입 순환은 소스 텍스트 smoke·node --check로 검출 불가하며 실브라우저 부팅에서만 깨진다. UI 분리 slice는 `smoke-qa-slice-02` 부팅 증명을 기본 검증에 포함한다.
- vm 추출형 smoke 밴드(179–197)는 helper가 leaf로 이동할 때 helperSourceByName 갱신이 필요하다. 갱신 단위는 "지금 실패한 것"이 아니라 "이동한 이름을 참조하는 모든 스크립트"다.
- 정찰 리포트의 순수 클러스터 주장은 이동 직전 함수별 재감사가 필요하다(guard 계열에서 5/14 반증).

## 4. 남은 항목

- ui/app.js(16,774 LOC) 후보: mission/control 스냅샷 계열(~1,533 LOC, leaf 승격 7종 선행), growth 패널 3종(152 LOC 퀵윈), task-helpers(~90 LOC). availability 계열 9종은 전원 `state.loading/mutating` 직접 결합으로 시그니처 변경 없이 이동 불가 — 보류 확정.
- runtime-service의 live-mutation guard 빌더 쌍은 assertRun 이동 또는 승인된 주입 패턴 결정 전까지 잔류.
- source mutation 관련 추가 권한(proposal generation, provider, memory, 지정 경로 밖 mutation, commit, push)은 계속 차단 — 각각 별도 operator 결정 필요.

## 5. 확인 커맨드

```bash
git log --oneline 5b2f2bc~1..HEAD
wc -l ui/app.js src/execution/execution-coordinator.js src/runtime/runtime-service.js
node scripts/smoke-proposal-application-source-mutation.mjs
node scripts/smoke-qa-slice-02.mjs
ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS=900000 node scripts/verification_status.mjs
```
