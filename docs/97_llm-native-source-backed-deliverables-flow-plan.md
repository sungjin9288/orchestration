# LLM-Native Source-Backed Deliverables Flow Plan

## Status

- Decision: `DEC-146`
- Authority: delegated non-critical usability implementation
- Scope: Deliverables browser presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The current Deliverables surface repeats the same artifact, review, approval, and handoff evidence
through a delivery board, completion register, Harness brief, narrative deck, execution evidence rail,
package shelves, approval desk, close-out desk, and Advanced Ops entry. In the measured source-backed
Builder-gate state, the surface is 4,053px tall on desktop and 6,606px tall on mobile. It contains 24
cards and 63 tokens, repeats `승인 대기` eight times, and exposes an unrelated Harness command before
the current delivery handoff.

## Product Boundary

Deliverables becomes one source-backed review flow:

1. Mission title, goal, linked task, review state, and current delivery status establish context.
2. The current delivery state and at most one existing bounded operator command appear once.
3. Result, Verification, Package, Acceptance, and Close-out appear in source order.
4. Every stage reads only current task artifact, review, ExecutionPlan, checkpoint, DeliveryPackage,
   acceptance, and MissionCloseOut records. Missing evidence stays visibly waiting.
5. Exact ids and source artifact refs remain available in one collapsed evidence disclosure.
6. Existing package persistence, acceptance, close-out, learning, and memory controls remain available
   in collapsed secondary disclosures when their existing source contracts make them relevant.
7. Execution and Advanced Ops navigation remain available without carrying new delivery authority.

The flow is not generated chat and does not infer verification, acceptance, or Mission completion. It
removes Harness tooling from the primary result path because Harness execution belongs to Execution or
Advanced Ops, while preserving the existing handlers and state-gated controls.

## Compatibility

- Existing `persist-delivery-package`, `accept-delivery-package`,
  `close-out-ai-company-mission`, Execution, Mission, and Advanced Ops handlers remain unchanged.
- Primary action priority follows the current exact package persistence, acceptance, and close-out
  summaries. When no delivery-specific action is ready, Deliverables routes to the existing Execution
  surface rather than consuming an approval itself.
- The company/ERP delivery desk remains a non-primary compatibility fallback; the accepted LLM-native
  shell uses the source-backed delivery flow.
- Disclosure state lives only in browser memory, survives periodic snapshot rendering, and resets when
  the operator selects another Mission.
- Schema v16, dependencies, persisted records, runtime methods, API routes, provider policy, review and
  approval semantics, persistence, source mutation, commit, push, release, scheduling, policy, and
  connector authority do not change.

## Verification

Focused UI smoke proves exact source-stage ordering, action selection through existing readiness
summaries, collapsed evidence and control disclosures, refresh-safe browser state, LLM-native shell
routing, legacy fallback preservation, and absence of fetch, persistence, generated text, automatic
execution, or authority expansion in the primary renderer. Existing package, acceptance, close-out,
learning, memory, execution, approval, and shell smokes prove compatibility.

Real-browser QA covers 1440x1000 and 390x844 against an in-progress Builder-gate state and a completed
package/acceptance/close-out state. It checks current action reachability, stage order, conditional
controls, exact refs, disclosure refresh, horizontal overflow, text fit, and console output. Closure
includes UI QA, README and completion-inventory evidence, `git diff --check`, and aggregate
verification.

## Rollback

Route the LLM-native shell back to the existing delivery-desk compatibility renderer, remove the
focused styles and smoke registration, and leave every runtime record, route, gate, and action handler
unchanged.

## Still Blocked

- generated delivery summaries, inferred verification or completion, automatic action execution
- automatic package persistence or acceptance, hidden close-out, durable UI preferences
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass
- runtime-agent commit/push, release, scheduling, policy mutation, or connectors
