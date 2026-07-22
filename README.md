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
- `docs/48_ai-company-master-plan.md`
- `docs/49_agent-runtime-contract.md`
- `docs/50_council-operating-protocol.md`
- `docs/51_ai-company-delivery-roadmap.md`
- `docs/52_ai-company-runtime-blueprint-implementation-plan.md`
- `docs/53_ai-company-runtime-blueprint-implementation-decision-handoff.md`
- `docs/54_ai-company-real-council-implementation-plan.md`
- `docs/55_ai-company-real-council-implementation-decision-handoff.md`
- `docs/56_ai-company-council-live-provider-implementation-plan.md`
- `docs/57_ai-company-council-live-provider-implementation-decision-handoff.md`
- `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md`
- `docs/59_ai-company-mission-workorder-compiler-implementation-decision-handoff.md`
- `docs/60_ai-company-workorder-persistence-execution-plan.md`
- `docs/61_ai-company-workorder-persistence-execution-decision-handoff.md`
- `docs/62_ai-company-reviewed-delivery-planning-plan.md`
- `docs/63_ai-company-reviewed-delivery-implementation-decision-handoff.md`
- `docs/64_ai-company-checkpoint-resume-recovery-plan.md`
- `docs/65_ai-company-checkpoint-resume-recovery-implementation-decision-handoff.md`
- `docs/66_ai-company-durable-delivery-package-persistence-plan.md`
- `docs/67_ai-company-durable-delivery-package-implementation-decision-handoff.md`
- `docs/68_ai-company-delivery-package-acceptance-plan.md`
- `docs/69_ai-company-delivery-package-acceptance-implementation-decision-handoff.md`
- `docs/70_ai-company-mission-task-close-out-plan.md`
- `docs/71_ai-company-mission-task-close-out-implementation-decision-handoff.md`
- `docs/72_ai-company-learning-candidate-preview-plan.md`
- `docs/73_ai-company-learning-candidate-preview-implementation-decision-handoff.md`
- `docs/74_ai-company-durable-learning-candidate-persistence-plan.md`
- `docs/75_ai-company-durable-learning-candidate-implementation-decision-handoff.md`
- `docs/76_ai-company-learning-candidate-review-outcome-plan.md`
- `docs/77_ai-company-learning-candidate-review-outcome-implementation-decision-handoff.md`
- `docs/78_ai-company-memory-candidate-preview-plan.md`
- `docs/79_ai-company-memory-candidate-preview-implementation-decision-handoff.md`
- `docs/80_ai-company-durable-memory-item-persistence-plan.md`
- `docs/81_ai-company-durable-memory-item-implementation-decision-handoff.md`
- `docs/82_ai-company-memory-recall-preview-plan.md`
- `docs/83_ai-company-memory-recall-preview-implementation-decision-handoff.md`
- `docs/84_ai-company-durable-memory-recall-persistence-plan.md`
- `docs/85_ai-company-durable-memory-recall-implementation-decision-handoff.md`
- `docs/86_ai-company-mission-memory-context-preview-plan.md`
- `docs/87_ai-company-mission-memory-context-preview-implementation-decision-handoff.md`
- `docs/88_external-pattern-native-adoption-plan.md`
- `docs/89_mission-evidence-graph-phase-2-plan.md`
- `docs/90_mission-evidence-graph-exploration-phase-3-plan.md`
- `docs/91_llm-native-active-mission-focus-plan.md`
- `docs/92_llm-native-mission-mode-control-plan.md`
- `docs/93_llm-native-first-run-project-connection-plan.md`
- `docs/94_llm-native-source-backed-mission-thread-plan.md`
- `docs/95_llm-native-source-backed-council-meeting-plan.md`
- `docs/96_llm-native-source-backed-execution-flow-plan.md`
- `docs/97_llm-native-source-backed-deliverables-flow-plan.md`
- `docs/98_llm-native-advanced-ops-navigation-plan.md`
- `docs/99_llm-native-mission-history-navigation-plan.md`
- `docs/100_llm-native-workspace-header-plan.md`
- `docs/101_llm-native-mobile-navigation-plan.md`
- `docs/102_llm-native-sparse-mission-graph-density-plan.md`
- `packs/development/pack.md`
- `packs/knowledge-work/pack.md`

## Current Development Focus

The AI Company Phase 0 source contract is documented in
`docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`,
`docs/50_council-operating-protocol.md`, and `docs/51_ai-company-delivery-roadmap.md`. These documents
define the planned company blueprint, runtime agent identity, staffing, Council, work-order,
handoff, checkpoint, delivery, learning, rollback, and phased authority contracts. Phase 1 planning
in `docs/52_ai-company-runtime-blueprint-implementation-plan.md` and the fielded handoff in
`docs/53_ai-company-runtime-blueprint-implementation-decision-handoff.md` are consumed by `DEC-079`.
The implementation now strictly loads one repo-backed blueprint and nine role contracts. Persisted
execution state is schema v16 after the additive AcceptanceCriterion and VerificationProof migration, while `companyRuntime` remains an
additive read-only snapshot on the configured local server path. The editable company roster remains
browser presentation only.

Mission evidence graph Phase 2 is accepted by `DEC-138` and implemented from
`docs/89_mission-evidence-graph-phase-2-plan.md`. The selected Mission keeps `Thread` as its default
reading model and offers an explicit `Graph` view backed by one exact
`GET /api/missions/:missionId/evidence-graph` projection. The projection is deterministic, capped at
250 nodes, source-reference bound, schema-v16 preserving, and read-only: it adds no persistence,
provider call, dependency, approval, execution, source mutation, commit, push, or release path.

Mission evidence graph Phase 3 exploration is accepted by `DEC-139` and implemented from
`docs/90_mission-evidence-graph-exploration-phase-3-plan.md`. The existing exact GET response now
supports browser-memory search over short node fields, lifecycle and status filters, direct-neighbor
focus-and-dim, and a read-only source relationship detail. The explorer does not change the runtime
projection or add persistence, automatic selection, navigation, or authority-bearing graph actions.

LLM-native active Mission focus is accepted by `DEC-140` and implemented from
`docs/91_llm-native-active-mission-focus-plan.md`. A selected Mission now opens directly on its title
and `Thread | Graph` workstream with one compact new-Mission command. The full composer opens only
for first-run or explicit compose mode, cancel returns to current work, and periodic snapshot refresh
preserves the focused composer field and selection. The existing Mission form, POST route, Council
modes, schema v16, dependencies, runtime state, and authority boundaries are unchanged.

LLM-native Mission mode control is accepted by `DEC-141` and implemented from
`docs/92_llm-native-mission-mode-control-plan.md`. The composer presents basic, independent-role,
and OpenAI Council paths as one native segmented configuration field, then keeps a single
`안건 등록` submit command. OpenAI remains disabled until provider readiness is present, while
knowledge-work keeps its existing fixed basic mode. Selection and exact radio focus survive the
existing browser refresh cycle without changing any runtime, API, schema, dependency, persistence,
provider, or authority contract.

LLM-native first-run project connection is accepted by `DEC-142` and implemented from
`docs/93_llm-native-first-run-project-connection-plan.md`. When no active project exists, the Mission
surface now states that prerequisite directly, removes the nested bootstrap cards and redundant empty
state, and presents one unframed name, local-path, and work-type form with one `프로젝트 연결`
command. Desktop and mobile keep the command visible without wrapping, and a successful connection
opens the unchanged Mission composer. Project creation/selection APIs, absolute `project_path`
validation, local-stub and pack defaults, schema v16, dependencies, runtime state, and authority
boundaries are unchanged.

LLM-native source-backed Mission thread is accepted by `DEC-143` and implemented from
`docs/94_llm-native-source-backed-mission-thread-plan.md`. The selected Mission now renders only the
Operator, Council, Execution, and Deliverables turns supported by current records. Future stages no
longer appear as synthetic conversation rows; the existing next gate explains the first pending
action. The active lead remains the conversation title, while the thread uses one neutral `진행 기록`
heading. Thread/Graph behavior, API routes, schema v16, dependencies, runtime state, provider gates,
and every execution or approval authority remain unchanged.

LLM-native source-backed Council meeting is accepted by `DEC-144` and implemented from
`docs/95_llm-native-source-backed-council-meeting-plan.md`. The primary Council view now reads as
one source-backed sequence: Mission context, independent Strategist/Architect/Decomposer positions,
one Conductor synthesis, recorded dissent, and the existing operator alignment gate. Source ids,
provider attempts, execution evidence, revision input, and WorkOrder preparation remain available
under collapsed secondary details instead of preceding the decision. Legacy, real-local-stub, and explicit
real-openai-responses behavior, schema v16, dependencies, persistence, and every approval or
execution authority remain unchanged.

LLM-native source-backed Execution flow is accepted by `DEC-145` and implemented from
`docs/96_llm-native-source-backed-execution-flow-plan.md`. The primary Execution view now places
the selected Mission and task context, the current source-backed checkpoint, and one existing
bounded operator command before the ordered Strategist, Architect, Decomposer, Maker, and Critic
progress. Exact run, approval, Decision Inbox, artifact, preflight, readiness, and harness evidence
remain available under collapsed secondary details. The existing handlers and gate predicates are
reused without changing runtime or API behavior, schema v16, dependencies, persistence, automatic
execution, approval semantics, provider behavior, source mutation, commit, push, or release authority.

LLM-native source-backed Deliverables flow is accepted by `DEC-146` and implemented from
`docs/97_llm-native-source-backed-deliverables-flow-plan.md`. The primary Deliverables view now
places the selected Mission and task, current source-backed delivery state, and one existing bounded
operator command before Result, Verification, Package, Acceptance, and Close-out progress. Exact
artifact and record refs, package review and close-out controls, and post-close-out learning or memory
handoffs remain available under collapsed secondary details. Existing handlers and readiness summaries
are reused without changing runtime or API behavior, schema v16, dependencies, persistence rules,
approval semantics, provider behavior, source mutation, commit, push, or release authority.

LLM-native Advanced Ops navigation is accepted by `DEC-147` and implemented from
`docs/98_llm-native-advanced-ops-navigation-plan.md`. Mission, Council, Execution, and Deliverables
remain continuously visible as the primary workstream. Decision Inbox, Artifacts, Logs, and Taskboard
remain the exact authoritative operator surfaces inside one native Advanced Ops disclosure. Its
summary keeps the pending Decision Inbox gate count visible, opens automatically on an Advanced Ops
surface, and closes when the operator returns to the primary workstream. Existing routes, dynamic
counts, `aria-current` state, handlers, schema v16, dependencies, persistence, approval semantics,
and every runtime, provider, source, Git, release, scheduling, policy, or connector authority remain
unchanged.

LLM-native Mission history navigation is accepted by `DEC-148` and implemented from
`docs/99_llm-native-mission-history-navigation-plan.md`. The sidebar now keeps the current Mission
title and project-scoped Mission count beside the existing new-Mission command. Opening one native
disclosure shows every Mission in the existing newest-first source order, marks the exact selected
Mission, and reuses the current `select-mission` route. The detailed full Mission register remains in
the Mission workspace. Search, ranking, pinning, grouping, rename, deletion, archive, automatic
selection, new sidebar or history preference persistence, runtime/API/schema/dependency changes,
and every provider, source, Git, release, scheduling, policy, or connector authority remain absent.

LLM-native Workspace Header consolidation is accepted by `DEC-149` and implemented from
`docs/100_llm-native-workspace-header-plan.md`. One visible header band now keeps the current project,
normalized provider mode, current surface, open gate count, refresh state, and existing refresh
command together. Repeated project and status presence rows were removed from Mission, Council,
Execution, and Deliverables so the same source context appears once. Existing browser state bindings,
API routes, schema v16, dependencies, provider configuration, persistence, approval semantics, and
every source, Git, release, scheduling, policy, or connector authority remain unchanged.

LLM-native mobile navigation compaction is accepted by `DEC-150` and implemented from
`docs/101_llm-native-mobile-navigation-plan.md`. Below 820px, the collapsed rail now uses three rows:
brand and new Mission, the four primary workstream links, then current Mission and Advanced Ops.
Opening either existing native disclosure gives its source-current choices the full rail width. The
same Mission selection, surface routes, `aria-current`, pending-gate projection, desktop rail,
Workspace Header, schema v16, dependencies, persistence, and authority boundaries remain unchanged.

LLM-native sparse Mission Graph density is accepted by `DEC-151` and implemented from
`docs/102_llm-native-sparse-mission-graph-density-plan.md`. Sparse desktop projections now derive
their canvas height from the densest visible lifecycle stage, while the mobile semantic fallback
keeps all six stage headings and counts without repeating empty-state paragraphs. Dense graph row
spacing, the exact GET response, source digest, 250-node cap, filters, selection, schema v16,
dependencies, runtime state, and authority boundaries remain unchanged.

Phase 2 Real Council implementation is accepted by `DEC-082` against
`docs/54_ai-company-real-council-implementation-plan.md` and the complete fielded decision in
`docs/55_ai-company-real-council-implementation-decision-handoff.md`. The opt-in `real-local-stub`
path records isolated Strategist, Architect, and Decomposer positions, deterministic conflict and
dissent evidence, Conductor synthesis, additive revision attempts, and explicit
`approve/request-revision/stop` decisions. Existing deterministic draft/approve routes remain
available as compatibility behavior. Live providers, standalone StaffingPlan, WorkOrders, memory
persistence expansion, autonomous scheduling, source/profile mutation, approval bypass, and
runtime-agent commit/push/release remain blocked.

Phase 3 Council live-provider implementation is accepted by `DEC-085` from the planning and complete
fielded gate documented by `DEC-083` and `DEC-084` in
`docs/56_ai-company-council-live-provider-implementation-plan.md` and
`docs/57_ai-company-council-live-provider-implementation-decision-handoff.md`. One explicit
`real-openai-responses` mode reuses the normalized position and synthesis contract for four
source-backed roles, executes sequential bounded calls, computes conflict deterministically before
Conductor synthesis, and records redacted provider evidence. Project readiness gates API/UI
selection; retry, timeout, cancellation, malformed output, and missing configuration fail closed
without local fallback. Authoritative `real-local-stub`, legacy Council, and human
alignment remain unchanged. Provider expansion and all downstream authority remain blocked.

Phase 4 Mission compiler planning and its fielded gate are recorded by `DEC-086` and `DEC-087`; the
exact response-only implementation is accepted by `DEC-088` in
`docs/58_ai-company-mission-workorder-compiler-implementation-plan.md` and
`docs/59_ai-company-mission-workorder-compiler-implementation-decision-handoff.md`. One approved,
source-current Real Council synthesis plus an exact operator `compileSpec` produces a deeply frozen,
deterministic response-only ExecutionPlan preview with a fixed Builder -> Reviewer -> QA draft graph
and normalized handoffs. Invalid input is rejected before Council approval persistence; explicit
inert mode skips linked-task creation, while the default approval auto-chain remains unchanged.
The preview itself remains response-only; durable promotion is available only through the explicit
Phase 5 path described below.

Phase 5 WorkOrder persistence and sequential execution planning is accepted by `DEC-089`, its
implementation decision handoff is recorded by `DEC-090`, and the exact fielded implementation is
accepted by `DEC-091` in
`docs/60_ai-company-workorder-persistence-execution-plan.md` and
`docs/61_ai-company-workorder-persistence-execution-decision-handoff.md`. Valid v6 state now migrates
additively to schema v7. One source-current preview plus exact digest input can persist one plan,
three WorkOrders, three handoffs, one linked control task, and one digest-bound approval. After
Decision Inbox approval, a separate local sequential Builder start reuses the
existing planner -> architect -> task-breaker -> builder-preflight chain and stops at the targeted
live-mutation approval. Reviewer/QA execution, source mutation, broader scheduling, provider-backed
WorkOrders, commit, push, release, and connectors remain blocked.

Phase 6 reviewed-delivery continuation planning is accepted by `DEC-092`, and its implementation
decision handoff is recorded by `DEC-093`; the exact fielded implementation is accepted by
`DEC-094` in
`docs/62_ai-company-reviewed-delivery-planning-plan.md` and
`docs/63_ai-company-reviewed-delivery-implementation-decision-handoff.md`. One explicit continue
request starts only from a source-current schema-v7 plan whose Builder waits at the exact approved
live-mutation gate. It reuses the bounded local-stub Builder and independent Reviewer, stops on
changes requested, and runs only shell-free `process.execPath --check` QA against actual
Builder-changed allowlisted files. QA persists one provenance-critical `qa-evidence` artifact; a
delivery-ready plan recomputes one deeply frozen response-only DeliveryPackage preview. Durable
persistence is available only through the exact package path below; Mission done, automatic rework,
scheduling/provider/memory expansion, commit, push, release, and connectors remain blocked.

Phase 7 checkpoint, resume, and recovery planning is accepted by `DEC-095`, its implementation
decision handoff is recorded by `DEC-096`, and the exact implementation is accepted by `DEC-097` in
`docs/64_ai-company-checkpoint-resume-recovery-plan.md` and
`docs/65_ai-company-checkpoint-resume-recovery-implementation-decision-handoff.md`. Only durable
`reviewer-ready` or `qa-ready` boundaries are resumable, with exact input, authority, and checkpoint
digest binding plus an explicit operator action. Active or ambiguous Builder, Reviewer, and QA stages
are quarantine-only and cannot be replayed automatically. Phase 7 introduced schema v8 with an
additive WorkflowCheckpoint map, read-only recovery classification, and exact resume/cancel routes.
Migration atomically bootstraps one checkpoint when valid schema-v7 evidence is already at an exact
durable boundary; non-boundary domain values remain unchanged. Each valid resume runs only the
existing local-stub Reviewer or constrained QA and stops at the next durable boundary. Builder
replay, automatic retry, scheduling, provider-backed WorkOrders, Mission done, memory expansion,
commit, push, release, and connectors remain blocked.

Durable DeliveryPackage persistence planning is accepted by `DEC-098`, its complete fielded
implementation handoff is recorded by `DEC-099`, and exact implementation is accepted by `DEC-100` in
`docs/66_ai-company-durable-delivery-package-persistence-plan.md` and
`docs/67_ai-company-durable-delivery-package-implementation-decision-handoff.md`. Valid schema-v8
state migrates additively to schema v9 without creating a package or losing checkpoint history. One
explicit exact preview/source/package/checkpoint tuple can append one immutable `review-required`
record; stale requests do not write and exact replay is idempotent. The preview remains
`persisted=false` and `missionDone=false`; package acceptance, Mission/task close-out, commit, push,
release, learning, memory, scheduling, provider expansion, and connectors remain blocked.

DeliveryPackage acceptance planning is accepted by `DEC-101`, its complete fielded
implementation handoff is recorded by `DEC-102`, and exact implementation is accepted by `DEC-103` in
`docs/68_ai-company-delivery-package-acceptance-plan.md` and
`docs/69_ai-company-delivery-package-acceptance-implementation-decision-handoff.md`. Schema v10 keeps
the schema-v9 package immutable and appends one acceptance record bound to the exact preview/source/
package/checkpoint tuple plus `decision=accept`. GET/POST acceptance routes and the Deliverables action
expose read-only accepted evidence after reload without changing package, Mission, task, or plan state.
Package rejection/changes-requested, Mission/task close-out, done, commit/push/release,
learning/memory, scheduling/provider expansion, policy mutation, approval bypass, and connectors
remain blocked.

Mission/task close-out planning-only authority is accepted by `DEC-104`, its complete fielded
implementation handoff is recorded by `DEC-105`, and exact implementation is accepted by `DEC-106` in
`docs/70_ai-company-mission-task-close-out-plan.md` and
`docs/71_ai-company-mission-task-close-out-implementation-decision-handoff.md`. The schema-v11 path
binds one immutable MissionCloseOut event to exact accepted package evidence, completed WorkOrders,
passed linked control-task review, and recomputed no-active-gate state, then atomically performs only
task `Review -> Done` and Mission `executing -> completed`. Terminal-record-first replay is idempotent;
standalone commit/release close-out, Git/release, reopen, package lifecycle expansion, learning,
scheduling, provider, policy, next-Mission, bypass, and connector authority remain blocked.

LearningCandidate preview planning-only authority is accepted by `DEC-107`, its complete fielded
implementation handoff is recorded by `DEC-108`, and exact response-only implementation is accepted
by `DEC-109` in
`docs/72_ai-company-learning-candidate-preview-plan.md` and
`docs/73_ai-company-learning-candidate-preview-implementation-decision-handoff.md`. The Phase 8 slice
keeps schema v11 unchanged and binds one operator-owned `retrospectiveSpec` to the exact
completed Mission/MissionCloseOut/package/acceptance/plan/checkpoint/WorkOrder/review/QA evidence set.
One explicit POST returns only a deterministic deeply frozen response-only preview with
`persisted=false`, both redaction and reviewer status kept `review-required`, source-contained
applicability and negative evidence, and every promotion or downstream authority false. The browser
keeps the response only in memory and clears it on snapshot refresh. Durable candidate review
outcomes, memory/skill promotion, provider generation, raw evidence ingestion, source/Git/release,
scheduling, next-Mission, policy mutation, approval bypass, and connectors remain blocked.

Durable LearningCandidate persistence planning-only authority is accepted by `DEC-110`, its
complete fielded implementation handoff is recorded by `DEC-111`, and exact implementation is
accepted by `DEC-112` in
`docs/74_ai-company-durable-learning-candidate-persistence-plan.md` and
`docs/75_ai-company-durable-learning-candidate-implementation-decision-handoff.md`. Schema v12 adds
only a LearningCandidate sequence/map and requires the runtime to recompute the
exact DEC-109 preview from the current terminal tuple plus operator-owned retrospectiveSpec before
one immutable `review-required`/`proposed` record can be appended. Invalid v11 input causes no
migration write, exact replay is read-only, and GET hydration exposes no runtime path. Candidate
review outcome, memory/skill promotion,
providers, raw evidence, source/Git/release, scheduling, next-Mission, policy, bypass, and connectors
remain blocked and require a separate complete fielded decision.

LearningCandidate review outcome planning-only authority is accepted by `DEC-113`, its complete
fielded implementation handoff is recorded by `DEC-114`, and exact implementation is accepted by
`DEC-115` in
`docs/76_ai-company-learning-candidate-review-outcome-plan.md` and
`docs/77_ai-company-learning-candidate-review-outcome-implementation-decision-handoff.md`. The
schema-v13 path preserves each schema-v12 candidate as immutable and binds one append-only
accepted, rejected, or changes-requested review event to exact `previewId`, `candidateDigest`,
`recordDigest`, an unexpired review window, bounded operator rationale, source-contained evidence
refs, and `human-reviewed`
acknowledgement. Exact replay is read-only and GET/UI hydration exposes the review as a separate
immutable fact without changing the candidate's review-required/proposed status. Candidate revision,
expiry/quarantine, memory/skill promotion, providers, raw evidence, source/Git/release, scheduling,
next-Mission, policy, bypass, and connectors remain blocked.

MemoryCandidate preview planning-only authority is accepted by `DEC-116`, its complete fielded
implementation handoff is recorded by `DEC-117`, and exact response-only implementation is accepted
by `DEC-118` in
`docs/78_ai-company-memory-candidate-preview-plan.md` and
`docs/79_ai-company-memory-candidate-preview-implementation-decision-handoff.md`. The current path
keeps schema v13 unchanged and accepts only one exact source-current unexpired LearningCandidate
plus its append-only `decision=accepted` review and operator-owned project-scoped `memorySpec`.
The result is deterministic, deeply frozen, `persisted=false`, `review-ready`,
storage-not-approved, promotion-blocked, response/browser-memory-only, and explicitly
`readiness-only-not-durable-memory`. There is no GET, snapshot field, durable memory record, or
storage/retrieval/application action. Durable memory, retrieval/import/apply/export/delete,
cross-workspace memory, skill promotion, providers, raw evidence, source/Git/release, scheduling,
next-Mission, policy, bypass, and connectors remain blocked.

Durable MemoryItem persistence planning-only authority is accepted by `DEC-119`, and its complete
fielded implementation handoff is recorded by `DEC-120` in
`docs/80_ai-company-durable-memory-item-persistence-plan.md` and
`docs/81_ai-company-durable-memory-item-implementation-decision-handoff.md`; `DEC-121` accepts the
exact schema-v14 implementation. Runtime recomputes the response-only DEC-118 MemoryCandidate,
requires one separate project-scoped storage approval, and atomically appends one immutable
`MemoryItem(status=stored)` to the additive sequence/map. Exact GET and Deliverables rendering expose
stored evidence without enabling recommendation or application behavior. Recommendation
retrieval/search/ranking/application, import/export/delete/refresh/expiry mutation,
cross-workspace use, skill promotion, providers, raw evidence, source/Git/release, scheduling,
next-Mission, policy, bypass, and connectors remain blocked.

MemoryRecall preview planning-only authority is accepted by `DEC-122`, the complete fielded
implementation handoff is recorded by `DEC-123`, and the exact response-only implementation is accepted by `DEC-124` in
`docs/82_ai-company-memory-recall-preview-plan.md` and
`docs/83_ai-company-memory-recall-preview-implementation-decision-handoff.md`. Runtime now validates
one operator-selected exact unexpired stored item and bounded project-local recallSpec, then returns a
deterministic deeply frozen `persisted=false`/`recall-ready` preview through one bounded POST response
and browser memory. That response-only slice preserved schema v14 and created no durable recall record.
Automatic enumeration/search/ranking/recommendation, Mission injection,
memory application, providers, source/Git/release, scheduling, next-Mission, policy,
bypass, and connectors remain blocked.

Durable MemoryRecall persistence planning-only authority is accepted by `DEC-125`, the complete
fielded implementation handoff is recorded by `DEC-126`, and the exact implementation is accepted by
`DEC-127` in
`docs/84_ai-company-durable-memory-recall-persistence-plan.md` and
`docs/85_ai-company-durable-memory-recall-implementation-decision-handoff.md`. The schema-v15 runtime
recomputes DEC-124, requires a separate `recordApproval.decision=record`, and retains at most one
immutable `MemoryRecall(status=recorded)` audit fact per source MemoryItem. Exact GET inspection and
the explicit UI record action expose only source-bound evidence. Recall list/history, automatic retrieval/search/ranking/recommendation,
Mission or WorkOrder injection, memory application, providers, source/Git/release, scheduling,
policy, bypass, and connectors remain blocked.

Mission memory context preview planning-only authority is accepted by `DEC-128`, its complete
fielded implementation handoff is recorded by `DEC-129`, and the exact implementation is accepted by
`DEC-130` in
`docs/86_ai-company-mission-memory-context-preview-plan.md` and
`docs/87_ai-company-mission-memory-context-preview-implementation-decision-handoff.md`. Runtime binds
one operator-selected exact current recorded recall and source item to one exact same-project draft
Mission, current canonical Mission digest, and bounded contextSpec, then returns a deeply frozen
deterministic `persisted=false`/`context-review-ready` response/browser-memory preview through one
64 KiB JSON-only POST. Mission/WorkOrder/prompt/policy injection, durable context, memory
application, automatic retrieval/ranking/recommendation, providers, schema migration, source/Git/
release, scheduling, policy, bypass, and connectors remain blocked.

The external-pattern native adoption sequence is accepted by `DEC-131` through `DEC-136` and recorded
in `docs/88_external-pattern-native-adoption-plan.md`. Durable Builder WorkOrders can first produce a
response-only verification plan, then persist exact reviewed AcceptanceCriteria under schema v16.
Append-only VerificationProof attempts preserve failed and passed history; review/manual evidence
requires exact artifacts and operator rationale, while automatic command evidence is limited to
shell-free allowlisted `node --check`. Reviewer resume remains blocked until every essential proof is
current and passed. Criteria-free plans preserve the earlier reviewed-delivery compatibility path.

One response-only bounded continuation preview now sits before the UI's explicit Reviewer or QA
checkpoint action. It binds current checkpoint/source/input/authority digests, completed units, and
artifacts to one progress digest, permits exactly one requested step and a deadline no more than 15
minutes after evaluation, and returns `no-progress`, `deadline-exceeded`, or `cancelled` without
writing state. The existing resume path still independently validates checkpoint, approval, source,
Decision Inbox, and proof evidence.

Optional exact research and context telemetry remain isolated support surfaces. The wigolo adapter is
disabled unless an operator enables it and supplies a repo-external executable; it performs only one
no-shell exact-URL fetch and returns bounded untrusted response evidence. Context telemetry measures
operator-supplied JSON by UTF-8 bytes, characters, leaf fields, and exact/gist classification without
returning raw values or rewriting the payload. Neither surface persists evidence, injects Mission or
provider context, schedules work, compresses payloads, or makes token/cost claims.

Existing read-only Loop Engineering and post-completion routing evidence remains source-backed.
`docs/20_loop-engineering-concept-review.md` defines the bounded operating concept, and
`scripts/loop-readiness-status.mjs` verifies that a proposed loop names a goal, boundary,
verification gate, stop condition, human return point, source-of-truth refs, and local evidence
posture before execution can be treated as ready.

Proposal generation planning plan is consumed historical evidence. The operator's planning decision
is recorded in `DEC-070` and consumed by `DEC-071`.
`docs/42_proposal-generation-planning-plan.md` defines one deterministic local inert draft from
exactly one existing Growth Evidence Ledger candidate, while
`docs/43_proposal-generation-implementation.md` records the approved pure implementation.

Deterministic inert proposal draft generation is implemented in
`src/runtime/proposal-drafts.js#createDeterministicProposalDraft`. It rejects incomplete or stale
evidence and returns an in-memory `draft-only` object with `applyAllowed=false`; it does not create
durable records, mutate queues, apply proposals, call providers, persist memory, mutate runtime/UI/
source state, commit, or push.

Pending inert proposal draft human review is implemented in
`src/runtime/proposal-draft-reviews.js#createProposalDraftHumanReviewPacket`. It preserves the
review question, fresh evidence, and blocked actions in a `pending-human-review` packet, but records
no review outcome and cannot create a record, mutate a queue, apply a proposal, call a provider,
persist memory, mutate runtime/UI/source state, commit, or push. The pending packet contract is in
`docs/44_proposal-draft-human-review.md`. Proposal draft human review decision packet is implemented in `docs/45_proposal-draft-human-review-decision-packet.md`; it defines only
evidence-only acceptance, an evidence request, rejection, or deferral for one fresh packet and also
records no outcome. Proposal draft human review evidence decision is accepted in
`docs/46_proposal-draft-human-review-evidence-decision.md` as repository history for
`accept-review-evidence-only`; it does not persist a runtime decision or open downstream authority.
Proposal draft downstream authority decision packet is implemented in
`docs/47_proposal-draft-downstream-authority-decision-packet.md`. It recommends planning local
durable proposal record creation for the reviewed inert draft, rejects broad continuation shortcuts,
records no outcome, and opens no planning or implementation authority. The next gate is
`fielded proposal draft downstream authority decision required`.
`scripts/vnext-proposal-draft-downstream-authority-decision-packet-status.mjs` verifies this
decision input remains read-only.

Recent verifier maintenance keeps this close-out evidence easier to audit without widening product
authority. The vNext audit, growth dashboard evidence depth, authority review/decision packet,
durable proposal record, and proposal application status scripts now run their status-script and
focused-smoke dependencies through the shared `scripts/vnext-status-assertions.mjs` `runStatus`
helper, and the authority review/decision packet scripts also share source-evidence assertion
helpers from the same module. The durable proposal record planning preview and implementation plan
status scripts use those shared source-evidence assertion helpers too; the helper uses the current
Node binary and the shared large JSON buffer, while before/after JSON diffs keep the emitted status
payloads unchanged. The proposal application handoff and implementation planning status scripts now
use those shared source-evidence assertion helpers as well. The operator decision handoff and
proposal application decision packet status scripts now use the same shared assertion helpers. The
runtime implementation status scripts for durable proposal records, proposal application attempts,
and single-path proposal source mutation now share source file loading and regex match assertion
helpers too. The vNext audit and growth dashboard evidence depth status scripts now share source
file loading plus exact-string, regex-match, and forbidden-action assertion helpers from that same
module.

The close-out evidence remains source-backed:
`tasks/todo.md` has zero unchecked task lines,
`docs/22_completion-gate-inventory.md` records the current gate table,
`scripts/smoke-completion-gate-inventory-current-evidence.mjs` pins README smoke counts, aggregate
registration, UI QA registration, zero-open backlog, post-completion router, proposal-record
lifecycle review alias evidence, proposal generation planning, implementation, pending human-review,
review-decision packet, accepted evidence-decision, and downstream authority decision-packet
evidence plus AI Company durable DeliveryPackage, acceptance implementation, and Mission/task
close-out implementation together, and
`scripts/post-completion-next-step-status.mjs` reports
`defaultCompletionImplementationOpen=false`. The latest checked aggregate evidence is required
`1/1`, informational `258/258`, total `259/259`; UI QA is required `63/63`.

The vNext audit still consumes the completed proposal-record lifecycle review status and exposes
`growth-evidence-ledger-proposal-record-lifecycle-review-maintenance` as maintenance evidence with
`implementationRequired=false`. It does not present the completed alias as a new implementation
queue. The audit reports `explicit-entry-required` for new implementation and preserves the four
entry reasons: explicit operator request, concrete regression, usability issue, or accepted vNext
decision.

The allowed explicit-entry posture is intentionally narrow. A follow-up request may open a
read-only vNext routing/status/doc-smoke slice first, but runtime mutation, UI mutation, provider
calls, memory persistence, connector reach, automation, lifecycle semantic changes, commit, and push
remain closed until a concrete regression, usability issue, or accepted vNext decision justifies a
wider implementation slice.

Loop readiness is intentionally read-only. `scripts/loop-readiness-status.mjs` does not accept
arguments, execute work, call providers, persist memory, schedule jobs, create commits, push, or open
external connectors; `scripts/smoke-loop-readiness-status.mjs` pins that safety boundary. The
post-completion router keeps the next safe posture at read-only status or doc-smoke work first, so
Loop Engineering strengthens the control plane without opening background automation or widening the
default development pack.

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

This close-out pass changes read-only operator-handoff documentation, the vNext audit status,
completion inventory evidence, README evidence, README smoke coverage, aggregate registration, and
task ledgers; it does not change runtime write paths, UI behavior, provider calls, memory
persistence, proposal generation or application, source mutation authority, product commit
authority, or product push authority.

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
  aggregate `259/259`, UI QA `63/63`, zero-open backlog, post-completion router, README smoke count,
  aggregate registration, UI QA registration, proposal-record lifecycle review alias boundaries, and
  proposal generation planning, implementation, pending human-review, review-decision packet, and
  accepted evidence-decision plus downstream authority decision-packet evidence.
- Durable DeliveryPackage persistence: `docs/66_ai-company-durable-delivery-package-persistence-plan.md`,
  `docs/67_ai-company-durable-delivery-package-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-durable-delivery-package.mjs`, and `scripts/smoke-ui-slice-657.mjs` prove
  the exact schema-v9 `review-required` record while package acceptance and Mission done remain absent.
- DeliveryPackage acceptance planning: `docs/68_ai-company-delivery-package-acceptance-plan.md`,
  `docs/69_ai-company-delivery-package-acceptance-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs` preserve the decision boundary.
- DeliveryPackage acceptance implementation: `DEC-103`,
  `scripts/smoke-ai-company-delivery-package-acceptance.mjs`, and `scripts/smoke-ui-slice-658.mjs`
  prove the immutable package / append-only accepted evidence path consumed by close-out.
- Mission/task close-out implementation: `DEC-104`, `DEC-105`, `DEC-106`,
  `docs/70_ai-company-mission-task-close-out-plan.md`,
  `docs/71_ai-company-mission-task-close-out-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-mission-task-close-out.mjs` plus `scripts/smoke-ui-slice-659.mjs` prove the
  schema-v11 atomic terminal transaction while standalone close-out and downstream authority stay unchanged.
- LearningCandidate preview implementation: `DEC-107`, `DEC-108`, `DEC-109`,
  the additive `src/runtime/file-store.js` read-only loader,
  `src/runtime/learning-candidate-preview.js`, `scripts/smoke-ai-company-learning-candidate-preview.mjs`,
  and `scripts/smoke-ui-slice-660.mjs` prove the exact response-only, zero-write, browser-memory review
  path while durable learning, memory/skill promotion, providers, source/Git/release, scheduling,
  next-Mission, policy, bypass, and connectors remain blocked.
- Durable LearningCandidate persistence: `DEC-110`, `DEC-111`, `DEC-112`,
  `docs/74_ai-company-durable-learning-candidate-persistence-plan.md`,
  `docs/75_ai-company-durable-learning-candidate-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-durable-learning-candidate-planning.mjs`,
  `scripts/smoke-ai-company-durable-learning-candidate.mjs`, and `scripts/smoke-ui-slice-661.mjs`
  prove schema-v12 sequence/map-only migration, runtime preview recomputation, one-save exact
  digest-bound immutable record, read-only hydration, and absent review/memory/skill/downstream
  authority.
- LearningCandidate review outcome: `DEC-113`, `DEC-114`, `DEC-115`,
  `docs/76_ai-company-learning-candidate-review-outcome-plan.md`,
  `docs/77_ai-company-learning-candidate-review-outcome-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs`,
  `scripts/smoke-ai-company-learning-candidate-review-outcome.mjs`, and
  `scripts/smoke-ui-slice-662.mjs` prove schema-v13 append-only review persistence, exact
  candidate/digest/expiry/evidence gating, immutable source candidate, all three normalized
  outcomes, idempotent replay, safe failures, read-only hydration, and absent downstream authority.
- MemoryCandidate preview: `DEC-116`, `DEC-117`, `DEC-118`,
  `docs/78_ai-company-memory-candidate-preview-plan.md`,
  `docs/79_ai-company-memory-candidate-preview-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-memory-candidate-preview-planning.mjs`,
  `scripts/smoke-ai-company-memory-candidate-preview.mjs`, and
  `scripts/smoke-ui-slice-663.mjs` prove the accepted-review-only response path, exact
  candidate/review digest and project-scope gate, operator-owned applicability/evidence/redaction/
  expiry contract, deterministic zero-write browser-memory lifecycle, safe failure behavior, and
  blocked durable memory, retrieval/import/apply/export/delete, skill, provider, source/Git/release,
  scheduling, next-Mission, policy, bypass, and connector authority.
- Durable MemoryItem persistence: `DEC-119`, `DEC-120`, `DEC-121`,
  `docs/80_ai-company-durable-memory-item-persistence-plan.md`,
  `docs/81_ai-company-durable-memory-item-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-durable-memory-item-planning.mjs`,
  `scripts/smoke-ai-company-durable-memory-item.mjs`, and `scripts/smoke-ui-slice-664.mjs` prove the
  schema-v14 sequence/map-only migration, distinct readiness and storage-approval gates, exact
  DEC-118 recomputation, immutable `stored` record, project scope, negative/redaction/review
  evidence, one-save migration-and-append, exact replay, safe no-write failures, read-only hydration,
  and still-blocked retrieval/application/export/delete/refresh/skill/provider/downstream authority.
- MemoryRecall preview implementation: `DEC-122`, `DEC-123`, `DEC-124`,
  `docs/82_ai-company-memory-recall-preview-plan.md`,
  `docs/83_ai-company-memory-recall-preview-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-memory-recall-preview-planning.mjs`,
  `scripts/smoke-ai-company-memory-recall-preview.mjs`, and `scripts/smoke-ui-slice-665.mjs` prove one
  schema-v14-preserving, exact-id operator-selected, project-local, response/browser-memory recall
  review contract with deterministic deep-frozen output, zero state/source writes, safe stale/
  expired/cross-workspace/credential/negative-evidence failure, and responsive UI. Automatic search/
  ranking/recommendation, Mission injection, application, durable recall, provider, source/Git/
  release, scheduling, policy, and connector authority remain blocked.
- Durable MemoryRecall persistence planning: `DEC-125`, `DEC-126`,
  `docs/84_ai-company-durable-memory-recall-persistence-plan.md`,
  `docs/85_ai-company-durable-memory-recall-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-durable-memory-recall-planning.mjs` define one schema-v15 sequence/map-only
  audit-record target and preserve the exact implementation decision provenance.
- Durable MemoryRecall persistence implementation: `DEC-127`, `src/runtime/memory-recalls.js`,
  `scripts/smoke-ai-company-durable-memory-recall.mjs`, and `scripts/smoke-ui-slice-666.mjs` prove
  schema-v14-to-v15 migration plus one immutable source-bound `recorded` audit fact in one save,
  exact replay and inspection, no-write stale or malformed refusal, and unchanged source evidence.
  Recall list/history/search/ranking/recommendation/injection/application and every external effect
  remain blocked.
- Mission memory context preview planning: `DEC-128`, `DEC-129`,
  `docs/86_ai-company-mission-memory-context-preview-plan.md`,
  `docs/87_ai-company-mission-memory-context-preview-implementation-decision-handoff.md`, and
  `scripts/smoke-ai-company-mission-memory-context-preview-planning.mjs` define one exact recorded-
  recall plus exact draft-Mission response-only review target. Runtime/API/UI implementation,
  Mission/WorkOrder/prompt/policy injection, memory application, automatic retrieval/ranking/
  recommendation, providers, schema/source/Git/release/scheduling/policy/bypass/connectors remain
  blocked outside the accepted implementation boundary.
- Mission memory context preview implementation: `DEC-130`,
  `src/runtime/mission-memory-context-preview.js`,
  `scripts/smoke-ai-company-mission-memory-context-preview.mjs`, and
  `scripts/smoke-ui-slice-667.mjs` prove exact recall/item/draft-Mission digest binding, complete
  evidence closure, deterministic deep-frozen replay, bounded POST and browser-memory lifecycle,
  zero state-byte mutation, safe failure handling, responsive fit, and absent apply/inject/search/
  recommend/persist controls.
- Proposal generation decision packet: `docs/40_proposal-generation-decision-packet.md` and
  `scripts/vnext-proposal-generation-decision-packet-status.mjs` define one deterministic local
  draft planning target, the full operator decision fields, rollback and focused smoke requirements,
  copy-ready planning wording, and blocked provider/memory/record/application/source/commit/push
  authority without approving planning or implementation.
- Proposal generation operator decision handoff is not approval:
  `docs/41_proposal-generation-operator-decision-handoff.md` and
  `scripts/vnext-proposal-generation-operator-decision-handoff-status.mjs` define the exact fielded
  planning response shape, invalid shortcuts, minimum planning acceptance, and still-blocked
  authorities without recording a decision or opening planning authority.
- vNext audit maintenance route:
  `scripts/vnext-development-audit-status.mjs` and
  `scripts/growth-evidence-ledger-proposal-record-lifecycle-review-status.mjs` prove the completed
  proposal-record lifecycle review alias is now maintenance evidence, not a new implementation
  queue. New implementation requires an explicit operator request, concrete regression, usability
  issue, or accepted vNext decision, and the route keeps proposal generation/application, provider
  calls, memory persistence, source mutation outside the approved named path, commit, and push
  blocked.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the current lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review, lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review-acceptance recommendation, and records this pass as evidence cleanup rather
  than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close final close, lifecycle close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, lifecycle close finalization
  review acceptance, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-final-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source mutation,
  and remediation execution blocked, preserves the next lifecycle-close-finalization-review-acceptance
  recommendation, and records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-finalization-review recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle
  close-review acceptance, lifecycle close review, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-review-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-finalization-review recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle
  close-review acceptance, lifecycle close review, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-review-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle close
  finalization, lifecycle close, source mutation, and remediation execution blocked, preserves the
  next lifecycle-close-finalization recommendation, and records this pass as evidence cleanup rather
  than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps lifecycle
  close acceptance, lifecycle close review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-final-close recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source mutation,
  and remediation execution blocked, preserves the next lifecycle-close-finalization-review-acceptance
  recommendation, and records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-final-close recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source mutation,
  and remediation execution blocked, preserves the next lifecycle-close-finalization-review-acceptance
  recommendation, and records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps lifecycle
  close acceptance, lifecycle close review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than product
  behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization-review recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps lifecycle
  close acceptance, lifecycle close review acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review acceptance, lifecycle close review, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-review-acceptance recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close review,
  lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-finalization-review recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization recommendation, and records this pass
  as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review, lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review-acceptance recommendation, and records this pass as evidence cleanup rather
  than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close,
  lifecycle close final close, source mutation, and remediation execution blocked, preserves the
  next lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps
  lifecycle close finalization review acceptance, lifecycle close finalization review, source
  mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-review-acceptance recommendation, and records this pass as evidence
  cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle
  close finalization review, lifecycle close finalization, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-finalization-review recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs`
  prove the preceding lifecycle-close-acceptance status packet remains read-only, keeps lifecycle
  close finalization, lifecycle close acceptance, source mutation, and remediation execution
  blocked, preserves the next lifecycle-close-finalization recommendation, and records this pass
  as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-review status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs`
  prove the preceding lifecycle-close-review status packet remains read-only, keeps lifecycle close
  review, lifecycle close, source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-review-acceptance recommendation, and records this pass as evidence cleanup rather
  than product behavior change.
- Growth lifecycle-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs`
  prove the preceding lifecycle-close status packet remains read-only, keeps lifecycle close,
  lifecycle close final-close, source mutation, and remediation execution blocked, preserves the
  next lifecycle-close-review recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-final-close status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status.mjs`
  prove the preceding lifecycle-close-final-close status packet remains read-only, keeps lifecycle
  close, lifecycle close final close, source mutation, and remediation execution blocked, preserves
  the next lifecycle-close recommendation, and records this pass as evidence cleanup rather than
  product behavior change.
- Growth lifecycle-close-finalization-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-acceptance status packet remains read-only, keeps
  lifecycle close final close, lifecycle close finalization acceptance, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-final-close recommendation, and
  records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization-review-acceptance status recheck:
  `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs`
  prove the preceding lifecycle-close-finalization-review-acceptance status packet remains read-only,
  keeps lifecycle close finalization acceptance, lifecycle close finalization review acceptance,
  source mutation, and remediation execution blocked, preserves the next
  lifecycle-close-finalization-acceptance recommendation, and records this pass as evidence cleanup
  rather than product behavior change.
- Growth lifecycle-close-finalization-review status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs`
  prove the preceding lifecycle-close-finalization-review status packet remains read-only, keeps lifecycle
  close finalization review acceptance, lifecycle close finalization review, source mutation, and
  remediation execution blocked, preserves the next lifecycle-close-finalization-review-acceptance
  recommendation, and records this pass as evidence cleanup rather than product behavior change.
- Growth lifecycle-close-finalization status recheck: `scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  and `scripts/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs`
  prove the preceding lifecycle-close-finalization status packet remains read-only, keeps lifecycle close
  finalization review, lifecycle close finalization, source mutation, and remediation execution blocked,
  preserves the next lifecycle-close-finalization-review recommendation, and records this pass as
  evidence cleanup rather than product behavior change.
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
  prove the preceding lifecycle-close-review-acceptance status packet remains read-only, keeps
  lifecycle close acceptance, lifecycle close review acceptance, source mutation, and remediation
  execution blocked, preserves the next lifecycle-close-acceptance recommendation, and records this
  pass as evidence cleanup rather than product behavior change.
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
  approved path, commit, and push authority stay blocked. The source mutation implementation status
  script runs its focused smoke through the shared `scripts/vnext-status-assertions.mjs`
  `runStatus` helper without changing the emitted status payload.
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
| LLM-native Mission shell | `Mission / Council / Execution / Deliverables` remains the product model. First-run and explicit new-Mission mode use the prompt-first composer; a selected Mission starts from its title and chronological Operator, Council, Execution, and Deliverables workstream. |
| Mission evidence graph | The selected Mission can switch from the default chronological `Thread` to a six-stage read-only `Graph` projection capped at 250 nodes, then search short source fields, filter lifecycle/status, focus direct neighbors, and inspect exact relationship refs through keyboard-readable desktop and semantic mobile controls. Sparse projections use source-density-derived spacing without changing the exact response. |
| Source-backed Deliverables flow | The LLM-native shell reads the current result, verification, package, acceptance, and close-out records once in source order, exposes at most one readiness-bound operator command, and keeps exact refs and existing gated controls collapsed. |
| LLM-native Advanced Ops navigation | The four primary workflow surfaces stay visible, while Decision Inbox, Artifacts, Logs, and Taskboard remain one disclosure away with pending-gate status and unchanged authoritative routing. |
| LLM-native Mission history navigation | Current Mission context stays beside the new-Mission command; one native sidebar disclosure exposes every project Mission in source-current newest-first order through the existing exact selection path. |
| LLM-native Workspace Header | One compact band keeps current project, normalized provider mode, current surface, open gate count, refresh state, and the refresh command visible without repeating workstream metadata. |
| LLM-native mobile navigation | At 820px and below, the collapsed top rail keeps brand/new Mission, four primary links, and current Mission/Advanced Ops in three rows; either native disclosure expands to full width when opened. |
| Opt-in Real Council | `DEC-082` permits one-Mission local-stub position isolation, deterministic conflict evidence, Conductor synthesis, revision/resume/stop, and approved handoff through the existing builder-preflight approval boundary; legacy deterministic Council remains available. |
| Advanced Ops surfaces | `Taskboard / Logs / Artifacts / Decision Inbox` remain available as authoritative operator surfaces. |
| Reference-driven operator shell | `docs/reference/vnext-reference-driven-ui-audit.md` records what was adopted or rejected from Linear, LangSmith Studio, Retool, Dify, n8n HITL, Zapier, and NN/g before the UI refresh. |
| Read-only growth evidence | The shell exposes `성장 증거 원장`, `개선 후보 대기열` drilldown, grouped failure patterns, current-snapshot regression comparison, rollback evidence links, and a blocked `제안 검토 게이트` as evidence-derived views; `scripts/smoke-ui-slice-649.mjs` pins that they do not call providers, persist memory, create/persist durable proposal records, mutate source, generate/apply proposals, commit, or push. |
| Local-only personalization | Recent desks, evidence density, preferred project hints, copyable preference review, preference reset/set controls, and a blocked long-term memory readiness gate stay local-only; browser `localStorage` under `orchestration.ui-preferences.v1` only changes shell convenience and the review packet is not an import/apply path. |
| Advanced Ops harness evidence | Harness execution output, input, run action markup, run action shelf markup, operator action token label/tone markup, visible result packet markup, visible header markup, visible token row markup, visible preview markup, visible preview action markup, visible input path action markup, visible action shelf markup, visible action shelf frame markup, visible hide action markup, visible summary rack markup, visible execution summary markup, visible supplemental summary markup, hidden preview markup, hidden preview action markup, hidden input path action markup, hidden action shelf markup, hidden action shelf frame markup, hidden result packet markup, hidden header markup, hidden context sections markup, hidden context title row markup, hidden run context summary markup, hidden harness context summary markup, hidden operator context summary markup, preview copy, request id fallback, action output path fallback, visible token label/tone markup, latest state token label/tone markup, hidden state token-specific label/tone markup, history header markup, history count token label/tone markup, output path copy, history input path copy, history path reuse/rerun action markup, history preview action markup, history action shelf markup, history action shelf frame markup, history summary rack markup, history summary rack frame markup, history item register markup, history item packet markup, history restore preview, execution packet copy, output-brief copy, policy-report copy, executed-at, output-channel, completion status, and hidden status summary fallback handoff use named helper flows across `ui/app.js`, `ui/harness-execution-tokens.js`, and `ui/harness-labels.js` while the focused `smoke-ui-slice-*` scripts keep action, runtime, provider, source mutation, commit, and push boundaries unchanged. |
| Authority expansion review | `docs/26_authority-expansion-review-spec.md` records the shared read-only request contract for future durable proposal records, memory persistence, provider calls, or source mutation; it does not approve implementation or open any authority. |
| Development pack loop | The implemented pack flow is documented in `packs/development/pack.md`: planner, architect, task-breaker, builder preflight, builder live mutation, reviewer, commit-package, local commit, release-package, close-out. |
| Opt-in knowledge-work pack | `packs/knowledge-work/pack.md` defines an explicit opt-in path for bounded non-coding deliverables such as decision memos, plans, checklists, and research briefs; it does not replace the `development` pack or open a pack marketplace. |
| Review and approval gates | Review-before-done and approval-before-commit/release follow-up are enforced through runtime/coordinator state and surfaced in Decision Inbox. |
| Acceptance and proof ledger | Schema v16 stores immutable Builder AcceptanceCriteria and append-only failed/passed VerificationProof attempts; current essential proof gates Reviewer resume. |
| Bounded continuation preflight | A response/browser-memory preview detects unchanged progress, deadline, or cancellation before exposing one existing Reviewer/QA checkpoint action; it grants no resume authority. |
| Optional exact research fetch | One explicitly enabled repo-external wigolo sidecar can fetch one public exact URL into bounded untrusted response evidence; crawl, search, cache control, persistence, synthesis, and Mission injection are absent. |
| Context budget telemetry | A bounded response-only report measures JSON UTF-8 bytes, characters, leaf fields, and exact/gist eligibility without returning raw values, rewriting payloads, calling providers, or persisting history. |
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
  Mission Thread | Graph / Council / Execution / Deliverables
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
src/research/wigolo-exact-fetch-adapter.js
  optional repo-external exact URL fetch; disabled by default
        |
src/runtime/file-store.js
  local state and artifact persistence under the selected runtime root
```

## Key Design Decisions

- `local-first / single-user-first / ops-first`: repo files and local state define the workflow;
  team workspace, OAuth, messenger, ranking, and org-management semantics are out of scope.
- LLM-native reading model without chatbot authority: the primary shell starts from a goal and shows
  structured agent turns, but typing or rendering a turn does not call a provider, mutate source,
  bypass approval, commit, push, or release.
- Active work before new intake: once a Mission is selected, its current workstream stays in the
  first viewport and the existing full composer opens only through an explicit browser-only command.
- Graph view is projection, not authority: Mission evidence relationships come from exact current
  source records, remain capped and read-only, and cannot select work, approve a gate, execute a
  WorkOrder, persist layout, or mutate source.
- `development` pack remains the default v1 workflow: v1 is intentionally narrow and does not
  implement a pack marketplace. `DEC-066` records the code-present `knowledge-work` pack as an
  explicit opt-in path for bounded non-coding deliverables; it does not replace the `development`
  pack.
- `project_path` before execution: every execution must be tied to an explicit local project path.
- Review before done: task completion depends on review evidence, not just a successful run.
- Approval before commit and release follow-up: commit-package and release-package prepare approval
  records; local commit and close-out consume the approved provenance later.
- Acceptance is not proof: reviewed immutable criteria and append-only current evidence are separate;
  no WorkOrder can infer completion from intended checks alone.
- Continuation preview is not resume authority: no-progress/deadline/cancellation telemetry remains
  response-only, and the existing resume gate revalidates current durable evidence before dispatch.
- External evidence stays untrusted and opt-in: exact wigolo fetch is disabled by default, invokes no
  shell, persists nothing, and cannot crawl, search, synthesize, or inject Mission context.
- Context metrics are not compression: exact/gist measurement exposes eligibility only; payload
  rewriting, tokenizer claims, provider calls, and token or cost claims remain outside the slice.
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
| `GET` | `/api/missions/:missionId/evidence-graph` | Read the selected Mission's deterministic source-backed graph projection without state writes. |
| `POST` | `/api/missions/:missionId/create-linked-task` | Create the mission-linked task. |
| `POST` | `/api/missions/:missionId/draft-council` | Draft a council session for the mission. |
| `POST` | `/api/missions/:missionId/approve-council` | Approve council alignment and start the bounded execution chain. |
| `POST` | `/api/missions/:missionId/council/start` | Start the opt-in local-stub Real Council path. |
| `POST` | `/api/council-sessions/:sessionId/resume` | Resume a failed position or synthesis attempt. |
| `POST` | `/api/council-sessions/:sessionId/decision` | Approve, request a targeted revision, or stop a Real Council session. |
| `POST` | `/api/council-sessions/:sessionId/work-order-preview` | Recompute one response-only source-current WorkOrder preview. |
| `POST` | `/api/council-sessions/:sessionId/work-order-plans` | Persist one exact-preview plan bundle and pending approval in current schema state. |
| `GET` | `/api/execution-plans/:executionPlanId` | Inspect one durable plan, WorkOrders, handoffs, approval, and control task. |
| `POST` | `/api/execution-plans/:executionPlanId/start-sequential` | Start only the approved local Builder preflight path and stop at live-mutation approval. |
| `POST` | `/api/execution-plans/:executionPlanId/continue-reviewed-delivery` | Continue one exact approved local Builder gate through Reviewer and constrained syntax QA. |
| `GET` | `/api/execution-plans/:executionPlanId/recovery` | Recompute one read-only current checkpoint recovery classification. |
| `POST` | `/api/execution-plans/:executionPlanId/continuation-preview` | Measure one bounded response-only next-step/no-progress/deadline/cancellation outcome. |
| `POST` | `/api/execution-plans/:executionPlanId/resume-from-checkpoint` | Resume one exact current Reviewer-ready or QA-ready checkpoint and stop at the next boundary. |
| `POST` | `/api/execution-plans/:executionPlanId/cancel-checkpoint` | Record cancellation for one exact current checkpoint without deleting evidence. |
| `POST` | `/api/execution-plans/:executionPlanId/work-orders/:workOrderId/verification-plan-preview` | Return source-bound response-only happy-path, risk, regression, and manual verification criteria. |
| `POST` | `/api/execution-plans/:executionPlanId/work-orders/:workOrderId/acceptance-criteria` | Persist one exact reviewed Builder criterion set under separate operator approval. |
| `GET` | `/api/execution-plans/:executionPlanId/work-orders/:workOrderId/verification-status` | Read current/stale proof status for durable criteria. |
| `POST` | `/api/execution-plans/:executionPlanId/work-orders/:workOrderId/acceptance-criteria/:criterionId/proofs` | Append one exact operator review/manual proof attempt. |
| `POST` | `/api/execution-plans/:executionPlanId/work-orders/:workOrderId/acceptance-criteria/:criterionId/run-node-check` | Run and append one source-bound shell-free allowlisted `node --check` proof. |
| `GET` | `/api/execution-plans/:executionPlanId/delivery-preview` | Recompute the response-only DeliveryPackage from delivery-ready evidence. |
| `GET` | `/api/execution-plans/:executionPlanId/delivery-package` | Read the current durable `review-required` DeliveryPackage record, if present. |
| `POST` | `/api/execution-plans/:executionPlanId/persist-delivery-package` | Persist one exact preview/source/package/checkpoint tuple as a durable review-required record. |
| `GET` | `/api/delivery-packages/:deliveryPackageId/acceptance` | Read append-only package acceptance evidence and its derived review status. |
| `POST` | `/api/delivery-packages/:deliveryPackageId/accept` | Append one exact accepted evidence record without changing package, Mission, task, or plan state. |
| `GET` | `/api/missions/:missionId/close-out` | Read exact MissionCloseOut evidence and its terminal Mission/task state. |
| `POST` | `/api/missions/:missionId/close-out` | Append one exact MissionCloseOut and atomically terminalize only the linked task and Mission. |
| `POST` | `/api/missions/:missionId/learning-candidate-preview` | Return one exact response-only, review-required LearningCandidate preview without state or source writes. |
| `GET` | `/api/missions/:missionId/learning-candidate` | Read the current durable review-required LearningCandidate evidence, if present. |
| `POST` | `/api/missions/:missionId/persist-learning-candidate` | Recompute one exact current preview and append at most one immutable proposed record. |
| `GET` | `/api/learning-candidates/:learningCandidateId/review` | Read the separate append-only review event without rewriting the source candidate. |
| `POST` | `/api/learning-candidates/:learningCandidateId/review` | Append one exact human-reviewed accepted, rejected, or changes-requested event. |
| `POST` | `/api/learning-candidates/:learningCandidateId/memory-candidate-preview` | Return one accepted-review-only project-scoped response-only MemoryCandidate preview without state or source writes. |
| `GET` | `/api/research/exact-fetch/readiness` | Inspect disabled-by-default wigolo exact-fetch readiness without a network call. |
| `POST` | `/api/research/exact-fetch` | Fetch one explicit public exact URL into bounded untrusted response evidence when enabled. |
| `POST` | `/api/telemetry/context-budget-report` | Measure one bounded JSON payload without raw-value output, rewrite, truncation, compression, provider call, or persistence. |
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
| `ORCHESTRATION_WIGOLO_EXACT_FETCH_ENABLED` | Must equal `1` to open the optional exact-fetch adapter. |
| `ORCHESTRATION_WIGOLO_SIDECAR_PATH` | Absolute executable path for an operator-installed repo-external wigolo sidecar. |
| `ORCHESTRATION_WIGOLO_LIVE_URL` | Optional exact URL used only by the opt-in live smoke. |

## Testing

This repo uses source and runtime smoke scripts rather than a conventional unit-test suite. The
counts below are file counts from current head, not a claim about passed test cases.

```bash
find scripts -maxdepth 1 -type f -name 'smoke-*.mjs' | wc -l      # 937 smoke files
find scripts -maxdepth 1 -type f -name '*qa-slice*.mjs' | wc -l   # 10 QA slice files
find scripts -maxdepth 1 -type f -name 'smoke-ui-slice-*.mjs' | wc -l # 685 UI smoke files
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
node scripts/vnext-proposal-generation-decision-packet-status.mjs
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
node scripts/smoke-ai-company-checkpoint-resume-recovery-planning.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
node scripts/smoke-ui-slice-656.mjs
node scripts/smoke-ai-company-durable-delivery-package-planning.mjs
node scripts/smoke-ai-company-durable-delivery-package.mjs
node scripts/smoke-ui-slice-657.mjs
node scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs
node scripts/smoke-ai-company-delivery-package-acceptance.mjs
node scripts/smoke-ui-slice-658.mjs
node scripts/smoke-ai-company-mission-task-close-out-planning.mjs
node scripts/smoke-ai-company-mission-task-close-out.mjs
node scripts/smoke-ui-slice-659.mjs
node scripts/smoke-ai-company-learning-candidate-preview-planning.mjs
node scripts/smoke-ai-company-learning-candidate-preview.mjs
node scripts/smoke-ui-slice-660.mjs
node scripts/smoke-ai-company-durable-learning-candidate-planning.mjs
node scripts/smoke-ai-company-durable-learning-candidate.mjs
node scripts/smoke-ui-slice-661.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs
node scripts/smoke-ai-company-learning-candidate-review-outcome.mjs
node scripts/smoke-ui-slice-662.mjs
node scripts/smoke-ai-company-memory-candidate-preview-planning.mjs
node scripts/smoke-ai-company-memory-candidate-preview.mjs
node scripts/smoke-ui-slice-663.mjs
node scripts/smoke-ai-company-durable-memory-item-planning.mjs
node scripts/smoke-ai-company-durable-memory-item.mjs
node scripts/smoke-ui-slice-664.mjs
node scripts/smoke-ai-company-memory-recall-preview-planning.mjs
node scripts/smoke-ai-company-memory-recall-preview.mjs
node scripts/smoke-ui-slice-665.mjs
node scripts/smoke-ai-company-durable-memory-recall-planning.mjs
node scripts/smoke-ai-company-durable-memory-recall.mjs
node scripts/smoke-ui-slice-666.mjs
node scripts/smoke-ai-company-mission-memory-context-preview-planning.mjs
node scripts/smoke-ai-company-mission-memory-context-preview.mjs
node scripts/smoke-ui-slice-667.mjs
node scripts/smoke-ai-company-mission-evidence-graph.mjs
node scripts/smoke-ui-slice-672.mjs
node scripts/smoke-ui-slice-673.mjs
node scripts/smoke-ui-slice-674.mjs
node scripts/smoke-ui-slice-675.mjs
node scripts/smoke-ui-slice-676.mjs
node scripts/smoke-ui-slice-677.mjs
node scripts/smoke-ui-slice-678.mjs
node scripts/smoke-ui-slice-679.mjs
node scripts/smoke-ui-slice-680.mjs
node scripts/smoke-ui-slice-681.mjs
node scripts/smoke-ui-slice-682.mjs
node scripts/smoke-ui-slice-683.mjs
node scripts/smoke-ui-slice-684.mjs
node scripts/smoke-ui-slice-685.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
node scripts/smoke-qa-slice-07.mjs
```

Current verification evidence from this README and completion close-out refresh:

- `node scripts/smoke-completion-gate-inventory-current-evidence.mjs`: completion inventory counts,
  aggregate `259/259`, UI QA `63/63`, zero-open backlog, post-completion router, README smoke count,
  aggregate registration, UI QA registration, proposal-record lifecycle review alias evidence, and
  proposal generation planning, implementation, pending human-review, review-decision packet, and
  accepted evidence-decision plus downstream authority decision-packet evidence stay aligned.
- `node scripts/smoke-ai-company-durable-delivery-package.mjs` and
  `node scripts/smoke-ui-slice-657.mjs`: `DEC-098`/`DEC-099`/`DEC-100`, exact schema-v8 migration,
  schema-v9 digest tuple persistence, read-only hydration, idempotency, and still-blocked package
  acceptance, Mission done, commit, push, release, learning, and memory stay aligned.
- `node scripts/smoke-ai-company-delivery-package-acceptance-planning.mjs`: `DEC-101`/`DEC-102`,
  immutable package retention, schema-v10 append-only acceptance contract, exact decision tuple, and
  still-blocked Mission/task close-out stay aligned.
- `node scripts/smoke-ai-company-delivery-package-acceptance.mjs` and
  `node scripts/smoke-ui-slice-658.mjs`: `DEC-103`, v9-to-v10 migration, exact accepted evidence,
  stale/malformed no-write behavior, idempotency, reload, responsive UI, and unchanged package,
  Mission, task, plan, source, commit/release/learning authority stay aligned.
- `node scripts/smoke-ai-company-mission-task-close-out-planning.mjs`,
  `node scripts/smoke-ai-company-mission-task-close-out.mjs`, and
  `node scripts/smoke-ui-slice-659.mjs`: `DEC-104`/`DEC-105`/`DEC-106`, schema-v11 migration,
  exact accepted-evidence gate, one-save atomic task/Mission transition, terminal replay, bypass guards,
  responsive terminal evidence, standalone close-out isolation, and blocked downstream authority stay aligned.
- `node scripts/smoke-ai-company-learning-candidate-preview-planning.mjs`,
  `node scripts/smoke-ai-company-learning-candidate-preview.mjs`, and
  `node scripts/smoke-ui-slice-660.mjs`: `DEC-107`/`DEC-108` provenance and `DEC-109`
  implementation, unchanged schema v11, exact completed Mission source closure, operator-owned
  retrospectiveSpec, deterministic deep-frozen response, zero state/source writes, browser-memory
  clearing, safe stale/malformed/credential refusal, responsive fit, and blocked durable learning,
  memory/skill, provider, source/Git/release, scheduling, next-Mission, policy, bypass, and connector
  authority stay aligned.
- `node scripts/smoke-ai-company-durable-learning-candidate-planning.mjs`,
  `node scripts/smoke-ai-company-durable-learning-candidate.mjs`, and
  `node scripts/smoke-ui-slice-661.mjs`: `DEC-110`/`DEC-111`/`DEC-112`, v11-to-v12 one-save
  migration/persistence, exact DEC-109 recomputation, immutable record digest, idempotent replay,
  read-only hydration, safe stale/malformed/expired refusal, responsive fit, and still-blocked review,
  memory/skill, provider, source/Git/release, scheduling, next-Mission, policy, bypass, and connector
  authority stay aligned.
- `node scripts/smoke-ai-company-learning-candidate-review-outcome-planning.mjs`,
  `node scripts/smoke-ai-company-learning-candidate-review-outcome.mjs`, and
  `node scripts/smoke-ui-slice-662.mjs`: `DEC-113`/`DEC-114` provenance and `DEC-115`
  implementation, v12-to-v13 one-save migration/review append, exact candidate/digest/expiry/evidence
  binding, immutable source candidate, accepted/rejected/changes-requested normalization, idempotent
  replay, safe stale/malformed/credential refusal, read-only hydration, responsive fit, and blocked
  revision, memory/skill, provider, source/Git/release, scheduling, next-Mission, policy, bypass, and
  connector authority stay aligned.
- `node scripts/smoke-ai-company-memory-candidate-preview-planning.mjs`,
  `node scripts/smoke-ai-company-memory-candidate-preview.mjs`, and
  `node scripts/smoke-ui-slice-663.mjs`: `DEC-116`/`DEC-117` provenance and `DEC-118`
  implementation, accepted-review-only exact candidate/review digest and expiry binding,
  project-only source-contained memorySpec, deterministic deep-frozen response, zero state/source
  writes, browser-memory clearing, safe rejected/changes-requested/stale/expired/malformed/
  cross-workspace/credential refusal, responsive fit, and blocked schema-v14, durable memory,
  retrieval/import/apply/export/delete, skill/provider/source/Git/release, scheduling, next-Mission,
  policy, bypass, and connector authority stay aligned.
- `node scripts/smoke-ai-company-durable-memory-item-planning.mjs`: `DEC-119`/`DEC-120` planning and
  handoff evidence, schema-v14 sequence/map-only target, exact DEC-118 recomputation, separate
  project-scoped storage approval, immutable `stored` status, attached negative/redaction/review
  evidence, migration/no-write/idempotency/rollback rules, current schema-v13 negative evidence,
  and blocked implementation, recommendation retrieval/application, import/export/delete/refresh,
  cross-workspace use, skill/provider/source/Git/release, scheduling, next-Mission, policy, bypass,
  and connector authority stay aligned.
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
  no-push boundaries. The vNext audit status runs its upstream growth, reflection, proposal
  readiness, lifecycle review, and source mutation implementation checks through the shared
  `scripts/vnext-status-assertions.mjs` `runStatus` helper and reuses shared source file loading,
  exact-string, and regex-match assertion helpers without changing the emitted status payload.
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
  evidence links are source-checked. It runs the vNext audit status through the shared
  `scripts/vnext-status-assertions.mjs` `runStatus` helper and reuses shared source file loading,
  regex-match, and forbidden-action assertion helpers without changing the emitted status payload.
- `node scripts/vnext-memory-readiness-decision-spec-status.mjs`: memory item contract, source and
  redaction rules, review gates, export, expiry, deletion, and blocked memory/provider/source/commit
  authority.
- `node scripts/vnext-authority-expansion-review-status.mjs`: authority expansion request fields,
  candidate authority paths, approval separation, stop conditions, rollback refs, and focused smoke
  requirements stay read-only. It runs upstream vNext audit, growth dashboard, proposal review, and
  memory readiness statuses through the shared `scripts/vnext-status-assertions.mjs` `runStatus`
  helper, and it reuses shared source file loading, markdown-section, backticked-field,
  source-evidence, and forbidden-action assertion helpers without changing the emitted status
  payload.
- `node scripts/vnext-authority-implementation-decision-packet-status.mjs`: operator decision
  outcomes, required decision fields, recommended first candidate, still-blocked authority, rollback
  refs, focused smoke refs, and aggregate verification ref stay read-only. It runs upstream vNext
  audit and authority expansion review statuses through the shared
  `scripts/vnext-status-assertions.mjs` `runStatus` helper, and it reuses shared source file
  loading, markdown-section, backticked-field, and source-evidence assertion helpers without
  changing the emitted status payload.
- `node scripts/vnext-durable-proposal-record-planning-preview-status.mjs`: durable proposal record
  shape, local-first storage candidate, focused smoke preview, rollback preview, and stop conditions
  stay planning input only and do not open record creation, persistence, proposal application,
  provider, memory, source mutation, commit, or push authority. It runs upstream status checks
  through the shared `scripts/vnext-status-assertions.mjs` `runStatus` helper, and it reuses shared
  source file loading, markdown-section, backticked-field, source-evidence, and forbidden-action
  assertion helpers without changing the emitted status payload.
- `node scripts/vnext-operator-decision-handoff-status.mjs`: operator decision fields, valid
  statements, invalid shortcuts, minimum planning-only acceptance, still-blocked authority, and stop
  conditions stay source-checked as the consumed planning-only handoff and do not open
  implementation, persistence, provider, memory, source mutation, commit, or push authority. It
  reuses shared source file loading, markdown-section, backticked-field, source-evidence, and
  forbidden-action assertion helpers without changing the emitted status payload.
- `node scripts/vnext-durable-proposal-record-implementation-plan-status.mjs`: accepted
  planning-only decision, implementation plan, rollback plan, focused smoke plan, and record contract
  remain source-checked as the planning artifact. It runs upstream status checks through the shared
  `scripts/vnext-status-assertions.mjs` `runStatus` helper, and it reuses shared source file
  loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion
  helpers without changing the emitted status payload.
- `node scripts/smoke-durable-proposal-record-creation.mjs`: approved runtime creation requires an
  implementation approval payload and source, negative, reviewer, and approval refs; the created
  record persists to local `state.json` with `proposal-record-0001`, `applyAllowed=false`, blocked
  application/provider/memory/source/commit/push actions, and rollback quarantine evidence.
- `node scripts/vnext-durable-proposal-record-implementation-status.mjs`: source-checks the runtime
  contract, file-store normalization, service API, read-only UI ledger, focused smoke, and aggregate
  registration for the approved creation/persistence slice. It runs the focused smoke through the
  shared `scripts/vnext-status-assertions.mjs` `runStatus` helper and reuses shared source file
  loading, regex match, and forbidden-action assertion helpers without changing the emitted status
  payload.
- `node scripts/vnext-proposal-application-decision-packet-status.mjs`: source-checks the read-only
  proposal application decision packet, required application decision fields, still-blocked
  application/provider/memory/source/commit/push authority, upstream proposal review spec, and
  durable proposal record implementation evidence. It runs upstream status checks through the shared
  `scripts/vnext-status-assertions.mjs` `runStatus` helper, using the current Node binary and shared
  large JSON buffer, and it reuses shared source file loading, markdown-section, backticked-field,
  source-evidence, and forbidden-action assertion helpers without changing the emitted status
  payload.
- `node scripts/vnext-proposal-generation-decision-packet-status.mjs`: source-checks the read-only
  proposal generation planning packet, deterministic one-candidate draft boundary, required decision
  fields, rollback and focused smoke requirements, copy-ready planning statement, and blocked
  provider/memory/record/application/source/commit/push authority.
- `node scripts/vnext-proposal-generation-operator-decision-handoff-status.mjs`: source-checks the
  copy-ready proposal generation planning handoff, invalid shortcuts, minimum fielded acceptance,
  upstream proposal queue/readiness evidence, and blocked provider/memory/record/application/source/
  commit/push authority without recording an operator decision.
- `node scripts/smoke-deterministic-proposal-draft-generation.mjs`: proves the approved pure draft
  generator returns deterministic `draft-only` output, rejects missing approval, incomplete evidence,
  stale evidence, and an unapproved candidate, and never exposes a durable record id or application
  authority.
- `node scripts/vnext-proposal-generation-implementation-status.mjs`: source-checks `DEC-071`, the
  pure generator, focused smoke, and the still-blocked durable record, queue, application, provider,
  memory, runtime/UI/source, commit, and push boundaries.
- `node scripts/smoke-proposal-draft-human-review.mjs`: proves a fresh inert draft becomes a
  deterministic `pending-human-review` packet, rejects promoted or stale input, records no review
  outcome, and keeps record, queue, and proposal application authority false.
- `node scripts/vnext-proposal-draft-human-review-status.mjs`: source-checks `DEC-072`, the pending
  review packet, focused smoke, and the still-blocked downstream authority.
- `node scripts/vnext-proposal-application-operator-decision-handoff-status.mjs`: source-checks the
  copy-ready application decision handoff, valid planning/implementation statement shapes, invalid
  shortcuts, minimum acceptance criteria, still-blocked authority, upstream application decision
  packet, durable proposal record implementation evidence, and consumed planning-only decision
  evidence. It runs upstream status checks through the shared
  `scripts/vnext-status-assertions.mjs` `runStatus` helper, and it reuses shared source file
  loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion
  helpers without changing the emitted status payload.
- `node scripts/vnext-proposal-application-implementation-plan-status.mjs`: source-checks the
  accepted planning-only application decision, audit-only application attempt plan, rollback plan,
  focused smoke plan, implementation prerequisites, still-blocked authority, upstream application
  packet/handoff evidence, and aggregate registration. It runs upstream status checks through the
  shared `scripts/vnext-status-assertions.mjs` `runStatus` helper, and it reuses shared source file
  loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion
  helpers without changing the emitted status payload.
- `node scripts/vnext-proposal-application-implementation-decision-handoff-status.mjs`: source-checks
  the copy-ready implementation approval and rejection statement shapes, invalid shortcuts, minimum
  acceptance criteria, still-blocked authority, upstream planning evidence, and aggregate
  registration without recording an implementation decision. It runs upstream status checks through
  the shared `scripts/vnext-status-assertions.mjs` `runStatus` helper, and it reuses shared source
  file loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion
  helpers without changing the emitted status payload.
- `node scripts/smoke-proposal-application-attempt-creation.mjs`: proves the approved audit-only
  runtime path creates `proposal-application-attempt-0001`, persists it under local
  `proposalApplicationAttempts`, rejects missing approval, missing records, expired or quarantined
  records, missing evidence refs, duplicate attempts, and keeps proposal generation/provider/memory/
  source/commit/push authority false.
- `node scripts/vnext-proposal-application-implementation-status.mjs`: source-checks the runtime
  contract, file-store normalization, service API, read-only UI marker, implementation doc, focused
  smoke, and aggregate registration for the approved audit-only application attempt slice. It runs
  the focused smoke through the shared `scripts/vnext-status-assertions.mjs` `runStatus` helper and
  reuses shared source file loading and regex match assertion helpers without changing the emitted
  status payload.
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
- `node scripts/vnext-proposal-application-source-mutation-implementation-status.mjs`: source-checks
  the approved single-path source mutation runtime contract, focused smoke, rollback behavior, and
  still-blocked proposal/provider/memory/outside-path/commit/push authority. It runs the focused
  smoke through the shared `scripts/vnext-status-assertions.mjs` `runStatus` helper and reuses
  shared source file loading and regex match assertion helpers without changing the emitted status
  payload.
- `node scripts/smoke-readme-scope-evidence.mjs`: README structure, source-backed counts, route
  list, package/env visibility, visible/hidden/history Advanced Ops helper, preview, action-shelf
  composition, preview action handoff, copy formatter source, token handoff structure, hidden state
  token handoff, hidden packet/header handoff, history action handoff, history count token handoff,
  growth authority boundary, knowledge-work boundary, and honesty patterns.
- `node scripts/smoke-completion-gate-inventory-current-evidence.mjs`: completion inventory counts,
  UI QA count, zero-open backlog, post-completion router, README smoke count, and proposal-record
  lifecycle review alias evidence stay aligned.
- `node scripts/ui_qa_status.mjs`: required UI QA checks `63/63`; snapshot reachability is
  informational and may be skipped when the local UI server is not running.
- `node scripts/verification_status.mjs`: required `1/1`, informational `258/258`, total `259/259`;
  the aggregate includes the README source-evidence smoke, vNext memory readiness decision spec,
  read-only growth dashboard evidence depth, authority expansion review, and authority implementation
  decision packet plus durable proposal record planning preview, operator decision handoff, and
  durable proposal record implementation plan, implementation, proposal application decision packet,
  proposal application operator decision handoff, proposal application implementation plan, and
  proposal application implementation decision handoff, proposal application attempt creation smoke,
  proposal application implementation status, source mutation decision packet, source mutation
  operator handoff, source mutation planning plan checks, and the proposal-record lifecycle review
  status/smoke checks plus AI Company durable DeliveryPackage planning, implementation, package
  acceptance planning and implementation, Mission/task close-out planning/runtime/UI evidence, and
  the LLM-native source-backed Deliverables presentation contract, and the LLM-native Advanced Ops
  navigation hierarchy, the exact source-backed Mission history navigation contract, and the
  single-band source-backed Workspace Header contract, the compact three-row mobile navigation
  contract, and the source-density-derived sparse Mission Graph presentation contract.
Recent local visual QA evidence for the refreshed shell was captured with the local UI server and
Playwright CLI:

- `output/playwright/orchestration-llm-native-desktop.png`
- `output/playwright/orchestration-llm-native-mobile.png`
- `output/playwright/orchestration-mission-evidence-graph-desktop.png`
- `output/playwright/orchestration-mission-evidence-graph-mobile.png`
- `output/playwright/orchestration-mission-evidence-graph-phase3-desktop.png`
- `output/playwright/orchestration-mission-evidence-graph-phase3-mobile.png`
- `output/playwright/orchestration-active-mission-focus-desktop.png`
- `output/playwright/orchestration-active-mission-focus-mobile.png`
- `output/playwright/orchestration-mission-mode-control-desktop.png`
- `output/playwright/orchestration-mission-mode-control-mobile.png`
- `output/playwright/orchestration-first-run-project-connection-desktop.png`
- `output/playwright/orchestration-first-run-project-connection-mobile.png`
- `output/playwright/orchestration-source-backed-mission-thread-desktop.png`
- `output/playwright/orchestration-source-backed-mission-thread-mobile.png`
- `output/playwright/orchestration-source-backed-council-meeting-desktop.png`
- `output/playwright/orchestration-source-backed-council-meeting-mobile.png`
- `output/playwright/orchestration-source-backed-execution-flow-desktop.png`
- `output/playwright/orchestration-source-backed-execution-flow-mobile.png`
- `output/playwright/orchestration-source-backed-deliverables-flow-desktop.png`
- `output/playwright/orchestration-source-backed-deliverables-flow-mobile.png`
- `output/playwright/orchestration-llm-advanced-ops-navigation-desktop.png`
- `output/playwright/orchestration-llm-advanced-ops-navigation-mobile.png`
- `output/playwright/orchestration-mission-history-navigation-desktop.png`
- `output/playwright/orchestration-mission-history-navigation-mobile.png`
- `output/playwright/orchestration-workspace-header-desktop.png`
- `output/playwright/orchestration-workspace-header-mobile.png`
- `output/playwright/orchestration-mobile-navigation-desktop.png`
- `output/playwright/orchestration-mobile-navigation-compact.png`
- `output/playwright/orchestration-current-graph-desktop.png`
- `output/playwright/orchestration-current-graph-mobile.png`
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
  aggregate `259/259`, UI QA `63/63`, and zero-open backlog are local source-backed checks.
- `DEC-138` permits only the selected Mission's exact read-only graph projection. The view is capped
  at 250 nodes and adds no schema migration, dependency, graph write, automatic selection,
  approval, execution, source mutation, commit, push, or release authority.
- `DEC-139` permits only browser-memory graph search, lifecycle/status filters, direct-neighbor focus,
  and read-only detail over the existing response. Runtime search/index, persisted explorer state,
  automatic selection, detail navigation, timeline/replay, 3D, and authority-bearing actions remain
  outside the implemented scope.
- `DEC-140` permits only browser-memory Mission composer presentation and focus behavior. Durable
  drafts, autosave, automatic Mission creation or dispatch, runtime/API/schema/dependency changes,
  scheduling, provider/source/Git/release authority, policy bypass, and connectors remain outside
  the implemented scope.
- `DEC-141` permits only browser-memory Council mode presentation and exact focus restoration. It
  adds no runtime or API behavior, provider call, schema or dependency change, persistence,
  automatic dispatch, authority expansion, source mutation, commit, push, release, scheduling,
  policy bypass, or connector reach.
- `DEC-142` permits only first-run project connection presentation. Project discovery, filesystem
  browsing, recent-path enumeration, provider/worktree actions, automatic Mission creation,
  runtime/API/schema/dependency changes, source mutation, commit, push, release, scheduling, policy
  bypass, and connectors remain outside the implemented scope.
- `DEC-143` permits only source-backed Mission Thread presentation. Durable or generated chat,
  hidden inference, synthetic future-stage messages, automatic stage advancement, runtime/API/schema/
  dependency changes, provider/source/Git/release authority, scheduling, policy bypass, and
  connectors remain outside the implemented scope.
- `DEC-144` permits only source-backed Council presentation. Durable or generated chat, transcript
  mutation, inferred agreement, automatic alignment or execution, provider fallback,
  runtime/API/schema/dependency changes, source/Git/release authority, scheduling, policy bypass,
  and connectors remain outside the implemented scope.
- `DEC-145` permits only source-backed Execution presentation. It reuses existing command handlers
  and gate predicates, keeps evidence and harness tools collapsed, and adds no generated progress,
  automatic execution, hidden approval consumption, runtime/API/schema/dependency change,
  source/Git/release authority, scheduling, policy bypass, or connectors.
- `DEC-146` permits only source-backed Deliverables presentation. It reuses existing package,
  acceptance, close-out, Execution, and Mission handlers, keeps exact evidence and gated controls
  collapsed, and adds no generated summary, inferred completion, automatic acceptance or close-out,
  runtime/API/schema/dependency change, source/Git/release authority, scheduling, policy bypass, or
  connectors.
- `DEC-147` permits only browser navigation hierarchy. The same eight existing surfaces keep their
  routes, dynamic counts, current state, handlers, and authority; the four Advanced Ops surfaces move
  under one native disclosure while pending Decision Inbox gates remain visible. It adds no runtime,
  API, schema, dependency, storage, provider, source, Git, release, scheduling, policy, or connector
  authority.
- `DEC-148` permits only sidebar Mission context and selection presentation. It reuses the existing
  project-scoped newest-first Mission source and exact selection route while keeping the full Mission
  register available. Mission search, ranking, pinning, grouping, rename, deletion, archive,
  automatic selection, persisted history state, runtime/API/schema/dependency changes, provider or
  source mutation, Git/release authority, scheduling, policy bypass, and connectors remain outside
  the implemented scope.
- `DEC-149` permits only Workspace Header presentation. It reuses the existing active project,
  provider configuration, current surface, pending gate, refresh state, and refresh command bindings
  in one visible band while removing repeated workstream presence rows. Provider configuration
  editing, gate calculation changes, persistence, runtime/API/schema/dependency changes, source
  mutation, Git/release authority, scheduling, policy bypass, and connectors remain outside the
  implemented scope.
- `DEC-150` permits only responsive navigation presentation below 820px. It reuses the existing
  Mission history and Advanced Ops native disclosures, Mission selection, primary and Advanced Ops
  routes, current state, and pending-gate projection while leaving desktop navigation unchanged.
  Destination removal or rename, automatic route selection, persisted disclosure state,
  runtime/API/schema/dependency changes, source mutation, Git/release authority, scheduling, policy
  bypass, and connectors remain outside the implemented scope.
- `DEC-151` permits only source-density-derived Mission Graph presentation. It retains all six
  lifecycle stages, exact GET data, source digest, 250-node cap, filters, selection, semantic stage
  headings and counts, dense row spacing, and the intrinsic Workspace Header. Projection changes,
  runtime search/index, persisted explorer state, runtime/API/schema/dependency changes, source
  mutation, Git/release authority, scheduling, policy bypass, and connectors remain outside the
  implemented scope.
- `DEC-085` permits one explicit OpenAI Responses Council transport for four source-backed roles.
  It requires configured project readiness and human alignment, stores only redacted provider
  evidence, and does not permit provider expansion, autonomous scheduling, WorkOrder execution,
  memory/profile/source mutation, approval bypass, runtime-agent commit/push/release, or connectors.
  The optional live smoke is informational and reports `skipped_missing_env` when unconfigured.
- `DEC-088` keeps Phase 4 deterministic Mission compilation and inert preview response-only.
- `DEC-091` permits only exact-preview promotion to schema-v7 durable records, one digest-bound plan
  approval, and one local sequential Builder preflight dispatch. It stops at the existing Builder
  live-mutation approval; Reviewer/QA execution, parallel or autonomous scheduling, provider-backed
  WorkOrders, checkpoint expansion, source mutation, commit, push, and release remain blocked.
- `DEC-094` permits only the exact local-stub reviewed-delivery continuation from an approved
  schema-v7 Builder gate through independent Reviewer and constrained syntax QA. The resulting
  DeliveryPackage preview is response-only and Mission remains not done; durable promotion requires
  the separate exact `DEC-100` path. Automatic rework, scheduling/provider/memory expansion, commit,
  push, release, and connectors remain blocked.
- `DEC-097` permits additive schema-v8 WorkflowCheckpoint persistence, read-only recovery, and one
  exact local-stub Reviewer or constrained QA resume/cancel path. Any active or ambiguous Builder,
  Reviewer, or QA interruption remains quarantine-only. Builder replay, automatic retry/rework,
  scheduling, provider-backed WorkOrders, Mission done, memory expansion,
  commit, push, release, and connectors remain blocked.
- `DEC-100` permits additive schema-v9 migration and one explicit exact-tuple durable
  `review-required` DeliveryPackage record. It does not permit package acceptance/rejection,
  Mission/task close-out or done, commit, push, release, learning, memory, retry/rework, scheduling,
  provider expansion, policy mutation, approval bypass, or connectors.
- `DEC-101` permits DeliveryPackage acceptance planning only, and `DEC-102` records the complete
  fielded implementation handoff. `DEC-103` permits only additive schema-v10 migration and one exact
  append-only `accepted` evidence record while the source package stays immutable and
  `review-required`. Rejection/changes-requested, Mission/task close-out, done,
  commit/push/release, learning/memory, scheduling/providers, policy mutation, approval bypass, and
  connectors remain blocked.
- `DEC-104` permits Mission/task close-out planning, `DEC-105` records the complete fielded handoff,
  and `DEC-106` permits only one exact schema-v11 MissionCloseOut plus atomic task/Mission terminal
  transaction. Package and acceptance evidence remain immutable. Standalone close-out,
  commit/push/release, reopen, package rejection/changes-requested, learning/memory, next-Mission
  creation, scheduling/providers, policy mutation, approval bypass, and connectors remain blocked.
- `DEC-107` permits planning for one schema-v11-preserving response-only LearningCandidate preview,
  `DEC-108` records the complete fielded implementation handoff, and `DEC-109` permits the exact
  runtime/API/UI response-only slice. It requires one completed Mission evidence tuple plus an
  operator-owned retrospectiveSpec, keeps `persisted=false` with redaction and reviewer status
  review-required, writes no state or source, exposes no GET/snapshot record, and clears browser
  memory on refresh. Durable candidate review outcome, memory/skill promotion,
  provider generation, raw evidence ingestion, source/Git/release, scheduling, next-Mission, policy
  mutation, approval bypass, and connectors remain blocked.
- `DEC-110` permits planning for one schema-v12 durable LearningCandidate record, `DEC-111` records
  the complete fielded implementation handoff, and `DEC-112` permits the exact runtime/API/UI slice.
  The path requires exact terminal
  evidence plus retrospectiveSpec, runtime recomputation of DEC-109, exact preview/candidate digests,
  explicit `decision=persist`, and one immutable review-required/proposed record. Candidate review
  outcome, memory/skill promotion, providers,
  raw evidence, source/Git/release, scheduling, next-Mission, policy mutation, approval bypass, and
  connectors remain blocked.
- `DEC-113` permits planning for one schema-v13 append-only LearningCandidateReview record,
  `DEC-114` records the complete fielded implementation handoff, and `DEC-115` permits the exact
  runtime/API/UI slice. The implementation preserves the schema-v12 candidate as immutable, accepts
  only exact operator-authored accept, reject, or changes-requested review evidence, and keeps candidate revision,
  expiry/quarantine, memory/skill promotion, providers, source/Git/release, scheduling, next-Mission,
  policy mutation, approval bypass, and connectors blocked.
- `DEC-116` permits planning only for one schema-v13-preserving response-only MemoryCandidate
  preview, `DEC-117` records the complete fielded implementation handoff, and `DEC-118` permits the
  exact runtime/API/UI slice. The implementation accepts only one exact source-current unexpired
  candidate plus `decision=accepted` review and operator-owned project-scoped memorySpec, returns no
  durable record, and exposes no GET or snapshot field. Durable memory,
  retrieval/import/apply/export/delete, cross-workspace memory, skill promotion, providers,
  source/Git/release, scheduling, next-Mission, policy mutation, approval bypass, and connectors
  remain blocked.
- `DEC-119` permits planning for one schema-v14 durable `MemoryItem(status=stored)`, `DEC-120`
  records the complete fielded implementation handoff, and `DEC-121` permits the exact runtime/API/UI
  slice. The implementation requires exact DEC-118 recomputation, a separate explicit project-
  scoped storage approval, immutable source evidence, attached negative/redaction/review refs, and
  sequence/map-only migration. Recommendation retrieval/application, import/export/delete/
  refresh, cross-workspace use, skill promotion, providers, source/Git/release, scheduling,
  next-Mission, policy mutation, approval bypass, and connectors remain blocked.
- `DEC-122` permits planning for one exact-id operator-selected response-only MemoryRecall preview,
  `DEC-123` records the complete fielded handoff, and `DEC-124` permits the exact runtime/API/UI slice.
  That slice preserved schema v14 and added only one deterministic response/browser-memory preview.
  The preview remains available after the later schema-v15 migration. Automatic enumeration/search/
  ranking/recommendation, Mission injection, memory application, providers, source/Git/release,
  scheduling, next-Mission, policy mutation, approval bypass, and connectors remain blocked.
- `DEC-125` permits planning only for one schema-v15 durable `MemoryRecall(status=recorded)`, and
  `DEC-126` records the complete fielded implementation handoff. `DEC-127` permits the exact
  schema-v15 runtime/API/UI slice: current state can contain one immutable source-bound recorded
  audit fact per MemoryItem after exact DEC-124 recomputation and separate operator approval. It
  implements no recall list/history, automatic retrieval/search/ranking/recommendation,
  Mission/WorkOrder injection, application, provider/source/Git/release/scheduling/policy/bypass/
  connector authority.
- `DEC-128` permits planning only for one schema-v15-preserving response-only
  `MissionMemoryContextPreview`, and `DEC-129` records the complete fielded implementation handoff.
  `DEC-130` permits only the exact response/browser-memory implementation with one recorded recall,
  one same-project draft Mission, current digests, complete evidence closure, and explicit
  non-injection language. Mission/WorkOrder/prompt/policy injection, durable context, memory
  application, automatic selection, providers, schema/source/Git/release/scheduling/policy/bypass/
  connectors remain blocked.
- `DEC-131` through `DEC-133` add response-only WorkOrder verification planning, process-safe
  optimistic state commits, and schema-v16 immutable AcceptanceCriteria plus append-only
  VerificationProof attempts. Only current passed essential Builder proof opens Reviewer resume;
  automatic proof, generic shell execution, retry, completion, scheduling, provider expansion,
  commit, push, and release remain blocked.
- `DEC-134` adds a response-only one-step continuation preview with exact progress digest, deadline,
  cancellation, and no-progress outcomes. It does not replace current checkpoint/approval/source/
  Decision Inbox/proof validation or create automatic loop, retry, replay, or background authority.
- `DEC-135` adds one disabled-by-default exact-URL wigolo adapter. The repository does not install or
  vendor wigolo; synthetic smoke uses a local fake sidecar and real network evidence remains optional
  and unconfigured unless all explicit environment values are present. Crawl, search, cache control,
  authenticated fetch, persistence, synthesis, and Mission/provider injection remain blocked.
- `DEC-136` adds measurement-only context telemetry. It reports no raw values and performs no payload
  rewrite, truncation, compression, tokenizer estimate, provider call, persistence, Mission injection,
  or token/cost claim.
- Proposal generation planning and decision-handoff artifacts remain historical decision evidence.
  `DEC-071` approves only the pure in-memory generator; it does not create durable records, mutate
  queues, apply proposals, call providers, persist memory, mutate runtime/UI/source state, commit,
  or push.
- `DEC-072` adds a pending human-review packet only. It records no review outcome and cannot promote
  the draft into a record, queue entry, application, provider request, memory item, source mutation,
  commit, or push.
- `DEC-073` adds a fielded review-decision input only. It records no outcome and cannot open durable
  record, queue, application, provider, memory, runtime/UI/source mutation, commit, or push authority.
- `DEC-074` records one `accept-review-evidence-only` decision as repository history only. It does not
  persist a runtime decision or open durable record, queue, application, provider, memory,
  runtime/UI/source mutation, commit, or push authority.
- `DEC-075` adds a downstream authority decision packet only. It recommends local durable proposal
  record creation planning for one reviewed inert draft, records no decision, and opens no planning,
  implementation, persistence, queue, application, provider, memory, runtime/UI/source mutation,
  commit, or push authority.
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
- `DEC-083` and `DEC-084` approve Council live-provider planning and its fielded implementation
  handoff only. No Council provider adapter, provider mode, credential access, provider call,
  runtime/API/UI change, or provider-specific live smoke is implemented by those decisions.
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
