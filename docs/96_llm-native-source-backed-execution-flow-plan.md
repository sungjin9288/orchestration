# LLM-Native Source-Backed Execution Flow Plan

## Status

- Decision: `DEC-145`
- Authority: delegated non-critical usability implementation
- Scope: Execution browser presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The current Execution surface repeats the same current gate through a command deck, harness brief,
left narrative deck, evidence-card rail, right judgment deck, approval shelf, blocker shelf, and
preflight shelf. In the measured source-backed Builder-approval state, the surface is 3,044px tall on
desktop and 6,285px tall on mobile. The actual approval command starts at 2,138px and 5,446px,
respectively, so harness tooling and repeated status summaries displace the bounded operator decision.

## Product Boundary

Execution becomes one source-backed control flow:

1. Mission title, goal, linked task, lifecycle, and latest run establish context.
2. The current checkpoint and its exact stop reason appear once.
3. At most one existing operator command appears from the current approval and readiness booleans.
4. Strategist, Architect, Decomposer, Maker, and Critic checkpoints appear in source order with their
   existing complete, current, blocked, or waiting status.
5. Exact run, approval, inbox, artifact, preflight, harness, and readiness evidence remain available
   in collapsed secondary details.
6. Council and Advanced Ops navigation remain available without carrying execution authority.

The flow is not generated chat and does not infer progress. It renders current runtime-derived
checkpoint, approval, readiness, run, and artifact evidence without typing simulation, automatic
selection, hidden continuation, or a new action.

## Compatibility

- Existing `run-inbox-action`, Builder mutation, Reviewer, commit-package, local-commit,
  release-package, close-out, Council navigation, and Advanced Ops handlers remain unchanged.
- Action priority follows the current explicit gate order and exposes no command unless its existing
  readiness boolean is true.
- The company/ERP execution desk remains a non-primary compatibility fallback; the accepted
  LLM-native shell uses the source-backed control flow.
- Disclosure state lives only in browser memory, survives periodic snapshot rendering, and resets
  when the operator selects another Mission.
- Schema v16, dependencies, persisted records, runtime methods, routes, provider policy, approval and
  review semantics, source mutation, commit, push, release, scheduling, policy, and connector
  authority do not change.

## Verification

Focused UI smoke proves current-action selection from existing readiness booleans, all existing action
handler values, source-backed checkpoint rendering, collapsed harness and provenance controls,
refresh-safe browser disclosure state, LLM-native shell routing, and absence of fetch, persistence,
background execution, or authority expansion in the primary renderer. Existing execution approval,
mutation, provider, and shell smokes prove runtime and API compatibility.

Real-browser QA covers 1440x1000 and 390x844, including current action reachability, checkpoint order,
disclosure refresh, exact source refs, horizontal overflow, text fit, and console output. Closure
includes UI QA, README and completion-inventory evidence, `git diff --check`, and aggregate
verification.

## Rollback

Route the LLM-native shell back to the existing execution-desk compatibility renderer, remove the
focused styles and smoke registration, and leave every runtime record, approval, route, and action
handler unchanged.

## Still Blocked

- generated or durable execution chat, inferred progress, automatic command selection or execution
- hidden approval consumption, automatic retry, parallel or background scheduling, checkpoint change
- runtime/API/schema/dependency changes, provider fallback, source mutation, approval bypass
- runtime-agent commit/push, release, policy mutation, or connectors
