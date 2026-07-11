# Proposal Generation Operator Decision Handoff

## Purpose

This handoff gives the operator a copy-ready decision shape for the
`proposal generation planning decision required` gate.

It is not an operator decision. It does not approve proposal generation planning or
implementation. It does not generate drafts, create proposal records, apply proposals, call
providers, persist memory, mutate runtime state, mutate UI state, mutate source files, commit, or
push.

## Current Gate

- Original gate: `proposal generation planning decision required`
- Decision packet: `docs/40_proposal-generation-decision-packet.md`
- Handoff status: `awaiting-fielded-operator-planning-decision`
- Recommended first target: deterministic local proposal draft generation planning
- Required input: one fielded `approve-proposal-generation-planning-only` decision
- Current proposal generation planning authority: blocked
- Current proposal generation implementation authority: blocked
- Current provider-assisted generation authority: blocked
- Current durable proposal record creation authority: approved runtime function only; no generation path may create records
- Current proposal application authority: blocked
- Current provider, memory, source mutation, commit, and push authority: blocked

## Decision Response Template

Use this shape when the operator chooses the next outcome:

| Field | Operator value |
| --- | --- |
| `decisionId` | Stable id such as `operator-decision-vnext-proposal-generation-planning-001`. |
| `decisionStatus` | One of `approve-proposal-generation-planning-only`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly `deterministic local proposal draft generation planning`. |
| `targetSurface` | Docs, the existing read-only Growth Evidence Ledger and proposal review surfaces, and a future named local draft-generation entrypoint. |
| `sourceEvidenceRefs` | Positive evidence refs, including `DEC-048`, `DEC-050`, `DEC-052`, `DEC-053`, `DEC-057`, `DEC-062`, `DEC-067`, `DEC-068`, `docs/24_proposal-review-decision-spec.md`, `docs/26_authority-expansion-review-spec.md`, `docs/27_authority-implementation-decision-packet.md`, `docs/40_proposal-generation-decision-packet.md`, `scripts/growth-evidence-ledger-proposal-readiness-status.mjs`, and `scripts/growth-proposal-queue-status.mjs`. |
| `negativeEvidenceRefs` | Missing generation plan, missing inert draft schema, missing rollback plan, missing focused generation smoke, provider calls blocked, memory persistence blocked, durable record creation outside the approved runtime function blocked, proposal application blocked, source mutation outside the approved named path blocked, commit blocked, and push blocked. |
| `generationPlanRefs` | Empty until `approve-proposal-generation-planning-only` exists; after that, exactly one later plan must be linked here before implementation approval can be requested. |
| `rollbackRefs` | Disable the future draft generation entrypoint, discard or quarantine invalid drafts, preserve source evidence, and prove aggregate verification after rollback. |
| `focusedSmokeRefs` | Planning smoke only until a later implementation decision; implementation, provider calls, memory persistence, durable record creation, proposal application, source mutation, commit, and push stay blocked. |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs`. |
| `stillBlockedAuthorities` | Proposal generation implementation, provider-assisted generation, durable proposal record creation outside the approved runtime function, durable proposal record UI creation action, proposal application, proposal queue mutation, provider calls, memory persistence, long-term memory, raw transcript ingestion, cross-workspace memory, skill promotion, runtime mutation, UI mutation, source mutation outside the approved named path, commit, and push. |
| `approvalStatement` | Plain operator wording that approves planning only and rejects implied implementation, record creation, application, provider, memory, source mutation, commit, or push authority. |

## Valid Decision Statements

These are valid statement shapes. The operator must choose and fill one; this document does not
choose for them.

### Planning Only

```text
decisionId=operator-decision-vnext-proposal-generation-planning-001
decisionStatus=approve-proposal-generation-planning-only
targetAuthority=deterministic local proposal draft generation planning
targetSurface=docs plus the existing read-only Growth Evidence Ledger and proposal review surfaces
sourceEvidenceRefs=DEC-048, DEC-050, DEC-052, DEC-053, DEC-057, DEC-062, DEC-067, DEC-068, docs/24_proposal-review-decision-spec.md, docs/26_authority-expansion-review-spec.md, docs/27_authority-implementation-decision-packet.md, docs/40_proposal-generation-decision-packet.md, scripts/growth-evidence-ledger-proposal-readiness-status.mjs, scripts/growth-proposal-queue-status.mjs
negativeEvidenceRefs=no accepted generation plan, no accepted inert draft schema, no accepted rollback plan, no focused generation smoke, provider calls remain blocked, memory persistence remains blocked, durable record creation outside the approved runtime function remains blocked, proposal application remains blocked, source mutation outside the approved named path remains blocked, commit and push remain blocked
generationPlanRefs=empty until this planning-only approval is accepted
rollbackRefs=disable the future draft generation entrypoint, discard or quarantine invalid drafts, preserve source evidence, prove aggregate verification after rollback
focusedSmokeRefs=planning smoke only; proposal generation implementation, provider calls, memory persistence, durable record creation, proposal application, source mutation, commit, and push stay blocked
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=proposal generation implementation, provider-assisted proposal generation, durable proposal record creation outside the approved runtime function, durable proposal record UI creation action, proposal application, proposal queue mutation, provider calls, memory persistence, long-term memory, raw transcript ingestion, cross-workspace memory, skill promotion, runtime mutation, UI mutation, source mutation outside the approved named path, commit, push
approvalStatement=I approve planning only for one deterministic local proposal draft generation path from one existing Growth Evidence Ledger candidate. This approval allows one generation plan, rollback plan, and focused smoke plan. It does not approve proposal generation implementation, provider calls, memory persistence, durable proposal record creation, proposal application, source mutation, commit, or push.
```

### Request More Evidence

```text
decisionId=operator-decision-vnext-proposal-generation-planning-001
decisionStatus=request-more-evidence
targetAuthority=deterministic local proposal draft generation planning
targetSurface=docs plus the existing read-only Growth Evidence Ledger and proposal review surfaces
missingEvidenceRefs=<operator-provided evidence gap>
stillBlockedAuthorities=proposal generation planning, proposal generation implementation, provider-assisted generation, durable record creation, proposal application, provider calls, memory persistence, source mutation, commit, push
approvalStatement=I request more read-only evidence before proposal generation planning. No planning, generation implementation, provider, memory, record creation, proposal application, source mutation, commit, or push authority opens.
```

### Reject Or Defer

```text
decisionId=operator-decision-vnext-proposal-generation-planning-001
decisionStatus=reject
targetAuthority=deterministic local proposal draft generation planning
targetSurface=docs plus the existing read-only Growth Evidence Ledger and proposal review surfaces
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=proposal generation planning, proposal generation implementation, provider-assisted generation, durable record creation, proposal application, provider calls, memory persistence, source mutation, commit, push
approvalStatement=I reject or defer proposal generation planning for now. Proposal generation planning, implementation, provider calls, memory persistence, durable record creation, proposal application, source mutation, commit, and push remain blocked.
```

## Invalid Shortcuts

These statements are not valid proposal generation planning approval:

- `continue`
- `proceed`
- `do everything`
- `approve all`
- `implement vNext`
- `enable proposal generation`
- `generate proposals`
- `ship it`
- any statement that omits `decisionStatus`
- any statement that omits `sourceEvidenceRefs`
- any statement that omits `negativeEvidenceRefs`
- any statement that omits rollback refs
- any statement that omits focused smoke refs
- any statement that names more than one authority path
- any statement that treats proposal record creation approval as generation approval
- any statement that treats proposal application approval as generation approval
- any statement that opens provider calls, memory persistence, source mutation, commit, or push by implication

## Minimum Planning Acceptance

A planning-only decision is acceptable only when it:

1. Uses `decisionStatus=approve-proposal-generation-planning-only`.
2. Names exactly `deterministic local proposal draft generation planning`.
3. Allows exactly one existing Growth Evidence Ledger candidate as input.
4. Keeps implementation blocked.
5. Keeps provider-assisted generation blocked.
6. Keeps durable proposal record creation blocked for the generation path.
7. Keeps proposal application blocked.
8. Keeps provider calls blocked.
9. Keeps memory persistence blocked.
10. Keeps source mutation outside the approved named path blocked.
11. Keeps commit and push blocked.
12. Includes source evidence refs.
13. Includes negative evidence refs.
14. Includes rollback refs.
15. Includes focused smoke refs.
16. Includes aggregate verification refs.

## Still Blocked

This handoff grants no authority by itself. These authorities remain blocked:

- proposal generation planning until a fielded decision is accepted
- proposal generation implementation
- provider-assisted proposal generation
- durable proposal record creation outside the approved runtime function
- durable proposal record UI creation action
- proposal application
- proposal queue mutation
- provider calls
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- runtime mutation
- UI mutation
- source mutation outside the approved named path
- commit
- push

## Stop Conditions

Stop before generation planning or implementation when:

- the operator decision is missing
- the operator decision is a shortcut instead of a fielded decision
- the operator decision omits required fields
- the operator decision names more than one proposal generation path
- the operator decision allows more than one input candidate
- source evidence refs are missing
- negative evidence refs are missing
- rollback refs are missing
- focused smoke refs are missing
- aggregate verification refs are missing
- the decision collapses planning approval and implementation approval
- the decision collapses draft generation, durable record creation, proposal application, and source mutation
- provider calls, memory persistence, source mutation, commit, or push would open by implication

## Verification

Run:

```bash
node scripts/vnext-proposal-generation-operator-decision-handoff-status.mjs
```

The status script verifies this handoff as read-only decision-template evidence, the proposal
generation decision packet, current development audit, README evidence, completion inventory,
aggregate registration, proposal queue/readiness evidence, and the authorities that remain blocked.
It does not record a new operator decision or open proposal generation planning authority.
