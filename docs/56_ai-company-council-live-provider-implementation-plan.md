# AI Company Council Live Provider Opt-In Implementation Plan

## Purpose

이 문서는 검증된 `real-local-stub` Council contract를 정확히 하나의 OpenAI Responses
provider opt-in 경로로 확장하기 위한 Phase 3 implementation plan이다.

이 문서는 provider implementation 또는 provider call 승인이 아니다. Runtime, API, UI,
CompanyBlueprint, provider adapter, persisted state를 변경하지 않으며 실제 credential을 읽거나
network request를 실행하지 않는다.

## Accepted Planning-Only Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-delegated-ai-company-council-live-provider-planning-001` |
| `decisionStatus` | `approve-ai-company-council-live-provider-planning-only` |
| `targetAuthority` | `Council live-provider opt-in implementation planning for the existing normalized position and synthesis contract` |
| `targetSurface` | docs plus the existing source-backed CompanyBlueprint, Real Council local-stub runtime/API/UI, OpenAI Responses adapter boundary, optional live verification note, and verification evidence |
| `sourceEvidenceRefs` | `DEC-076`, `DEC-079`, `DEC-082`, `docs/48_ai-company-master-plan.md`, `docs/49_agent-runtime-contract.md`, `docs/50_council-operating-protocol.md`, `docs/51_ai-company-delivery-roadmap.md`, `docs/54_ai-company-real-council-implementation-plan.md`, `src/runtime/council-sessions.js`, `src/execution/council-coordinator.js`, `src/execution/providers/council-local-stub-adapter.js`, `src/execution/providers/openai-responses-adapter.js`, `src/execution/providers/openai-responses-retry-policy.js` |
| `negativeEvidenceRefs` | no Council OpenAI Responses adapter, no provider Council mode, no Council provider allowlist or prompt contract, no provider transport evidence on Council attempts, no Council cancellation path, no provider-specific focused synthetic smoke, and no optional Council real-live smoke exist |
| `implementationPlanRefs` | this document |
| `rollbackRefs` | disable only the future `real-openai-responses` entrypoint, preserve `real-local-stub` as authoritative, quarantine incomplete provider attempts, preserve schema v6 and source evidence, rerun focused local-stub and aggregate verification |
| `focusedSmokeRefs` | planning smoke only in `scripts/smoke-ai-company-council-live-provider-planning.mjs`; provider synthetic, optional real-live, and UI/API implementation smokes remain blocked |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | Council live-provider implementation or calls, provider matrix expansion, standalone StaffingPlan runtime, WorkOrder compilation/execution, memory/checkpoint schema expansion, autonomous or parallel scheduling, profile/source mutation, approval bypass, runtime-agent commit/push/release |
| `approvalStatement` | The operator approves planning only for one explicit OpenAI Responses Council opt-in path. Non-critical planning artifacts may be self-approved, but provider implementation, credentials, calls, runtime/API/UI changes, and every downstream authority require a later complete fielded decision. |

## Current Baseline Evidence

- `DEC-082` implements `mode=real-local-stub` with isolated Strategist, Architect, and Decomposer
  position requests, deterministic conflict checks, Conductor synthesis, and human alignment.
- Local-stub runtime/API/UI smokes are the authoritative synthetic gate.
- Existing execution live-provider support is limited to its current execution-role allowlist and is
  not a Council adapter.
- `company/blueprint.json` currently permits only `local-stub`; role contracts deny
  `provider.call`.
- `OPENAI_API_KEY` and `OPENAI_RESPONSES_MODEL` are optional environment inputs for the existing
  execution provider boundary. Missing values are reported as not configured by live smokes.
- Persisted state remains schema v6 and stores no CompanyBlueprint policy or provider credential.

## Implementation Objective

Add one explicit `mode=real-openai-responses` path that:

1. Reuses the existing normalized Council position and synthesis contracts without semantic drift.
2. Calls only Strategist, Architect, Decomposer, and Conductor through one OpenAI Responses adapter.
3. Preserves position isolation and deterministic conflict checking before synthesis.
4. Records secret-free transport evidence separately from domain output.
5. Fails closed on readiness, authority, schema, timeout, cancellation, or malformed output errors.
6. Leaves `real-local-stub` unchanged and authoritative for required verification.

## Exact Future Target Surface

A later implementation decision may open only:

```text
company/blueprint.json
company/roles/conductor.md
company/roles/strategist.md
company/roles/architect.md
company/roles/decomposer.md
src/runtime/company-blueprint.js
src/runtime/council-sessions.js
src/execution/council-coordinator.js
src/execution/providers/council-openai-responses-adapter.js
src/runtime/runtime-service.js
scripts/serve-ui-slice-01.mjs
ui/council-signals.js
ui/app.js
scripts/smoke-ai-company-council-live-provider.mjs
scripts/smoke-ai-company-council-live-provider-live.mjs
scripts/smoke-ui-slice-652.mjs
scripts/verification_status.mjs
scripts/ui_qa_status.mjs
```

`src/execution/providers/openai-responses-retry-policy.js` is reuse-only unless the later decision
explicitly names a minimal cancellation-compatible change. Documentation, README, task ledger, and
existing verifier pins may change only to keep evidence honest. No file-store migration, general
provider registry, memory, WorkOrder, source mutation, commit, push, or release implementation is
inside this allowlist.

## Provider And Role Allowlist

- Provider adapter: `openai-responses` only.
- Council mode: `real-openai-responses` only.
- Position roles: Strategist, Architect, Decomposer.
- Synthesis role: Conductor.
- Unknown provider, model source, role, tool request, response type, or mode fails closed.
- The mode is explicit per start request and never inferred from an API key or project setting.
- Provider readiness requires an approved project provider configuration, model, key variable, fetch
  support, and CompanyBlueprint role policy.

This slice does not create a provider matrix and does not widen the existing execution-role adapter
allowlist.

## Normalized Output Contract

Provider output must validate against the existing domain fields exactly.

Position:

```text
recommendation
assumptions[]
evidenceRefs[]
objections[]
risks[]
confidence
proposedNextStep
```

Synthesis:

```text
missionInterpretation
adoptedRecommendation
adoptedPositionRefs[]
rejectedAlternatives[]
dissentRefs[]
unresolvedQuestions[]
proposedExecutionBoundary
proposedAcceptanceCriteria[]
humanDecisionRequired=true
```

Unknown or missing fields, invalid refs, stale source digest, unsupported evidence, or
`humanDecisionRequired=false` are terminal schema failures. Provider text cannot change authority,
mode, alignment action, tool allowlist, or downstream execution boundary.

## Prompt And Data-Minimization Contract

- Every position role receives the same normalized mission agenda and source digest.
- No position request includes peer output or prior provider response.
- Conductor receives only validated positions and deterministic conflict summary.
- Absolute local `projectPath`, environment values, credentials, raw source content, and unrelated
  state are omitted.
- Role source files define role instructions; runtime input supplies only normalized mission fields,
  evidence refs, source digest, output schema, and explicit authority boundary.
- Raw chain-of-thought is neither requested nor stored.
- Raw prompt and raw provider response are not persisted in Council records.

## Provider Evidence Contract

Domain output remains unchanged. Each successful or failed provider step may add a separate
secret-free `providerEvidence` envelope:

```text
adapter
model
providerRunId optional
usage optional
providerAttemptCount
startedAt
completedAt optional
outcome
errorCode optional
```

Evidence must not include API keys, authorization headers, environment values, raw prompts, raw
responses, local absolute paths, or chain-of-thought. Error messages are normalized to stable codes
and safe summaries.

## Execution And Call Budget

- Execution is sequential in Phase 3; autonomous or parallel provider scheduling is excluded.
- Initial attempt: three position calls and one synthesis call.
- Targeted revision: only selected position roles and one synthesis call.
- Synthesis retry: one bounded Conductor call.
- Transport retries occur inside the existing retry policy and do not create new Council domain
  attempts.
- Maximum call and retry counts are explicit configuration with conservative defaults and recorded
  in evidence.
- Human `approve`, `request-revision`, or `stop` remains required; provider output cannot self-approve.

## Retry Timeout And Cancellation

- Retry only HTTP 429 and 5xx outcomes classified by the shared retry policy.
- Do not retry authority rejection, unsupported role/mode, schema failure, malformed JSON, other 4xx,
  stale digest, timeout, explicit cancellation, or local validation failure.
- Every provider call has a bounded timeout and an injected `AbortSignal`.
- Operator cancellation aborts the active request, records terminal cancelled evidence, and creates no
  linked task or downstream run.
- Missing key/model/fetch support fails readiness before the first request and records no partial
  successful session.
- Retry exhaustion preserves failure evidence and never falls back to a successful local-stub result.

## Runtime And API Compatibility Plan

- Preserve current synchronous `startRealCouncilForMission`, `resumeRealCouncilSession`, and
  `decideRealCouncilSession` local-stub behavior.
- Add an explicit asynchronous provider branch rather than silently converting existing direct
  runtime consumers to Promise-based behavior.
- Existing start/resume/decision API routes may dispatch the provider branch only when the request
  explicitly names `real-openai-responses` and readiness succeeds.
- Legacy deterministic draft/approve routes and `real-local-stub` routes remain unchanged.
- Provider mode is never selected by browser-local company roster state.

## Persistence And Schema Compatibility

- Persisted state remains `schemaVersion: 6`.
- `createEmptyState` and file-store normalization are not edited.
- Provider attempt fields are additive and complete on record creation.
- Company policy and credentials remain repo/env inputs, not persisted state.
- Reload preserves normalized output, provider evidence, cancellation/failure status, attempts, and
  alignment state without requiring raw provider payloads.
- Existing sessions without provider fields continue through their current paths.

## UI Boundary

The later implementation may expose a provider option only when the configured project reports
provider readiness. It must display mode, role progress, normalized evidence, usage when available,
safe failure code, and the same alignment actions as local stub. It must not display credentials,
raw prompts/responses, chain-of-thought, typing simulation, ranking, or browser-defined authority.

The current planning slice makes no UI change.

## Focused Verification Plan

`scripts/smoke-ai-company-council-live-provider.mjs` must use an injected synthetic fetch and prove:

1. Explicit provider mode and four-role allowlist.
2. Identical isolated position agenda without peer outputs.
3. Existing position/synthesis schema compatibility.
4. Deterministic conflict check before Conductor execution.
5. 429/5xx bounded retry and non-retryable fail-closed behavior.
6. Timeout, cancellation, malformed JSON, unknown field, and stale digest failures.
7. Secret/path/raw-payload redaction from state, logs, snapshots, and errors.
8. Call-budget enforcement and transport/domain attempt separation.
9. Schema v6 reload and legacy/local-stub compatibility.
10. No implicit task, WorkOrder, mutation, commit, push, release, or memory authority.

`scripts/smoke-ai-company-council-live-provider-live.mjs` is optional. With missing key/model it must
exit successfully with `skipped_missing_env`; when configured it may verify one bounded Council
request and record only redacted evidence. Its result is informational and cannot replace the
synthetic gate.

`scripts/smoke-ui-slice-652.mjs` must prove readiness-gated selection, provider progress/evidence,
safe failure display, alignment parity, and unchanged local-stub/legacy UI.

## Rollback Plan

1. Disable/remove only the `real-openai-responses` entrypoint and UI option.
2. Abort active provider requests and stop new provider Council starts.
3. Quarantine incomplete provider sessions; preserve completed normalized evidence without raw
   payloads or credentials.
4. Keep `real-local-stub`, legacy deterministic Council, schema v6 state, and existing execution
   provider behavior unchanged.
5. Remove the Council provider adapter after no entrypoint references it.
6. Rerun local-stub Real Council, provider synthetic, UI, and aggregate verification.

## Implementation Sequence

1. Add the strict Council provider adapter with injected fetch, timeout, retry, cancellation, and
   redacted evidence.
2. Add explicit async provider orchestration while preserving the local synchronous coordinator.
3. Add source-policy allowlist changes for the four Council roles only.
4. Integrate readiness-gated runtime/API dispatch and additive provider attempt evidence.
5. Add mode-gated UI status and alignment parity.
6. Add synthetic, optional live, UI/API, local-stub regression, and aggregate verification.

## Acceptance Criteria

- Local-stub synthetic verification remains authoritative and unchanged.
- Provider mode is explicit, single-provider, role-allowlisted, sequential, bounded, and cancellable.
- Live and local outputs satisfy the same normalized domain schema.
- Retry, timeout, cancellation, malformed output, missing configuration, and redaction are proven.
- Schema v6, legacy routes, direct local runtime consumers, and existing execution provider behavior
  remain compatible.
- Optional live verification reports configured, passed, failed, or skipped truthfully.
- No downstream authority opens implicitly.

## Exclusions

- Provider matrix or multi-provider routing
- Parallel/autonomous Council scheduling
- Standalone StaffingPlan, ExecutionPlan, or WorkOrder runtime
- Raw prompt/response or chain-of-thought persistence
- Memory/checkpoint schema expansion or skill promotion
- Runtime profile editing or browser-defined role authority
- Source mutation, approval bypass, runtime-agent commit/push/release

## Implementation Decision Required

Actual implementation requires every field in
`docs/57_ai-company-council-live-provider-implementation-decision-handoff.md`. Broad approval,
continuation wording, or delegated non-critical self-approval does not open provider implementation
or calls.

## Implementation Status

Planning-only authority is accepted. Provider implementation, credentials, calls, runtime/API/UI
changes, and downstream authority remain blocked.

## Verification

```bash
node scripts/smoke-ai-company-council-live-provider-planning.mjs
node scripts/verification_status.mjs
```
