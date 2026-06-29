# Proposal Application Operator Decision Handoff

## Purpose

This handoff gives the operator a copy-ready decision shape for the `proposal application planning decision required` gate.

It is not an operator decision. It is not proposal application approval. It is not source mutation approval. It does not apply proposals, generate proposals, call providers, persist memory, mutate source, commit, or push.

## Current Gate

- Original application gate: `proposal application decision required`
- Current gate: `proposal application planning decision required`
- Decision packet: `docs/31_proposal-application-decision-packet.md`
- Source implementation: `DEC-057`
- Handoff status: `decision-template-only`
- Current creation authority: durable proposal record creation and persistence only through the approved runtime function
- Current application authority: blocked
- Current source mutation authority: blocked
- Current commit and push authority: blocked

## Decision Response Template

Use this shape when the operator chooses the next outcome:

| Field | Operator value |
| --- | --- |
| `decisionId` | Stable id such as `operator-decision-vnext-proposal-application-001`. |
| `decisionStatus` | One of `approve-application-planning-only`, `approve-application-implementation-slice`, `request-more-evidence`, `reject`, or `defer`. |
| `targetAuthority` | Exactly one authority path. Recommended first value: `proposal application planning for existing durable proposal records`. |
| `targetSurface` | The docs, runtime function, UI review surface, or local storage surface affected by the decision. |
| `sourceEvidenceRefs` | Positive evidence refs, including `DEC-057`, `DEC-058`, `docs/24_proposal-review-decision-spec.md`, `docs/30_durable-proposal-record-implementation-plan.md`, and `docs/31_proposal-application-decision-packet.md`. |
| `negativeEvidenceRefs` | Known risks, missing proof, rejected alternatives, stale records, expired records, unresolved reviewer concerns, and any source mutation risk. |
| `applicationPlanRefs` | Empty for `approve-application-planning-only`; required and accepted before `approve-application-implementation-slice`. |
| `rollbackRefs` | Required rollback evidence for disabling the application path, preserving proposal record audit evidence, quarantining failed application attempts, and proving aggregate verification after rollback. |
| `focusedSmokeRefs` | Required focused smoke refs proving the exact application path and proving provider calls, memory persistence, source mutation, commit, and push stay blocked unless separately approved. |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs`. |
| `stillBlockedAuthorities` | Proposal generation, proposal application outside the named path, provider calls, memory persistence, source mutation, commit, and push. |
| `approvalStatement` | Plain operator wording that separates application planning, application implementation, source mutation approval, commit approval, and push approval. |

## Valid Decision Statements

These are valid statement shapes. The operator must choose and fill one; this document does not choose for them.

### Application Planning Only

```text
I approve planning only for proposal application semantics on existing durable proposal records.
This approval allows one application plan, rollback plan, and focused smoke plan.
It does not approve proposal application implementation, source mutation, provider calls, memory persistence, commit, or push.
```

### Application Implementation Slice

```text
I approve implementation only for the proposal application slice described in <applicationPlanRefs>.
This approval allows only the named application path and keeps source mutation, provider calls, memory persistence, commit, and push blocked unless separately approved.
```

### Request More Evidence

```text
I request more read-only evidence before proposal application planning or implementation approval.
The missing evidence is: <name the missing evidence>.
No application, source mutation, provider, memory, commit, or push authority opens.
```

### Defer Or Reject

```text
I defer or reject proposal application planning for now.
No application planning or implementation authority opens from this decision.
```

## Invalid Shortcuts

These are not valid operator decisions for opening the next path:

- `continue`
- `proceed`
- `do everything`
- `implement application`
- `apply all proposals`
- `approve all`
- any decision that names more than one authority path
- any decision that combines application planning, application implementation, source mutation approval, commit approval, or push approval
- any decision that treats durable proposal record creation approval as application approval

## Minimum Planning-Only Acceptance

Before a later application implementation plan can be written, an accepted `approve-application-planning-only` decision must include:

- `decisionStatus=approve-application-planning-only`
- `targetAuthority=proposal application planning for existing durable proposal records`
- one named `targetSurface`
- source evidence refs
- negative evidence refs
- expected rollback refs
- expected focused smoke refs
- aggregate verification ref
- explicit still-blocked authority list
- an approval statement that says planning only

## Minimum Implementation-Slice Acceptance

Before a later application implementation can be written, an accepted `approve-application-implementation-slice` decision must include:

- `decisionStatus=approve-application-implementation-slice`
- exactly one named application authority path
- accepted application plan refs
- source evidence refs and negative evidence refs
- rollback refs
- focused smoke refs
- aggregate verification ref
- explicit still-blocked authority list
- an approval statement that keeps source mutation, provider calls, memory persistence, commit, and push separate unless those actions are separately approved

## Still Blocked

These authorities remain blocked from this handoff:

- proposal generation
- proposal application
- proposal queue mutation
- durable proposal record UI creation action
- provider calls
- memory persistence
- long-term memory store
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- runtime mutation from growth candidates
- UI action mutation from growth candidates
- source mutation
- commit
- push

## Stop Conditions

Stop before application planning or implementation when any of these are true:

- the decision text is a shortcut instead of a fielded decision
- more than one authority path is named
- source evidence refs are missing
- negative evidence refs are missing
- application plan refs are missing for an implementation-opening decision
- rollback refs are missing
- focused smoke refs are missing
- aggregate verification ref is missing
- application planning and implementation approval are collapsed into one unclear statement
- application approval and source mutation approval are collapsed into one statement
- commit or push is requested without separate explicit approval
- provider calls, memory persistence, source mutation, commit, or push would open by implication

## Verification

Run:

```bash
node scripts/vnext-proposal-application-operator-decision-handoff-status.mjs
```

The script must stay read-only. It verifies this handoff, the proposal application decision packet, the proposal review decision spec, durable proposal record implementation evidence, vNext development audit, README evidence, completion-gate inventory, aggregate registration, and blocked authority markers without recording an operator decision or opening proposal application authority.
