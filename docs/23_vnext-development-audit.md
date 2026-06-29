# vNext Development Audit

## Purpose

This audit records what is actually implemented from the reference-driven redesign, AI growth surface, and personalization plan. It also names the next development work without opening new authority.

The current product posture is:

- reference-driven shell: implemented
- read-only growth evidence: implemented as evidence review, not model training
- local-only personalization: implemented as browser convenience with copyable preference review, not runtime memory
- durable proposal records: read-only decision spec defined; creation and persistence remain blocked
- long-term memory: read-only decision spec defined; persistence, raw transcript ingestion, cross-workspace memory, and skill promotion remain blocked

## Current Evidence

| Area | Current state | Evidence |
| --- | --- | --- |
| Reference-driven design | Implemented. The shell uses the warm enterprise direction from `DESIGN.md` and the adopted/rejected reference matrix. | `DESIGN.md`, `docs/reference/vnext-reference-driven-ui-audit.md`, `ui/styles.css`, `scripts/smoke-ui-slice-649.mjs` |
| Product surface | Implemented. `Mission / Council / Execution / Deliverables` is the default shell, while `Taskboard / Logs / Artifacts / Decision Inbox` remains Advanced Ops. | `README.md`, `ui/app.js`, `docs/00_master-brief.md` |
| Growth learning | Implemented as read-only evidence extraction. It shows candidates from runs, reviews, approvals, blockers, and artifacts, but it does not train a model or mutate state. | `ui/app.js`, `scripts/smoke-ui-slice-649.mjs`, `docs/01_decision-log.md#DEC-048` |
| Proposal review gate | Implemented as a blocked readiness preview. The future decision spec is defined, but the UI still does not create, approve, apply, or persist proposal records. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-048`, `docs/01_decision-log.md#DEC-050`, `docs/24_proposal-review-decision-spec.md`, `scripts/vnext-proposal-review-decision-spec-status.mjs` |
| Personalization | Implemented as local browser preference only: recent surfaces, evidence density, preferred project hint, copyable preference review, and reset controls. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-049`, `scripts/smoke-ui-slice-649.mjs` |
| Long-term memory | Not implemented by design. The future decision spec is defined, but the UI still does not persist memory, ingest raw transcripts, globalize memory across workspaces, promote skills, call providers, mutate source, commit, or push. | `docs/01_decision-log.md#DEC-049`, `docs/01_decision-log.md#DEC-051`, `docs/25_memory-readiness-decision-spec.md`, `ui/app.js`, `scripts/smoke-ui-slice-649.mjs`, `scripts/vnext-memory-readiness-decision-spec-status.mjs` |

## Development Plan

Completed: `local-only personalization portability`
The shell now shows a copyable preference review packet for browser-only UI preferences. This is not an import or apply path; it improves handoff without touching runtime memory, provider calls, source mutation, commit, or push authority.

Completed: `proposal review decision spec`
`docs/24_proposal-review-decision-spec.md` defines the durable proposal record schema, source refs, evidence refs, reviewer refs, approval semantics, expiry rules, and stop conditions needed before any creation or persistence action appears. This remains a read-only decision spec and does not open proposal record creation, persistence, approval, application, provider calls, source mutation, commit, or push authority.

Completed: `memory readiness decision spec`
`docs/25_memory-readiness-decision-spec.md` defines the memory item schema, source refs, evidence refs, redaction refs, workspace scope, review semantics, export/deletion rules, expiry rules, and stop conditions needed before any long-term memory persistence appears. This remains a read-only decision spec and does not open memory persistence, raw transcript ingestion, cross-workspace memory, skill promotion, provider calls, source mutation, commit, or push authority.

1. `growth dashboard evidence depth`
   Expand read-only Growth Evidence Ledger views with grouped failure patterns, regression comparisons, and rollback evidence links. This remains display-only until a later approved proposal/application path exists.

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
```

The scripts check the reference audit, design rules, README claims, UI markers, decision boundaries, growth engine recommendation, reflection recommendation, proposal-readiness handoff, and memory-readiness contract. They must remain read-only.
