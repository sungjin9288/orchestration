# Operator Decision Handoff

## Purpose

This handoff gives the operator a copy-ready decision template for the `operator decision required` gate.

It is not an operator decision. It is not `approve-planning-only`. It is not implementation approval. It does not create proposal records, persist records, mutate queues, call providers, persist memory, mutate source, commit, or push.

## Current Gate

- Original gate: `operator decision required`
- Accepted follow-up: `DEC-056`
- Current downstream gate: `implementation decision required`
- Decision packet: `docs/27_authority-implementation-decision-packet.md`
- Planning preview: `docs/28_durable-proposal-record-planning-preview.md`
- Implementation plan: `docs/30_durable-proposal-record-implementation-plan.md`
- Recommended first candidate: durable proposal record creation and persistence
- Handoff status: `consumed-by-planning-only-decision`
- Current implementation authority: blocked

## Decision Response Template

Use this shape when the operator chooses the next outcome:

| Field | Operator value |
| --- | --- |
| `decisionId` | Stable id such as `operator-decision-vnext-proposal-record-001`. |
| `decisionStatus` | One of `approve-planning-only`, `approve-implementation-slice`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly one authority path. Recommended first value: `durable proposal record creation and persistence`. |
| `targetSurface` | The affected surface, such as local proposal record storage under the selected runtime root plus the existing proposal review surface. |
| `sourceEvidenceRefs` | Positive evidence refs, including `DEC-048`, `DEC-050`, `DEC-052`, `DEC-053`, `DEC-054`, `docs/24_proposal-review-decision-spec.md`, `docs/27_authority-implementation-decision-packet.md`, and `docs/28_durable-proposal-record-planning-preview.md`. |
| `negativeEvidenceRefs` | Missing proof and risks, including no accepted storage path, no accepted id policy, no accepted timestamp policy, no accepted expiry policy, no accepted rollback plan, no implementation plan, and no creation smoke yet. |
| `implementationPlanRefs` | Empty until `approve-planning-only` exists; after that, the later plan must be linked here before implementation approval. |
| `rollbackRefs` | Required rollback evidence for disabling the creation path, restoring local file-store state, quarantining invalid local records, preserving audit evidence, and proving aggregate verification after rollback. |
| `focusedSmokeRefs` | Required focused smoke refs proving creation approval is required and proposal application, provider calls, memory persistence, source mutation, commit, and push stay blocked. |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs`. |
| `stillBlockedAuthorities` | Proposal application, proposal generation, proposal queue mutation beyond the approved path, memory persistence, long-term memory, provider calls, runtime mutation from growth candidates, source mutation, commit, and push. |
| `approvalStatement` | Plain operator wording that separates planning approval, implementation approval, proposal application approval, commit approval, and push approval. |

## Valid Decision Statements

These are valid statement shapes. The operator must choose and fill one; this document does not choose for them.

### Planning Only

```text
I approve planning only for durable proposal record creation and persistence.
This approval allows one implementation plan, rollback plan, and focused smoke plan.
It does not approve implementation, proposal application, provider calls, memory persistence, source mutation, commit, or push.
```

### Request More Evidence

```text
I request more read-only evidence before planning approval.
The missing evidence is: <name the missing evidence>.
No implementation, persistence, provider, memory, source mutation, commit, or push authority opens.
```

### Defer Or Reject

```text
I defer or reject durable proposal record planning for now.
No implementation planning or authority opens from this decision.
```

## Invalid Shortcuts

These are not valid operator decisions for opening the next path:

- `continue`
- `proceed`
- `do everything`
- `implement vNext`
- `build the proposal record feature`
- `approve all`
- any decision that names more than one authority path
- any decision that combines planning approval, implementation approval, proposal application approval, commit approval, or push approval

## Minimum Planning-Only Acceptance

Before a later implementation plan can be written, an accepted `approve-planning-only` decision must include:

- `decisionStatus=approve-planning-only`
- `targetAuthority=durable proposal record creation and persistence`
- one named `targetSurface`
- source evidence refs
- negative evidence refs
- expected rollback refs
- expected focused smoke refs
- aggregate verification ref
- explicit still-blocked authority list
- an approval statement that says planning only

## Still Blocked

These authorities remain blocked from this handoff:

- proposal generation
- proposal application
- proposal queue mutation
- proposal record creation
- proposal record persistence
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- provider calls
- runtime mutation from growth candidates
- UI action mutation from growth candidates
- source mutation
- commit
- push

## Stop Conditions

Stop before implementation when any of these are true:

- no explicit `approve-implementation-slice` exists for the accepted implementation plan
- the decision text is a shortcut instead of a fielded decision
- more than one authority path is named
- source evidence refs are missing
- negative evidence refs are missing
- rollback refs are missing
- focused smoke refs are missing
- aggregate verification ref is missing
- planning approval, implementation approval, proposal application approval, commit approval, or push approval are collapsed into one statement
- any blocked authority would open by implication

## Verification

Run:

```bash
node scripts/vnext-operator-decision-handoff-status.mjs
```

The script must stay read-only. It verifies this handoff, the decision packet, the planning preview, the vNext development audit, README evidence, completion-gate inventory, aggregate registration, and blocked authority markers without recording an operator decision or opening implementation authority.
