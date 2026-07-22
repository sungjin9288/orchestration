# LLM-Native Source-Backed Mission Thread Plan

## Status

- Decision: `DEC-143`
- Authority: delegated non-critical usability implementation
- Scope: selected Mission Thread presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The active Mission thread always renders four rows even when Execution and Deliverables have not
started. Those empty future stages look like model messages despite having no source record. The
Mission title is also repeated in the lead, thread heading, and Operator turn. On a 390px viewport,
that repetition and the placeholder rows push the real next gate below the first screen.

## Product Boundary

The thread should read like a source-backed conversation:

- Operator appears for the selected Mission and shows the recorded goal.
- Council appears only when a Council session exists.
- Execution appears only when a linked task exists.
- Deliverables appears only when a current deliverable artifact exists.
- The existing next gate explains the first pending action instead of a synthetic future message.
- The active Mission lead remains the only conversation title; the thread uses the neutral heading
  `진행 기록` and the Operator turn does not repeat the title.

The order stays Operator, Council, Execution, Deliverables. No content is generated, inferred, or
persisted by this presentation rule.

## Compatibility

- `Thread` remains the default and `Graph` keeps the exact DEC-138/139 GET projection and browser
  exploration behavior.
- Existing Mission, Council, task, artifact, review, next-action, and context-inspector data are read
  unchanged.
- The current next-gate command and authority checks remain the only handoff to another surface.
- Mission compose mode, project bootstrap, API routes, schema v16, dependencies, runtime state,
  provider readiness, approval gates, source mutation, and Git authority remain unchanged.

## Verification

Focused smoke proves conditional source-backed row inclusion, stable chronological order, removal of
future placeholder copy, one active conversation title, conditional turn headings, unchanged
Thread/Graph selection, and zero authority-bearing code in the renderer. Real-browser QA covers the
current Mission with Council evidence but no linked task or artifact at 1440x1000 and 390x844,
including visible turn count, next-gate position, text fit, horizontal overflow, and console output.
Closure includes compatibility smokes, UI QA, README/inventory evidence, `git diff --check`, and
aggregate verification.

## Rollback

Restore the fixed four-entry workstream array and repeated Mission headings, remove the focused smoke
and evidence entries, and leave every runtime record unchanged.

## Still Blocked

- durable chat or message records, generated conversation content, hidden inference, or transcript
  persistence
- automatic Execution or Deliverables advancement, provider calls, scheduling, or background work
- runtime/API/schema/dependency changes, approval bypass, source mutation, runtime-agent commit/push,
  release, policy mutation, or connectors
