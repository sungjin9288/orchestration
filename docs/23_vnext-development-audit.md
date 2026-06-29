# vNext Development Audit

## Purpose

This audit records what is actually implemented from the reference-driven redesign, AI growth surface, and personalization plan. It also names the next development work without opening new authority.

The current product posture is:

- reference-driven shell: implemented
- read-only growth evidence: implemented as evidence review with grouped dashboard depth, not model training
- local-only personalization: implemented as browser convenience with copyable preference review, not runtime memory
- durable proposal records: creation and persistence are implemented only through approved local runtime records; proposal application remains blocked
- long-term memory: read-only decision spec defined; persistence, raw transcript ingestion, cross-workspace memory, and skill promotion remain blocked
- authority expansion: read-only review spec defined; implementation approval and all blocked authorities remain blocked
- operator decision packet: read-only decision input defined; it does not approve implementation
- durable proposal record planning preview: read-only planning input defined; it is not planning approval and does not create or persist records
- operator decision handoff: read-only decision template defined; it is not an operator decision
- durable proposal record implementation plan: planning-only approval accepted, implementation approval accepted, and local runtime creation/persistence implemented without proposal application authority
- proposal application decision packet: read-only decision input defined; it does not approve application

## Current Evidence

| Area | Current state | Evidence |
| --- | --- | --- |
| Reference-driven design | Implemented. The shell uses the warm enterprise direction from `DESIGN.md` and the adopted/rejected reference matrix. | `DESIGN.md`, `docs/reference/vnext-reference-driven-ui-audit.md`, `ui/styles.css`, `scripts/smoke-ui-slice-649.mjs` |
| Product surface | Implemented. `Mission / Council / Execution / Deliverables` is the default shell, while `Taskboard / Logs / Artifacts / Decision Inbox` remains Advanced Ops. | `README.md`, `ui/app.js`, `docs/00_master-brief.md` |
| Growth learning | Implemented as read-only evidence extraction with grouped failure patterns, current-snapshot regression comparison, and rollback evidence links. It shows candidates from runs, reviews, approvals, blockers, and artifacts, but it does not train a model or mutate state. | `ui/app.js`, `ui/styles.css`, `scripts/smoke-ui-slice-649.mjs`, `scripts/vnext-growth-dashboard-evidence-depth-status.mjs`, `docs/01_decision-log.md#DEC-048` |
| Proposal review gate | Implemented as a blocked application preview plus read-only durable record ledger. The runtime can create and persist records only through the approved creation function; the UI still does not create, approve, apply, or mutate proposals. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-048`, `docs/01_decision-log.md#DEC-050`, `docs/01_decision-log.md#DEC-057`, `docs/24_proposal-review-decision-spec.md`, `scripts/vnext-proposal-review-decision-spec-status.mjs`, `scripts/smoke-durable-proposal-record-creation.mjs` |
| Personalization | Implemented as local browser preference only: recent surfaces, evidence density, preferred project hint, copyable preference review, and reset controls. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-049`, `scripts/smoke-ui-slice-649.mjs` |
| Long-term memory | Not implemented by design. The future decision spec is defined, but the UI still does not persist memory, ingest raw transcripts, globalize memory across workspaces, promote skills, call providers, mutate source, commit, or push. | `docs/01_decision-log.md#DEC-049`, `docs/01_decision-log.md#DEC-051`, `docs/25_memory-readiness-decision-spec.md`, `ui/app.js`, `scripts/smoke-ui-slice-649.mjs`, `scripts/vnext-memory-readiness-decision-spec-status.mjs` |
| Authority expansion review | Implemented as a read-only review contract. It defines request fields, separated readiness/planning/implementation/application gates, rollback refs, and stop conditions, but it does not open implementation authority. | `docs/01_decision-log.md#DEC-052`, `docs/26_authority-expansion-review-spec.md`, `scripts/vnext-authority-expansion-review-status.mjs` |
| Authority implementation decision packet | Implemented as a read-only operator decision input. It lists decision outcomes, required decision fields, still-blocked authority, stop conditions, rollback refs, and focused smoke refs, but it does not approve implementation. | `docs/01_decision-log.md#DEC-053`, `docs/27_authority-implementation-decision-packet.md`, `scripts/vnext-authority-implementation-decision-packet-status.mjs` |
| Durable proposal record planning preview | Implemented as a read-only planning preview. It turns the recommended first candidate into a concrete record-shape, storage, focused-smoke, rollback, and stop-condition input, but it is not `approve-planning-only`, implementation approval, creation, persistence, application, provider, memory, source mutation, commit, or push authority. | `docs/01_decision-log.md#DEC-054`, `docs/28_durable-proposal-record-planning-preview.md`, `scripts/vnext-durable-proposal-record-planning-preview-status.mjs` |
| Operator decision handoff | Implemented as a read-only decision template and consumed by the accepted planning-only decision. It preserves valid statement shapes, invalid shortcuts, minimum planning-only acceptance, still-blocked authority, and stop conditions without approving implementation, record creation, persistence, application, memory, provider, source mutation, commit, or push. | `docs/01_decision-log.md#DEC-055`, `docs/29_operator-decision-handoff.md`, `scripts/vnext-operator-decision-handoff-status.mjs` |
| Durable proposal record implementation | Implemented as an approved local runtime slice. It stores durable proposal records in `state.json`, uses stable `proposal-record-0001` ids, requires creation approval evidence, keeps `applyAllowed=false`, exposes records as read-only UI data, and keeps proposal application, provider calls, memory persistence, source mutation, commit, and push blocked. | `docs/01_decision-log.md#DEC-056`, `docs/01_decision-log.md#DEC-057`, `docs/30_durable-proposal-record-implementation-plan.md`, `src/runtime/contracts.js`, `src/runtime/file-store.js`, `src/runtime/runtime-service.js`, `scripts/smoke-durable-proposal-record-creation.mjs`, `scripts/vnext-durable-proposal-record-implementation-status.mjs` |
| Proposal application decision packet | Implemented as a read-only decision input. It names the valid application decision outcomes, required fields, application boundary, still-blocked authority, stop conditions, and verification refs before any durable proposal record can be applied. | `docs/01_decision-log.md#DEC-058`, `docs/31_proposal-application-decision-packet.md`, `scripts/vnext-proposal-application-decision-packet-status.mjs` |

## Development Plan

Completed: `local-only personalization portability`
The shell now shows a copyable preference review packet for browser-only UI preferences. This is not an import or apply path; it improves handoff without touching runtime memory, provider calls, source mutation, commit, or push authority.

Completed: `proposal review decision spec`
`docs/24_proposal-review-decision-spec.md` defines the durable proposal record schema, source refs, evidence refs, reviewer refs, approval semantics, expiry rules, and stop conditions needed before any creation or persistence action appears. This remains a read-only decision spec and does not open proposal record creation, persistence, approval, application, provider calls, source mutation, commit, or push authority.

Completed: `memory readiness decision spec`
`docs/25_memory-readiness-decision-spec.md` defines the memory item schema, source refs, evidence refs, redaction refs, workspace scope, review semantics, export/deletion rules, expiry rules, and stop conditions needed before any long-term memory persistence appears. This remains a read-only decision spec and does not open memory persistence, raw transcript ingestion, cross-workspace memory, skill promotion, provider calls, source mutation, commit, or push authority.

Completed: `growth dashboard evidence depth`
The Growth Evidence Ledger now shows grouped failure patterns, current-snapshot regression comparison, and rollback evidence links as a display-only dashboard depth layer. It does not apply proposals, create proposal records, persist memory, call providers, mutate source, commit, or push.

Completed: `operator-approved authority expansion review`
`docs/26_authority-expansion-review-spec.md` defines the shared read-only review contract for future durable proposal records, memory persistence, provider calls, or source mutation. It records required request fields, candidate authority paths, separated approval gates, stop conditions, rollback refs, and verification requirements. It does not approve implementation or open any authority.

Completed: `authority implementation decision packet`
`docs/27_authority-implementation-decision-packet.md` turns the current `operator decision required` gate into a concrete read-only decision input. It names decision outcomes, required fields, the recommended first candidate, stop conditions, still-blocked authority, rollback refs, focused smoke refs, and aggregate verification requirements. It does not approve planning, implementation, application, provider calls, persistence, source mutation, commit, or push.

Completed: `durable proposal record planning preview`
`docs/28_durable-proposal-record-planning-preview.md` turns the recommended first candidate into a concrete read-only planning input. It names the proposal record shape, local-first storage candidate, focused smoke preview, rollback preview, and stop conditions for a later plan. It is not planning approval and does not create proposal records, persist records, mutate queues, apply proposals, persist memory, call providers, mutate source, commit, or push.

Completed: `operator decision handoff`
`docs/29_operator-decision-handoff.md` gave the operator a copy-ready decision template for the `operator decision required` gate. It lists required decision fields, valid statement shapes, invalid shortcuts, minimum planning-only acceptance criteria, still-blocked authority, and stop conditions. It is not implementation approval and does not approve implementation, proposal record creation, persistence, application, memory, provider calls, source mutation, commit, or push.

Completed: `durable proposal record implementation plan`
`docs/30_durable-proposal-record-implementation-plan.md` records the accepted `approve-planning-only` decision and defines the implementation plan, rollback plan, and focused smoke plan for the recommended durable proposal record creation and persistence path. It is planning-only and does not approve implementation, proposal record creation, proposal record persistence, proposal application, provider calls, memory persistence, source mutation, commit, or push.

Completed: `durable proposal record implementation`
`src/runtime/contracts.js`, `src/runtime/file-store.js`, and `src/runtime/runtime-service.js` implement approved local proposal record creation and persistence under the selected runtime root. `ui/app.js` reads saved records on the proposal review surface without adding create/apply UI actions. `scripts/smoke-durable-proposal-record-creation.mjs` proves approval-required creation, evidence-required validation, local `state.json` persistence, `applyAllowed=false`, blocked proposal application/provider/memory/source/commit/push authority, and rollback quarantine evidence.

Completed: `proposal application decision packet`
`docs/31_proposal-application-decision-packet.md` turns the current proposal application gate into read-only decision input. It separates application planning, application implementation, source mutation approval, commit approval, and push approval while keeping proposal generation/application, provider calls, memory persistence, source mutation, commit, and push blocked.

1. `proposal application planning decision required`
   Choose whether a later slice should plan or implement proposal application semantics for existing durable proposal records. The current packet is decision input only; it does not generate proposals, apply proposals, mutate source, call providers, persist memory, commit, or push.

## Authority Boundary

These authorities remain blocked:

- provider calls from growth learning surfaces
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- proposal generation or application
- durable proposal record UI creation action
- runtime, UI, or source mutation from growth candidates
- commit or push

## Verification

Run:

```bash
node scripts/vnext-development-audit-status.mjs
node scripts/vnext-proposal-review-decision-spec-status.mjs
node scripts/vnext-memory-readiness-decision-spec-status.mjs
node scripts/vnext-growth-dashboard-evidence-depth-status.mjs
node scripts/vnext-authority-expansion-review-status.mjs
node scripts/vnext-authority-implementation-decision-packet-status.mjs
node scripts/vnext-durable-proposal-record-planning-preview-status.mjs
node scripts/vnext-operator-decision-handoff-status.mjs
node scripts/vnext-durable-proposal-record-implementation-plan-status.mjs
node scripts/smoke-durable-proposal-record-creation.mjs
node scripts/vnext-durable-proposal-record-implementation-status.mjs
node scripts/vnext-proposal-application-decision-packet-status.mjs
```

The scripts check the reference audit, design rules, README claims, UI markers, grouped growth evidence depth, decision boundaries, growth engine recommendation, reflection recommendation, proposal-readiness handoff, memory-readiness contract, authority-expansion review contract, authority implementation decision packet, durable proposal record planning preview, operator decision handoff, durable proposal record implementation plan, the approved durable proposal record creation/persistence smoke, and the proposal application decision packet.
