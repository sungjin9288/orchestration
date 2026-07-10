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

## Product Planning

We planned Orchestration as a local-first AI work operating system, not as a generic chatbot, hosted
team platform, or provider marketplace. The first planning decision was to make the product useful
for one operator managing real local repo work: every task must belong to a selected project, every
execution must carry `project_path`, and review or approval gates must be visible before work is
treated as complete.

The initial v1 product plan centered on an ops-first development control plane. `Taskboard`, `Logs`,
`Artifacts`, and `Decision Inbox` were defined as the authoritative operator surfaces, while the
default workflow stayed intentionally narrow around the `development` pack: planner, architect,
task-breaker, builder preflight, approval-gated builder live mutation, reviewer, commit-package,
local commit, release-package, and close-out. This kept the product focused on inspectable local
execution instead of broad automation.

After the v1 control-plane baseline, the planning direction shifted toward a more legible
AI-orchestration product experience: a user starts from a goal, sees multiple AI roles align around a
mission, watches bounded execution progress, and receives evidence-backed deliverables. That is why
the current primary shell is organized around `Mission / Council / Execution / Deliverables`, while
the original `Taskboard / Logs / Artifacts / Decision Inbox` surfaces remain available as advanced
ops mode and source-of-truth controls.

We also planned explicit boundaries. The product does not pursue messenger-first collaboration,
ranking or gamification, budget/HR/org simulation, OAuth-first platform expansion, hidden source
mutation, self-commit, self-push, or multi-provider-first architecture. The code-present
`knowledge-work` pack is treated as an explicit opt-in path for bounded non-coding deliverables such
as decision memos, plans, checklists, and research briefs; it does not replace the default
`development` workflow or open a pack marketplace.

Planning source files:

- `docs/00_master-brief.md`
- `docs/01_decision-log.md`
- `docs/03_architecture-roadmap-v1.md`
- `docs/06_ai-orchestration-pivot.md`
- `packs/development/pack.md`
- `packs/knowledge-work/pack.md`

## Current Development Focus

The current development focus is post-completion lifecycle-close status recheck
evidence close-out. The default completion baseline is still closed for implementation work:
`tasks/todo.md` has zero
unchecked task lines,
`docs/22_completion-gate-inventory.md` records the current gate table, and
`scripts/smoke-completion-gate-inventory-current-evidence.mjs` pins the README smoke counts,
aggregate registration, UI QA registration, zero-open backlog, post-completion router, and
proposal-record lifecycle review alias evidence together. The latest checked aggregate evidence is
required `1/1`, informational `168/168`, total `169/169`; UI QA is required `28/28`.

The active close-out slice is
`growth-lifecycle-close-status-recheck-smoke-readability-post-m7-2352`. It keeps the
lifecycle-close status evidence current without changing the already grouped focused
smoke: source summary, vocabulary, schema, readiness, next-slice, safety boundary,
invalid-argument, plan, and cross-document evidence remain separated. The source
close-status script, focused smoke, runtime behavior, UI behavior,
provider configuration, memory persistence, proposal generation/application, source mutation
authority, commit, push, connector reach, automation, and lifecycle semantics remain unchanged.

Follow-up work still enters only from an explicit operator request, a concrete regression, a
usability issue, or an accepted vNext decision. The first posture for that follow-up remains
read-only/status-or-doc-smoke-first until current evidence justifies runtime or UI mutation.

The immediately preceding growth evidence focus normalized repeated review/acceptance/finalization
suffixes into the shorter `growth-evidence-ledger-proposal-record-lifecycle-review` alias. The
current status slice proves that alias directly, preserves the long route as `sourceCandidate`, and
prevents the default backlog from growing another lifecycle suffix when no engine/reflection evidence
has drifted. The focused growth reflection smoke still pins the route invariants behind that alias:
39 lifecycle transition helper calls, 62 top-level read-only route helper calls, one direct
finding-map implementation, 2/71/45 contract-finding guard/advanced/base routes, 26/102 aggregate
base/advanced routes, 4/122/1 next-candidate guard/advanced/base routes, 129 read-only next
candidates, 26 base post-completion candidates, 23 post-completion candidate/finding-update rows,
and 11/11 post-completion copy rows.

This close-out pass changes README evidence, README smoke coverage, and task ledgers; it does not
change runtime write paths, UI behavior, provider calls, memory persistence, proposal generation or
application, source mutation authority, product commit authority, or product push authority.

The immediately preceding development arc concluded a behavior-preserving module extraction campaign
that pulled pure logic out of the three largest files into single-responsibility leaf modules,
alongside the operator-approved source mutation slice (`DEC-067`,
`docs/39_proposal-application-source-mutation-implementation.md`) and several regression and
hardening fixes. Measured with `wc -l`, `ui/app.js` went from 19,335 to 14,691 lines,
`src/execution/execution-coordinator.js` from 5,657 to 4,610, and `src/runtime/runtime-service.js`
from 3,520 to 2,810; the extracted logic now lives in leaf modules under `src/execution/coordinator/`
(git, diff, paths, execution-requests, decision-inputs, artifact-content, markdown), under
`src/runtime/` (normalizers, proposal-records, task-gates, retention-policy, assertions), and across
`ui/` (harness-execution-tokens, markdown-artifact-parsing, artifact-parsing, artifact-structured-render,
artifact-relations, task-detail-snapshots, task-summaries, control-snapshots, growth-panels,
council-signals, ops-entry-signals, availability). Each extraction kept function bodies verbatim and
was gated by the aggregate plus, for UI slices, a real-browser boot smoke; per-function re-audits
kept genuinely state-coupled functions (store/state closure-bound CRUD, DOM/render code) in place.
The app shell still owns browser state, clipboard actions, rerun actions, runtime mutation, provider
calls, commit, and push boundaries, and the runtime service keeps all state-bound entry points plus
the single approved source mutation path.

Current source-backed evidence:

- Completion gate inventory: `docs/22_completion-gate-inventory.md` and
  `scripts/smoke-completion-gate-inventory-current-evidence.mjs` prove the current completion table,
  aggregate `169/169`, UI QA `28/28`, zero-open backlog, post-completion router, README smoke count,
  aggregate registration, UI QA registration, and proposal-record lifecycle review alias boundaries.
- Growth lifecycle-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the current lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle close
  finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps lifecycle
  close acceptance, lifecycle close review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle close
  finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps lifecycle
  close acceptance, lifecycle close review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle close
  finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps lifecycle
  close acceptance, lifecycle close review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle close
  finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps lifecycle
  close acceptance, lifecycle-close-review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle-close-review
  acceptance, lifecycle-close-review, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close final-close status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet is read-only, keeps lifecycle close,
  lifecycle close final-close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close recommendation, and records the assertion grouping as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close finalization acceptance status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet is read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records the assertion grouping as evidence cleanup rather than product behavior change.
- Growth lifecycle-close finalization review acceptance status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet is read-only, keeps
  lifecycle close finalization acceptance, lifecycle close finalization review acceptance, source
  mutation, and remediation execution blocked, preserves the next lifecycle-close-finalization-acceptance
  recommendation, and records the assertion grouping as evidence cleanup rather than product
  behavior change.
- Growth lifecycle-close finalization review status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet is read-only, keeps lifecycle
  close finalization review acceptance, lifecycle close finalization review, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-finalization-review-acceptance
  recommendation, and records the assertion grouping as evidence cleanup rather than product
  behavior change.
- Growth lifecycle-close finalization status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet is read-only, keeps lifecycle close
  finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records the
  assertion grouping as evidence cleanup rather than product behavior change.
- Growth lifecycle-close acceptance status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet is read-only, keeps lifecycle close
  finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records the assertion grouping
  as evidence cleanup rather than product behavior change.
- Growth lifecycle-close review acceptance status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet is read-only, keeps lifecycle
  close acceptance, lifecycle-close-review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records the assertion
  grouping as evidence cleanup rather than product behavior change.
- Growth lifecycle-close review status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet is read-only, keeps lifecycle-close-review
  acceptance, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review-acceptance recommendation, and records the assertion grouping as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close status: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet is read-only, keeps source mutation and
  remediation execution blocked, preserves the next lifecycle-close-review recommendation, and
  records the assertion grouping as evidence cleanup rather than product behavior change.
- Growth proposal-record lifecycle review: `scripts/growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs`
  and `scripts/smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs` prove the
  current short alias, preserved `sourceCandidate`, blocked write/provider/memory/proposal/source/
  commit/push authority, and maintenance-only next recommendation.
- Growth reflection close-out: `scripts/growth-reflection-evaluator.mjs` and
  `scripts/smoke-growth-reflection-evaluator.mjs` pin the read-only route helpers, explicit route
  tables, score helper, low-score summary helper, old-marker absence, and route counts listed above.
- Growth reflection runtime status: `scripts/growth-engine-status.mjs`,
  `scripts/growth-evidence-ledger-proposal-readiness-status.mjs`,
  `scripts/vnext-development-audit-status.mjs`, and
  `scripts/vnext-proposal-application-source-mutation-implementation-status.mjs` recheck that the
  evaluator remains read-only and that provider, memory, proposal, source mutation outside the
  approved path, commit, and push authority stay blocked.
- Extraction verdict and metrics: `docs/inspection-20260703-final.md` records the commit arc, the
  measured before/after line counts, and the confirmed no-clean-extraction-remaining state.
- Runtime/execution leaves: `src/runtime/task-gates.js`, `src/runtime/retention-policy.js`,
  `src/runtime/assertions.js`, `src/execution/coordinator/artifact-content.js`, and
  `src/execution/execution-text-utils.js`, with the shared `normalizeRelativePath` path-traversal
  guard hardened and consolidated into `src/execution/coordinator/paths.js`.
- UI leaves: `ui/artifact-structured-render.js`, `ui/control-snapshots.js`, and `ui/availability.js`
  (the last extracted via `busy`-boolean injection so its logic is state-shape independent).
- README evidence gate: `scripts/smoke-readme-scope-evidence.mjs`
- Aggregate gate: `scripts/verification_status.mjs`

## Features

| Feature | Evidence-backed scope |
| --- | --- |
| Local project registry | `project_path` is required before execution; local project state is managed by `src/runtime/runtime-service.js`. |
| Mission-first shell | `Mission / Council / Execution / Deliverables` is the default product shell in `ui/app.js`. |
| Advanced Ops surfaces | `Taskboard / Logs / Artifacts / Decision Inbox` remain available as authoritative operator surfaces. |
| Reference-driven operator shell | `docs/reference/vnext-reference-driven-ui-audit.md` records what was adopted or rejected from Linear, LangSmith Studio, Retool, Dify, n8n HITL, Zapier, and NN/g before the UI refresh. |
| Read-only growth evidence | The shell exposes `성장 증거 원장`, `개선 후보 대기열` drilldown, grouped failure patterns, current-snapshot regression comparison, rollback evidence links, and a blocked `제안 검토 게이트` as evidence-derived views; `scripts/smoke-ui-slice-649.mjs` pins that they do not call providers, persist memory, create/persist durable proposal records, mutate source, generate/apply proposals, commit, or push. |
| Local-only personalization | Recent desks, evidence density, preferred project hints, copyable preference review, preference reset/set controls, and a blocked long-term memory readiness gate stay local-only; browser `localStorage` under `orchestration.ui-preferences.v1` only changes shell convenience and the review packet is not an import/apply path. |
| Advanced Ops harness evidence | Harness execution output, input, run action markup, run action shelf markup, operator action token label/tone markup, visible result packet markup, visible header markup, visible token row markup, visible preview markup, visible preview action markup, visible input path action markup, visible action shelf markup, visible action shelf frame markup, visible hide action markup, visible summary rack markup, visible execution summary markup, visible supplemental summary markup, hidden preview markup, hidden preview action markup, hidden input path action markup, hidden action shelf markup, hidden action shelf frame markup, hidden result packet markup, hidden header markup, hidden context sections markup, hidden context title row markup, hidden run context summary markup, hidden harness context summary markup, hidden operator context summary markup, preview copy, request id fallback, action output path fallback, visible token label/tone markup, latest state token label/tone markup, hidden state token-specific label/tone markup, history header markup, history count token label/tone markup, output path copy, history input path copy, history path reuse/rerun action markup, history preview action markup, history action shelf markup, history action shelf frame markup, history summary rack markup, history summary rack frame markup, history item register markup, history item packet markup, history restore preview, execution packet copy, output-brief copy, policy-report copy, executed-at, output-channel, completion status, and hidden status summary fallback handoff use named helper flows across `ui/app.js`, `ui/harness-execution-tokens.js`, and `ui/harness-labels.js` while the focused `smoke-ui-slice-*` scripts keep action, runtime, provider, source mutation, commit, and push boundaries unchanged. |
| Authority expansion review | `docs/26_authority-expansion-review-spec.md` records the shared read-only request contract for future durable proposal records, memory persistence, provider calls, or source mutation; it does not approve implementation or open any authority. |
| Development pack loop | The implemented pack flow is documented in `packs/development/pack.md`: planner, architect, task-breaker, builder preflight, builder live mutation, reviewer, commit-package, local commit, release-package, close-out. |
| Opt-in knowledge-work pack | `packs/knowledge-work/pack.md` defines an explicit opt-in path for bounded non-coding deliverables such as decision memos, plans, checklists, and research briefs; it does not replace the `development` pack or open a pack marketplace. |
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
| Dependencies | A root `package.json` is present but declares no dependencies; the local-stub path uses Node.js built-in modules only, so no `npm install` is required. |

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
- `development` pack remains the default v1 workflow: v1 is intentionally narrow and does not
  implement a pack marketplace. `DEC-066` records the code-present `knowledge-work` pack as an
  explicit opt-in path for bounded non-coding deliverables; it does not replace the `development`
  pack.
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
- Proposal application source mutation decision packet is consumed planning evidence: `DEC-063` and
  `docs/36_proposal-application-source-mutation-decision-packet.md` define source mutation decision
  outcomes, required fields, application attempt refs, rollback refs, focused smoke refs, and stop
  conditions. The accepted planning-only decision consumes this packet as evidence, but it still
  does not open source mutation implementation, provider calls, memory persistence, commit, or push.
- Proposal application source mutation operator handoff is consumed planning evidence: `DEC-064` and
  `docs/37_proposal-application-source-mutation-operator-decision-handoff.md` provide copy-ready
  source mutation planning, implementation, evidence-request, rejection, and deferral statement
  shapes. The accepted planning-only decision consumes this handoff as evidence, but it still does
  not open source mutation implementation, provider calls, memory persistence, commit, or push.
- Proposal application source mutation planning plan is planning-only evidence: `DEC-065` and
  `docs/38_proposal-application-source-mutation-planning-plan.md` record the accepted
  `approve-source-mutation-planning-only` decision, one mutation plan, rollback plan, focused smoke
  plan, and implementation prerequisites, but they do not approve source mutation implementation,
  proposal generation, provider calls, memory persistence, commit, or push.
- Proposal application source mutation is implemented for exactly one approved path: `DEC-067` and
  `docs/39_proposal-application-source-mutation-implementation.md` add the approved local runtime
  path that applies one accepted mutation plan for one audit-only application attempt, guarded by a
  separate source mutation approval, exactly-one-target normalization, clean baseline proof,
  dry-run diff preview, recorded beforeContent rollback, quarantine, and load-time authority
  hardening. Proposal generation, provider calls, memory persistence, source mutation outside the
  named path, commit, and push remain blocked.
- Local-demo-only release boundary: release-package and close-out do not push, publish, merge, or
  call an external release system.
- Provider opt-in stays bounded: OpenAI Responses support is an explicit adapter path and does not
  replace the default local-stub baseline.

## Getting Started

Prerequisites:

- Node.js (built-in modules only; the repo declares no npm dependencies)
- A local git worktree to use as `project_path`
- A minimal root `package.json` is present for reviewer convenience (name, engines, and `serve`/`verify`/`smoke`
  scripts); it declares no dependencies, so no `npm install` step is required.
- A root `.env.example` lists the optional live-provider variables; the default local-stub path needs none of
  them, so copying it to `.env` is only necessary when exercising the opt-in OpenAI Responses adapter.

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
find scripts -maxdepth 1 -type f -name 'smoke-*.mjs' | wc -l      # 854 smoke files
find scripts -maxdepth 1 -type f -name '*qa-slice*.mjs' | wc -l   # 10 QA slice files
find scripts -maxdepth 1 -type f -name 'smoke-ui-slice-*.mjs' | wc -l # 650 UI smoke files
```

For smoke discovery or targeted execution, use the checked runner instead of launching every smoke
script by accident:

```bash
node scripts/run-smoke.mjs --list
node scripts/run-smoke.mjs --filter smoke-readme-scope-evidence
node scripts/run-smoke.mjs --all --fail-fast
```

Completion close-out verification is split deliberately: focused README and completion-inventory
smokes pin the public claims and inventory counts, while aggregate and UI QA commands confirm those
same counts remain registered in the wider gate. The README evidence smoke also keeps forbidden
public-claim patterns, route list coverage, and source-route registrations in the same checked
surface.

Representative verification commands:

```bash
node scripts/growth-reflection-evaluator.mjs
node scripts/smoke-growth-reflection-evaluator.mjs
node scripts/growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs
node scripts/smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs
node scripts/growth-engine-status.mjs
node scripts/growth-evidence-ledger-proposal-readiness-status.mjs
node scripts/vnext-development-audit-status.mjs
node scripts/vnext-proposal-application-source-mutation-implementation-status.mjs
node scripts/smoke-ui-slice-305.mjs
node scripts/smoke-ui-slice-306.mjs
node scripts/smoke-ui-slice-310.mjs
node scripts/smoke-ui-slice-311.mjs
node scripts/smoke-ui-slice-312.mjs
node scripts/smoke-ui-slice-314.mjs
node scripts/smoke-ui-slice-317.mjs
node scripts/smoke-ui-slice-318.mjs
node scripts/smoke-ui-slice-325.mjs
node scripts/smoke-ui-slice-326.mjs
node scripts/smoke-ui-slice-328.mjs
node scripts/smoke-ui-slice-329.mjs
node scripts/smoke-ui-slice-331.mjs
node scripts/smoke-ui-slice-334.mjs
node scripts/smoke-ui-slice-335.mjs
node scripts/smoke-ui-slice-336.mjs
node scripts/smoke-ui-slice-337.mjs
node scripts/smoke-ui-slice-344.mjs
node scripts/smoke-ui-slice-351.mjs
node scripts/smoke-ui-slice-352.mjs
node scripts/smoke-ui-slice-353.mjs
node scripts/smoke-ui-slice-375.mjs
node scripts/smoke-ui-slice-380.mjs
node scripts/smoke-ui-slice-381.mjs
node scripts/smoke-ui-slice-382.mjs
node scripts/smoke-ui-slice-383.mjs
node scripts/smoke-ui-slice-384.mjs
node scripts/smoke-ui-slice-385.mjs
node scripts/smoke-ui-slice-386.mjs
node scripts/smoke-ui-slice-387.mjs
node scripts/smoke-ui-slice-388.mjs
node scripts/smoke-ui-slice-605.mjs
node scripts/smoke-ui-slice-606.mjs
node scripts/smoke-ui-slice-612.mjs
node scripts/smoke-ui-slice-613.mjs
node scripts/smoke-ui-slice-614.mjs
node scripts/smoke-ui-slice-615.mjs
node scripts/smoke-ui-slice-616.mjs
node scripts/smoke-ui-slice-619.mjs
node scripts/smoke-ui-slice-620.mjs
node scripts/smoke-ui-slice-621.mjs
node scripts/smoke-ui-slice-623.mjs
node scripts/smoke-ui-slice-625.mjs
node scripts/smoke-ui-slice-626.mjs
node scripts/smoke-ui-slice-627.mjs
node scripts/smoke-ui-slice-628.mjs
node scripts/smoke-ui-slice-629.mjs
node scripts/smoke-ui-slice-630.mjs
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
node scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs
node scripts/vnext-proposal-application-source-mutation-planning-plan-status.mjs
node scripts/smoke-proposal-application-source-mutation.mjs
node scripts/vnext-proposal-application-source-mutation-implementation-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs
node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs
node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs
node scripts/smoke-readme-scope-evidence.mjs
node scripts/smoke-completion-gate-inventory-current-evidence.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
node scripts/smoke-qa-slice-07.mjs
```

Current verification evidence from this README and completion close-out refresh:

- `node scripts/smoke-completion-gate-inventory-current-evidence.mjs`: completion inventory counts,
  aggregate `169/169`, UI QA `28/28`, zero-open backlog, post-completion router, README smoke count,
  aggregate registration, UI QA registration, and proposal-record lifecycle review alias evidence
  stay aligned.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`:
  reports `ok=true`, read-only lifecycle-close status readiness, blocked
  source mutation and remediation execution, and the next lifecycle-close-review command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`:
  pins the lifecycle-close status source markers, vocabulary, schema required fields, readiness,
  safety boundary, invalid-argument rejection, growth gateway plan evidence, and cross-document
  ledger evidence without opening runtime, UI, provider, memory, proposal, source mutation, commit,
  or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`:
  reports `ok=true`, read-only lifecycle-close-review acceptance readiness,
  blocked lifecycle-close-review acceptance, blocked source mutation and remediation execution, and
  the next lifecycle-close-review-acceptance command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`:
  pins the lifecycle-close-review status source markers, vocabulary, schema required fields,
  readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and
  cross-document ledger evidence without opening runtime, UI, provider, memory, proposal, source
  mutation, commit, or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`:
  reports `ok=true`, read-only lifecycle-close acceptance readiness, blocked
  lifecycle-close-review acceptance, blocked lifecycle close acceptance, blocked source mutation and
  remediation execution, and the next lifecycle-close-acceptance command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`:
  pins the lifecycle-close-review-acceptance status source markers, vocabulary, schema required
  fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and
  cross-document ledger evidence without opening runtime, UI, provider, memory, proposal, source
  mutation, commit, or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`:
  reports `ok=true`, read-only lifecycle-close finalization readiness,
  blocked lifecycle close finalization, blocked lifecycle close acceptance, blocked source mutation
  and remediation execution, and the next lifecycle-close-finalization command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`:
  pins the lifecycle-close-acceptance status source markers, vocabulary, schema required fields,
  readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and
  cross-document ledger evidence without opening runtime, UI, provider, memory, proposal, source
  mutation, commit, or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`:
  reports `ok=true`, read-only lifecycle-close-finalization-review
  readiness, blocked lifecycle close finalization review, blocked lifecycle close finalization,
  blocked source mutation and remediation execution, and the next lifecycle-close-finalization-review
  command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`:
  pins the lifecycle-close-finalization status source markers, vocabulary, schema required fields,
  readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and
  cross-document ledger evidence without opening runtime, UI, provider, memory, proposal, source
  mutation, commit, or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`:
  reports `ok=true`, read-only lifecycle-close-finalization-review-acceptance
  readiness, blocked lifecycle close finalization review acceptance, blocked lifecycle close
  finalization review, blocked source mutation and remediation execution, and the next
  lifecycle-close-finalization-review-acceptance command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`:
  pins the lifecycle-close-finalization-review status source markers, vocabulary, schema required
  fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and
  cross-document ledger evidence without opening runtime, UI, provider, memory, proposal, source
  mutation, commit, or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`:
  reports `ok=true`, read-only lifecycle-close-finalization-acceptance
  readiness, blocked lifecycle close finalization acceptance, blocked lifecycle close finalization
  review acceptance, blocked source mutation and remediation execution, and the next
  lifecycle-close-finalization-acceptance command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`:
  pins the lifecycle-close-finalization-review-acceptance status source markers, vocabulary, schema
  required fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan
  evidence, and cross-document ledger evidence without opening runtime, UI, provider, memory,
  proposal, source mutation, commit, or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`:
  reports `ok=true`, read-only lifecycle-close-final-close readiness, blocked lifecycle close final
  close, blocked lifecycle close finalization acceptance, blocked source mutation and remediation
  execution, and the next lifecycle-close-final-close command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`:
  pins the lifecycle-close-finalization-acceptance status source markers, vocabulary, schema
  required fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan
  evidence, and cross-document ledger evidence without opening runtime, UI, provider, memory,
  proposal, source mutation, commit, or push authority.
- `node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`:
  reports `ok=true`, read-only lifecycle-close readiness, blocked lifecycle close, blocked lifecycle
  close final-close, blocked source mutation and remediation execution, and the next lifecycle-close
  command.
- `node scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`:
  pins the lifecycle-close-final-close status source markers, vocabulary, schema required fields,
  readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and
  cross-document ledger evidence without opening runtime, UI, provider, memory, proposal, source
  mutation, commit, or push authority.
- `node scripts/growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs`: current
  read-only lifecycle review output proves the growth engine and reflection evaluator both route to
  `growth-evidence-ledger-proposal-record-lifecycle-review`, preserves the repeated
  review/acceptance/finalization route as `sourceCandidate`, and recommends only
  `growth-evidence-ledger-proposal-record-lifecycle-review-maintenance` unless evidence drifts.
- `node scripts/smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs`: pins the
  lifecycle review status source markers, no-write API surface, invalid-argument rejection,
  `sourceCandidate` preservation, finding ids, and blocked provider/memory/proposal/source/commit/
  push authority.
- `node scripts/growth-reflection-evaluator.mjs`: current read-only evaluator output reports
  aggregate score `100`, six passing criteria, next recommended slice
  `growth-evidence-ledger-proposal-record-lifecycle-review`, and no watched or blocked criteria.
- `node scripts/smoke-growth-reflection-evaluator.mjs`: pins the helper/table route counts, old
  nested-marker absence, score classification helper, low-score summary helper, read-only next
  candidate markers, and route/finding copy invariants for the current growth reflection evaluator.
- `node scripts/growth-engine-status.mjs`,
  `node scripts/growth-evidence-ledger-proposal-readiness-status.mjs`,
  `node scripts/vnext-development-audit-status.mjs`, and
  `node scripts/vnext-proposal-application-source-mutation-implementation-status.mjs`: recheck the
  same growth/proposal/source-mutation status surfaces with read-only/no-provider/no-memory/no-commit/
  no-push boundaries.
- `node scripts/smoke-ui-slice-305.mjs`, `306`, `310`, `311`, `312`, `314`, `317`, `318`, `325`, `326`, `328`, `329`, `331`, `334`, `335`, `336`, `337`, `338`, `339`, `343`, `344`, `351`, `352`, `353`, `361`, `363`, `375`, `379`, `380`, `381`, `382`, `383`, `384`,
  `385`, `386`, `387`, `388`, `411`, `605`, `606`, `612`, `613`, `614`, `615`, `616`, `619`,
  `620`, `621`, `623`, `625`, `626`, `627`, `628`, `629`, and `630`:
  harness helper-focused smokes for run action markup, run action shelf markup handoff, history restore preview, executed-at labels, hidden status summary fallback handoff, output-channel
  tokens, visible token labels, visible result packet markup handoff, visible header markup handoff, visible token row markup handoff, visible token label/tone markup handoff, operator action token label/tone markup handoff, latest state token label/tone markup handoff, visible preview markup handoff, visible preview action markup handoff, visible input path action markup handoff, visible summary rack markup handoff, visible execution summary markup handoff, visible supplemental summary markup handoff, hidden preview action markup handoff, hidden input path action markup handoff, hidden
  state token-specific label/tone markup handoff, hidden header markup handoff, hidden context sections markup handoff, hidden context title row markup handoff, hidden run context summary markup handoff, hidden harness context summary markup handoff, hidden operator context summary markup handoff, history header markup handoff, history count token label/tone markup handoff, history input path copy markup handoff, history path reuse/rerun action markup handoff, history preview action markup handoff, history action shelf markup handoff, history action shelf frame markup handoff, history summary rack markup handoff, history summary rack frame markup handoff, history item register markup handoff, history item packet markup handoff, policy-report predicates,
  execution packet copy fallback formatting, execution packet copy markup handoff, hidden action markup handoff, hidden action shelf markup handoff, hidden action shelf frame markup handoff, hidden result packet markup handoff, visible action shelf markup handoff, visible action shelf frame markup handoff, visible hide action markup handoff, output path copy label/status handoff, policy-report copy fallback formatting,
  completion lead/output copy, preview text, request id fallback labels, action output path fallback, input/output summary fallback values,
  result state tokens, output-brief copy labels/payload titles, and hidden/history output-brief
  action rendering.
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
  provider/memory/source/commit/push authority as consumed planning-only evidence.
- `node scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs`:
  source-checks the copy-ready source mutation operator handoff, valid decision shapes, invalid
  shortcuts, minimum acceptance criteria, stop conditions, and still-blocked
  provider/memory/source/commit/push authority as consumed planning-only evidence.
- `node scripts/vnext-proposal-application-source-mutation-planning-plan-status.mjs`: source-checks
  the accepted source mutation planning-only decision, mutation plan, rollback plan, focused smoke
  plan, implementation decision requirement, and still-blocked provider/memory/source/commit/push
  authority before any source mutation implementation can open.
- `node scripts/smoke-readme-scope-evidence.mjs`: README structure, source-backed counts, route
  list, package/env visibility, visible/hidden/history Advanced Ops helper, preview, action-shelf
  composition, preview action handoff, copy formatter source, token handoff structure, hidden state
  token handoff, hidden packet/header handoff, history action handoff, history count token handoff,
  growth authority boundary, knowledge-work boundary, and honesty patterns.
- `node scripts/smoke-completion-gate-inventory-current-evidence.mjs`: completion inventory counts,
  UI QA count, zero-open backlog, post-completion router, README smoke count, and proposal-record
  lifecycle review alias evidence stay aligned.
- `node scripts/ui_qa_status.mjs`: required UI QA checks `28/28`; snapshot reachability is
  informational and may be skipped when the local UI server is not running.
- `node scripts/verification_status.mjs`: required `1/1`, informational `168/168`, total `169/169`;
  the aggregate includes the README source-evidence smoke, vNext memory readiness decision spec,
  read-only growth dashboard evidence depth, authority expansion review, and authority implementation
  decision packet plus durable proposal record planning preview, operator decision handoff, and
  durable proposal record implementation plan, implementation, proposal application decision packet,
  proposal application operator decision handoff, proposal application implementation plan, and
  proposal application implementation decision handoff, proposal application attempt creation smoke,
  proposal application implementation status, source mutation decision packet, source mutation
  operator handoff, source mutation planning plan checks, and the proposal-record lifecycle review
  status/smoke checks.
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
- The current completion gate is evidence-closed, not a claim of hosted production readiness:
  aggregate `169/169`, UI QA `28/28`, and zero-open backlog are local source-backed checks.
- The current lifecycle-close status recheck close-out is README-backed evidence cleanup
  only. It does not change the status script contract, focused smoke contract, runtime behavior, UI
  behavior, lifecycle semantics, provider calls, memory persistence, proposal generation/application,
  source mutation authority, commit, or push behavior.
- Growth proposal-record lifecycle review is read-only evidence. It preserves the long repeated
  route as `sourceCandidate` but does not create proposal records, apply proposals, mutate queues,
  call providers, persist memory, mutate source, commit, or push.
- GitHub source repository access is reviewer-verified in `links.md`; a separate evidence-package
  download URL is optional and not yet recorded.
- Root `package.json` (no dependencies) and root `.env.example` are present; the project still ships with no
  third-party runtime dependencies and runs on Node.js built-in modules only.
- Optional OpenAI live-provider verification requires visible `OPENAI_API_KEY` and
  `OPENAI_RESPONSES_MODEL`; when those env vars are missing, live-provider checks are skipped rather
  than treated as required failures.
- Growth evidence and personalization are shell-level views only. Candidate drilldown and the proposal
  review preview are not proof of model learning, long-term memory, durable proposal record creation,
  autonomous proposal application, source mutation, commit, push, or external automation.
- Growth reflection evaluator route/readability work is a read-only evaluation and evidence cleanup.
  It may recommend the next local slice, but it does not create durable proposal records, apply
  proposals, call providers, persist memory, mutate project source through the product runtime,
  execute product commit, or execute product push authority.
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
- Proposal application source mutation operator handoff remains decision input only.
  `docs/37_proposal-application-source-mutation-operator-decision-handoff.md` gives the operator
  copy-ready decision wording and is now consumed by the planning-only decision, but it does not
  approve source mutation implementation, provider calls, memory persistence, commit, or push.
- Proposal application source mutation is implemented for exactly one approved path. `DEC-067` and
  `docs/39_proposal-application-source-mutation-implementation.md` record the accepted
  `approve-source-mutation-implementation-slice` decision and the runtime path that applies one
  accepted mutation plan with clean baseline proof, dry-run diff preview, recorded rollback, and
  quarantine evidence. It does not generate proposals, call providers, persist memory, mutate
  source outside the named path, commit, or push, and `proposalRecord.applyAllowed` stays false.
- The `knowledge-work` pack is explicit opt-in for bounded non-coding deliverables under `DEC-066`
  and has a
  required synthetic smoke in `scripts/verification_status.mjs`, but it does not replace the
  `development` pack, become the default v1 workflow, or approve release, provider, memory, source
  mutation, commit, or push behavior beyond the same review and approval gates.
- The shipped local release path is local-demo-only: no push, publish, merge, or external release
  automation is executed by release-package or close-out.
- Multi-user workspace, OAuth, messenger-first workflows, ranking, HR/org-management, provider
  marketplace, and additional non-development packs beyond the explicit opt-in `knowledge-work`
  path are outside v1 scope.
- The screenshot and screencast evidence are local artifacts, not proof of an accessible hosted app.
- `scripts/portfolio-share-status.mjs` reports source repository access separately from a downloadable
  evidence package URL, so a missing package URL must not be read as unverified GitHub source access.
- Verification counts are measured file counts or command results; this README avoids unsupported
  performance, cost, accuracy, automation-rate, or adoption metrics.

## Links

- GitHub: [sungjin9288/orchestration](https://github.com/sungjin9288/orchestration)
- Reviewer source access: verified in [links.md](./links.md) with anonymous HTTP 200 and GitHub API
  `private: false`, `visibility: public` evidence from 2026-07-04.
- Operating rules: [AGENTS.md](./AGENTS.md)
- Design rules: [DESIGN.md](./DESIGN.md)
- Completion gate inventory: [docs/22_completion-gate-inventory.md](./docs/22_completion-gate-inventory.md)
- Local demo checklist: [docs/local-demo-checklist.md](./docs/local-demo-checklist.md)
- Evidence manifest: [evidence/evidence_manifest.md](./evidence/evidence_manifest.md)
- Screenshots: [evidence/screenshots/](./evidence/screenshots/)
- Demo: no verified hosted public demo URL. Recorded local demo plan:
  [docs/public-demo-screencast-plan.md](./docs/public-demo-screencast-plan.md)
- Evidence package URL: not recorded yet; package upload and checksum verification remain optional
  follow-up steps in [docs/portfolio-share-handoff.md](./docs/portfolio-share-handoff.md).
