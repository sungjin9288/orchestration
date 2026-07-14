# AI Company Council Live Provider Implementation Decision Handoff

## Purpose

이 문서는 `Council live-provider opt-in implementation decision required` gate를 위한 copy-ready
operator input이다. 이 문서 자체는 provider implementation, credential access, provider call,
runtime/API/UI change authority가 아니다.

## Current Gate

- Phase 1 runtime blueprint: implemented and verified by `DEC-079`
- Phase 2 local-stub Real Council: implemented and verified by `DEC-082`
- Phase 3 planning decision: `operator-delegated-ai-company-council-live-provider-planning-001`
- Planning status: accepted for planning only by `DEC-083`
- Implementation plan: `docs/56_ai-company-council-live-provider-implementation-plan.md`
- Implementation handoff: documented by `DEC-084`
- Required synthetic baseline: `real-local-stub`
- Current runtime schema: v6
- Current gate: complete fielded Council live-provider implementation decision required

## Source Evidence

- `DEC-076`, `DEC-079`, `DEC-082`, `DEC-083`, `DEC-084`
- `docs/48_ai-company-master-plan.md`
- `docs/49_agent-runtime-contract.md`
- `docs/50_council-operating-protocol.md`
- `docs/51_ai-company-delivery-roadmap.md`
- `docs/54_ai-company-real-council-implementation-plan.md`
- `docs/56_ai-company-council-live-provider-implementation-plan.md`
- `company/blueprint.json`
- `company/roles/{conductor,strategist,architect,decomposer}.md`
- `src/runtime/council-sessions.js`
- `src/execution/council-coordinator.js`
- `src/execution/providers/council-local-stub-adapter.js`
- `src/execution/providers/openai-responses-adapter.js`
- `src/execution/providers/openai-responses-retry-policy.js`
- `node scripts/smoke-ai-company-council-live-provider-planning.mjs`
- `node scripts/verification_status.mjs`

## Valid Implementation Decision Shape

```text
decisionId=operator-decision-ai-company-council-live-provider-implementation-001
decisionStatus=approve-ai-company-council-live-provider-implementation-slice
targetAuthority=one explicit OpenAI Responses opt-in path for the existing Real Council normalized position and synthesis contract
targetSurface=company/blueprint.json, company/roles/conductor.md, company/roles/strategist.md, company/roles/architect.md, company/roles/decomposer.md, src/runtime/company-blueprint.js, src/runtime/council-sessions.js, src/execution/council-coordinator.js, src/execution/providers/council-openai-responses-adapter.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, scripts/smoke-ai-company-council-live-provider.mjs, scripts/smoke-ai-company-council-live-provider-live.mjs, scripts/smoke-ui-slice-652.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/56_ai-company-council-live-provider-implementation-plan.md
runtimePath=keep real-local-stub authoritative, require explicit real-openai-responses mode and provider readiness, execute isolated Strategist Architect and Decomposer requests sequentially, compute conflict in deterministic code, execute Conductor only with normalized positions, persist additive redacted provider evidence, and retain approve request-revision or stop human alignment
compatibilityPlanRefs=keep schemaVersion 6, do not edit createEmptyState or file-store normalization, preserve synchronous local-stub runtime methods and legacy routes, add an explicit async provider branch, preserve existing execution provider behavior, and keep optional live verification informational
sourceEvidenceRefs=DEC-076, DEC-079, DEC-082, DEC-083, DEC-084, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/54_ai-company-real-council-implementation-plan.md, docs/56_ai-company-council-live-provider-implementation-plan.md, company/blueprint.json, company/roles/conductor.md, company/roles/strategist.md, company/roles/architect.md, company/roles/decomposer.md, src/runtime/council-sessions.js, src/execution/council-coordinator.js, src/execution/providers/council-local-stub-adapter.js, src/execution/providers/openai-responses-adapter.js, src/execution/providers/openai-responses-retry-policy.js
negativeEvidenceRefs=no Council OpenAI Responses adapter, provider Council mode, Council provider allowlist, provider prompt contract, redacted provider attempt evidence, cancellation path, focused synthetic provider smoke, optional Council real-live smoke, or provider mode UI exists
rollbackRefs=disable real-openai-responses entrypoints, abort active requests, quarantine incomplete provider sessions, preserve normalized source evidence and schema v6, keep real-local-stub and legacy Council authoritative, rerun focused and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-council-live-provider.mjs proving role and mode allowlists, request isolation, schema parity, deterministic conflict-before-synthesis, bounded retry, timeout, cancellation, malformed output, missing configuration, redaction, call budget, schema v6 reload, local-stub and legacy compatibility; scripts/smoke-ai-company-council-live-provider-live.mjs optional and skipped_missing_env when unconfigured; scripts/smoke-ui-slice-652.mjs proving readiness-gated selection, safe progress and failure evidence, alignment parity, and unchanged local-stub UI
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=provider matrix expansion, standalone StaffingPlan runtime, dynamic staffing, parallel or autonomous scheduling, ExecutionPlan or WorkOrder compilation/execution, memory or checkpoint schema expansion, runtime profile mutation, source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, external connectors
approvalStatement=I approve implementation only for one explicit OpenAI Responses Council opt-in path described in docs/56_ai-company-council-live-provider-implementation-plan.md. This permits the four source-backed Council roles to use the existing normalized contract with bounded retry timeout cancellation redaction and optional live verification while real-local-stub remains authoritative. It does not approve provider expansion, StaffingPlan, parallel scheduling, WorkOrders, memory persistence expansion, profile or source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, or external connectors.
```

## Rejection Decision Shape

```text
decisionId=operator-decision-ai-company-council-live-provider-implementation-001
decisionStatus=reject-ai-company-council-live-provider-implementation
targetAuthority=one explicit OpenAI Responses opt-in path for the existing Real Council normalized position and synthesis contract
targetSurface=docs/56_ai-company-council-live-provider-implementation-plan.md
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=Council provider implementation and calls, provider expansion, StaffingPlan, scheduling, WorkOrders, memory, profile or source mutation, approval bypass, runtime-agent commit, runtime-agent push, release, external connectors
approvalStatement=I reject the Council live-provider implementation slice for now. Planning evidence remains available, but provider and downstream authorities stay blocked.
```

## Invalid Shortcuts

These are not implementation approval:

- `continue`
- `approved`
- `approve all`
- `do everything`
- `enable live Council`
- `self-approve implementation`
- approval that omits exact files, provider/role allowlist, compatibility, rollback, focused smoke,
  redaction, cancellation, or blocked authority
- approval that also opens provider expansion, StaffingPlan, WorkOrders, memory, mutation, commit,
  push, release, or external connectors

## Minimum Acceptance Criteria

1. Use the exact implementation `decisionStatus` and target authority.
2. Reference `docs/56_ai-company-council-live-provider-implementation-plan.md`.
3. Use the exact target allowlist and one OpenAI Responses provider path.
4. Keep local-stub synthetic verification authoritative.
5. Keep schema v6, local synchronous methods, legacy routes, and existing execution provider behavior.
6. Prove request isolation, normalized schema parity, conflict-before-synthesis, and human alignment.
7. Prove bounded retry, timeout, cancellation, call budget, missing configuration, and malformed output.
8. Prove credentials, paths, raw prompts/responses, and chain-of-thought are not persisted or exposed.
9. Keep optional live verification informational and truthful when skipped.
10. Keep every downstream authority blocked.

## Still Blocked After Approval

- additional providers or provider matrix routing
- standalone StaffingPlan and dynamic staffing
- parallel/autonomous scheduling
- ExecutionPlan and WorkOrder compilation/execution
- memory/checkpoint schema expansion and skill promotion
- runtime profile editing
- source mutation or approval bypass
- runtime-agent commit, push, release, external connectors

## Stop Conditions

Stop before implementation if the decision is incomplete, the target surface widens, provider mode
can activate implicitly, local-stub behavior would become async or change, schema/file-store migration
becomes necessary, provider output can affect authority, secret-safe evidence cannot be proven,
synthetic verification depends on live credentials, rollback cannot preserve records, or downstream
authority opens implicitly.

## Verification

```bash
node scripts/smoke-ai-company-council-live-provider-planning.mjs
node scripts/verification_status.mjs
```

The planning smoke verifies decision evidence only. It does not read credentials, call a provider,
or grant implementation authority.
