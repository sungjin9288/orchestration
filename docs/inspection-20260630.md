# Orchestration 1.0 리팩토링 및 디밸롭 점검 리포트

작성일: 2026-06-30

이 문서는 현재 `main`의 실제 코드와 검증 표면을 기준으로 남은 작업을 다시 정렬한다. 초안 점검에서 드러난 `knowledge-work` 문서 드리프트, smoke runner 부재, source mutation planning-only gate는 이미 후속 변경으로 정리되었으므로 더 이상 열린 P0로 보지 않는다.

## 1. 현재 상태

### Git

| 항목 | 실측 |
| --- | --- |
| 브랜치 | `main` |
| origin 대비 | `0 0` (`git rev-list --left-right --count origin/main...HEAD`) |
| 현재 작업 트리 | generic formatter helper 분리, worktree label helper 분리, portable preference review helper 분리, artifact preview helper 분리, execution label helper 분리, smoke/status 증거 갱신, 이 점검 리포트 |

현재 `main`과 `origin/main`은 같은 커밋을 가리킨다. 이번 작업트리 변경은 runtime authority를 넓히지 않는 UI read-only helper extraction이며, `commit`과 `push`는 이번 source mutation planning-only 승인 범위에 포함되지 않는다.

### 규모

| 파일 | LOC | 함수-ish 수 | 판단 |
| --- | ---: | ---: | --- |
| `ui/app.js` | 19,335 | 572 | 여전히 최대 리팩토링 대상. `ui/pack-config.js`, `ui/surface-config.js`, `ui/company-config.js`, `ui/council-config.js`, `ui/desk-status.js`, `ui/preference-config.js`, `ui/personalization-snapshot.js`, `ui/growth-config.js`, `ui/growth-learning.js`, `ui/harness-labels.js`, `ui/harness-brief-labels.js`, `ui/formatters.js`, `ui/worktree-labels.js`, `ui/artifact-preview.js`, `ui/execution-labels.js`, `ui/inbox-labels.js` 분리가 시작됨 |
| `src/execution/execution-coordinator.js` | 5,657 | 202 | git, diff, stage execution 책임이 한 파일에 집중 |
| `src/runtime/runtime-service.js` | 3,520 | 209 | project/task/run/artifact/decision/proposal record 책임이 한 파일에 집중 |
| `src/execution/providers/openai-responses-adapter.js` | 3,513 | - | role별 prompt/schema/rendering 책임 집중 |
| `src/execution/providers/local-stub-adapter.js` | 1,583 | - | 기본 adapter |
| `ui/surface-config.js` | 272 | 4 | 새 surface/navigation config 모듈 |
| `ui/company-config.js` | 157 | 15 | 새 company roster config, directory summary, ops scope helper 모듈 |
| `ui/council-config.js` | 106 | 0 | 새 Council/Orchestration shell static metadata 모듈 |
| `ui/desk-status.js` | 78 | 5 | 새 Execution/Deliverables desk status helper 모듈 |
| `ui/preference-config.js` | 57 | 6 | local-only preference config, normalization, portable review packet helper 모듈 |
| `ui/personalization-snapshot.js` | 34 | 3 | 새 local-only personalization read-only snapshot 모듈 |
| `ui/growth-config.js` | 30 | 0 | 새 growth authority/readiness config 모듈 |
| `ui/growth-learning.js` | 213 | 20 | 새 read-only Growth Evidence Ledger snapshot 모듈 |
| `ui/harness-labels.js` | 60 | 12 | 새 harness execution label helper 모듈 |
| `ui/harness-brief-labels.js` | 107 | 6 | 새 harness output brief label/tone helper 모듈 |
| `ui/formatters.js` | 22 | 2 | 새 generic UI formatter helper 모듈 |
| `ui/worktree-labels.js` | 17 | 2 | 새 linked-worktree label helper 모듈 |
| `ui/artifact-preview.js` | 51 | 6 | 새 artifact preview badge/copy helper 모듈 |
| `ui/execution-labels.js` | 92 | 5 | 새 execution role/stage 및 evidence rail label helper 모듈 |
| `ui/inbox-labels.js` | 43 | 3 | 새 inbox kind/status/action label helper 모듈 |
| `ui/pack-config.js` | 27 | 2 | pack copy/config 모듈 |

### Smoke 및 status 표면

| 항목 | 실측 |
| --- | ---: |
| `scripts/smoke-*.mjs` | 849 |
| `scripts/*-status.mjs` | 197 |
| `scripts/vnext-*.mjs` | 20 |
| `scripts` 파일 총계 | 1004 |
| smoke runner | `scripts/run-smoke.mjs` 존재 |
| `knowledge-work` source-backed refs | 31 |

`scripts/run-smoke.mjs`가 생겼으므로 “집계 러너 부재”는 해결됐다. 다만 849개 smoke 전체를 매번 실행하는 것이 기본 게이트가 되지는 않는다. 현재 방식은 focused smoke + aggregate `verification_status` 조합이 현실적이다.

## 2. 완료로 재분류할 항목

### `knowledge-work` 문서 정합성

`DEC-066`과 README, AGENTS, master brief, architecture roadmap, README smoke가 `knowledge-work`를 code-present explicit opt-in pack으로 설명한다. 더 이상 “코드에는 있는데 문서가 부정하는” 상태가 아니다.

### Smoke runner

`scripts/run-smoke.mjs`는 명시적 `--filter` 또는 `--all` 없이는 실행하지 않는 구조로 추가됐다. smoke 실행을 편하게 만들되, 숨은 권한 실행이나 자동 전체 실행은 열지 않는다.

### Source mutation planning-only

`operator-decision-vnext-proposal-source-mutation-001`은 `DEC-065`와 `docs/38_proposal-application-source-mutation-planning-plan.md`에 반영되어 있다. 현재 열린 것은 planning-only evidence이며, 다음 gate는 `proposal application source mutation implementation decision required`다.

계속 차단되는 권한:

- source mutation implementation
- proposal generation
- provider calls
- memory persistence
- source mutation
- commit
- push

## 3. 남은 P0 / P1

### P0: `ui/app.js` 상태 있는 surface 분리

`ui/pack-config.js`, `ui/surface-config.js`, `ui/company-config.js`, `ui/council-config.js`, `ui/desk-status.js`, `ui/preference-config.js`, `ui/personalization-snapshot.js`, `ui/growth-config.js`, `ui/growth-learning.js`, `ui/harness-labels.js`, `ui/harness-brief-labels.js`, `ui/formatters.js`, `ui/worktree-labels.js`, `ui/artifact-preview.js`, `ui/execution-labels.js`, `ui/inbox-labels.js`로 정적 config, local-only personalization snapshot, authority marker, read-only growth snapshot 계산, desk status 계산, harness label/tone 계산, generic formatting, linked-worktree label 계산, artifact preview badge/copy 계산, execution role/stage label 계산, evidence rail label 계산, inbox label 계산, portable preference review packet 생성 분리는 시작됐다. 다음 단계는 render lifecycle과 state reconciliation을 깨지 않는 가장 작은 surface를 하나 골라 분리하는 것이다.

권장 순서:

1. read-only 성격이 강한 Growth Evidence / personalization panel 중 하나를 먼저 분리
2. DOM query, event binding, state mutation이 한 모듈에 섞이지 않게 adapter 함수를 명시
3. 기존 `smoke-ui-slice-*`에서 import/server/visible copy/authority marker를 같이 검증

### P0: `execution-coordinator.js` git/diff 책임 분리

`runGit`, repo change-set 수집, unified diff 생성은 비교적 순수하고 stage authority와 분리 가능하다. 첫 분리는 behavior-preserving helper extraction이어야 한다.

권장 순서:

1. `src/execution/coordinator/git.js`
2. `src/execution/coordinator/diff.js`
3. coordinator 본문은 stage orchestration만 남김

### P1: source mutation dry-run preview 계획

실제 source mutation 구현 전에 부작용 없는 dry-run preview가 필요하다. 이 단계도 아직 승인되지 않았다. 다음 implementation decision이 오기 전까지는 계획서와 smoke 설계만 유지한다.

필수 조건:

- 정확히 하나의 existing audit-only application attempt
- durable proposal record linkage
- clean baseline proof
- diff preview refs
- rollback refs
- focused smoke refs
- aggregate verification refs

### P1: `runtime-service.js` proposal record 책임 분리

durable proposal record와 application attempt 흐름은 앞으로 더 자주 바뀔 가능성이 높다. `runtime/proposal-records.js`로 먼저 분리하면 source mutation preview/implementation gate를 검토할 때 blast radius가 줄어든다.

## 4. 권장 다음 진행

1. 다음 구현 slice는 `ui/app.js`에서 read-only surface 하나를 분리한다.
2. source mutation은 implementation approval이 들어오기 전까지 실제 write path를 만들지 않는다.
3. source mutation implementation decision이 들어오면 먼저 정확히 하나의 audit-only application attempt, clean baseline proof, dry-run diff preview, rollback refs, focused smoke refs를 확인한다.

## 5. 확인 커맨드

이 리포트는 아래 실측을 기준으로 작성했다.

```bash
git rev-list --left-right --count origin/main...HEAD
git status --porcelain --untracked-files=all
wc -l ui/app.js src/execution/execution-coordinator.js src/runtime/runtime-service.js ui/pack-config.js ui/surface-config.js ui/company-config.js ui/council-config.js ui/desk-status.js ui/preference-config.js ui/personalization-snapshot.js ui/growth-config.js ui/growth-learning.js ui/harness-labels.js ui/harness-brief-labels.js ui/formatters.js ui/worktree-labels.js ui/artifact-preview.js ui/execution-labels.js ui/inbox-labels.js
rg -n "function |=>" ui/app.js src/execution/execution-coordinator.js src/runtime/runtime-service.js ui/pack-config.js ui/surface-config.js ui/company-config.js ui/council-config.js ui/desk-status.js ui/preference-config.js ui/personalization-snapshot.js ui/growth-config.js ui/growth-learning.js ui/harness-labels.js ui/harness-brief-labels.js ui/formatters.js ui/worktree-labels.js ui/artifact-preview.js ui/execution-labels.js ui/inbox-labels.js
find scripts -maxdepth 1 -name 'smoke-*.mjs' | wc -l
find scripts -maxdepth 1 -name '*-status.mjs' | wc -l
test -f scripts/run-smoke.mjs
rg -n "DEC-065|operator-decision-vnext-proposal-source-mutation-001|approve-source-mutation-planning-only|docs/38_proposal-application-source-mutation-planning-plan" docs README.md scripts tasks -S
```
