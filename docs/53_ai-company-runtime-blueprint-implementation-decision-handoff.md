# AI Company Runtime Blueprint Implementation Decision Handoff

## Purpose

이 문서는 `read-only runtime CompanyBlueprint and AgentProfile implementation decision required`
게이트를 위한 copy-ready operator input이다.

이 문서 자체는 operator decision이 아니지만, 아래 valid shape가 이후 operator에 의해 그대로
제출되어 `DEC-079`로 accepted됐다. 이 handoff는 consumed evidence이며 Phase 2 authority를 열지
않는다.

## Current Gate

- Planning decision: `operator-delegated-ai-company-runtime-blueprint-planning-001`
- Planning status: accepted for planning only
- Implementation plan: `docs/52_ai-company-runtime-blueprint-implementation-plan.md`
- Fielded implementation decision: `operator-decision-ai-company-runtime-blueprint-implementation-001`
- Runtime implementation: accepted and implemented for the exact read-only blueprint path only
- State schema migration: blocked
- Current runtime schema: v6
- Handoff status: `consumed-by-DEC-079`
- Current downstream gate: `Real Council for one Mission implementation planning decision required`

## Source Evidence

- `DEC-076`
- `DEC-077`
- `DEC-078`
- `docs/48_ai-company-master-plan.md`
- `docs/49_agent-runtime-contract.md`
- `docs/50_council-operating-protocol.md`
- `docs/51_ai-company-delivery-roadmap.md`
- `docs/52_ai-company-runtime-blueprint-implementation-plan.md`
- `src/runtime/contracts.js`
- `src/runtime/file-store.js`
- `src/runtime/runtime-service.js`
- `scripts/serve-ui-slice-01.mjs`
- `ui/company-config.js`
- `node scripts/smoke-ai-company-runtime-blueprint-planning.mjs`
- `node scripts/verification_status.mjs`

## Valid Implementation Decision Shape

다음 입력은 read-only runtime blueprint slice 하나만 승인한다.

```text
decisionId=operator-decision-ai-company-runtime-blueprint-implementation-001
decisionStatus=approve-ai-company-runtime-blueprint-implementation-slice
targetAuthority=read-only runtime CompanyBlueprint and AgentProfile loading plus additive snapshot exposure
targetSurface=company/blueprint.json, company/roles/*.md, src/runtime/company-blueprint.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, scripts/smoke-ai-company-runtime-blueprint.mjs, scripts/verification_status.mjs
implementationPlanRefs=docs/52_ai-company-runtime-blueprint-implementation-plan.md
runtimePath=validate one repo-backed blueprint and nine role contracts, inject it optionally into the runtime, and expose one read-only companyRuntime snapshot envelope without persisting policy
compatibilityPlanRefs=keep schemaVersion 6, do not edit createEmptyState or file-store normalization, preserve direct runtime consumers without companyBlueprintPath, make configured API snapshot change additive only
sourceEvidenceRefs=DEC-076, DEC-077, DEC-078, docs/48_ai-company-master-plan.md, docs/49_agent-runtime-contract.md, docs/50_council-operating-protocol.md, docs/51_ai-company-delivery-roadmap.md, docs/52_ai-company-runtime-blueprint-implementation-plan.md, src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/company-config.js
negativeEvidenceRefs=no source-backed blueprint or role files exist, no strict loader exists, no runtime company envelope exists, current Council is deterministic, browser roster is presentation-only, no implementation smoke exists, live provider and memory evidence are absent
rollbackRefs=disable companyBlueprintPath injection, remove the additive companyRuntime snapshot envelope, remove or quarantine invalid company source files, preserve schema v6 state and deterministic Council/browser baseline, rerun focused and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-runtime-blueprint.mjs proving valid load, strict invalid rejection, path containment, immutable normalized output, stable ids, schema v6 persistence absence, legacy snapshot compatibility, additive configured snapshot, browser/runtime authority separation, and no provider/memory/scheduling/source/commit/push authority
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=StaffingPlan runtime, independent Council role execution, provider role expansion, memory persistence, autonomous scheduling, WorkOrder execution, checkpoint persistence, runtime profile mutation, source mutation outside existing approved paths, approval bypass, runtime-agent commit, runtime-agent push, release
approvalStatement=I approve implementation only for the read-only runtime CompanyBlueprint and AgentProfile loading path described in docs/52_ai-company-runtime-blueprint-implementation-plan.md. The implementation must keep schemaVersion 6, avoid policy persistence, preserve current Mission and deterministic Council behavior, and expose only an additive read-only companyRuntime snapshot envelope. This does not approve StaffingPlan or Council role execution, provider calls, memory persistence, autonomous scheduling, source mutation, approval bypass, runtime-agent commit, runtime-agent push, or release.
```

## Rejection Decision Shape

```text
decisionId=operator-decision-ai-company-runtime-blueprint-implementation-001
decisionStatus=reject-ai-company-runtime-blueprint-implementation
targetAuthority=read-only runtime CompanyBlueprint and AgentProfile loading plus additive snapshot exposure
targetSurface=docs/52_ai-company-runtime-blueprint-implementation-plan.md
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=runtime blueprint implementation, state schema migration, StaffingPlan runtime, Council role execution, provider calls, memory persistence, autonomous scheduling, source mutation, approval bypass, runtime-agent commit, runtime-agent push, release
approvalStatement=I reject the runtime CompanyBlueprint and AgentProfile implementation slice for now. Planning evidence remains available, but all runtime and downstream authorities stay blocked.
```

## Invalid Shortcuts

다음 입력은 implementation approval이 아니다.

- `continue`
- `approve`
- `approve all`
- `do everything`
- `build the AI company`
- `self-approve implementation`
- `implement Phase 1` without the required fields
- schema migration, Council execution, provider calls, memory, scheduling, source mutation, commit, push,
  또는 release를 함께 여는 문구
- rollback, focused smoke, compatibility, negative evidence, still-blocked authority가 없는 문구

## Minimum Acceptance Criteria

Implementation approval은 다음을 모두 만족해야 한다.

1. 정확한 `decisionStatus=approve-ai-company-runtime-blueprint-implementation-slice`를 사용한다.
2. `docs/52_ai-company-runtime-blueprint-implementation-plan.md`를 지정한다.
3. Target surface를 계획의 exact file allowlist로 제한한다.
4. Persisted state가 schema v6에 남는다고 명시한다.
5. Company policy를 `state.json`에 저장하지 않는다.
6. Existing direct runtime consumer와 Mission/Council semantics를 보존한다.
7. Invalid source, unknown fields, duplicate ids, unsafe refs, forbidden authority를 fail closed한다.
8. Browser presentation roster와 runtime identity/authority를 분리한다.
9. Focused smoke와 aggregate verification을 지정한다.
10. Rollback과 negative evidence를 지정한다.
11. Council role execution, provider, memory, scheduling, mutation, approval bypass, runtime-agent
    commit/push/release를 blocked로 유지한다.

## Still Blocked After Approval

유효한 Phase 1 implementation approval 이후에도 다음은 차단된다.

- StaffingPlan runtime and acceptance
- independent Council positions and Conductor synthesis
- provider-assisted Council roles
- memory or checkpoint persistence
- autonomous or parallel scheduling
- WorkOrder execution
- runtime profile editing
- source mutation outside existing approved bounded paths
- approval bypass
- runtime-agent commit, push, release, external connectors

## Stop Conditions

다음 중 하나면 구현 전에 멈춘다.

- fielded operator decision이 없다.
- target files가 plan allowlist를 벗어난다.
- schemaVersion 변경 또는 file-store policy persistence가 필요하다.
- current deterministic Council semantics를 조용히 대체한다.
- browser roster를 runtime authority로 승격한다.
- blueprint invalid 상태가 partial authority로 normalize된다.
- rollback, compatibility, focused smoke, negative evidence가 누락된다.
- provider, memory, scheduling, source mutation, approval, commit, push, release가 implication으로 열린다.

## Verification

```bash
node scripts/smoke-ai-company-runtime-blueprint-planning.mjs
node scripts/smoke-ai-company-runtime-blueprint.mjs
node scripts/verification_status.mjs
```

Planning smoke는 accepted decision과 exact boundary가 current implementation에 소비됐는지
검증하고, focused runtime smoke는 strict load와 compatibility를 검증한다. Handoff는 Council,
provider, memory, scheduling, mutation, approval bypass, commit/push/release authority를 열지 않는다.
