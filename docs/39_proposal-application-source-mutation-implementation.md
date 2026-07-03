# Proposal Application Source Mutation Implementation

## Purpose

This document records the implemented source mutation path for exactly one accepted proposal
application source mutation plan, applied against an existing approved audit-only proposal
application attempt.

It is not proposal generation, provider execution, memory persistence, source mutation outside
the named path, commit, or push authority.

## Accepted Operator Decision

| Field | Accepted value |
| --- | --- |
| `decisionId` | `operator-decision-vnext-proposal-source-mutation-implementation-001` |
| `decisionStatus` | `approve-source-mutation-implementation-slice` |
| `targetAuthority` | proposal application source mutation implementation for exactly one accepted mutation plan |
| `targetSurface` | `src/runtime/runtime-service.js` single approved apply path, `src/runtime/contracts.js` constants, `src/runtime/proposal-records.js` pure validation helpers, `src/runtime/file-store.js` load-time hardening, `scripts/smoke-proposal-application-source-mutation.mjs`, `scripts/vnext-proposal-application-source-mutation-implementation-status.mjs`, `scripts/verification_status.mjs` registration, `docs/39_proposal-application-source-mutation-implementation.md`, tasks ledger |
| `mutationPlanRefs` | `DEC-065`, `docs/38_proposal-application-source-mutation-planning-plan.md` |
| `applicationAttemptRefs` | approved audit-only `proposalApplicationAttempts` path (`proposal-application-attempt-0001` shape) |
| `sourceEvidenceRefs` | `DEC-057`, `DEC-058`, `DEC-059`, `DEC-060`, `DEC-061`, `DEC-062`, `DEC-063`, `DEC-064`, `DEC-065` |
| `negativeEvidenceRefs` | proposal generation remains blocked, provider calls remain blocked, memory persistence remains blocked, source mutation outside the named path remains blocked, commit and push remain blocked |
| `rollbackRefs` | docs/38 rollback plan; `rollbackProposalSourceMutation` restores recorded `beforeContent`; `quarantineProposalSourceMutation` isolates failed mutations |
| `focusedSmokeRefs` | `scripts/smoke-proposal-application-source-mutation.mjs` |
| `aggregateVerificationRef` | `node scripts/verification_status.mjs` |
| `stillBlockedAuthorities` | proposal generation, provider calls, memory persistence, source mutation outside the named path, commit, push |
| `approvalStatement` | I approve implementation only for the source mutation slice described in DEC-065 and docs/38_proposal-application-source-mutation-planning-plan.md. This does not approve proposal generation, provider calls, memory persistence, source mutation outside the named path, commit, or push. |

## Implementation Approval

Implementation approval: accepted.

The approval is limited to exactly one approved apply path, tied to one existing durable proposal
record and one existing approved audit-only proposal application attempt. Proposal generation,
provider calls, memory persistence, source mutation outside the named path, commit, and push
remain blocked.

## Implemented Contract

Runtime implementation: completed.

`applyProposalSourceMutation(input = {})` in `src/runtime/runtime-service.js` applies exactly one
mutation for one named target file per proposal application attempt:

- **Approval separation** — `sourceMutationApproval` must be a distinct decision from both the
  proposal record's creation approval and the application attempt's application approval.
  `sourceMutationApprovalRefs` must include `sourceMutationApproval.decisionId`. The approval's
  `decisionStatus` must equal `approve-source-mutation-implementation-slice`, its `targetAuthority`
  must match the accepted authority string, and its `approvalStatement` must contain
  `approve implementation only` plus an explicit `does not approve ... <authority>` clause for
  each still-blocked authority (proposal generation, provider calls, memory persistence, source
  mutation outside the named path, commit, push).
- **Exactly one target** — `normalizeProposalSourceMutationTarget` rejects anything that is not a
  single plain object naming one `relativePath`, requires `expectedBeforeContent` and non-empty
  `afterContent` that differ from each other, and rejects any `relativePath` that escapes the
  project root (leading `/`, `..`, `../`, or `/../` segments).
- **Affected-files gate** — `mutation.relativePath` must already be listed in
  `proposalRecord.affectedFiles`; otherwise `applyProposalSourceMutation` throws
  `mutation.relativePath must be listed in proposalRecord.affectedFiles`.
- **Clean baseline proof** — `normalizeCleanBaselineProof` requires `cleanBaselineProof.statusOutput`
  to be an empty string (a clean `git status --porcelain` capture) and a valid `capturedAt`
  timestamp.
- **Dry-run diff preview** — `normalizeDryRunDiffPreview` requires `dryRunDiffPreview.diffText` to
  reference the target `relativePath` and a valid `previewedAt` timestamp.
- **Expected-before-content match** — the runtime reads the current target file content and
  requires it to equal `mutation.expectedBeforeContent` exactly before writing; otherwise it throws
  `mutation.expectedBeforeContent must match the current target content`.
- **One mutation per attempt** — `assertProposalApplicationAttemptCanAuthorizeSourceMutation`
  rejects an attempt whose `sourceMutationIds` is already non-empty with `proposalApplicationAttempt
  already authorized one source mutation`, and requires the attempt to reference the same
  `proposalId`, be in `planned` status, and the linked proposal record to still be
  `created`, non-expired, and `applyAllowed === false`.
- **Apply** — on success the runtime writes `mutation.afterContent` to the resolved target path,
  creates one `proposalSourceMutations` entry with `status: 'applied'`, records
  `beforeContent`/`afterContent`, evidence refs, rollback refs, focused smoke refs, and
  `blockedActions`, links the mutation id back onto the application attempt's
  `sourceMutationIds`, and re-asserts `proposalRecord.applyAllowed = false`.
- **Rollback** — `rollbackProposalSourceMutation(input = {})` requires the mutation to be in
  `applied` status, requires the current target file content to still equal the recorded
  `afterContent` (`rollback requires the applied content to still be present`), writes back the
  recorded `beforeContent`, and moves status to `rolled-back`. Rolling back a second time throws
  `proposalSourceMutation.status must be applied`.
- **Quarantine** — `quarantineProposalSourceMutation(input = {})` moves a mutation to `quarantined`
  status from any prior status and forces every authority flag back to `false`.
- **Read paths** — `getProposalSourceMutation` and `listProposalSourceMutations` provide read-only
  lookup and filtering by `proposalId`/`status` without mutating state.

## Boundaries

The following authorities stay blocked after this slice, matching DEC-057 through DEC-065
evidence:

- **Proposal generation** — no code path in this slice creates a proposal record or proposal
  content.
- **Provider calls** — no code path in this slice calls an LLM provider or external API.
- **Memory persistence** — no code path in this slice writes to any memory or knowledge store.
- **Source mutation outside the named path** — `applyProposalSourceMutation` writes only to the
  single `mutation.relativePath` named in the call, gated by the affected-files check and the
  project-path containment check in `resolveProposalSourceMutationTargetPath`.
- **Commit** — no git commit is issued by this slice.
- **Push** — no git push is issued by this slice.

Every persisted `proposalSourceMutations` entry forces `proposalGenerationAllowed`,
`providerCallsAllowed`, `memoryPersistenceAllowed`, `sourceMutationOutsideNamedPathAllowed`,
`commitAllowed`, and `pushAllowed` to `false`, both at write time in `runtime-service.js` and again
at load time in `file-store.js`'s `normalizeState`, so a hand-edited `state.json` cannot flip
these flags back on across a reload. The linked `proposalRecord.applyAllowed` also stays `false`
after a mutation is applied, preserving the DEC-057/DEC-062 posture that a durable proposal record
never grants blanket application authority on its own.

## Focused Smoke

```bash
node scripts/smoke-proposal-application-source-mutation.mjs
```

The smoke proves: approval-separation rejections (missing approval, wrong `decisionStatus`,
missing `sourceMutationApprovalRefs` entry, reused application-approval decision id); target
rejections (multi-target input, path escape, unlisted `relativePath`, no-op `afterContent`, stale
`expectedBeforeContent`); evidence rejections (dirty `cleanBaselineProof.statusOutput`, missing
clean baseline proof, missing or non-matching `dryRunDiffPreview`, empty `rollbackRefs` /
`focusedSmokeRefs`); attempt-linkage rejection (unknown `applicationAttemptId`); that the target
file is untouched by every rejected call; one successful apply that writes `afterContent` and
forces every authority flag false; that a second mutation on the same attempt is rejected; that
the persisted state and a freshly reloaded runtime both keep authority flags false; rollback that
restores `beforeContent` and rejects a second rollback; and quarantine that keeps authority flags
false and shows up in `listProposalSourceMutations`.

## Verification

```bash
node scripts/smoke-proposal-application-source-mutation.mjs
node scripts/vnext-proposal-application-source-mutation-implementation-status.mjs
node scripts/verification_status.mjs
```

## Still Blocked

These authorities remain blocked after this implementation:

- proposal generation
- provider calls
- memory persistence
- source mutation outside the named path
- commit
- push

## Stop Conditions

Stop and escalate to a new operator decision before proceeding if any of the following occur:

- a second source mutation is attempted against the same application attempt
- a mutation targets a `relativePath` not present in `proposalRecord.affectedFiles`
- `cleanBaselineProof.statusOutput` is non-empty at call time
- the target file's current content does not match `mutation.expectedBeforeContent`
- rollback is attempted after the applied content has already changed underneath it
- any authority flag (`proposalGenerationAllowed`, `providerCallsAllowed`,
  `memoryPersistenceAllowed`, `sourceMutationOutsideNamedPathAllowed`, `commitAllowed`,
  `pushAllowed`) is observed as anything other than `false` on a persisted or reloaded
  `proposalSourceMutations` entry
