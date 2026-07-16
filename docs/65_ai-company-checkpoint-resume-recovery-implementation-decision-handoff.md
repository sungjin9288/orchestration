# AI Company Checkpoint Resume And Recovery Implementation Decision Handoff

## Purpose

이 문서는 `docs/64_ai-company-checkpoint-resume-recovery-plan.md`의 planning-only evidence를
schema-v8 durable checkpoint, restart recovery, explicit resume/cancel implementation으로 넓힐지
operator가 complete fielded shape로 결정할 수 있게 작성된 handoff다. 이 문서 자체는 schema,
runtime, API, UI, execution, provider, source mutation, commit, push, 또는 release authority를 열지
않는다.

## Current Gate

- Planning-only decision: accepted as `DEC-095`
- Implementation handoff: documented as `DEC-096`
- Complete fielded implementation decision: supplied and accepted as `DEC-097`
- Current runtime: schema v8 with WorkflowCheckpoint records, read-only recovery, and explicit resume/cancel routes
- Safe resume target: exact current local-stub `reviewer-ready` or `qa-ready` checkpoint only
- Active/ambiguous stages: quarantine only; no replay

This handoff is consumed provenance. It does not widen the implemented target or open any downstream
authority beyond the exact `DEC-097` decision.

## Minimum Required Decision Fields

```text
decisionId=
decisionStatus=
targetAuthority=
targetSurface=
implementationPlanRefs=
runtimePath=
compatibilityPlanRefs=
migrationPlanRefs=
recoveryPlanRefs=
sourceEvidenceRefs=
negativeEvidenceRefs=
rollbackRefs=
focusedSmokeRefs=
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=
approvalStatement=
```

## Recommended Approval Shape

```text
decisionId=operator-decision-ai-company-checkpoint-resume-recovery-implementation-001
decisionStatus=approve-ai-company-checkpoint-resume-recovery-implementation-slice
targetAuthority=one local deterministic schema-v8 WorkflowCheckpoint path and one explicit operator resume or cancel path for a source-current schema-v7 reviewed-delivery ExecutionPlan at reviewer-ready or qa-ready only
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/workflow-checkpoints.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-checkpoint-resume-recovery.mjs, scripts/smoke-ui-slice-656.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/64_ai-company-checkpoint-resume-recovery-plan.md
runtimePath=atomically migrate valid schema v7 state to v8, append digest-bound WorkflowCheckpoint records at durable reviewed-delivery boundaries, recompute current input and authority digests after restart, expose read-only recovery classification, require exact checkpoint and digest tuples for explicit resume or cancel, resume only reviewer-ready or qa-ready through existing local-stub Reviewer or constrained QA, append attempt history, and stop at the next durable boundary
compatibilityPlanRefs=preserve DEC-091 persistence and Builder waiting-gate, DEC-094 exact reviewed-delivery continuation, Phase 4 response-only preview, standalone task and Council paths, response-only DeliveryPackage behavior, existing provider and QA contracts, and states without ExecutionPlans or checkpoints
migrationPlanRefs=add schemaVersion 8 workflowCheckpoint sequence and map plus additive executionPlan checkpoint refs, preserve every existing schema-v7 domain value, reject unknown future schema and partial v8 records, save migration and checkpoint append atomically, and retain v8 evidence during rollback without downgrade
recoveryPlanRefs=treat only reviewer-ready and qa-ready as executable resume boundaries, keep builder-waiting-gate on the existing exact continue path, classify delivery-ready as terminal, quarantine every interrupted active Builder Reviewer or QA stage, reject stale digest policy authority source graph or evidence refs, never auto-resume on boot read render approval or timeout, and create no duplicate completed run artifact or checkpoint
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-091, DEC-094, DEC-095, DEC-096, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/60_ai-company-workorder-persistence-execution-plan.md, docs/62_ai-company-reviewed-delivery-planning-plan.md, docs/64_ai-company-checkpoint-resume-recovery-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs
negativeEvidenceRefs=current state is schema v7 with no workflowCheckpoint sequence map or plan refs, reviewed-delivery is one synchronous request chain, there is no durable stage digest attempt history recovery classifier resume cancel API or UI, and interrupted active stages cannot prove whether execution completed before reconciliation
rollbackRefs=disable resume and cancel entrypoints and UI controls, stop new attempts, retain recovery inspection where safe, quarantine resumable non-terminal checkpoints with rollback evidence, preserve schema v8 checkpoint plan WorkOrder task run artifact inbox approval and source evidence, never downgrade delete or replay uncertain state, and rerun migration restart focused UI compatibility and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-checkpoint-resume-recovery.mjs proving atomic v7-to-v8 migration deterministic checkpoint and digest binding restart from reviewer-ready and qa-ready no duplicate completed units stale and authority mismatch refusal active-stage quarantine cancellation retention attempt history reload rollback and DEC-091 DEC-094 compatibility; scripts/smoke-ui-slice-656.mjs proving recovery inspection exact-gated resume cancel stale quarantine safe API failures blocked downstream controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=Builder mutation replay, automatic retry or rework, parallel dynamic autonomous or background scheduling, provider-backed WorkOrder execution, provider expansion, durable DeliveryPackage, Mission done, memory or organizational learning persistence, profile or policy mutation, approval bypass, runtime-agent commit, runtime-agent push, release, external connectors
approvalStatement=I approve implementation only for the schema-v8 safe-boundary checkpoint and explicit local-stub Reviewer or QA resume/cancel path described in docs/64_ai-company-checkpoint-resume-recovery-plan.md. This permits no active Builder replay, automatic retry, provider-backed scheduling, durable DeliveryPackage, Mission done, memory expansion, approval bypass, runtime-agent commit, runtime-agent push, release, or external connectors.
```

## Other Valid Outcomes

### Request More Evidence

```text
decisionId=operator-decision-ai-company-checkpoint-resume-recovery-implementation-001
decisionStatus=request-ai-company-checkpoint-resume-recovery-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before checkpoint and recovery implementation authority can open.
```

### Reject

```text
decisionId=operator-decision-ai-company-checkpoint-resume-recovery-implementation-001
decisionStatus=reject-ai-company-checkpoint-resume-recovery-implementation
decisionNotes=
approvalStatement=I reject the checkpoint resume and recovery implementation slice. Schema v7 and DEC-094 remain authoritative.
```

### Defer

```text
decisionId=operator-decision-ai-company-checkpoint-resume-recovery-implementation-001
decisionStatus=defer-ai-company-checkpoint-resume-recovery-implementation
decisionNotes=
approvalStatement=I defer the checkpoint resume and recovery implementation slice. No schema v8 checkpoint or resume authority opens.
```

## Invalid Shortcuts

These are not implementation approval:

```text
approval
approved
continue
do everything
approve all
self approve
use your judgment
```

They do not identify migration, safe boundaries, digest binding, active-stage quarantine, rollback,
focused restart evidence, or still-blocked authority.

## Minimum Acceptance Criteria

An approval is complete only when it:

1. names `docs/64_ai-company-checkpoint-resume-recovery-plan.md` exactly;
2. names the complete schema-v8 target allowlist and migration contract;
3. preserves every existing schema-v7 domain value and rejects partial/future state;
4. allows executable resume only from exact current `reviewer-ready` or `qa-ready` checkpoints;
5. quarantines every interrupted active Builder, Reviewer, or QA stage without replay;
6. binds resume/cancel to checkpoint, input, authority, source, graph, and evidence digests;
7. preserves attempt, stale, cancellation, quarantine, rollback, and source evidence;
8. proves no duplicate completed unit, provider call, run, artifact, or checkpoint;
9. preserves DEC-091, DEC-094, response-only delivery, standalone task, and Council behavior;
10. keeps scheduling/provider/memory/Mission done/commit/push/release/connectors blocked.

## Stop Conditions

Stop and do not implement when:

- the decision omits required fields or uses only a shortcut;
- migration can lose, rewrite, partially normalize, or downgrade existing schema-v7 evidence;
- an active or ambiguous stage can be replayed automatically;
- resume is not bound to exact current digests and one allowed action;
- process boot, GET, UI render, approval resolution, timeout, or cancellation can start work;
- repeated resume can duplicate completed execution or evidence;
- checkpoint deletion, hidden replacement, provider expansion, scheduling, memory, Mission done,
  commit, push, release, or connectors are bundled into the slice;
- focused migration/restart/runtime/API/UI or aggregate verification fails.

## Verification After The Accepted Decision

```bash
node scripts/smoke-ai-company-checkpoint-resume-recovery-planning.mjs
node scripts/smoke-ai-company-checkpoint-resume-recovery.mjs
node scripts/smoke-ui-slice-656.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ui-slice-655.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

The accepted Phase 7 implementation must keep all commands above green. Builder replay, scheduling,
provider-backed WorkOrders, durable DeliveryPackage, Mission done, memory, commit, push, release, and
external connectors remain blocked.
