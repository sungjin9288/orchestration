# Orchestration 1.0

Local-first AI workflow control plane for running development work with explicit project context,
execution state, review gates, approval gates, logs, and artifacts.

> Status: PoC / MVP-quality local project. This is a single-user, local-first implementation, not a
> distributed orchestration service or hosted team platform.

## Why I Built This

AI coding workflows often fail in the gaps between steps: missing project context, unclear execution
order, weak review evidence, and hidden approval boundaries. Orchestration 1.0 explores that control
plane layer directly: a local project is registered, a mission or task is created, execution moves
through bounded stages, and every meaningful output is inspectable through logs, artifacts, review,
and approvals.

## Features

| Feature | Evidence-backed scope |
| --- | --- |
| Local project registry | `project_path` is required before execution; local project state is managed by `src/runtime/runtime-service.js`. |
| Mission-first shell | `Mission / Council / Execution / Deliverables` is the default product shell in `ui/app.js`. |
| Advanced Ops surfaces | `Taskboard / Logs / Artifacts / Decision Inbox` remain available as authoritative operator surfaces. |
| Reference-driven operator shell | `docs/reference/vnext-reference-driven-ui-audit.md` records what was adopted or rejected from Linear, LangSmith Studio, Retool, Dify, n8n HITL, Zapier, and NN/g before the UI refresh. |
| Read-only growth evidence | The shell exposes `성장 증거 원장`, `개선 후보 대기열` drilldown, grouped failure patterns, current-snapshot regression comparison, rollback evidence links, and a blocked `제안 검토 게이트` as evidence-derived views; `scripts/smoke-ui-slice-649.mjs` pins that they do not call providers, persist memory, create/persist durable proposal records, mutate source, generate/apply proposals, commit, or push. |
| Local-only personalization | Recent desks, evidence density, preferred project hints, copyable preference review, preference reset/set controls, and a blocked long-term memory readiness gate stay local-only; browser `localStorage` under `orchestration.ui-preferences.v1` only changes shell convenience and the review packet is not an import/apply path. |
| Authority expansion review | `docs/26_authority-expansion-review-spec.md` records the shared read-only request contract for future durable proposal records, memory persistence, provider calls, or source mutation; it does not approve implementation or open any authority. |
| Development pack loop | The implemented pack flow is documented in `packs/development/pack.md`: planner, architect, task-breaker, builder preflight, builder live mutation, reviewer, commit-package, local commit, release-package, close-out. |
| Review and approval gates | Review-before-done and approval-before-commit/release follow-up are enforced through runtime/coordinator state and surfaced in Decision Inbox. |
| Local artifact store | Runtime state and artifacts are persisted through `src/runtime/file-store.js`; no external database is required. |
| Provider boundary | `local-stub` is the default. `openai-responses` exists as an explicit opt-in adapter for planner-through-reviewer roles. |
| Local UI/API server | `scripts/serve-ui-slice-01.mjs` serves the static UI plus local JSON endpoints for demo and smoke flows. |

## Tech Stack

| Area | Current implementation |
| --- | --- |
| Runtime | Node.js, CommonJS runtime modules in `src/runtime/*.js` |
| Execution | Node.js coordinator and provider adapters in `src/execution/*.js` |
| UI | Static HTML/CSS/JavaScript in `ui/index.html`, `ui/styles.css`, `ui/app.js` |
| Persistence | Local file store rooted by `--runtime-root` |
| Verification | Node smoke scripts using `node:assert/strict`; representative browser/runtime QA through project scripts |
| Dependencies | No root `package.json` is present on current head, so the documented local-stub path uses Node.js and built-in modules only. |

## Architecture

```text
ui/
  Mission / Council / Execution / Deliverables
  Advanced Ops: Taskboard / Logs / Artifacts / Decision Inbox
  Read-only growth evidence + local-only personalization
        |
scripts/serve-ui-slice-01.mjs
  local HTTP wrapper for UI, snapshot, artifact, log, and action endpoints
        |
src/runtime/runtime-service.js
  project, mission, task, run, artifact, decision, review, approval state
        |
src/execution/execution-coordinator.js
  planner -> architect -> task-breaker -> builder -> reviewer
  commit-package -> local commit -> release-package -> close-out
        |
src/execution/providers/
  local-stub default adapter
  openai-responses explicit opt-in adapter
        |
src/runtime/file-store.js
  local state and artifact persistence under the selected runtime root
```

## Key Design Decisions

- `local-first / single-user-first / ops-first`: repo files and local state define the workflow;
  team workspace, OAuth, messenger, ranking, and org-management semantics are out of scope.
- `development` pack only: v1 is intentionally narrow and does not implement a pack marketplace.
- `project_path` before execution: every execution must be tied to an explicit local project path.
- Review before done: task completion depends on review evidence, not just a successful run.
- Approval before commit and release follow-up: commit-package and release-package prepare approval
  records; local commit and close-out consume the approved provenance later.
- Reference-driven design without cloning: the current shell borrows low-noise navigation, traceable
  operator state, permission-aware density, and human approval posture from adjacent tools while
  keeping Orchestration's local project and evidence boundary intact.
- Growth is evidence review, not model training: growth surfaces can summarize local runs, artifacts,
  reviews, approvals, and failed or blocked work into candidate counts, candidate detail, grouped
  failure patterns, current-snapshot regression comparison, rollback evidence links, reviewer
  questions, and a blocked proposal-review preview, but they do not persist memory, generate/apply
  proposals, create or persist durable proposal records, call providers, mutate source, commit, or push.
- Proposal review is not proposal approval: `DEC-048` separates review from application, while
  `DEC-050` and `docs/24_proposal-review-decision-spec.md` define the schema, separated
  review/create/apply gates, expiry, supersession, and stop conditions. Durable record creation and
  persistence now exist only through the approved local runtime path; application remains blocked.
- Personalization is local convenience only: recent desks, evidence density, preferred project hints,
  and preference reset/set controls live in browser storage and are surfaced as shortcuts or prefilled
  context, not automatic execution.
- Long-term memory is readiness only: `DEC-049` keeps raw transcript ingestion, durable memory
  persistence, cross-workspace memory, and skill promotion blocked until schema, source refs,
  redaction, export, expiry, human review, and focused smoke evidence exist. `DEC-051` and
  `docs/25_memory-readiness-decision-spec.md` now define the current read-only memory item schema,
  source/redaction rules, export/deletion gates, expiry, and stop conditions before any persistence
  path can open.
- Authority expansion review is not implementation approval: `DEC-052` and
  `docs/26_authority-expansion-review-spec.md` define request fields, candidate authority paths,
  separated readiness/planning/implementation/application gates, stop conditions, rollback refs,
  and verification requirements before a later approved slice can open any durable proposal,
  memory, provider, source mutation, commit, or push authority.
- Authority implementation decision packet is decision input only: `DEC-053` and
  `docs/27_authority-implementation-decision-packet.md` list the operator decision outcomes,
  required fields, still-blocked authority, rollback refs, focused smoke refs, and aggregate
  verification ref needed before a later implementation plan can open exactly one authority path.
- Durable proposal record planning preview is not planning approval: `DEC-054` and
  `docs/28_durable-proposal-record-planning-preview.md` define the record shape, local-first
  storage candidate, focused smoke preview, rollback preview, and stop conditions for the
  recommended first candidate, but they do not approve planning, create or persist records, apply
  proposals, persist memory, call providers, mutate source, commit, or push.
- Operator decision handoff is not approval: `DEC-055` and
  `docs/29_operator-decision-handoff.md` provide the copy-ready decision fields, valid statement
  shapes, invalid shortcuts, minimum planning-only acceptance, still-blocked authority, and stop
  conditions that led to the accepted planning-only decision, but they do not approve
  implementation, persistence, provider calls, memory, source mutation, commit, or push.
- Durable proposal record implementation plan is consumed decision evidence: `DEC-056` and
  `docs/30_durable-proposal-record-implementation-plan.md` record the accepted
  `approve-planning-only` decision plus the implementation plan, rollback plan, focused smoke plan,
  and implementation decision for local durable proposal record creation and persistence, but they do
  not approve applying proposals, calling providers, persisting memory, mutating source, committing,
  or pushing.
- Durable proposal record creation and persistence is implemented: `DEC-057` adds the approved
  local runtime path for `proposalRecords` in the selected `state.json`. Created records keep
  `applyAllowed=false`; proposal application, provider calls, memory persistence, source mutation,
  commit, and push remain blocked.
- Proposal application decision packet is decision input only: `DEC-058` and
  `docs/31_proposal-application-decision-packet.md` define application decision options, required
  fields, application boundary, stop conditions, still-blocked authority, rollback refs, focused
  smoke refs, and aggregate verification refs before any durable proposal record can be applied.
- Proposal application operator decision handoff is not approval: `DEC-059` and
  `docs/32_proposal-application-operator-decision-handoff.md` provide copy-ready application
  planning and implementation statement shapes, invalid shortcuts, minimum acceptance criteria,
  still-blocked authority, and stop conditions. The accepted planning-only decision consumes this
  handoff as evidence, but it still does not open application implementation authority.
- Proposal application implementation plan is planning-only evidence: `DEC-060` and
  `docs/33_proposal-application-implementation-plan.md` record the accepted
  `approve-application-planning-only` decision, audit-only application attempt plan, rollback plan,
  focused smoke plan, and implementation prerequisites, but they do not approve proposal
  application implementation, provider calls, memory persistence, source mutation, commit, or push.
- Proposal application implementation decision handoff is not approval: `DEC-061` and
  `docs/34_proposal-application-implementation-decision-handoff.md` provide copy-ready approval and
  rejection statement shapes for exactly one audit-only application attempt path. The handoff does
  not record an implementation decision or open proposal generation, source mutation, provider
  calls, memory persistence, commit, or push.
- Proposal application audit-only attempt is implemented: `DEC-062` and
  `docs/35_proposal-application-implementation.md` add one approved local runtime path that records
  inert application attempt evidence under `proposalApplicationAttempts`. It does not generate
  proposals, call providers, persist memory, mutate source, commit, or push.
- Proposal application source mutation decision packet is decision input only: `DEC-063` and
  `docs/36_proposal-application-source-mutation-decision-packet.md` define source mutation decision
  outcomes, required fields, application attempt refs, rollback refs, focused smoke refs, and stop
  conditions before any source mutation planning or implementation can open.
- Local-demo-only release boundary: release-package and close-out do not push, publish, merge, or
  call an external release system.
- Provider opt-in stays bounded: OpenAI Responses support is an explicit adapter path and does not
  replace the default local-stub baseline.

## Getting Started

Prerequisites:

- Node.js
- A local git worktree to use as `project_path`
- No `npm install` step is documented for current head because root `package.json` is not present.
- Root `.env.example` is not present. Optional live-provider variables are listed below from source
  usage instead of an env template.

Run the local UI/API server:

```bash
node scripts/serve-ui-slice-01.mjs --runtime-root /tmp/orchestration-demo-runtime
```

Open the local shell:

```text
http://127.0.0.1:4310/
```

Check the snapshot endpoint:

```bash
curl http://127.0.0.1:4310/api/snapshot
```

Run the basic local-stub API flow:

```bash
curl -X POST http://127.0.0.1:4310/api/projects \
  -H 'content-type: application/json' \
  -d '{"name":"Local demo","projectPath":"/absolute/path/to/this/repo"}'

curl -X POST http://127.0.0.1:4310/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Demo task","intent":"Verify local-stub planner flow."}'

curl -X POST http://127.0.0.1:4310/api/tasks/task-0001/run-planner \
  -H 'content-type: application/json' \
  -d '{}'
```

Current-head local API evidence was rechecked on 2026-06-23 with:

```bash
node scripts/serve-ui-slice-01.mjs --port 4324 --runtime-root /tmp/orchestration-local-demo-readme-check-20260623
```

Observed result:

```json
{
  "ok": true,
  "projectId": "project-0001",
  "taskId": "task-0001",
  "plannerRunId": "run-0001",
  "plannerArtifactId": "artifact-0001"
}
```

## API / Usage

`scripts/serve-ui-slice-01.mjs` defines the local demo endpoints. Common routes include:

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/snapshot` | Read the current runtime snapshot. |
| `GET` | `/api/runs/:runId/logs` | Read stored logs for a run. |
| `GET` | `/api/artifacts/:artifactId` | Read artifact metadata/content preview. |
| `POST` | `/api/projects` | Register a project with `name` and `projectPath`. |
| `POST` | `/api/projects/:projectId/select` | Select the active project. |
| `POST` | `/api/projects/:projectId/provider-config` | Set non-secret provider config metadata. |
| `POST` | `/api/projects/:projectId/linked-worktrees` | Create/select a linked worktree project. |
| `POST` | `/api/missions` | Create a mission, optionally with council autodraft. |
| `POST` | `/api/missions/:missionId/select` | Select a mission. |
| `POST` | `/api/missions/:missionId/create-linked-task` | Create the mission-linked task. |
| `POST` | `/api/missions/:missionId/draft-council` | Draft a council session for the mission. |
| `POST` | `/api/missions/:missionId/approve-council` | Approve council alignment and start the bounded execution chain. |
| `POST` | `/api/tasks` | Create a task under the active project. |
| `POST` | `/api/tasks/:taskId/run-planner` | Run planner. |
| `POST` | `/api/tasks/:taskId/run-architect` | Run architect. |
| `POST` | `/api/tasks/:taskId/run-task-breaker` | Run task-breaker. |
| `POST` | `/api/tasks/:taskId/run-builder-preflight` | Run builder preflight. |
| `POST` | `/api/tasks/:taskId/request-builder-live-mutation-approval` | Request builder live-mutation approval. |
| `POST` | `/api/tasks/:taskId/run-builder-live-mutation` | Run approved bounded live mutation. |
| `POST` | `/api/tasks/:taskId/run-reviewer` | Run reviewer. |
| `POST` | `/api/tasks/:taskId/run-commit-package` | Prepare commit package and approval. |
| `POST` | `/api/tasks/:taskId/run-local-commit` | Execute approved local commit. |
| `POST` | `/api/tasks/:taskId/run-release-package` | Prepare local-demo-only release package and approval. |
| `POST` | `/api/tasks/:taskId/run-close-out` | Finalize approved close-out. |
| `POST` | `/api/decision-inbox/:itemId/actions` | Approve, reject, or resolve a pending inbox item. |

Optional live-provider environment variables used by source:

| Variable | Source-backed purpose |
| --- | --- |
| `OPENAI_API_KEY` | Secret read from process env by the OpenAI Responses adapter when a project explicitly opts in. |
| `OPENAI_RESPONSES_MODEL` | Optional real-live smoke/model selection variable used by live-provider scripts. |
| `OPENAI_RESPONSES_TIMEOUT_MS` | Optional adapter timeout override. |
| `OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS` | Optional retry attempt override. |
| `OPENAI_RESPONSES_RETRY_DELAY_MS` | Optional retry delay override. |

## Testing

This repo uses source and runtime smoke scripts rather than a conventional unit-test suite. The
counts below are file counts from current head, not a claim about passed test cases.

```bash
find scripts -maxdepth 1 -type f -name 'smoke-*.mjs' | wc -l      # 848 smoke files
find scripts -maxdepth 1 -type f -name '*qa-slice*.mjs' | wc -l   # 10 QA slice files
find scripts -maxdepth 1 -type f -name 'smoke-ui-slice-*.mjs' | wc -l # 649 UI smoke files
```

Representative verification commands:

```bash
node scripts/smoke-ui-slice-649.mjs
node scripts/vnext-growth-dashboard-evidence-depth-status.mjs
node scripts/vnext-memory-readiness-decision-spec-status.mjs
node scripts/vnext-authority-expansion-review-status.mjs
node scripts/vnext-authority-implementation-decision-packet-status.mjs
node scripts/vnext-durable-proposal-record-planning-preview-status.mjs
node scripts/vnext-operator-decision-handoff-status.mjs
node scripts/vnext-durable-proposal-record-implementation-plan-status.mjs
node scripts/smoke-durable-proposal-record-creation.mjs
node scripts/vnext-durable-proposal-record-implementation-status.mjs
node scripts/vnext-proposal-application-decision-packet-status.mjs
node scripts/vnext-proposal-application-operator-decision-handoff-status.mjs
node scripts/vnext-proposal-application-implementation-plan-status.mjs
node scripts/vnext-proposal-application-implementation-decision-handoff-status.mjs
node scripts/smoke-proposal-application-attempt-creation.mjs
node scripts/vnext-proposal-application-implementation-status.mjs
node scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
node scripts/smoke-qa-slice-07.mjs
```

Current verification evidence from this README refresh:

- `node scripts/smoke-ui-slice-649.mjs`: reference-driven shell markers, read-only growth candidate
  drilldown, grouped failure patterns, regression comparison, rollback evidence links, blocked
  proposal-review preview, local-only personalization settings, and blocked provider/memory/
  proposal-record/source/proposal/commit/push authority.
- `node scripts/vnext-growth-dashboard-evidence-depth-status.mjs`: Growth Evidence Ledger dashboard
  depth stays display-only while grouped failure patterns, regression comparison, and rollback
  evidence links are source-checked.
- `node scripts/vnext-memory-readiness-decision-spec-status.mjs`: memory item contract, source and
  redaction rules, review gates, export, expiry, deletion, and blocked memory/provider/source/commit
  authority.
- `node scripts/vnext-authority-expansion-review-status.mjs`: authority expansion request fields,
  candidate authority paths, approval separation, stop conditions, rollback refs, and focused smoke
  requirements stay read-only.
- `node scripts/vnext-authority-implementation-decision-packet-status.mjs`: operator decision
  outcomes, required decision fields, recommended first candidate, still-blocked authority, rollback
  refs, focused smoke refs, and aggregate verification ref stay read-only.
- `node scripts/vnext-durable-proposal-record-planning-preview-status.mjs`: durable proposal record
  shape, local-first storage candidate, focused smoke preview, rollback preview, and stop conditions
  stay planning input only and do not open record creation, persistence, proposal application,
  provider, memory, source mutation, commit, or push authority.
- `node scripts/vnext-operator-decision-handoff-status.mjs`: operator decision fields, valid
  statements, invalid shortcuts, minimum planning-only acceptance, still-blocked authority, and stop
  conditions stay source-checked as the consumed planning-only handoff and do not open
  implementation, persistence, provider, memory, source mutation, commit, or push authority.
- `node scripts/vnext-durable-proposal-record-implementation-plan-status.mjs`: accepted
  planning-only decision, implementation plan, rollback plan, focused smoke plan, and record contract
  remain source-checked as the planning artifact.
- `node scripts/smoke-durable-proposal-record-creation.mjs`: approved runtime creation requires an
  implementation approval payload and source, negative, reviewer, and approval refs; the created
  record persists to local `state.json` with `proposal-record-0001`, `applyAllowed=false`, blocked
  application/provider/memory/source/commit/push actions, and rollback quarantine evidence.
- `node scripts/vnext-durable-proposal-record-implementation-status.mjs`: source-checks the runtime
  contract, file-store normalization, service API, read-only UI ledger, focused smoke, and aggregate
  registration for the approved creation/persistence slice.
- `node scripts/vnext-proposal-application-decision-packet-status.mjs`: source-checks the read-only
  proposal application decision packet, required application decision fields, still-blocked
  application/provider/memory/source/commit/push authority, upstream proposal review spec, and
  durable proposal record implementation evidence.
- `node scripts/vnext-proposal-application-operator-decision-handoff-status.mjs`: source-checks the
  copy-ready application decision handoff, valid planning/implementation statement shapes, invalid
  shortcuts, minimum acceptance criteria, still-blocked authority, upstream application decision
  packet, durable proposal record implementation evidence, and consumed planning-only decision
  evidence.
- `node scripts/vnext-proposal-application-implementation-plan-status.mjs`: source-checks the
  accepted planning-only application decision, audit-only application attempt plan, rollback plan,
  focused smoke plan, implementation prerequisites, still-blocked authority, upstream application
  packet/handoff evidence, and aggregate registration.
- `node scripts/vnext-proposal-application-implementation-decision-handoff-status.mjs`: source-checks
  the copy-ready implementation approval and rejection statement shapes, invalid shortcuts, minimum
  acceptance criteria, still-blocked authority, upstream planning evidence, and aggregate
  registration without recording an implementation decision.
- `node scripts/smoke-proposal-application-attempt-creation.mjs`: proves the approved audit-only
  runtime path creates `proposal-application-attempt-0001`, persists it under local
  `proposalApplicationAttempts`, rejects missing approval, missing records, expired or quarantined
  records, missing evidence refs, duplicate attempts, and keeps proposal generation/provider/memory/
  source/commit/push authority false.
- `node scripts/vnext-proposal-application-implementation-status.mjs`: source-checks the runtime
  contract, file-store normalization, service API, read-only UI marker, implementation doc, focused
  smoke, and aggregate registration for the approved audit-only application attempt slice.
- `node scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs`: source-checks
  the read-only source mutation decision packet, required operator fields, application-attempt
  dependency, rollback refs, focused smoke refs, stop conditions, and still-blocked
  provider/memory/source/commit/push authority before any source mutation planning can open.
- `node scripts/smoke-readme-scope-evidence.mjs`: README structure, source-backed counts, route
  list, missing env-template/package notes, and honesty patterns.
- `node scripts/ui_qa_status.mjs`: required UI QA checks `27/27`; snapshot reachability is
  informational and may be skipped when the local UI server is not running.
- `node scripts/verification_status.mjs`: required `1/1`, informational `158/158`, total `159/159`;
  the aggregate includes the README source-evidence smoke, vNext memory readiness decision spec,
  read-only growth dashboard evidence depth, authority expansion review, and authority implementation
  decision packet plus durable proposal record planning preview, operator decision handoff, and
  durable proposal record implementation plan, implementation, proposal application decision packet,
  proposal application operator decision handoff, proposal application implementation plan, and
  proposal application implementation decision handoff, proposal application attempt creation smoke,
  and proposal application implementation status checks.
- `node scripts/smoke-qa-slice-07.mjs`: representative local browser/runtime QA path covering
  Mission, linked task, builder approval, builder live mutation, reviewer, artifacts, logs, and
  duplicate guards.

Recent local visual QA evidence for the refreshed shell was captured with the local UI server and
Playwright CLI:

- `output/playwright/vnext-desktop-top-final.png`
- `output/playwright/vnext-mobile.png`
- `output/playwright/vnext-p1-desktop.png`
- `output/playwright/vnext-p1-mobile.png`
- `output/playwright/vnext-proposal-boundary-desktop.png`
- `output/playwright/vnext-proposal-boundary-mobile.png`
- `output/playwright/vnext-proposal-boundary-mobile-growth.png`
- `output/playwright/vnext-memory-boundary-desktop.png`
- `output/playwright/vnext-memory-boundary-mobile-readiness.png`
- `output/playwright/vnext-memory-boundary-gate-element.png`

## Scope & Limitations

- This is a local-first PoC/MVP-quality project, not a hosted service.
- The default path is single-user and local-stub based.
- No public hosted demo URL is verified for reviewer access.
- Root `.env.example` and root `package.json` are not present on current head.
- Optional OpenAI live-provider verification requires visible `OPENAI_API_KEY` and
  `OPENAI_RESPONSES_MODEL`; when those env vars are missing, live-provider checks are skipped rather
  than treated as required failures.
- Growth evidence and personalization are shell-level views only. Candidate drilldown and the proposal
  review preview are not proof of model learning, long-term memory, durable proposal record creation,
  autonomous proposal application, source mutation, commit, push, or external automation.
- Durable proposal record creation and persistence are implemented only for approved local runtime
  records under `proposalRecords` in the selected `state.json`. This does not approve proposal
  application, provider calls, memory persistence, source mutation, commit, or push.
- Proposal application remains decision-gated. `docs/31_proposal-application-decision-packet.md`
  is read-only input and does not apply records, generate proposals, call providers, persist memory,
  mutate source, commit, or push.
- `docs/32_proposal-application-operator-decision-handoff.md` is consumed planning-only decision
  evidence. It does not approve implementation, apply records, mutate source, call providers,
  persist memory, commit, or push.
- `docs/33_proposal-application-implementation-plan.md` is planning-only evidence. It records an
  accepted application planning decision and does not approve application implementation, source
  mutation, provider calls, memory persistence, commit, or push.
- Long-term memory storage remains blocked until an accepted decision defines memory item schema,
  source/evidence refs, workspace applicability, raw transcript exclusion, redaction, export, expiry,
  deletion, human review, and focused smoke coverage for unchanged provider/source/commit/push
  boundaries.
- Authority expansion review remains a review contract. `DEC-057` implements the approved durable
  proposal record creation/persistence slice, but proposal application, memory persistence, provider
  calls, source mutation, commit, and push still require a later explicit decision, rollback evidence,
  focused smoke coverage, and aggregate verification.
- Durable proposal record planning preview is consumed by the accepted planning-only decision.
  `docs/28_durable-proposal-record-planning-preview.md` does not create or persist records, assign
  ids or timestamps, mutate queues, apply proposals, call providers, persist memory, mutate source,
  commit, or push.
- Operator decision handoff is consumed by the accepted planning-only decision.
  `docs/29_operator-decision-handoff.md` still records the exact fields and valid statement shapes
  that made the decision auditable, but ambiguous shortcuts such as `continue`, `approve all`, or
  `implement vNext` still do not open implementation, proposal application, memory, provider, source
  mutation, commit, or push authority.
- Proposal application implementation planning is accepted and the audit-only attempt path is implemented.
  `docs/33_proposal-application-implementation-plan.md` records the audit-only application attempt
  plan and focused smoke plan; the implemented path still does not apply proposals, mutate source,
  call providers, persist memory, commit, or push.
- Proposal application implementation decision handoff is read-only input.
  `docs/34_proposal-application-implementation-decision-handoff.md` defines approval and rejection
  statement shapes, but it does not record an implementation decision or open proposal application
  implementation, source mutation, provider calls, memory persistence, commit, or push.
- Proposal application audit-only attempt creation is implemented.
  `docs/35_proposal-application-implementation.md` records the approved inert local attempt path, but
  it does not generate proposals, mutate proposal source, call providers, persist memory, mutate
  project source files, commit, or push.
- Proposal application source mutation remains decision-gated.
  `docs/36_proposal-application-source-mutation-decision-packet.md` is read-only input for a later
  source mutation decision. It does not plan source mutation, implement source mutation, call
  providers, persist memory, commit, or push.
- The shipped local release path is local-demo-only: no push, publish, merge, or external release
  automation is executed by release-package or close-out.
- Multi-user workspace, OAuth, messenger-first workflows, ranking, HR/org-management, provider
  marketplace, and non-development packs are outside v1 scope.
- The screenshot and screencast evidence are local artifacts, not proof of an accessible hosted app.
- Verification counts are measured file counts or command results; this README avoids unsupported
  performance, cost, accuracy, automation-rate, or adoption metrics.

## Links

- GitHub: [sungjin9288/orchestration](https://github.com/sungjin9288/orchestration)
- Operating rules: [AGENTS.md](./AGENTS.md)
- Design rules: [DESIGN.md](./DESIGN.md)
- Completion gate inventory: [docs/22_completion-gate-inventory.md](./docs/22_completion-gate-inventory.md)
- Local demo checklist: [docs/local-demo-checklist.md](./docs/local-demo-checklist.md)
- Evidence manifest: [evidence/evidence_manifest.md](./evidence/evidence_manifest.md)
- Screenshots: [evidence/screenshots/](./evidence/screenshots/)
- Demo: no verified hosted public demo URL. Recorded local demo plan:
  [docs/public-demo-screencast-plan.md](./docs/public-demo-screencast-plan.md)
