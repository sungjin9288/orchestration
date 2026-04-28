# Development Closeout Plan

## Purpose
This document records the current pre-commit development closeout state. It does not
stage, commit, push, widen runtime behavior, or change product scope.

## Worktree Bundle Classification

### Bundle 1: Primary UI/UX Shell
Scope:
- `ui/app.js`
- `ui/index.html`
- `ui/styles.css`
- UI smoke slices that pin primary shell, workspace guidance, execution packet, and
  result/handoff affordances

Intent:
- make the user-facing shell clearer about what each surface does
- keep Mission, Council, Execution, Deliverables, and Advanced Ops paths visible
- preserve local-first runtime, approval, reviewer, artifact, and snapshot semantics

Commit posture:
- review as the largest UI bundle before staging
- do not split `ui/app.js` mechanically unless a hunk review shows a safe boundary

### Bundle 2: Harness And Local Execution Utilities
Scope:
- `scripts/harness-registry.mjs`
- `scripts/harness_verification_status.mjs`
- `scripts/markitdown-convert.mjs`
- `scripts/memory-brief.mjs`
- `scripts/prompt-provenance-guard.mjs`
- `scripts/verification-output-brief.mjs`
- `scripts/work-quality-guard.mjs`
- `scripts/smoke-harness-slice-38.mjs` through `scripts/smoke-harness-slice-43.mjs`
- updated harness smoke contracts

Intent:
- keep external repository signals as local, source-only, policy-anchored helpers
- expose no-write Markitdown policy reporting before conversion
- preserve approved harness dispatch and freeze semantics

Commit posture:
- stage with harness docs and harness smoke updates
- keep provider/live execution out of this bundle unless separately approved

### Bundle 3: Verification Aggregates And Doc Guards
Scope:
- `scripts/ui_qa_status.mjs`
- `scripts/verification_status.mjs`
- `scripts/smoke-ui-slice-633.mjs` through `scripts/smoke-ui-slice-636.mjs`
- `scripts/smoke-openspace-slice-02.mjs`
- `docs/07_mission-council-slice-m6-02.md`
- `docs/08_openspace-integration-plan.md`
- `docs/09_pre-real-test-readiness.md`
- `docs/13_harness-baseline.md`

Intent:
- keep source-of-truth docs aligned with implemented current-main behavior
- keep UI QA, OpenSpace wiring, and harness verification discoverable from aggregate gates
- distinguish required synthetic checks from informational host/live checks

Commit posture:
- stage after Bundle 1 and Bundle 2 are reviewed, because this bundle documents their final verification shape

### Bundle 4: Task Ledger And Lessons
Scope:
- `tasks/todo.md`
- `tasks/lessons.md`

Intent:
- record completed slices, exact verification evidence, and reusable lessons
- keep historical context intact without reopening completed work

Commit posture:
- stage last with the bundle it describes, or as a final ledger-only commit if needed

## Verification Matrix

Required synthetic gates:
- `node scripts/ui_qa_status.mjs`
- `node scripts/harness_verification_status.mjs`
- `node scripts/verification_status.mjs`
- `node scripts/smoke-qa-slice-07.mjs`
- `git diff --check`

Source/doc guard checks:
- `node scripts/smoke-ui-slice-633.mjs`
- `node scripts/smoke-ui-slice-634.mjs`
- `node scripts/smoke-ui-slice-635.mjs`
- `node scripts/smoke-ui-slice-636.mjs`
- `node scripts/smoke-openspace-slice-02.mjs`

Live or host-dependent lanes:
- `ui_qa_status` snapshot reachability is informational unless the local UI server is running
- OpenSpace `execute_task` is host-credential dependent; `blocked_missing_host_llm_credentials`
  is a host follow-up, not repo wiring regression
- optional live-provider smokes remain non-blocking unless explicitly targeted

## Browser Evidence

Manual browser rendering evidence:
- `output/playwright/orchestration-final-desktop.png`
- `output/playwright/orchestration-final-mobile.png`

Observed browser state:
- local UI server started with `node scripts/serve-ui-slice-01.mjs --port 4315`
- desktop viewport captured at `1440x1000`
- mobile viewport captured at `390x844`
- `/api/snapshot` returned `200` with `generatedAt`
- server was stopped after capture and port `4315` had no remaining listener

Representative browser flow:
- `node scripts/smoke-qa-slice-07.mjs` passed
- flow covered project registration, mission creation, linked task creation, builder approval,
  builder live mutation, artifact/log checks, reviewer run, review artifact selection, duplicate
  guards, and secret scanning

## Commit Preparation Plan

No files are staged yet. Recommended commit order after user approval:

1. `feat`: UI/UX shell and execution packet clarity bundle.
2. `feat`: harness utility and Markitdown policy-report bundle.
3. `test`: verification aggregate and source-of-truth doc guard bundle.
4. `docs`: task ledger, lessons, and closeout plan bundle.

## Exact Staging Manifest

No staging has been performed. Use this manifest only after explicit staging/commit approval.

### Commit 1: UI/UX shell and execution packet clarity
Stage together:
- `ui/app.js`
- `ui/index.html`
- `ui/styles.css`
- `scripts/serve-ui-slice-01.mjs`
- `scripts/smoke-ui-slice-108.mjs`
- `scripts/smoke-ui-slice-265.mjs`
- `scripts/smoke-ui-slice-279.mjs`
- `scripts/smoke-ui-slice-283.mjs`
- `scripts/smoke-ui-slice-559.mjs` through `scripts/smoke-ui-slice-632.mjs`

Validation before committing this bundle:
- `node --check ui/app.js`
- `node scripts/ui_qa_status.mjs`
- `node scripts/smoke-qa-slice-07.mjs`
- `git diff --check`

### Commit 2: Harness utilities and no-write policy-report helpers
Stage together:
- `scripts/harness-registry.mjs`
- `scripts/harness_verification_status.mjs`
- `scripts/markitdown-convert.mjs`
- `scripts/memory-brief.mjs`
- `scripts/prompt-provenance-guard.mjs`
- `scripts/verification-output-brief.mjs`
- `scripts/work-quality-guard.mjs`
- `scripts/smoke-harness-slice-02.mjs`
- `scripts/smoke-harness-slice-03.mjs`
- `scripts/smoke-harness-slice-04.mjs`
- `scripts/smoke-harness-slice-05.mjs`
- `scripts/smoke-harness-slice-06.mjs`
- `scripts/smoke-harness-slice-07.mjs`
- `scripts/smoke-harness-slice-08.mjs`
- `scripts/smoke-harness-slice-09.mjs`
- `scripts/smoke-harness-slice-13.mjs`
- `scripts/smoke-harness-slice-14.mjs`
- `scripts/smoke-harness-slice-32.mjs`
- `scripts/smoke-harness-slice-37.mjs`
- `scripts/smoke-harness-slice-38.mjs` through `scripts/smoke-harness-slice-43.mjs`

Validation before committing this bundle:
- `node scripts/harness_verification_status.mjs`
- `git diff --check`

Readiness status:
- validated without staging while Commit 1 remains staged
- modified files confirmed through targeted `git diff --name-only`
- new helper and harness smoke files confirmed through targeted `git ls-files --others --exclude-standard`
- syntax checks passed for the new helper and harness smoke files
- `node scripts/harness_verification_status.mjs` passed `43/43`
- `git diff --check` passed

### Commit 3: Verification aggregates and source-of-truth doc guards
Stage together:
- `docs/07_mission-council-slice-m6-02.md`
- `docs/08_openspace-integration-plan.md`
- `docs/09_pre-real-test-readiness.md`
- `docs/13_harness-baseline.md`
- `scripts/ui_qa_status.mjs`
- `scripts/verification_status.mjs`
- `scripts/smoke-ui-slice-633.mjs`
- `scripts/smoke-ui-slice-634.mjs`
- `scripts/smoke-ui-slice-635.mjs`
- `scripts/smoke-ui-slice-636.mjs`
- `scripts/smoke-openspace-slice-02.mjs`

Note:
- `docs/13_harness-baseline.md` contains both harness and verification command documentation.
  If strict commit separation is required, patch-stage this file. Otherwise keep it in this
  verification/docs bundle so the final command list lands with the aggregate checks.

Validation before committing this bundle:
- `node scripts/smoke-ui-slice-633.mjs`
- `node scripts/smoke-ui-slice-634.mjs`
- `node scripts/smoke-ui-slice-635.mjs`
- `node scripts/smoke-ui-slice-636.mjs`
- `node scripts/smoke-openspace-slice-02.mjs`
- `node scripts/ui_qa_status.mjs`
- `node scripts/verification_status.mjs`
- `git diff --check`

### Commit 4: Closeout docs and task ledger
Stage together:
- `docs/14_development-closeout-plan.md`
- `tasks/todo.md`
- `tasks/lessons.md`

Validation before committing this bundle:
- `node scripts/ui_qa_status.mjs`
- `node scripts/harness_verification_status.mjs`
- `node scripts/verification_status.mjs`
- `git diff --check`

### Not staged by default
- `output/playwright/orchestration-final-desktop.png`
- `output/playwright/orchestration-final-mobile.png`

Reason:
- `output/` is ignored by `.gitignore`.
- These files are local browser evidence, not source artifacts.

Before any commit:
- rerun `node scripts/ui_qa_status.mjs`
- rerun `node scripts/harness_verification_status.mjs`
- rerun `node scripts/verification_status.mjs`
- rerun `git diff --check`

Commit and push remain deferred until explicit user approval.
