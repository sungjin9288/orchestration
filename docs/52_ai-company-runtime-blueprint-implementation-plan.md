# AI Company Runtime Blueprint Implementation Plan

## Purpose

이 문서는 사용자가 승인하고 비핵심 planning decision에 대해 self-approval을 위임한 범위에서,
`runtime CompanyBlueprint and AgentProfile implementation planning`을 구체적인 Phase 1
implementation input으로 만든다.

이 문서는 runtime implementation 승인이 아니다. `company/` source files, loader, runtime
snapshot, API behavior, state schema를 변경하지 않으며 provider call, memory persistence,
autonomous scheduling, source mutation, commit 또는 push authority를 runtime agent에게 부여하지
않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-runtime-blueprint-planning-001` |
| `decisionStatus` | `approve-runtime-company-blueprint-planning-only` |
| `targetAuthority` | `runtime CompanyBlueprint and AgentProfile implementation planning` |
| `targetSurface` | docs plus the existing runtime contracts, file-store normalization, runtime snapshot, UI presentation roster, and synthetic verification surfaces |
| `sourceEvidenceRefs` | `DEC-076`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/runtime-service.js`, `scripts/serve-ui-slice-01.mjs`, `ui/company-config.js`, `scripts/smoke-ai-company-master-plan.mjs` |
| `negativeEvidenceRefs` | no `company/blueprint.json`, no role source files, no strict blueprint loader, no source-backed runtime roster, no runtime snapshot company envelope, no focused implementation smoke; current Council remains deterministic and the browser roster remains presentation-only |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable the optional blueprint path, remove the additive snapshot envelope, preserve schema v6 state, restore the deterministic Council and browser presentation baseline, run focused and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-runtime-blueprint-planning.mjs`; runtime implementation smoke remains blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | runtime blueprint implementation, state schema migration, Council role execution, provider calls, memory persistence, autonomous scheduling, source mutation, approval bypass, runtime-agent commit, runtime-agent push |
| `approvalStatement` | The operator approves planning and delegates self-approval for this non-critical planning artifact only. This allows one implementation plan, rollback plan, focused smoke plan, and implementation decision handoff. It does not approve runtime or API implementation, state schema migration, Council role execution, provider calls, memory persistence, autonomous scheduling, source mutation, approval bypass, or runtime-agent commit or push. |

## Implementation Outcome

- Fielded decision: `operator-decision-ai-company-runtime-blueprint-implementation-001`
- Decision status: `approve-ai-company-runtime-blueprint-implementation-slice`
- Recorded decision: `DEC-079`
- Implementation: strict source loader, nine role contracts, optional runtime injection, configured
  additive read-only `companyRuntime` snapshot
- Compatibility: persisted schema v6, no policy persistence, legacy caller snapshot unchanged
- Focused evidence: `node scripts/smoke-ai-company-runtime-blueprint.mjs`
- Still blocked: StaffingPlan, Council role execution, providers, memory, scheduling, profile
  mutation, source mutation, approval bypass, runtime-agent commit/push/release

## Current Baseline Evidence

The following negative evidence was captured before `DEC-079`; it is retained as planning provenance.

- `src/runtime/contracts.js#createEmptyState` fixed persisted state at `schemaVersion: 6`.
- `src/runtime/file-store.js#normalizeState` owns persisted-state compatibility and does not know
  about a company blueprint.
- `src/runtime/runtime-service.js#buildCouncilSessionRecord` creates one deterministic Council record
  with presentation participants and a fixed transcript.
- `scripts/serve-ui-slice-01.mjs` creates the runtime with `runtimeRoot` only and serves the current
  state snapshot.
- `ui/company-config.js` stores editable browser presentation members under
  `orchestration.company-members.v1`; this is not runtime identity or authority.
- No `company/blueprint.json`, `company/roles/*.md`, or `src/runtime/company-blueprint.js` existed.

Current implementation evidence now confirms those source and loader files exist while persisted
state remains schema v6 and deterministic Council behavior stays unchanged.

## Implementation Objective

Add one read-only, source-backed company roster boundary that validates `CompanyBlueprint` and
`AgentProfile` policy from repo files and exposes readiness plus validated profiles in the existing
snapshot. The slice must not execute agents, staff a Mission, call a provider, persist the blueprint
into runtime state, or change Council behavior.

The implementation is complete only when the runtime can distinguish these states:

| Status | Meaning | Allowed behavior |
| --- | --- | --- |
| `ready` | Blueprint and all role refs pass strict validation. | Expose the normalized read-only company envelope. |
| `not-configured` | No blueprint path was supplied to the runtime. | Preserve existing runtime behavior; AI Company entrypoints remain unavailable. |
| `invalid` | A supplied blueprint is missing, malformed, unknown, unsafe, or internally inconsistent. | Preserve existing runtime behavior, expose secret-free error codes, and fail closed for AI Company entrypoints. |

## Exact Target Surface

The implementation decision may open only these files:

```text
company/blueprint.json
company/roles/conductor.md
company/roles/strategist.md
company/roles/architect.md
company/roles/decomposer.md
company/roles/researcher.md
company/roles/builder.md
company/roles/reviewer.md
company/roles/qa.md
company/roles/ops.md
src/runtime/company-blueprint.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
scripts/smoke-ai-company-runtime-blueprint.mjs
scripts/verification_status.mjs
```

Documentation, README claims, and task ledgers may change only to keep evidence honest. Phase 1 must
not edit provider adapters, Council execution, Mission transitions, builder mutation, commit,
release, memory, proposal, or UI company-member mutation code.

## Company Source Contract

`company/blueprint.json` is repository policy, not mutable runtime state. It must contain exactly the
documented `CompanyBlueprint` fields and nine unique profiles for Conductor, Strategist, Architect,
Decomposer, Researcher, Builder, Reviewer, QA, and Ops.

Each `company/roles/*.md` file must contain these headings:

```text
# Role: <name>
## Objective
## Inputs
## Outputs
## Decision Rules
## Tool And Workspace Boundary
## Stop And Escalation
## Non-Authority
```

Role files describe policy and structured outputs. They must not contain secrets, provider-specific
credentials, hidden approval grants, self-modification instructions, or permission to commit/push.

## Validation Contract

`src/runtime/company-blueprint.js` should be a dependency-light CommonJS leaf that exports strict,
deterministic validation and loading functions. Validation must reject:

- unknown top-level, profile, nested policy, or authority fields
- missing or duplicate `companyId`/agent ids
- unsupported roles, packs, provider modes, workspace modes, or session scopes
- non-array allowlists, empty required strings, non-boolean authority fields, or invalid limits
- absolute `instructionsRef`, traversal, symlink escape, or refs outside `company/roles/`
- missing role files or role documents without the required headings
- any profile with `canCommit=true` or `canPush=true`
- mutation authority for Conductor, Strategist, Architect, Decomposer, Researcher, Reviewer, QA, or
  Ops
- Builder mutation authority that implies a path outside the existing approved preflight/live-mutation
  gate

Returned objects must be cloned or deeply frozen so callers cannot mutate source policy in memory.
Diagnostics must use stable error codes and repo-relative refs without source content or secrets.

## Runtime Integration Contract

`createRuntimeService` may accept an optional `companyBlueprintPath`. When absent, existing direct
runtime consumers must remain byte-compatible apart from internal implementation details.

When a path is supplied, `getSnapshot()` may add one backward-compatible envelope:

```text
companyRuntime
- status: ready | not-configured | invalid
- blueprint: normalized CompanyBlueprint | null
- sourceRefs[]
- errors[]
```

The envelope is read-only evidence. No endpoint may create/update/delete profiles in this slice.
`scripts/serve-ui-slice-01.mjs` may pass the repository blueprint path to the runtime, but existing
Mission, Council, task, run, artifact, approval, proposal, commit, and release routes must keep their
current semantics.

## Compatibility And Migration Plan

- Persisted state stays at `schemaVersion: 6`.
- `src/runtime/contracts.js#createEmptyState` and `src/runtime/file-store.js#normalizeState` do not add
  company policy fields.
- Existing `state.json` files require no migration and must remain byte-compatible after load/save
  unless an existing runtime operation changes them.
- Existing callers that omit `companyBlueprintPath` keep their current snapshot shape.
- `/api/snapshot` gains `companyRuntime` only in the configured server path and keeps every existing
  field and route unchanged.
- `ui/company-config.js` remains presentation-only; it cannot override `companyRuntime` identity,
  role policy, or authority.

Any need to persist a blueprint, change schemaVersion, or replace the browser roster is outside this
plan and requires a new decision.

## Failure And Recovery

| Failure | Required result |
| --- | --- |
| Missing configured file | `invalid` with stable missing-file code; server baseline remains inspectable |
| Malformed JSON | `invalid` with parse code; no raw content in diagnostics |
| Unknown field or role | `invalid`; no partial profile exposure |
| Unsafe instructions ref | `invalid`; no outside-path read |
| Missing role heading | `invalid`; offending repo-relative ref only |
| Runtime created without path | `not-configured` or legacy snapshot compatibility, as selected by the approved implementation |
| Loader regression | Disable configured blueprint path and return to deterministic Council/browser roster baseline |

No invalid configuration may be silently normalized into authority.

## Focused Smoke Plan

The later implementation must add `scripts/smoke-ai-company-runtime-blueprint.mjs` proving:

1. The repository blueprint and all nine role files load as `ready`.
2. Agent ids are stable and unique across two runtime instances.
3. Every instructions ref resolves inside `company/roles/` and required headings exist.
4. Unknown fields, duplicate ids, unsupported roles/modes, unsafe refs, missing files, malformed JSON,
   and forbidden authority fail closed.
5. The validated object cannot be mutated by callers.
6. Existing state remains schema v6 and a load/save cycle does not persist company policy.
7. Runtime consumers without a blueprint path preserve the prior snapshot contract.
8. The configured server snapshot exposes `companyRuntime` additively without changing existing
   Mission/Council/task data.
9. Browser company members cannot override runtime ids or authority.
10. No provider call, Council role run, memory write, source mutation, approval bypass, commit, or push
    path is introduced.
11. Existing representative runtime, Mission/Council, API, and README smokes continue to pass.
12. Aggregate verification registers the focused smoke and passes.

## Rollback Plan

1. Stop passing `companyBlueprintPath` from the local server.
2. Remove the additive `companyRuntime` snapshot envelope and loader integration.
3. Remove or quarantine invalid `company/` source files without touching runtime state.
4. Preserve existing schema v6 `state.json`, Mission, Council, task, run, artifact, decision, and
   approval evidence.
5. Re-run the implementation focused smoke in rollback mode plus representative baseline smokes.
6. Run `node scripts/verification_status.mjs` and require zero failures.

Rollback must not require state migration because Phase 1 does not persist company policy.

## Implementation Sequence

1. Add role source files and a strict blueprint fixture.
2. Add the isolated loader/validator and its invalid-fixture smoke cases.
3. Add optional runtime injection without changing default direct consumers.
4. Add the configured server path and additive snapshot evidence.
5. Prove schema v6 and browser/runtime authority separation.
6. Register focused smoke in aggregate verification.
7. Update README/task evidence only after runtime proof exists.
8. Run focused, representative, and aggregate gates before commit.

## Acceptance Criteria

- Exactly one authority opens: read-only source-backed blueprint loading and snapshot exposure.
- Persisted state remains schema v6 with no migration.
- All nine roles have stable validated identities and source refs.
- Invalid policy fails closed without preventing inspection of the existing runtime baseline.
- Existing deterministic Council behavior is unchanged.
- Browser presentation roster remains non-authoritative.
- Provider, memory, scheduling, source mutation, approval, commit, and push behavior is unchanged.
- Focused and aggregate verification pass with zero failures.

## Exclusions

This plan does not authorize:

- StaffingPlan creation or acceptance
- independent Council role execution or synthesis
- provider adapter role expansion
- Mission/WorkOrder scheduling
- checkpoint or memory persistence
- runtime profile editing
- source mutation or approval bypass
- runtime-agent commit, push, release, or external action

## Implementation Decision Status

The architecture-sensitive implementation decision was supplied in full and accepted as `DEC-079`.
The handoff in `docs/53_ai-company-runtime-blueprint-implementation-decision-handoff.md` is consumed
evidence. Its exact allowlist remains the implementation boundary; it does not authorize Phase 2.

## Verification

```bash
node scripts/smoke-ai-company-runtime-blueprint-planning.mjs
node scripts/smoke-ai-company-runtime-blueprint.mjs
node scripts/verification_status.mjs
```

These commands verify that planning evidence was consumed by exactly one implementation path and
that current runtime support preserves the documented compatibility and blocked authority.
