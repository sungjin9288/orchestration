# Proposal Application Implementation Decision Handoff

## Purpose

This document is a copy-ready operator handoff for the current `proposal application implementation decision required` gate.

It is not an operator decision. It does not implement proposal application, apply proposals, generate proposals, call providers, persist memory, mutate source, commit, or push.

## Current Gate

- Current gate: `proposal application implementation decision required`
- Handoff status: `decision-input-only`
- Planning approval: accepted through `operator-decision-vnext-proposal-application-001`
- Implementation approval: blocked
- Application plan: `docs/33_proposal-application-implementation-plan.md`
- Decision packet: `docs/31_proposal-application-decision-packet.md`
- Planning handoff: `docs/32_proposal-application-operator-decision-handoff.md`

## Source Evidence

- `DEC-057`
- `DEC-058`
- `DEC-059`
- `DEC-060`
- `DEC-061`
- `docs/24_proposal-review-decision-spec.md`
- `docs/30_durable-proposal-record-implementation-plan.md`
- `docs/31_proposal-application-decision-packet.md`
- `docs/32_proposal-application-operator-decision-handoff.md`
- `docs/33_proposal-application-implementation-plan.md`
- `node scripts/vnext-proposal-application-implementation-plan-status.mjs`
- `node scripts/verification_status.mjs`

## Valid Implementation Decision Shape

Use this shape only if the operator wants to approve the next implementation slice.

Required fields: `decisionId`, `decisionStatus`, `targetAuthority`, `targetSurface`, `implementationPlanRefs`, `applicationPath`, `sourceEvidenceRefs`, `negativeEvidenceRefs`, `rollbackRefs`, `focusedSmokeRefs`, `aggregateVerificationRef`, `stillBlockedAuthorities`, and `approvalStatement`.

```text
decisionId=operator-decision-vnext-proposal-application-implementation-001
decisionStatus=approve-application-implementation-slice
targetAuthority=proposal application implementation for one audit-only attempt path on existing durable proposal records
targetSurface=local proposal application attempt records plus the existing proposal review surface
implementationPlanRefs=docs/33_proposal-application-implementation-plan.md
applicationPath=record one inert application attempt for an existing durable proposal record without source mutation
sourceEvidenceRefs=DEC-057, DEC-058, DEC-059, DEC-060, docs/24_proposal-review-decision-spec.md, docs/30_durable-proposal-record-implementation-plan.md, docs/31_proposal-application-decision-packet.md, docs/32_proposal-application-operator-decision-handoff.md, docs/33_proposal-application-implementation-plan.md
negativeEvidenceRefs=proposal generation remains blocked, source mutation remains blocked, provider calls remain blocked, memory persistence remains blocked, commit and push remain blocked, application approval is separate from creation approval
rollbackRefs=disable application attempt entrypoint, preserve proposal record audit evidence, quarantine failed application attempts, restore pre-application state shape, prove aggregate verification after rollback
focusedSmokeRefs=application attempt creation smoke only; missing application approval fails, missing record fails, expired or invalid records fail, missing evidence refs fail, source mutation/provider/memory/commit/push stay blocked
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=proposal generation, provider calls, memory persistence, source mutation, commit, push
approvalStatement=I approve implementation only for one audit-only proposal application attempt path on existing durable proposal records as described in docs/33_proposal-application-implementation-plan.md. This does not approve proposal generation, source mutation, provider calls, memory persistence, commit, or push.
```

## Rejection Decision Shape

Use this shape if the operator wants to keep implementation blocked.

```text
decisionId=operator-decision-vnext-proposal-application-implementation-001
decisionStatus=reject-application-implementation
targetAuthority=proposal application implementation for one audit-only attempt path on existing durable proposal records
targetSurface=local proposal application attempt records plus the existing proposal review surface
rejectionReason=<operator-provided reason>
stillBlockedAuthorities=proposal application implementation, proposal generation, provider calls, memory persistence, source mutation, commit, push
approvalStatement=I reject proposal application implementation for now. Proposal application implementation, proposal generation, provider calls, memory persistence, source mutation, commit, and push remain blocked.
```

## Invalid Shortcuts

These statements are not valid implementation approval:

- `continue`
- `do everything`
- `approve all`
- `implement vNext`
- `apply the proposal`
- `ship it`
- any statement that omits `decisionStatus`
- any statement that omits `implementationPlanRefs`
- any statement that omits rollback refs
- any statement that omits focused smoke refs
- any statement that treats proposal record creation approval as application approval
- any statement that treats application approval as source mutation approval
- any statement that opens provider calls, memory persistence, source mutation, commit, or push by implication

## Minimum Acceptance Criteria

An implementation approval is acceptable only when it:

1. Uses `decisionStatus=approve-application-implementation-slice`.
2. Names exactly one audit-only application attempt path.
3. Points to `docs/33_proposal-application-implementation-plan.md`.
4. Keeps proposal generation blocked.
5. Keeps source mutation blocked.
6. Keeps provider calls blocked.
7. Keeps memory persistence blocked.
8. Keeps commit and push blocked.
9. Includes rollback refs.
10. Includes focused smoke refs.
11. Includes aggregate verification refs.

## Still Blocked After Approval

Even if the implementation slice is approved, these authorities stay blocked unless separately approved:

- proposal generation
- source mutation
- provider calls
- memory persistence
- long-term memory
- raw transcript ingestion
- cross-workspace memory
- skill promotion
- commit
- push

## Stop Conditions

Stop before implementation when:

- the operator decision is missing
- the operator decision omits required fields
- the operator decision names more than one implementation path
- the operator decision collapses creation approval and application approval
- the operator decision collapses application approval and source mutation approval
- rollback refs are missing
- focused smoke refs are missing
- aggregate verification refs are missing
- provider calls, memory persistence, source mutation, commit, or push would open by implication

## Verification

Run:

```bash
node scripts/vnext-proposal-application-implementation-decision-handoff-status.mjs
```

The status script verifies this handoff, the consumed planning-only evidence, the current development audit, the README, completion inventory, aggregate registration, and blocked authority markers. It does not record an implementation decision or open implementation authority.
