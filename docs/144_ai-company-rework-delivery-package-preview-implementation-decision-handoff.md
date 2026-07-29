# AI Company Rework DeliveryPackage Preview Implementation Decision Handoff

## Purpose

This document is the complete fielded decision shape for the planning-only
Stage 5I boundary in
`docs/143_ai-company-rework-delivery-package-preview-plan.md`. `DEC-210`
authorizes planning only, and `DEC-211` records this handoff.

This handoff creates no runtime, API, UI, schema, package, Mission, task,
source, provider, Git, release, memory, scheduling, policy, bypass, or connector
authority. Implementation may begin only after one exact complete matching
decision is supplied and accepted as `DEC-212`.

## Required Decision Fields

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

Every field must be present exactly once.

## Valid Approval Outcome

```text
decisionId=operator-decision-ai-company-rework-delivery-package-preview-implementation-001
decisionStatus=approve-ai-company-rework-delivery-package-preview-implementation-slice
targetAuthority=one deterministic schema-v24-preserving response-only ReworkDeliveryPackagePreview from one operator-selected exact source-current completed DEC-209 rework QA execution and terminal DELIVERY_READY checkpoint
targetSurface=src/runtime/rework-delivery-package-preview.js, src/runtime/runtime-service.js, scripts/serve-ui-slice-01.mjs, ui/council-signals.js, ui/app.js, ui/styles.css, scripts/smoke-ai-company-rework-delivery-package-preview.mjs, scripts/smoke-ui-slice-711.mjs, scripts/verification_status.mjs, scripts/ui_qa_status.mjs
implementationPlanRefs=docs/143_ai-company-rework-delivery-package-preview-plan.md
runtimePath=require one exact ReworkPlan route plus the exact nine-key GET query qaWorkOrderAttemptId qaWorkOrderAttemptRecordDigest qaRunId qaEvidenceArtifactId deliveryReadyCheckpointId checkpointDigest sourceDigest qaInputDigest and evaluatedAt, reject missing extra repeated blank malformed oversized or noncanonical input before runtime dispatch, load current schema-v24 state without migration or save, validate source-current accepted ReworkPlan and ReworkPlanAcceptance immutable BuilderReworkDispatch approved DEC-200 mutation Approval DEC-203 Builder mutation attempt #3 Run Artifact records and bounded exact raw bytes DEC-206 Reviewer attempt #2 passed Run review Artifact record and bounded exact raw bytes DEC-209 QA attempt #1 completed Run qa-evidence Artifact record and bounded exact raw bytes exact QA_READY and terminal DELIVERY_READY checkpoint lineage current post-mutation target bytes accepted StaffingPlan StaffingEntry CouncilSession CompanyBlueprint role sources local-stub provider non-terminal Mission open control task fixed completed Builder Reviewer QA graph no active attempt unresolved blocker package acceptance or close-out record, derive canonical mutation reviewer QA and rework delivery evidence digests plus deterministic artifact refs role results verification summary risks blocked actions preview digest and id with generatedAt fixed to the immutable DEC-209 QA Artifact createdAt, return one deeply frozen persisted=false status=rework-delivery-preview-ready result through one bounded GET response and browser memory, keep every authoritySummary flag false, and stop before generic preview durable DeliveryPackage persistence acceptance rejection changes-requested Mission or task close-out retry recovery provider source Git release memory learning scheduling policy bypass or connectors
compatibilityPlanRefs=keep DEC-094 generic reviewed-delivery preview DEC-100 durable DeliveryPackage DEC-103 package acceptance DEC-106 Mission close-out DEC-188 Reviewer rework preview DEC-191 ReworkPlan DEC-194 ReworkPlanAcceptance DEC-197 Builder rework preflight DEC-200 mutation Approval DEC-203 source mutation DEC-206 Reviewer re-execution DEC-209 rework QA standalone task Council specialist memory Growth commit and release behavior unchanged, keep generic preview persistence acceptance and close-out functions ineligible for rework evidence, preserve generic snapshot exclusions, and clear only browser-memory rework preview state on refresh selection input source change or failed recomputation
migrationPlanRefs=keep STATE_SCHEMA_VERSION=24 and do not edit createEmptyState file-store normalization migrations sequences maps ExecutionPlan WorkOrder WorkOrderAttempt Run Artifact WorkflowCheckpoint DeliveryPackage DeliveryPackageAcceptance MissionCloseOut or generic snapshot contracts; create no durable record during boot read render GET invalid input or valid preview
sourceEvidenceRefs=DEC-076, DEC-088, DEC-091, DEC-094, DEC-163, DEC-169, DEC-172, DEC-188, DEC-191, DEC-194, DEC-197, DEC-200, DEC-203, DEC-206, DEC-209, DEC-210, DEC-211, docs/113_ai-company-multi-agent-completion-plan.md, docs/137_ai-company-builder-rework-source-mutation-plan.md, docs/139_ai-company-reviewer-reexecution-plan.md, docs/141_ai-company-rework-qa-execution-plan.md, docs/143_ai-company-rework-delivery-package-preview-plan.md, src/runtime/delivery-packages.js, src/runtime/rework-qa-execution.js, src/runtime/runtime-service.js, src/runtime/file-store.js, scripts/serve-ui-slice-01.mjs, ui/app.js
negativeEvidenceRefs=current generic buildExecutionPlanDeliveryPreviewFromState validates the original plan and terminal Builder live-mutation approval plus generic Reviewer and QA evidence, omits DEC-203 mutation DEC-206 Reviewer attempt #2 DEC-209 QA attempt #1 raw Artifact bytes rework evidence digests and rework checkpoint lineage, declares durable persistence allowed, and is connected to existing persistence acceptance and close-out controls that exceed this response-only authority; no dedicated module exact route browser-memory result focused runtime smoke or UI smoke exists
rollbackRefs=disable and remove only the dedicated rework preview runtime method exact GET route UI action and browser-memory result, preserve schema-v24 state project source and every durable source record without migration downgrade deletion rewrite inferred package creation or close-out, keep exact DEC-209 inspection and every generic delivery path unchanged, and rerun focused compatibility README inventory UI QA and aggregate verification
focusedSmokeRefs=scripts/smoke-ai-company-rework-delivery-package-preview.mjs proving exact nine-key transport canonical timestamp bounds complete DEC-203 DEC-206 DEC-209 raw-byte digest source checkpoint attempt Run Artifact WorkOrder graph and current-file lineage including QA JSON result evidence plus separately validated durable refs, deterministic deeply frozen preview schema-v24 and state-byte preservation, one terminal rework fixture directly calling and rejecting generic preview persistence acceptance and close-out entrypoints, safe malformed stale failed interrupted drifted symlinked oversized provider-backed and downstream-record refusal, no durable package or downstream mutation, and prior delivery plus rework compatibility; scripts/smoke-ui-slice-711.mjs proving exact ready response browser-memory-only rendering refresh selection input source and failed-recompute clearing bounded safe errors absent persistence acceptance close-out retry recovery provider source Git release memory scheduling policy bypass and connector controls and desktop mobile fit
aggregateVerificationRef=node scripts/verification_status.mjs
stillBlockedAuthorities=schema migration durable DeliveryPackage creation persistence acceptance rejection changes-requested supersession deletion or generic-path promotion Mission or task close-out or done another QA attempt retry recovery resume cancellation quarantine replacement inferred settlement provider-backed execution source mutation runtime-agent commit push or release memory or learning application next-Mission automatic parallel dynamic background scheduling profile or policy mutation approval bypass and external connectors
approvalStatement=I approve implementation only for one exact schema-v24-preserving response-only ReworkDeliveryPackagePreview described in docs/143_ai-company-rework-delivery-package-preview-plan.md. This permits one deterministic no-write projection and browser-memory rendering only. It does not approve a durable DeliveryPackage, package decision, Mission or task close-out, retry, recovery, provider or source execution, Git or release, memory or learning application, scheduling, policy mutation, approval bypass, or connectors.
```

## Valid Non-Approval Outcomes

`request-more-evidence`, `reject-implementation`, and `defer-implementation`
must supply all fifteen fields, identify this exact response-only Stage 5I
boundary, authorize no implementation, and preserve every DEC-209 record and
source byte unchanged.

## Invalid Shortcuts

- `approval`, `approve all`, `continue`, delegated self-approval, or `go ahead`;
- any decision missing, renaming, or widening a required field;
- widening `buildExecutionPlanDeliveryPreviewFromState()` so rework evidence
  reaches generic persistence or acceptance;
- accepting caller-supplied source bytes, Artifact bodies, paths, commands,
  package content, role, attempt number, or downstream action;
- editing schema, file-store normalization, durable package contracts, provider
  adapters, source, Git, release, memory, policy, or connectors;
- adding durable package, acceptance, close-out, retry, recovery, or scheduling
  controls to the same slice.

## Acceptance Rule

Planning may close under `DEC-210` and `DEC-211`. Runtime/API/UI implementation
must not begin until one complete decision matches every value above and is
accepted as `DEC-212`.
