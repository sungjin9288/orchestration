# vNext Development Audit

## Purpose

This audit records what is actually implemented from the reference-driven redesign, AI growth surface, and personalization plan. It also names the next development work without opening new authority.

The current product posture is:

- reference-driven shell: implemented
- read-only growth evidence: implemented as evidence review, not model training
- local-only personalization: implemented as browser convenience, not runtime memory
- durable proposal records: blocked until a separate decision opens schema, approval, and persistence rules
- long-term memory: blocked until a separate decision opens source, redaction, export, expiry, and deletion rules

## Current Evidence

| Area | Current state | Evidence |
| --- | --- | --- |
| Reference-driven design | Implemented. The shell uses the warm enterprise direction from `DESIGN.md` and the adopted/rejected reference matrix. | `DESIGN.md`, `docs/reference/vnext-reference-driven-ui-audit.md`, `ui/styles.css`, `scripts/smoke-ui-slice-649.mjs` |
| Product surface | Implemented. `Mission / Council / Execution / Deliverables` is the default shell, while `Taskboard / Logs / Artifacts / Decision Inbox` remains Advanced Ops. | `README.md`, `ui/app.js`, `docs/00_master-brief.md` |
| Growth learning | Implemented as read-only evidence extraction. It shows candidates from runs, reviews, approvals, blockers, and artifacts, but it does not train a model or mutate state. | `ui/app.js`, `scripts/smoke-ui-slice-649.mjs`, `docs/01_decision-log.md#DEC-048` |
| Proposal review gate | Implemented as a blocked readiness preview. It is not proposal approval and does not create or persist durable proposal records. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-048` |
| Personalization | Implemented as local browser preference only: recent surfaces, evidence density, preferred project hint, and reset controls. | `ui/app.js`, `README.md`, `docs/01_decision-log.md#DEC-049` |
| Long-term memory | Not implemented by design. The shell shows a readiness gate only. | `docs/01_decision-log.md#DEC-049`, `ui/app.js`, `scripts/smoke-ui-slice-649.mjs` |

## Development Plan

1. `local-only personalization portability`
   Add export, import, or copyable review for browser-only UI preferences. This can improve handoff without touching runtime memory.

2. `proposal review decision spec`
   Define durable proposal record schema, source refs, evidence refs, reviewer refs, approval semantics, and expiry rules before any creation or persistence action appears.

3. `memory readiness decision spec`
   Define memory item schema, source boundaries, redaction, export, expiry, deletion, and skill-promotion review before long-term memory can open.

4. `growth dashboard evidence depth`
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
```

The script checks the reference audit, design rules, README claims, UI markers, decision boundaries, growth engine recommendation, reflection recommendation, and proposal-readiness handoff. It must remain read-only.
