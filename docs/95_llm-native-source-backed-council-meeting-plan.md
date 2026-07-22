# LLM-Native Source-Backed Council Meeting Plan

## Status

- Decision: `DEC-144`
- Authority: delegated non-critical usability implementation
- Scope: Council browser presentation only
- Runtime schema: v16 unchanged
- API contract: unchanged

## Problem

The Council surface repeats the same Mission and Council evidence through a boardroom hero,
attendance register, role cards, heartbeat strip, handoff deck, transcript cards, outcome cards, and
approval shelf. In the current source-backed fixture, that produces a 5,522px desktop surface and a
9,957px mobile surface. The mobile alignment gate begins 9,868px below the viewport, so decorative
meeting structure appears long before the role judgments and operator decision.

## Product Boundary

Council becomes one source-backed reading flow:

1. Mission title, goal, Council status, and alignment state establish the current context.
2. Strategist, Architect, and Decomposer positions appear in recorded order as unframed role turns.
3. Conductor synthesis appears once after the independent positions.
4. Conflict, dissent, and open questions appear only when source records contain them.
5. Operator alignment keeps the existing approve, request-revision, stop, and handoff actions.
6. Source ids, provider provenance, execution evidence, and WorkOrder preparation remain available
   in collapsed detail regions without repeating the visible role recommendations or synthesis.

The flow is not a group chat. It renders current Council records without typing simulation, generated
messages, inferred agreement, avatars, seating charts, or decorative future stages.

## Compatibility

- Legacy deterministic transcript, `real-local-stub`, and explicit `real-openai-responses` modes keep
  their current runtime and API behavior.
- Existing provider readiness, bounded retry, redaction, revision targeting, alignment decisions,
  WorkOrder preview, linked-task handoff, and Advanced Ops actions remain unchanged.
- The company/ERP boardroom renderer remains a non-primary compatibility fallback; the accepted
  LLM-native shell always uses the conversational Council flow.
- Disclosure state lives only in browser memory, survives periodic snapshot rendering, and resets
  when the operator selects another Mission.
- Schema v16, dependencies, persisted records, runtime methods, routes, source mutation, approval
  gates, commit, push, release, scheduling, policy, and connector authority do not change.

## Verification

Focused UI smoke proves source-backed turn selection, one Conductor synthesis, conditional dissent,
visible alignment actions, collapsed secondary controls, LLM-native shell routing, escaped text, and
absence of boardroom, heartbeat, handoff-deck, generated-message, persistence, or authority expansion
in the primary renderer. The smoke also proves browser-memory disclosure ownership and Mission-change
reset. Existing Real Council and provider smokes prove runtime and API compatibility.

Real-browser QA covers 1440x1000 and 390x844, including source-backed role order, document and gate
position, horizontal overflow, text fit, collapsed details, action reachability, and console output.
Closure includes UI QA, README and completion-inventory evidence, `git diff --check`, and aggregate
verification.

## Rollback

Route the LLM-native shell back to the existing boardroom compatibility renderer, remove the focused
styles and smoke registration, and leave every runtime record and API route unchanged.

## Still Blocked

- durable chat, generated messages, hidden reasoning, transcript mutation, or Council record rewrite
- automatic alignment, execution, retry, scheduling, provider fallback, or background work
- runtime/API/schema/dependency changes, approval bypass, source mutation, runtime-agent commit/push,
  release, policy mutation, or connectors
