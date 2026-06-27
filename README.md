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
| Read-only growth evidence | The shell exposes `성장 증거 원장`, `개선 후보 대기열` drilldown, and a blocked `제안 검토 게이트` as evidence-derived views; `scripts/smoke-ui-slice-649.mjs` pins that they do not call providers, persist memory, mutate source, generate/apply proposals, commit, or push. |
| Local-only personalization | Recent desks, evidence density, preferred project hints, and preference reset/set controls are stored under `orchestration.ui-preferences.v1` in browser `localStorage`; they only change shell convenience and do not mutate runtime authority. |
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
  reviews, approvals, and failed or blocked work into candidate counts, candidate detail, reviewer
  questions, and a blocked proposal-review preview, but they do not persist memory, generate/apply
  proposals, call providers, mutate source, commit, or push.
- Personalization is local convenience only: recent desks, evidence density, preferred project hints,
  and preference reset/set controls live in browser storage and are surfaced as shortcuts or prefilled
  context, not automatic execution.
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
find scripts -maxdepth 1 -type f -name 'smoke-*.mjs' | wc -l      # 846 smoke files
find scripts -maxdepth 1 -type f -name '*qa-slice*.mjs' | wc -l   # 10 QA slice files
find scripts -maxdepth 1 -type f -name 'smoke-ui-slice-*.mjs' | wc -l # 649 UI smoke files
```

Representative verification commands:

```bash
node scripts/smoke-ui-slice-649.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
node scripts/smoke-qa-slice-07.mjs
```

Current verification evidence from this README refresh:

- `node scripts/smoke-ui-slice-649.mjs`: reference-driven shell markers, read-only growth candidate
  drilldown, blocked proposal-review preview, local-only personalization settings, and blocked
  provider/memory/source/proposal/commit/push authority.
- `node scripts/smoke-readme-scope-evidence.mjs`: README structure, source-backed counts, route
  list, missing env-template/package notes, and honesty patterns.
- `node scripts/ui_qa_status.mjs`: required UI QA checks `27/27`; snapshot reachability is
  informational and may be skipped when the local UI server is not running.
- `node scripts/verification_status.mjs`: required `1/1`; informational count includes the README
  source-evidence smoke.
- `node scripts/smoke-qa-slice-07.mjs`: representative local browser/runtime QA path covering
  Mission, linked task, builder approval, builder live mutation, reviewer, artifacts, logs, and
  duplicate guards.

Recent local visual QA evidence for the refreshed shell was captured with the local UI server and
Playwright CLI:

- `output/playwright/vnext-desktop-top-final.png`
- `output/playwright/vnext-mobile.png`
- `output/playwright/vnext-p1-desktop.png`
- `output/playwright/vnext-p1-mobile.png`

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
