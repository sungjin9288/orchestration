# Proposal Application Implementation

## Purpose

This document records the implemented audit-only proposal application attempt path for existing
durable proposal records.

It is not proposal generation, proposal application to source, provider execution, memory
persistence, source mutation, commit, or push authority.

## Implementation Approval

Implementation approval: accepted.

Accepted decision:

- `decisionId=operator-decision-vnext-proposal-application-implementation-001`
- `decisionStatus=approve-application-implementation-slice`
- `targetAuthority=proposal application implementation for one audit-only attempt path on existing durable proposal records`
- `applicationPath=record one inert application attempt for an existing durable proposal record without source mutation`

The approval is limited to one local audit record path. Source mutation remains blocked, and proposal
generation, provider calls, memory persistence, commit, and push remain blocked.

## Runtime Implementation

Runtime implementation: completed.

The approved path records one inert application attempt under local `state.json`
`proposalApplicationAttempts`. It links the attempt back to an existing durable proposal record
through `applicationAttemptIds` and keeps the attempt in `planned` status.

The runtime does not apply a proposal, generate proposal content, mutate source files, call a
provider, persist memory, commit, or push.

## Rollback Plan

Rollback keeps the audit trail intact:

- disable the application attempt entrypoint
- preserve durable proposal record evidence
- quarantine invalid or failed application attempts
- restore the pre-application state shape when needed
- prove aggregate verification after rollback

`quarantineProposalApplicationAttempt` changes only the local attempt status to `quarantined`.

## Focused Smoke

```bash
node scripts/smoke-proposal-application-attempt-creation.mjs
```

The smoke proves approval-required creation, existing-record validation, evidence-required
validation, duplicate blocking, forced-false authority flags, and rollback quarantine.

## Verification

```bash
node scripts/smoke-proposal-application-attempt-creation.mjs
node scripts/vnext-proposal-application-implementation-status.mjs
node scripts/verification_status.mjs
```

## Still Blocked

These authorities remain blocked after this implementation:

- proposal generation
- provider calls
- memory persistence
- source mutation
- commit
- push

Proposal source mutation remains a separate authority decision and is not opened by this slice.
