# AI Company Reviewed Delivery Implementation Decision Handoff

## Purpose

이 문서는 `docs/62_ai-company-reviewed-delivery-planning-plan.md`의 planning-only evidence를
실제 source mutation, Reviewer/QA WorkOrder execution, API/UI continuation으로 넓힐지 operator가
complete fielded shape로 결정할 수 있게 한다. 이 문서는 implementation approval이 아니며
runtime, schema, source, provider, UI 또는 durable state를 변경하지 않는다.

## Current Gate

- Planning-only decision: accepted as `DEC-092`
- Implementation handoff: documented as `DEC-093`
- Current runtime: schema v7 durable plan with Builder stopped at exact live-mutation approval
- Implementation authority: blocked
- Source mutation and Reviewer/QA dispatch: blocked
- DeliveryPackage: documented contract only; no composer or record

General approval, continuation wording, delegated non-critical self-approval, or approval of the
existing plan does not open this source-mutation and execution-sensitive implementation.

## Minimum Required Decision Fields

```text
decisionId=
decisionStatus=
targetAuthority=
targetSurface=
implementationPlanRefs=
runtimePath=
compatibilityPlanRefs=
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
decisionId=operator-decision-ai-company-reviewed-delivery-implementation-001
decisionStatus=approve-ai-company-reviewed-delivery-implementation-slice
targetAuthority=one explicit local-stub pass-path from one schema-v7 ExecutionPlan Builder waiting-gate through the exact approved live mutation, independent Reviewer, constrained node syntax QA, and one response-only DeliveryPackage preview
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, src/execution/qa-node-check-runner.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-reviewed-delivery.mjs, scripts/smoke-ui-slice-655.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/62_ai-company-reviewed-delivery-planning-plan.md
runtimePath=require one source-current schema-v7 plan active at Builder waiting-gate plus the exact approved terminal live-mutation approval and explicit continue request, reuse existing local-stub Builder mutation and Reviewer, stop on changes-requested, run only shell-free allowlisted node --check QA, persist one qa-evidence artifact, compose one response-only DeliveryPackage preview, and stop before Mission done commit push or release
compatibilityPlanRefs=keep schemaVersion 7, preserve DEC-091 persistence/start and Phase 4 response-only preview, preserve standalone task Builder/Reviewer routes and Council behavior, reject provider-backed WorkOrder continuation, and add no durable DeliveryPackage record
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-085, DEC-088, DEC-091, DEC-092, DEC-093, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/60_ai-company-workorder-persistence-execution-plan.md, docs/62_ai-company-reviewed-delivery-planning-plan.md, src/runtime/contracts.js, src/runtime/runtime-service.js, src/execution/execution-coordinator.js, scripts/serve-ui-slice-01.mjs
negativeEvidenceRefs=no durable continuation after Builder waiting-gate, no WorkOrder reconciliation for existing Builder or Reviewer runs, no independent QA runner or qa-evidence artifact, no DeliveryPackage composer, and no changes-requested WorkOrder attempt runtime
rollbackRefs=disable continue and delivery-preview routes and UI controls, stop new dispatch, restore failed Builder targets through the existing coordinator rollback, retain durable plan run artifact approval and inbox evidence, mark non-terminal WorkOrders blocked with rollback evidence, discard response-only packages, preserve DEC-091 inspection and waiting-gate behavior, and rerun focused plus aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-reviewed-delivery.mjs proving exact approval and digest binding, bounded Builder mutation and rollback, passed Reviewer dependency, changes-requested stop, constrained node-check QA, qa-evidence provenance, deterministic response-only DeliveryPackage, reload idempotency and blocked downstream authority; scripts/smoke-ui-slice-655.mjs proving approval-gated continuation, safe progress and failure evidence, response-only package rendering, blocked controls and desktop/mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=durable DeliveryPackage persistence, Mission done, automatic changes-requested rework, parallel dynamic autonomous retry or checkpoint scheduling, provider-backed WorkOrder execution, provider expansion, memory or checkpoint persistence, profile or policy mutation, approval bypass, runtime-agent commit, runtime-agent push, release, external connectors
approvalStatement=I approve implementation only for the explicit local-stub reviewed-delivery pass-path described in docs/62_ai-company-reviewed-delivery-planning-plan.md. This permits source mutation only through the existing exact Builder live-mutation approval, then one independent Reviewer and constrained node syntax QA before a response-only DeliveryPackage preview. It does not approve durable DeliveryPackage records, Mission done, automatic rework, arbitrary commands, scheduling expansion, provider-backed WorkOrders, memory or checkpoints, approval bypass, runtime-agent commit, runtime-agent push, release, or external connectors.
```

## Other Valid Outcomes

### Request More Evidence

```text
decisionId=operator-decision-ai-company-reviewed-delivery-implementation-001
decisionStatus=request-reviewed-delivery-implementation-evidence
requestedEvidenceRefs=
decisionNotes=
approvalStatement=I request the named evidence before reviewed-delivery implementation authority can open.
```

### Reject

```text
decisionId=operator-decision-ai-company-reviewed-delivery-implementation-001
decisionStatus=reject-ai-company-reviewed-delivery-implementation
decisionNotes=
approvalStatement=I reject the reviewed-delivery implementation slice. The DEC-091 waiting-gate baseline remains authoritative.
```

### Defer

```text
decisionId=operator-decision-ai-company-reviewed-delivery-implementation-001
decisionStatus=defer-ai-company-reviewed-delivery-implementation
decisionNotes=
approvalStatement=I defer the reviewed-delivery implementation slice. No source mutation or Reviewer/QA WorkOrder authority opens.
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

They do not identify the exact source-mutation boundary, QA command restriction, response-only
package contract, rollback, smoke evidence, or still-blocked authority.

## Minimum Acceptance Criteria

An approval is complete only when it:

1. names the exact `docs/62_ai-company-reviewed-delivery-planning-plan.md` target;
2. binds continuation to the current plan, source digest, terminal approval, preflight artifact/run,
   and linked control task;
3. permits source mutation only through the existing Builder live-mutation gate;
4. keeps local-stub-only execution and stops on Reviewer changes requested;
5. restricts QA to shell-free allowlisted `node --check` checks;
6. keeps DeliveryPackage response-only and Mission done false;
7. names rollback and focused runtime/API/UI smoke refs;
8. explicitly keeps commit, push, release, scheduling, providers, memory, checkpoints, and connectors
   blocked.

## Stop Conditions

Stop and do not implement when:

- the decision omits required fields or uses only a shortcut;
- the target permits arbitrary shell or test command execution;
- the target bypasses or weakens the existing Builder approval/provenance checks;
- source-current plan, preflight, approval, or changed-file evidence cannot be proven;
- the target auto-runs after approval, auto-reworks changes requested, or schedules parallel work;
- DeliveryPackage persistence, Mission done, commit, push, or release is bundled into the same slice;
- rollback cannot preserve source and runtime evidence.

## Verification After A Later Decision

```bash
node scripts/smoke-ai-company-reviewed-delivery-planning.mjs
node scripts/smoke-ai-company-reviewed-delivery.mjs
node scripts/smoke-ui-slice-655.mjs
node scripts/ui_qa_status.mjs
node scripts/verification_status.mjs
```

Until the complete fielded approval is accepted, only the planning smoke exists and implementation
smokes/routes/controls remain blocked.
