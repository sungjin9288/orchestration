# Pre-Real-Test Readiness

## Purpose
이 문서는 current `main` 기준에서 실 테스트 직전 readiness contract와 operator runbook을 고정한다.

목표는 새 capability를 여는 것이 아니라, 이미 닫힌 `Mission / Council / Execution / Deliverables` 기본 제품 경로가 실제 solo dogfooding에서도 자연스럽게 닫히는지 검증하는 것이다.

이 문서는 아래 경계를 유지한다.

- frozen required regression gate는 바꾸지 않는다
- `local-stub` shipped default는 유지한다
- `openai-responses live` 는 optional provider path이지만, 실 테스트 readiness에서는 `local-stub` 와 동등한 acceptance path로 본다
- runtime object, route id, approval/review contract, artifact taxonomy는 바꾸지 않는다
- rehearsal에서 드러난 수정은 같은 성격의 thin slice를 local batch로 모아 한 번에 publish한다

## Readiness Contract

### Ready Definition
실 테스트 시작 가능 상태는 아래가 모두 참일 때만 성립한다.

1. `project_path required`, `review before done`, `approval before commit` 같은 frozen baseline contract가 current `main` 에서 유지된다.
2. `Mission -> Council -> Execution -> Deliverables` 기본 경로가 `local-stub` 에서 자연스럽게 닫힌다.
3. 같은 기본 경로가 `openai-responses live` 에서도 자연스럽게 닫힌다.
4. first-use friction이 남아 있더라도 그것이 external env/provider issue가 아니라면 thin-slice batch로 바로 분류되고, ledger에 current evidence가 남는다.

### Equal Acceptance Paths
실 테스트 readiness에서는 아래 두 경로를 같은 무게로 취급한다.

1. `Mission -> Council -> Execution -> Deliverables` on `local-stub`
2. `Mission -> Council -> Execution -> Deliverables` on `openai-responses live`

중요:

- 이 규칙은 pre-real-test readiness 기준이다
- repo-required freeze gate를 live-required gate로 승격하지 않는다
- required synthetic baseline과 optional live-provider verification의 boundary는 그대로 유지한다

### Success Criteria
각 acceptance path는 아래를 모두 만족해야 한다.

- active project bootstrap이 성공한다
- `Mission` 생성과 `Council` draft가 성공한다
- `Council` recommendation과 alignment CTA가 읽힌다
- approval 뒤 `planner -> architect -> task-breaker -> builder preflight` 가 자동 진행된다
- `Execution` 에서 current gate와 next action이 명확하다
- `Deliverables` 에서 latest artifact/review/approval/completion 상태를 해석할 수 있다
- 필요할 때 `Open Advanced Ops Mode` 로 자연스럽게 handoff 된다

## Verification Layers

### A. Hygiene
- `node scripts/smoke-ui-slice-63.mjs`
- `git diff --check`

### B. Representative Synthetic Readiness
current frozen baseline을 흔들지 않는 대표 synthetic bundle은 아래로 유지한다.

- `node scripts/smoke-ui-slice-59.mjs`
- `node scripts/ui_qa_status.mjs`
- `node scripts/smoke-provider-slice-05.mjs`
- `node scripts/smoke-qa-slice-07.mjs`

`ui_qa_status` 는 source-only UI contract checks를 required lane으로 실행하고, local
`/api/snapshot` reachability는 UI server가 켜져 있을 때만 informational lane으로 기록한다.
현재 representative bundle에는 `operator-home-runway` check도 포함되어 첫 화면이
`active mission / owner / gate / next action / result location`을 계속 보여 주는지 함께 고정한다.
`operator-home-no-mission-start-gate` check는 등록된 안건이 없는 첫 사용자에게 primary next action이
`협의회`로 건너뛰지 않고 `미션 / 신규 안건 등록`에 머무르는지 고정한다.
`operator-home-no-mission-handoff-label` check는 같은 empty-state에서 오른쪽 인계 패널이
`Execution handoff / 실행 인계`가 아니라 `Mission intake / 접수 인계`로 시작점을 설명하는지 고정한다.

필요하면 touched surface에 맞는 narrow smoke를 추가로 실행하되, required freeze gate 자체를 재정의하지 않는다.

### C. Real Rehearsal
실 테스트 직전 representative rehearsal은 아래 exact entrypoint로 기록한다.

- local-stub canonical browser path: `node scripts/smoke-qa-slice-07.mjs`
- live provider representative: `node scripts/smoke-provider-live-slice-05.mjs`
- live browser representative: `node scripts/smoke-qa-live-slice-07.mjs`

live path red가 나와도 아래 경우는 repo bug와 분리한다.

- missing `OPENAI_API_KEY`
- missing `OPENAI_RESPONSES_MODEL`
- external auth/quota/provider capacity issue

이 경우에도 red를 지우지 말고, exact entrypoint evidence를 ledger에 남긴 뒤 external condition 복구 후 같은 command를 다시 돌린다.

## Operator Runbook

### Prerequisites
- current branch는 current `main` 또는 current `main` 에서 갈라진 rehearsal batch여야 한다
- `project_path` 가 실제 local repo를 가리켜야 한다
- live rehearsal 전에는 아래 env가 현재 Codex app session에서 보여야 한다
  - `OPENAI_API_KEY`
  - `OPENAI_RESPONSES_MODEL`
- browser rehearsal은 실행마다 짧은 고유 Playwright daemon session name을 만들어 stale page/server state를 피하되, macOS socket path length 한계도 넘지 않게 유지한다
- operator evidence를 수집할 때는 runtime/output evidence 해석이 섞이지 않도록 `smoke-qa-slice-07.mjs` 와 `smoke-qa-live-slice-07.mjs` 를 exact entrypoint 기준으로 순차 실행한다

### Scenario A: Local-Stub Canonical Flow
1. `node scripts/smoke-qa-slice-07.mjs`
2. `Mission` bootstrap -> mission create/select -> linked task -> builder approval -> builder live mutation -> reviewer -> logs/artifact landing 이 모두 닫히는지 확인한다
3. 아래 evidence를 기록한다

### Scenario B: Live Rehearsal
1. `launchctl getenv OPENAI_API_KEY`
2. `launchctl getenv OPENAI_RESPONSES_MODEL`
3. `node scripts/smoke-provider-live-slice-05.mjs`
4. `node scripts/smoke-qa-live-slice-07.mjs`
5. planner-through-preflight provider path와 mission-first browser path 둘 다 green인지 확인한다
6. 아래 evidence를 기록한다

### Triage Order
실패 시 아래 순서대로 분류한다.

1. env visibility
2. current project/bootstrap
3. council/alignment
4. execution gate
5. deliverables interpretation
6. provider external evidence

### Evidence Template
각 rehearsal 후 아래 형태로 evidence를 남긴다.

```md
- command: `node scripts/...`
  mode: `local-stub | live`
  result: `pass | fail | skipped`
  runtimeRoot: `...`
  outputRoot: `...`
  runIds: `planner / architect / task-breaker / builder / reviewer`
  artifactIds: `plan / architecture / breakdown / preflight / review / ...`
  currentGate: `...`
  approvalReviewState: `...`
  operatorFriction: `읽기 어려운 문장, 막힌 지점, handoff confusion`
```

## Stop Criteria

### Ready To Start Real Dogfooding
아래가 모두 참이면 실 테스트를 시작할 수 있다.

- local-stub canonical rehearsal이 green이다
- live representative rehearsal이 green이다
- operator가 읽기 어려운 first-use friction이 남아 있으면 batch 단위로 정리됐다
- remaining red가 있더라도 repo bug가 아닌 external condition이라는 근거가 ledger에 남아 있다

### Stop And Batch Fix
아래 중 하나면 실 테스트를 시작하지 않고 같은 성격의 thin-slice batch로 묶어 수정한다.

- local-stub path에서 repo-side regression이 재현된다
- live path에서 external issue가 아닌 repo-side regression이 재현된다
- current gate / next action / deliverables interpretation 중 하나라도 operator가 반복적으로 읽지 못한다

### Keep External Issues Separate
아래는 repo bug로 섞지 않는다.

- auth/quota/provider capacity failure
- Codex app session env invisibility
- stale Playwright daemon/socket 같은 harness collision

이 경우에는 external or harness evidence로 분류하고, 복구 후 같은 exact entrypoint를 다시 실행해 current evidence로 덮어쓴다.
