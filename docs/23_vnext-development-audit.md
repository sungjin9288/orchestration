# vNext Development Audit

## Purpose

This audit records what is actually implemented from the reference-driven redesign, AI growth surface, and personalization plan. It also names the next development work without opening new authority.

The current product posture is:

- reference-driven shell: implemented
- read-only growth evidence: implemented as evidence review with grouped dashboard depth, not model training
- local-only personalization: implemented as browser convenience with copyable preference review, not runtime memory
- durable proposal records: read-only decision spec defined; creation and persistence remain blocked
- long-term memory: read-only decision spec defined; persistence, raw transcript ingestion, cross-workspace memory, and skill promotion remain blocked
- authority expansion: read-only review spec defined; implementation approval and all blocked authorities remain blocked
- operator decision packet: read-only decision input defined; it does not approve implementation
- durable proposal record planning preview: read-only planning input defined; it is not planning approval and does not create or persist records

## Current Evidence

| Area | Current state | Evidence |
| --- | --- | --- |
| Reference-driven design | Implemented. The shell uses the warm enterprise direction from `DESIGN.md` and the adopted/rejected reference matrix. | `DESIGN.md`, `docs/reference/vnext-reference-driven-ui-audit.md`, `ui/styles.css`, `scripts/smoke-ui-slice-649.mjs` |
| Product surface | Implemented. `Mission / Council / Execution / Deliverables` is the default shell, while `Taskboard / Logs / Artifacts / Decision Inbox` remains Advanced Ops. | `README.md`, `ui/app.js`, `docs/00_master-brief.md` |
| Growth learning | Implemented as read-only evidence extraction with grouped failure patterns, current-snapshot regression comparison, and rollback evidence links. It shows candidates from runs, reviews, approvals, blockers, and artifacts, but it does not train a model or mutate state. | `ui/app.js`, `ui/styles.css`, `scripts/smoke-ui-slice-649.mjs`, `scripts/vnext-growth-dashboard-evidence-depth-status.mjs`, `docs/01_decision-log.md#DEC-048` |
| Proposal review gate | Implemented as a blocked readiness preview. The future decision spec is defined, but the UI still does not create, approve, apply, or persist proposal records. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-048`, `docs/01_decision-log.md#DEC-050`, `docs/24_proposal-review-decision-spec.md`, `scripts/vnext-proposal-review-decision-spec-status.mjs` |
| Personalization | Implemented as local browser preference only: recent surfaces, evidence density, preferred project hint, copyable preference review, and reset controls. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-049`, `scripts/smoke-ui-slice-649.mjs` |
| Long-term memory | Not implemented by design. The future decision spec is defined, but the UI still does not persist memory, ingest raw transcripts, globalize memory across workspaces, promote skills, call providers, mutate source, commit, or push. | `docs/01_decision-log.md#DEC-049`, `docs/01_decision-log.md#DEC-051`, `docs/25_memory-readiness-decision-spec.md`, `ui/app.js`, `scripts/smoke-ui-slice-649.mjs`, `scripts/vnext-memory-readiness-decision-spec-status.mjs` |
| Authority expansion review | Implemented as a read-only review contract. It defines request fields, separated readiness/planning/implementation/application gates, rollback refs, and stop conditions, but it does not open implementation authority. | `docs/01_decision-log.md#DEC-052`, `docs/26_authority-expansion-review-spec.md`, `scripts/vnext-authority-expansion-review-status.mjs` |
| Authority implementation decision packet | Implemented as a read-only operator decision input. It lists decision outcomes, required decision fields, still-blocked authority, stop conditions, rollback refs, and focused smoke refs, but it does not approve implementation. | `docs/01_decision-log.md#DEC-053`, `docs/27_authority-implementation-decision-packet.md`, `scripts/vnext-authority-implementation-decision-packet-status.mjs` |
| Durable proposal record planning preview | Implemented as a read-only planning preview. It turns the recommended first candidate into a concrete record-shape, storage, focused-smoke, rollback, and stop-condition input, but it is not `approve-planning-only`, implementation approval, creation, persistence, application, provider, memory, source mutation, commit, or push authority. | `docs/01_decision-log.md#DEC-054`, `docs/28_durable-proposal-record-planning-preview.md`, `scripts/vnext-durable-proposal-record-planning-preview-status.mjs` |

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

1. `operator decision required`
   Choose whether a later implementation slice should open exactly one authority path. The current recommended first candidate is durable proposal record creation and persistence, but it still requires explicit operator approval, an accepted implementation plan, rollback plan, and focused smoke coverage before any write, provider, source mutation, commit, or push behavior changes.

## Authority Boundary

These authorities remain blocked:

- provider calls from growth learning surfaces
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- proposal generation or application
- durable proposal record creation or persistence
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
```

The scripts check the reference audit, design rules, README claims, UI markers, grouped growth evidence depth, decision boundaries, growth engine recommendation, reflection recommendation, proposal-readiness handoff, memory-readiness contract, authority-expansion review contract, authority implementation decision packet, and durable proposal record planning preview. They must remain read-only.
