# Loop Engineering Concept Review

## Purpose
This note records how the Loop Engineering concept should influence Orchestration after the
completed v1 baseline and the AgentWay harness concept pass.

Checked sources:

- PyTorchKR discussion article: `https://discuss.pytorch.kr/t/loop-engineering/10796`
- Local attachment: `/Users/sungjin/.codex/attachments/45246957-740b-495a-9d9a-8b337224f58d/pasted-text.txt`

The source describes Loop Engineering as designing a feedback loop where an AI agent discovers,
plans, executes, verifies, and iterates until a goal is satisfied. For this repo, the useful
interpretation is not "let agents run freely." The useful interpretation is:

> Orchestration should design bounded, inspectable, approval-aware loops that keep verification
> and stop conditions first-class.

## Source Caveat
The PyTorchKR article itself says the post was summarized with a GPT model and may differ from the
original intent. Treat it as a source-only concept signal, not as authoritative product policy or
provider guidance.

Any claims in the source about model pricing, model specs, `/loop` or `/goal` command availability,
or frontier-model economics remain reference context only. They do not change Orchestration's
provider strategy, live-provider boundary, or local-stub default.

## Concept Extraction

### 1. Loop Skeleton
The reusable loop skeleton is:

1. `Discover`: identify goal, context, constraints, and missing information.
2. `Plan`: produce a bounded path with expected checks.
3. `Execute`: mutate or produce output only inside the approved boundary.
4. `Verify`: run independent checks against the success criteria.
5. `Iterate`: repeat only when the failure mode is understood and the next attempt remains bounded.

Orchestration already maps this to:

- `Mission / Council`: discover and align
- `planner / architect / task-breaker`: plan and narrow the execution boundary
- `builder-preflight / builder-live-mutation`: execute only after explicit approval
- `reviewer / verification evidence`: verify independently
- `follow-up gates`: iterate or close only through visible decisions, review, and approval

### 2. Closed Loop First
The article separates open loops from closed loops. Orchestration should adopt the closed-loop
interpretation first:

- explicit goal
- explicit stage sequence
- explicit stop condition
- explicit evaluation gate
- explicit human return points
- explicit local evidence

Open-loop exploration, unattended background automation, and broad agent fleet autonomy remain out
of scope until a later decision defines budget, permissions, rollback, redaction, and evidence
boundaries.

### 3. Six Components Reframed For Orchestration

| Source component | Orchestration interpretation |
| --- | --- |
| Automations | Operator-invoked or approved local loops only; no hidden cron or unattended provider-driven mutation. |
| Worktrees | Keep linked worktree isolation and exact worktree guards for release/close-out; do not use worktrees to bypass approval. |
| Skills | Treat skills as scoped workflow modules with applicability, tool scope, and verification outputs. |
| Plugins/connectors | Keep MCP/connectors optional and permission-gated; do not make messenger or external channel reach the default. |
| Subagents | Use delegation for responsibility partitioning and independent verification, not for uncontrolled parallelism. |
| Memory | Prefer repo docs, task ledgers, artifacts, and reviewed lessons; do not add a persistent memory store without ingest/redaction/export rules. |

### 4. Loop Engineering vs Existing Harness Engineering
Loop Engineering is compatible with the previous AgentWay harness review, but it emphasizes a
different question.

- Harness Engineering asks where system control lives.
- Loop Engineering asks how work advances, checks itself, and knows when to stop.

For Orchestration, these must be combined:

- control lives in repo docs, packs, approvals, runtime artifacts, and review records
- loops advance through the existing `development` pack stage order
- loops stop on explicit success, blocker, stale proof, failed verification, missing approval, or
  human decision needs

## Adopt / Keep / Defer / Reject

| Decision | Concept | Orchestration interpretation |
| --- | --- | --- |
| Adopt | Discover / Plan / Execute / Verify / Iterate | Use as a product and docs vocabulary for bounded work progression. |
| Adopt | Closed-loop-first posture | Keep loops narrow, inspectable, local, and approval-aware before considering open loops. |
| Adopt | Eval gate | Treat verification and review as the loop's stop/go condition, not a final explanation. |
| Adopt | Stop condition design | Every future loop proposal must name success, retry, escalation, and stop states. |
| Keep | Human gates | Approval and decision points remain explicit even when a loop can resume locally. |
| Keep | Worktree isolation | Parallel or iterative execution must keep provenance and linked-worktree guards intact. |
| Defer | Scheduled automation | Needs explicit operator opt-in, budget limits, local evidence retention, and rollback rules. |
| Defer | Fleet loops | Needs stronger subagent lifecycle, budget, state isolation, and independent synthesis contracts. |
| Defer | Persistent memory | Needs ingest, redaction, export, expiry, and applicability governance. |
| Reject | Open-loop autonomy as default | Do not let agents explore, mutate, or retry without explicit boundaries and review. |
| Reject | Provider-cost-driven architecture | Do not change provider strategy because a reference source claims cheaper loop execution. |
| Reject | "User waits for result" as sole UX | Operator must still see gates, evidence, blockers, and next human decisions. |

## Product Implications

### Mission
Mission entry can use Loop Engineering language to clarify:

- target outcome
- success checks
- constraints
- stop/escalation conditions

### Council
Council should not only discuss ideas. It should identify:

- missing context
- risk boundaries
- recommended loop shape
- expected verification gate
- where human approval is needed

### Execution
Execution should continue to show:

- current loop stage
- current owner
- current gate
- next safe action
- why the loop is stopped or allowed to continue

### Deliverables
Deliverables should summarize:

- what changed
- what verification passed or failed
- what was retried
- what remains open
- whether the loop is complete, blocked, or waiting on approval

## Next Safe Build Candidates
These are candidates, not approvals:

1. A growth reflection rule that flags any proposal that claims "loop automation" while omitting
   budget, retry, rollback, and approval boundaries.

## Implemented Read-Only Slice: `loop-readiness-status`

`node scripts/loop-readiness-status.mjs` implements the first safe build candidate as a read-only
status command. It checks the current source-of-truth docs for the required loop readiness shape:

- goal
- boundary
- verification gate
- stop condition
- human return point
- source-of-truth refs
- local evidence posture

The command does not accept arguments and does not execute work, call providers, persist memory,
schedule jobs, create commits, push, or open external connectors. Its focused smoke is
`node scripts/smoke-loop-readiness-status.mjs`, and aggregate coverage is registered in
`node scripts/verification_status.mjs`.

## Implemented UI Copy Slice: `mission-council-loop-stage-stop-condition-copy`

Mission과 Council 표면은 현재 loop stage와 stop condition을 source-derived copy로 표시한다.
이 slice는 `ui/app.js`의 existing mission, council, execution, deliverables previews를 조합해
`Discover / Plan / Execute / Verify / Iterate` 중 현재 stage와 사람에게 돌아갈 stop condition을
보여 주며, runtime route나 state schema를 만들지 않고 UI copy만 추가한다.

Focused smoke는 `node scripts/smoke-ui-slice-646.mjs`이고 aggregate coverage는
`node scripts/verification_status.mjs`에 등록되어 있다.

## Not Authorized By This Note
This review does not authorize:

- unattended scheduled execution
- open-loop exploration
- provider expansion or model-default changes
- persistent memory store adoption
- automatic pull request, push, merge, release, or external notification semantics
- new connector/channel execution
- weakening `project_path`, review, approval, linked-worktree, or local-demo-only gates

## Close-Out Judgment
Loop Engineering should be added to Orchestration as a bounded operating concept:

- design loops, not isolated prompts
- keep loops closed before opening them
- make verification the loop's control point
- preserve human approval and source-of-truth authority
- treat memory, skills, worktrees, connectors, and subagents as governed loop components

That strengthens the current Orchestration baseline without widening runtime scope.
