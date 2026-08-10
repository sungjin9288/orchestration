# AI Company Reviewed Mission Context Attachment Implementation Decision Handoff

## Purpose

This handoff turns the planning boundary in
`docs/153_ai-company-reviewed-mission-context-attachment-plan.md` into one complete operator decision.
It authorizes nothing by itself.

## Current Gate

- Planning-only decision: accepted as `DEC-225`
- Implementation handoff: recorded as `DEC-226`
- Current runtime: schema v28 with response/browser-memory-only DEC-130 context preview
- Implementation decision: reserved for exact `DEC-227`
- Context consumption or injection: separately blocked after attachment persistence

## Required Fields

```text
decisionId
decisionStatus
targetAuthority
targetSurface
implementationPlanRefs
runtimePath
compatibilityPlanRefs
migrationPlanRefs
sourceEvidenceRefs
negativeEvidenceRefs
rollbackRefs
focusedSmokeRefs
aggregateVerificationRef
stillBlockedAuthorities
approvalStatement
```

Every field must appear exactly once. Generic approval, partial copy, renamed field, omitted source,
or wording that combines attachment with context use is non-authorizing.

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-reviewed-mission-context-attachment-implementation-001
decisionStatus=approve-ai-company-reviewed-mission-context-attachment-implementation-slice
targetAuthority=one deterministic local schema-v29 immutable MissionContextAttachment from one exact source-current DEC-130 MissionMemoryContextPreview and separate operator attachment review
targetSurface=src/runtime/contracts.js, src/runtime/file-store.js, src/runtime/assertions.js, src/runtime/mission-context-attachments.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-reviewed-mission-context-attachment.mjs, scripts/smoke-ui-slice-716.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/153_ai-company-reviewed-mission-context-attachment-plan.md
runtimePath=require one exact current unexpired recorded MemoryRecall and immutable stored MemoryItem plus one exact same-project draft unlinked Mission bounded contextSpec evaluatedAt exact DEC-130 source preview id and digest and separate attachmentReview decision=attach, recompute DEC-130 from current state before any write, atomically migrate valid schema-v28 state and append one immutable MissionContextAttachment while leaving Mission and every source record unchanged, expose one exact Mission-bound inspection result, and stop before role prompt policy Council ExecutionPlan or WorkOrder context consumption or injection
compatibilityPlanRefs=preserve DEC-121 MemoryItem DEC-127 MemoryRecall DEC-130 response-only MissionMemoryContextPreview DEC-224 QA safe-checkpoint resume Mission lifecycle Council WorkOrder checkpoint delivery learning Growth provider commit and release behavior, preserve generic snapshot exclusion, and create no approval inbox run artifact provider attempt source mutation or automatic selection
migrationPlanRefs=add schemaVersion 29 missionContextAttachment sequence and missionContextAttachments map only, preserve every valid schema-v28 value, create no attachment during migration boot read GET render preview or invalid input, validate and recompute the full source tuple and review before one atomic migration-plus-append save, permit at most one attachment per target Mission, resolve exact replay without sequence increment or save, reject future partial duplicate divergent or semantically invalid v29 state, and retain valid v29 evidence during rollback without downgrade deletion Mission rewrite or implicit activation
sourceEvidenceRefs=DEC-121, DEC-127, DEC-130, DEC-163, DEC-224, DEC-225, DEC-226, docs/86_ai-company-mission-memory-context-preview-plan.md, docs/87_ai-company-mission-memory-context-preview-implementation-decision-handoff.md, docs/113_ai-company-multi-agent-completion-plan.md, docs/153_ai-company-reviewed-mission-context-attachment-plan.md, src/runtime/memory-items.js, src/runtime/memory-recalls.js, src/runtime/mission-memory-context-preview.js, src/runtime/runtime-service.js
negativeEvidenceRefs=current schema v28 has no MissionContextAttachment sequence map contract record digest attach method POST route Mission-bound exact GET durable UI evidence or focused persistence smoke, DEC-130 preview is response and browser-memory only, Mission records have no context attachment field, and no Strategist planner Council ExecutionPlan WorkOrder prompt or policy consumption authority exists
rollbackRefs=disable attachment creation and UI action, stop new records, preserve valid schema-v29 attachments and every source record, keep exact Mission-bound inspection available, perform no downgrade deletion Mission rewrite source cleanup replacement supersession or implicit consumption, and rerun migration focused compatibility UI QA README inventory and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-reviewed-mission-context-attachment.mjs proving atomic v28-to-v29 migration no passive creation exact ten-key request current DEC-130 recomputation exact Mission recall item preview and digest binding separate review timestamp and expiry rules one-per-Mission uniqueness canonical immutable record exact replay without save stale and divergent no-write refusal exact Mission-bound inspection reload rollback source byte equivalence generic snapshot exclusion no context use or downstream effect and DEC-121 DEC-127 DEC-130 DEC-224 compatibility; scripts/smoke-ui-slice-716.mjs proving exact browser preview gating acknowledgement rationale reviewedAt requirements durable read-only rendering refresh hydration safe stale malformed and content-type failures absent consumption injection apply recommend replace delete provider source Git release schedule or next-Mission controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=Strategist planner Council ExecutionPlan WorkOrder prompt or policy context consumption or injection, memory application, automatic MemoryItem MemoryRecall attachment or Mission enumeration search ranking scoring recommendation or selection, attachment revision replacement supersession deletion expiry mutation list history or cross-workspace use, provider-assisted context generation, raw transcript artifact-body source-content provider-payload environment credential or secret ingestion, source mutation, runtime-agent commit push or release, automatic retry rework parallel dynamic autonomous or background scheduling, next-Mission creation, profile or policy mutation, approval bypass, collections, and external connectors
approvalStatement=I approve implementation only for one exact schema-v29 immutable reviewed MissionContextAttachment described in docs/153_ai-company-reviewed-mission-context-attachment-plan.md. This permits record and exact inspection only. It does not approve role prompt policy Council plan or WorkOrder context consumption or injection memory application automatic retrieval search ranking recommendation provider source Git release scheduling next-Mission policy collections bypass or connectors.
```

## Other Valid Outcomes

Use the same fields and source refs with one of these statuses:

- `request-ai-company-reviewed-mission-context-attachment-implementation-evidence`
- `reject-ai-company-reviewed-mission-context-attachment-implementation`
- `defer-ai-company-reviewed-mission-context-attachment-implementation`

An evidence request must name the missing proof. Rejection or deferral preserves schema v28 and the
DEC-130 response-only preview. None authorizes implementation.

## Invalid Shortcuts

These do not authorize implementation:

- `approval`, `approve all fields`, or `continue` without the complete packet;
- an approval that omits exact preview recomputation or separate attachment review;
- an approval that mutates the Mission or adds an attachment id to it;
- an approval that enables Strategist/planner use, prompt injection, recommendation, or application;
- an approval that adds list/search/ranking, multiple attachments, replacement, or deletion;
- an approval that changes provider, source, Git, release, scheduling, policy, collection, or connector
  authority.

## Accepted Outcome

The operator supplied the complete value-matching block under **Valid Approval Outcome** and it is
accepted as `DEC-227`. Schema-v29 record-and-inspect implementation is complete; this handoff grants
no Strategist/planner consumption, Mission or prompt injection, automatic retrieval, provider,
source/Git/release, scheduling, next-Mission, policy, collection, bypass, or connector authority.
