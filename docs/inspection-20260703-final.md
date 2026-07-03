# Orchestration 1.0 모듈 추출 캠페인 최종 마감 리포트

작성일: 2026-07-03

이 문서는 `docs/inspection-20260630.md`에서 착수해 `docs/inspection-20260702.md`·`docs/inspection-20260703.md`를 거쳐 진행된 behavior-preserving 모듈 추출 캠페인의 최종 종료 상태를 실측 기준으로 기록한다. 이 리포트로 캠페인을 정식 종결한다.

## 1. 규모 변화 (wc -l 실측)

| 파일 | 착수 시 | 종료 시 | 감소 |
| --- | ---: | ---: | ---: |
| `ui/app.js` | 19,335 | 14,691 | -24% |
| `src/execution/execution-coordinator.js` | 5,657 | 4,610 | -19% |
| `src/runtime/runtime-service.js` | 3,520 | 2,810 | -20% |

## 2. 신설 leaf 모듈

- `src/execution/coordinator/`: git.js, diff.js, paths.js, execution-requests.js, decision-inputs.js, artifact-content.js, markdown.js
- `src/execution/`: execution-text-utils.js
- `src/runtime/`: normalizers.js, proposal-records.js, task-gates.js, retention-policy.js, assertions.js
- `ui/`: harness-execution-tokens.js, markdown-artifact-parsing.js, artifact-parsing.js, artifact-structured-render.js, artifact-relations.js, task-detail-snapshots.js, task-summaries.js, control-snapshots.js, growth-panels.js, council-signals.js, ops-entry-signals.js, availability.js (이전 웨이브의 harness-labels/harness-brief-labels/execution-labels/inbox-labels/desk-status/surface-config/council-config/company-config/pack-config/growth-config/growth-learning/personalization-snapshot/preference-config/worktree-labels/artifact-preview/project-bootstrap/harness-state 포함)

## 3. 커밋 아크 (시간순, 6857ac4 이후)

리팩토링 slice 외에 아래 비-리팩토링 성과가 같은 아크에 포함된다:

- `4834559` operator 승인 source mutation 단일 경로 구현 (DEC-067, docs/39), aggregate 163→165체크 확장
- `383cfb6` verification_status stdout 64KiB 파이프 절단 버그 수정 (process.exit→process.exitCode)
- `b0e938b` in-surface 액션 버튼 실클릭 회귀 수정 (디스패처 셀렉터 정밀화) + `69fda0b` 특례 분기 재배치
- `d7aa4fd`/`a37f1f9` aggregate 밖 조용한 smoke 회귀 대량 복구 (legacy band 122개 + vm/pin band 18개)
- `5b2f2bc` provider smoke 현행 계약·재시도 예산 인지 재작성
- `e029f93` normalizeRelativePath path-traversal 가드 하드닝 통일 (Windows 드라이브 이탈 방어)

## 4. 검증 규율 (캠페인 전 구간 적용)

- 매 slice: `node --check` + focused smoke + `ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS=900000 node scripts/verification_status.mjs` (ok true, totalChecks 165, failures 0, stderr 0 bytes).
- UI slice: 실브라우저 부팅 증명(`smoke-qa-slice-02`) 필수 — ES module 역수입 순환은 소스 텍스트 smoke로 검출 불가하고 실브라우저에서만 깨지기 때문.
- 상태 결합 추출(availability): 호출부 전수 grep + 런타임 동작 증명(busy true/false) + 실브라우저 3중 검증.
- 보안 인접 변경(path-traversal 가드): 심각도 평가 후 사용자 승인, 런타임 케이스 테이블로 하드닝·정상입력 불변 양방향 증명.

## 5. 반복 확인된 교훈

- 정찰의 "순수 클러스터" 주장은 이동 직전 함수별 재감사가 필요하다. guard 계열 5/14, retention의 getArtifactRetentionState, live-mutation의 findLatestSuccessfulBuilderLiveMutationRun — 세 번 모두 "순수" 묶음에 state 참조가 숨어 있었다. 판별 기준은 "state. 카운트"가 아니라 "그 state가 파라미터인가 클로저인가, 상수인가 mutable인가"다.
- out-of-aggregate smoke는 계약 변경 시 조용히 썩는다. 대규모 캠페인 마감에는 851 전수 스윕 → 직렬 재분류(환경성 분리) → leaf 홈 grep repoint가 표준 절차다.
- 중복 제거는 병합 직전 diff로 byte-identity를 확인해야 한다("같은 이름 ≠ 같은 코드"). 패키지 경계를 넘는 중복은 통합보다 잔존이 낫다.

## 6. 종료 판정 — 더 이상 clean 순수 추출 없음

재감사로 확정한다. 남은 코드는 성격이 다르다:

- **runtime**: store/state closure-bound CRUD(create/get/list/quarantine verb, sequence 생성, 상태 조회/저장). 파라미터 주입 없이는 leaf 이동 불가.
- **coordinator**: 모듈 스코프에 남은 것은 fs/git I/O 헬퍼와 24 LOC 스테이지 매퍼 2개뿐. 팩토리 내부는 전부 runtime/adapter 클로저 결합.
- **ui/app.js**: 남은 대형 함수는 전부 `render*`(DOM 생성 + state 직접 읽기). availability 계열만 state-주입으로 추출했고(승인), 나머지 상태 결합은 별도 성격의 작업이다.
- **잔류 확정 불순 함수**: buildBuilderLiveMutationGuardSummary(store.readArtifact), getArtifactRetentionState(state.artifacts/tasks), 각종 CRUD.

추가 감축은 순수 추출이 아니라 상태 결합 리팩토링(availability식 주입, 넓은 blast radius) 또는 새 기능이며, 착수 전 방향 결정이 필요하다.

## 7. 확인 커맨드

```bash
git log --reverse --oneline 6857ac4..HEAD
wc -l ui/app.js src/execution/execution-coordinator.js src/runtime/runtime-service.js
node scripts/smoke-readme-scope-evidence.mjs
ORCHESTRATION_VERIFICATION_LOCK_WAIT_MS=900000 node scripts/verification_status.mjs
```
