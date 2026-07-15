# AI Company WorkOrder Persistence And Sequential Execution Decision Handoff

## Purpose

이 문서는 `docs/60_ai-company-workorder-persistence-execution-plan.md`의 planning-only evidence를
schema/runtime/API/UI execution implementation decision으로 넘기기 위한 copy-ready fielded
handoff다. 이 문서 자체는 schema migration, durable records, approval creation, WorkOrder dispatch,
provider call, source mutation, commit, push, release authority를 열지 않는다.

## Current Gate

- Planning authority: accepted as `DEC-089`
- Decision handoff evidence: `DEC-090`
- Implementation authority: blocked pending one complete fielded decision
- Current runtime: schema v6 plus response-only Phase 4 preview
- Reviewer/QA execution, parallel scheduling, mutation, and downstream delivery: blocked

## Source Evidence

- `DEC-076`, `DEC-079`, `DEC-082`, `DEC-085`, `DEC-088`, `DEC-089`, `DEC-090`
- `docs/48_ai-company-master-plan.md`
- `docs/49_agent-runtime-contract.md`
- `docs/50_council-operating-protocol.md`
- `docs/51_ai-company-delivery-roadmap.md`
- `docs/58_ai-company-mission-workorder-compiler-implementation-plan.md`
- `docs/60_ai-company-workorder-persistence-execution-plan.md`
- `src/runtime/contracts.js`
- `src/runtime/file-store.js`
- `src/runtime/mission-workorder-compiler.js`
- `src/runtime/runtime-service.js`
- `src/execution/execution-coordinator.js`
- `scripts/serve-ui-slice-01.mjs`
- `node scripts/smoke-ai-company-workorder-persistence-execution-planning.mjs`
- `node scripts/verification_status.mjs`

## Valid Implementation Decision Shape

```text
decisionId=operator-decision-ai-company-workorder-persistence-execution-implementation-001
decisionStatus=approve-ai-company-workorder-persistence-execution-implementation-slice
targetAuthority=one local deterministic schema-v7 durable ExecutionPlan and WorkOrder record path with one digest-bound operator approval and one sequential Builder dispatch stopping at the existing live-mutation approval gate
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-workorder-persistence-execution.mjs, scripts/smoke-ui-slice-654.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/60_ai-company-workorder-persistence-execution-plan.md
runtimePath=recompute one source-current DEC-088 preview from exact compileSpec, require exact previewId and sourceDigest, atomically migrate schema v6 to v7 and persist one plan three WorkOrders three handoffs one linked control task and one digest-bound task-owned approval, reconcile approval or rejection through the existing Decision Inbox, and after a separate approved start dispatch only the Builder WorkOrder through the existing local-stub planner architect task-breaker builder-preflight chain before stopping at the existing targeted live-mutation approval
compatibilityPlanRefs=preserve Phase 4 response-only preview and absent-mode Council auto-chain, preserve existing task approval provider and execution behavior outside the new routes, add no provider adapter role prompt pack CompanyBlueprint or Council contract changes, and reject non-local provider mode for the new sequential dispatch
migrationPlanRefs=add schemaVersion 7 executionPlan workOrder and handoffPacket sequences and maps, migrate valid v6 state additively without changing existing domain values, reject unknown future schema and partial v7 records, and preserve v7 evidence during rollback without downgrade
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-089, DEC-090, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/58_ai-company-mission-workorder-compiler-implementation-plan.md, docs/60_ai-company-workorder-persistence-execution-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/mission-workorder-compiler.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs
negativeEvidenceRefs=current state is schema v6 with no durable plan WorkOrder or handoff maps, no plan approval scope or sequential WorkOrder coordinator exists, current preview is response-only, and Reviewer and QA have no independent executable Phase 5 runtime
rollbackRefs=disable persistence and sequential-start routes and UI controls, stop new dispatch, retain and mark non-terminal v7 plans and WorkOrders blocked or cancelled with rollback evidence, preserve linked task run artifact inbox approval and Council evidence, keep Phase 4 preview and legacy Council behavior, and rerun migration focused UI compatibility and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-workorder-persistence-execution.mjs proving exact preview and digest gating atomic v6-to-v7 migration deterministic idempotent persistence approval and rejection binding local-stub-only dependency-ready Builder dispatch stop at targeted live-mutation approval no source change no Reviewer or QA dispatch reload rollback and legacy compatibility; scripts/smoke-ui-slice-654.mjs proving explicit persist approve and start states blocked downstream controls safe API failures reload evidence and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=builder live mutation, Reviewer or QA WorkOrder execution, parallel dynamic autonomous or retry scheduling, provider-backed WorkOrder dispatch, provider expansion, memory or checkpoint expansion, profile or source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, external connectors
approvalStatement=I approve implementation only for the schema-v7 durable plan records, digest-bound operator approval, and one local sequential Builder dispatch described in docs/60_ai-company-workorder-persistence-execution-plan.md. This permits no source mutation and must stop at the existing builder live-mutation approval. It does not approve Reviewer or QA execution, parallel or autonomous scheduling, provider-backed WorkOrder dispatch, memory or checkpoint expansion, source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, or external connectors.
```

## Rejection Decision Shape

```text
decisionId=operator-decision-ai-company-workorder-persistence-execution-implementation-001
decisionStatus=reject-ai-company-workorder-persistence-execution-implementation
targetAuthority=one local deterministic schema-v7 durable ExecutionPlan and WorkOrder record path with one digest-bound operator approval and one sequential Builder dispatch stopping at the existing live-mutation approval gate
targetSurface=docs/60_ai-company-workorder-persistence-execution-plan.md
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=schema migration durable records plan approval WorkOrder dispatch or execution Reviewer QA scheduling providers memory checkpoints source mutation approval bypass runtime-agent commit push release external connectors
approvalStatement=I reject the WorkOrder persistence and sequential execution implementation slice for now. Planning evidence remains available, while schema runtime API UI execution and downstream authority stay blocked.
```

## Invalid Shortcuts

These are not implementation approval:

- `continue`
- `approved`
- `approve all`
- `do everything`
- `self-approve implementation`
- approval that omits schema migration, exact record contracts, digest-bound approval, local-stub-only
  dispatch, existing live-mutation stop, rollback, focused smoke, or still-blocked authority
- approval that also opens source mutation, Reviewer/QA execution, provider-backed dispatch,
  parallel/autonomous scheduling, checkpoints, commit, push, release, or connectors

## Minimum Acceptance Criteria

1. Use the exact implementation `decisionStatus`, target authority, and target allowlist.
2. Reference `docs/60_ai-company-workorder-persistence-execution-plan.md`.
3. Authorize only additive schema v7 records and safe v6 migration.
4. Require source-current recompilation plus exact preview and source digests before persistence.
5. Bind one task-owned approval to exact plan provenance and require a separate start command.
6. Dispatch only the dependency-ready Builder WorkOrder in local-stub mode.
7. Stop at the existing targeted builder live-mutation approval with no source mutation.
8. Prove idempotency, reload, rejection retention, rollback retention, and no duplicate dispatch.
9. Preserve Phase 4 preview, legacy Council behavior, and existing execution semantics elsewhere.
10. Keep Reviewer/QA execution and every downstream authority blocked.

## Still Blocked After Approval

- builder live mutation and any project source-file write
- Reviewer or QA WorkOrder execution
- parallel, dynamic, autonomous, retry, or unattended scheduling
- provider-backed WorkOrder dispatch or provider/role expansion
- durable checkpoints, resume automation, or memory expansion
- CompanyBlueprint, AgentProfile, Council, prompt, pack, or provider policy mutation
- approval bypass, runtime-agent commit, push, release, external connectors

## Stop Conditions

- Required field or target file is omitted from the fielded decision.
- Schema migration can lose, rewrite, or partially normalize existing v6 records.
- Persistence can occur without exact preview/source digest validation.
- Approval is not bound to plan, task, preview, and source evidence.
- Repeated persistence or start can duplicate records, runs, artifacts, or approvals.
- New dispatch can use a live provider, mutate source, or pass the live-mutation gate.
- Reviewer/QA or parallel scheduling becomes reachable.
- Rollback deletes v7, task, run, artifact, inbox, approval, or Council evidence.
- Focused migration/runtime/API/UI or aggregate verification fails.

## Verification

```bash
node scripts/smoke-ai-company-workorder-persistence-execution-planning.mjs
node scripts/smoke-ai-company-mission-workorder-compiler.mjs
node scripts/smoke-ui-slice-653.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```
