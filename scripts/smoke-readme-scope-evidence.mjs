import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const readmePath = path.join(repoRoot, 'README.md');
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const harnessExecutionTokensPath = path.join(repoRoot, 'ui', 'harness-execution-tokens.js');
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');
const growthConfigPath = path.join(repoRoot, 'ui', 'growth-config.js');
const growthLearningPath = path.join(repoRoot, 'ui', 'growth-learning.js');
const growthPanelsPath = path.join(repoRoot, 'ui', 'growth-panels.js');
const personalizationSnapshotPath = path.join(repoRoot, 'ui', 'personalization-snapshot.js');
const preferenceConfigPath = path.join(repoRoot, 'ui', 'preference-config.js');
const referenceAuditPath = path.join(repoRoot, 'docs', 'reference', 'vnext-reference-driven-ui-audit.md');
const contractsPath = path.join(repoRoot, 'src', 'runtime', 'contracts.js');
const knowledgeWorkPackPath = path.join(repoRoot, 'packs', 'knowledge-work', 'pack.md');
const masterBriefPath = path.join(repoRoot, 'docs', '00_master-brief.md');
const decisionLogPath = path.join(repoRoot, 'docs', '01_decision-log.md');
const architectureRoadmapPath = path.join(repoRoot, 'docs', '03_architecture-roadmap-v1.md');
const agentsPath = path.join(repoRoot, 'AGENTS.md');

const readme = fs.readFileSync(readmePath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const harnessExecutionTokens = fs.readFileSync(harnessExecutionTokensPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');
const growthConfig = fs.readFileSync(growthConfigPath, 'utf8');
const growthLearning = fs.readFileSync(growthLearningPath, 'utf8');
const growthPanels = fs.readFileSync(growthPanelsPath, 'utf8');
const personalizationSnapshot = fs.readFileSync(personalizationSnapshotPath, 'utf8');
const preferenceConfig = fs.readFileSync(preferenceConfigPath, 'utf8');
const referenceAudit = fs.readFileSync(referenceAuditPath, 'utf8');
const contracts = fs.readFileSync(contractsPath, 'utf8');
const knowledgeWorkPack = fs.readFileSync(knowledgeWorkPackPath, 'utf8');
const masterBrief = fs.readFileSync(masterBriefPath, 'utf8');
const decisionLog = fs.readFileSync(decisionLogPath, 'utf8');
const architectureRoadmap = fs.readFileSync(architectureRoadmapPath, 'utf8');
const agents = fs.readFileSync(agentsPath, 'utf8');

function countScripts(predicate) {
  return fs.readdirSync(path.join(repoRoot, 'scripts')).filter(predicate).length;
}

function assertReadmeHas(pattern) {
  assert.match(readme, pattern);
}

function assertTextHasAll(text, patterns) {
  for (const pattern of patterns) {
    assert.match(text, pattern);
  }
}

function assertTextDoesNotHaveAll(text, patterns) {
  for (const pattern of patterns) {
    assert.doesNotMatch(text, pattern);
  }
}

function assertReadmeHasAll(patterns) {
  assertTextHasAll(readme, patterns);
}

function assertReadmeDoesNotHaveAll(patterns) {
  assertTextDoesNotHaveAll(readme, patterns);
}

function assertReadmeHasRoutes(routes) {
  for (const route of routes) {
    assert.ok(readme.includes(route), `README route missing: ${route}`);
  }
}

const smokeFileCount = countScripts((name) => /^smoke-.*\.mjs$/.test(name));
const qaSliceFileCount = countScripts((name) => /qa-slice.*\.mjs$/.test(name));
const uiSmokeFileCount = countScripts((name) => /^smoke-ui-slice-.*\.mjs$/.test(name));

const requiredSections = [
  '# Orchestration 1.0',
  '## Why I Built This',
  '## Product Planning',
  '## Current Development Focus',
  '## Features',
  '## Tech Stack',
  '## Architecture',
  '## Key Design Decisions',
  '## Getting Started',
  '## API / Usage',
  '## Testing',
  '## Scope & Limitations',
  '## Links',
];

let previousIndex = -1;
for (const section of requiredSections) {
  const index = readme.indexOf(section);
  assert.ok(index > previousIndex, `README section missing or out of order: ${section}`);
  previousIndex = index;
}

const readmePositioningEvidence = [
  /PoC \/ MVP-quality local project/,
  /local-first AI work operating system/,
  /Mission \/ Council \/ Execution \/ Deliverables/,
  /Taskboard \/ Logs \/ Artifacts \/ Decision Inbox/,
  /Planning source files:/,
  /docs\/06_ai-orchestration-pivot\.md/,
  /packs\/development\/pack\.md/,
  /minimal root `package\.json` is present for reviewer convenience/,
  /root `\.env\.example` lists the optional live-provider variables/,
  /No public hosted demo URL is verified/,
  /no verified hosted public demo URL/,
  /Current-head local API evidence was rechecked on 2026-06-23/,
  /"plannerArtifactId": "artifact-0001"/,
  /Reference-driven operator shell/,
  /Read-only growth evidence/,
  /Local-only personalization/,
  /Advanced Ops harness evidence/,
];

const advancedOpsHarnessEvidence = [
  /run action markup/,
  /run action shelf markup/,
  /operator action token label\/tone markup/,
  /visible result packet markup/,
  /visible header markup/,
  /visible token row markup/,
  /visible preview markup/,
  /visible preview action markup/,
  /visible input path action markup/,
  /visible action shelf markup/,
  /visible action shelf frame markup/,
  /visible summary rack markup/,
  /visible execution summary markup/,
  /visible supplemental summary markup/,
  /hidden preview markup/,
  /hidden preview action markup/,
  /hidden input path action markup/,
  /hidden action shelf markup/,
  /hidden action shelf frame markup/,
  /hidden result packet markup/,
  /hidden header markup/,
  /hidden context sections markup/,
  /hidden context title row markup/,
  /hidden run context summary markup/,
  /hidden harness context summary markup/,
  /hidden operator context summary markup/,
  /visible token label\/tone markup/,
  /latest state token label\/tone markup/,
  /hidden state token-specific label\/tone markup/,
  /history header markup/,
  /history count token label\/tone markup/,
  /output path copy/,
  /history input path copy/,
  /history path reuse\/rerun action markup/,
  /history preview action markup/,
  /history action shelf markup/,
  /history action shelf frame markup/,
  /history summary rack markup/,
  /history summary rack frame markup/,
  /history item register markup/,
  /history item packet markup/,
  /history restore preview/,
  /execution packet copy/,
  /output-brief copy/,
  /policy-report copy/,
  /hidden status summary fallback handoff/,
];

const advancedOpsHarnessSmokeEvidence = [
  /node scripts\/smoke-ui-slice-305\.mjs/,
  /node scripts\/smoke-ui-slice-306\.mjs/,
  /node scripts\/smoke-ui-slice-310\.mjs/,
  /node scripts\/smoke-ui-slice-329\.mjs/,
  /node scripts\/smoke-ui-slice-331\.mjs/,
  /`361`/,
  /node scripts\/smoke-ui-slice-375\.mjs/,
  /node scripts\/smoke-ui-slice-381\.mjs/,
];

const advancedOpsHarnessHandoffEvidence = [
  /run action shelf markup handoff/,
  /operator action token label\/tone markup handoff/,
  /visible token label\/tone markup handoff/,
  /visible header markup handoff/,
  /visible token row markup handoff/,
  /latest state token label\/tone markup handoff/,
  /hidden\s+state token-specific label\/tone markup handoff/,
  /visible preview markup handoff/,
  /visible preview action markup handoff/,
  /visible input path action markup handoff/,
  /visible summary rack markup handoff/,
  /visible execution summary markup handoff/,
  /visible supplemental summary markup handoff/,
  /hidden preview action markup handoff/,
  /hidden input path action markup handoff/,
  /hidden header markup handoff/,
  /hidden context sections markup handoff/,
  /hidden context title row markup handoff/,
  /hidden run context summary markup handoff/,
  /hidden harness context summary markup handoff/,
  /hidden operator context summary markup handoff/,
  /history header markup handoff/,
  /history count token label\/tone markup handoff/,
  /history input path copy markup handoff/,
  /history path reuse\/rerun action markup handoff/,
  /history preview action markup handoff/,
  /history action shelf markup handoff/,
  /history action shelf frame markup handoff/,
  /history summary rack markup handoff/,
  /history summary rack frame markup handoff/,
  /history item register markup handoff/,
  /history item packet markup handoff/,
  /visible result packet markup handoff/,
  /execution\s+packet copy fallback formatting/,
  /execution packet copy markup handoff/,
  /hidden action markup handoff/,
  /hidden action shelf markup handoff/,
  /hidden action shelf frame markup handoff/,
  /hidden result packet markup handoff/,
  /visible action shelf markup handoff/,
  /visible action shelf frame markup handoff/,
  /visible hide action markup handoff/,
  /output path copy label\/status handoff/,
  /output-brief copy labels\/payload titles/,
  /policy-report copy fallback\s+formatting/,
  /completion status/,
  /`ui\/harness-labels\.js`/,
];

assertReadmeHasAll(readmePositioningEvidence);
assertReadmeHasAll(advancedOpsHarnessEvidence);
assertReadmeHasAll(advancedOpsHarnessSmokeEvidence);
assertReadmeHasAll(advancedOpsHarnessHandoffEvidence);

const completionFocusEvidence = [
  /Phase 2 Real Council implementation is accepted by `DEC-082`/,
  /opt-in `real-local-stub`\s+path records isolated Strategist, Architect, and Decomposer positions/,
  /Existing deterministic draft\/approve routes remain\s+available as compatibility behavior/,
  /Live providers, standalone StaffingPlan, WorkOrders, memory\s+persistence expansion, autonomous scheduling, source\/profile mutation, approval bypass, and\s+runtime-agent commit\/push\/release remain blocked/,
  /Phase 3 Council live-provider implementation is accepted by `DEC-085`/,
  /One explicit\s+`real-openai-responses` mode reuses the normalized position and synthesis contract/,
  /Phase 4 Mission compiler planning and its fielded gate are recorded by `DEC-086` and `DEC-087`/,
  /exact response-only implementation is accepted by `DEC-088`/,
  /docs\/58_ai-company-mission-workorder-compiler-implementation-plan\.md/,
  /docs\/59_ai-company-mission-workorder-compiler-implementation-decision-handoff\.md/,
  /fixed Builder -> Reviewer -> QA draft graph/,
  /The preview itself remains response-only/,
  /Phase 5 WorkOrder persistence and sequential execution planning is accepted by `DEC-089`/,
  /implementation decision handoff is recorded by `DEC-090`/,
  /exact fielded implementation is\s+accepted by `DEC-091`/,
  /Valid v6 state now migrates\s+additively to schema v7/,
  /Reviewer\/QA execution, source mutation, broader scheduling, provider-backed\s+WorkOrders, commit, push, release, and connectors remain blocked/,
  /Phase 6 reviewed-delivery continuation planning is accepted by `DEC-092`/,
  /implementation\s+decision handoff is recorded by `DEC-093`/,
  /exact fielded implementation is accepted by\s+`DEC-094`/,
  /docs\/62_ai-company-reviewed-delivery-planning-plan\.md/,
  /docs\/63_ai-company-reviewed-delivery-implementation-decision-handoff\.md/,
  /shell-free `process\.execPath --check` QA against actual\s+Builder-changed allowlisted files/,
  /deeply frozen response-only DeliveryPackage preview/,
  /Durable\s+persistence is available only through the exact package path below; Mission done, automatic rework/,
  /Phase 7 checkpoint, resume, and recovery planning is accepted by `DEC-095`/,
  /implementation\s+decision handoff is recorded by `DEC-096`/,
  /exact implementation is accepted by `DEC-097`/,
  /docs\/64_ai-company-checkpoint-resume-recovery-plan\.md/,
  /docs\/65_ai-company-checkpoint-resume-recovery-implementation-decision-handoff\.md/,
  /Only durable\s+`reviewer-ready` or `qa-ready` boundaries are resumable/,
  /Active or ambiguous Builder, Reviewer,\s+and QA stages\s+are quarantine-only/,
  /Phase 7 introduced schema v8 with an\s+additive WorkflowCheckpoint map, read-only recovery classification, and exact resume\/cancel routes/,
  /Durable DeliveryPackage persistence planning is accepted by `DEC-098`/,
  /complete fielded\s+implementation handoff is recorded by `DEC-099`/,
  /docs\/66_ai-company-durable-delivery-package-persistence-plan\.md/,
  /docs\/67_ai-company-durable-delivery-package-implementation-decision-handoff\.md/,
  /preview remains\s+`persisted=false` and `missionDone=false`/,
  /Existing read-only Loop Engineering and post-completion routing evidence remains source-backed/,
  /docs\/20_loop-engineering-concept-review\.md/,
  /scripts\/loop-readiness-status\.mjs/,
  /verifies that a proposed loop names a goal, boundary,\s+verification gate, stop condition, human return point, source-of-truth refs, and local evidence\s+posture/,
  /Proposal generation planning plan is consumed historical evidence/,
  /DEC-070/,
  /DEC-071/,
  /docs\/42_proposal-generation-planning-plan\.md/,
  /docs\/43_proposal-generation-implementation\.md/,
  /docs\/44_proposal-draft-human-review\.md/,
  /docs\/45_proposal-draft-human-review-decision-packet\.md/,
  /docs\/46_proposal-draft-human-review-evidence-decision\.md/,
  /docs\/47_proposal-draft-downstream-authority-decision-packet\.md/,
  /one deterministic local inert draft from\s+exactly one existing Growth Evidence Ledger candidate/,
  /Deterministic inert proposal draft generation is implemented/,
  /rejects incomplete or stale\s+evidence and returns an in-memory `draft-only` object with `applyAllowed=false`/,
  /does not create\s+durable records, mutate queues, apply proposals, call providers, persist memory, mutate runtime\/UI\/\s+source state, commit, or push/,
  /Pending inert proposal draft human review is implemented/,
  /`pending-human-review` packet, but records\s+no review outcome/,
  /Proposal draft human review decision\s+packet is implemented/,
  /evidence-only acceptance, an evidence request, rejection, or deferral/,
  /Proposal draft human review evidence decision is accepted/,
  /`accept-review-evidence-only`; it does not persist a runtime decision or open downstream authority/,
  /Proposal draft downstream authority decision packet is implemented/,
  /recommends planning local\s+durable proposal record creation for the reviewed inert draft/,
  /next gate is\s+`fielded proposal draft downstream authority decision required`/,
  /Mission\/task close-out planning-only authority is accepted by `DEC-104`/,
  /complete fielded\s+implementation handoff is recorded by `DEC-105`/,
  /docs\/70_ai-company-mission-task-close-out-plan\.md/,
  /docs\/71_ai-company-mission-task-close-out-implementation-decision-handoff\.md/,
  /execution state is schema v16/,
  /LearningCandidate preview planning-only authority is accepted by `DEC-107`/,
  /implementation handoff is recorded by `DEC-108`/,
  /exact response-only implementation is accepted\s+by `DEC-109`/,
  /docs\/72_ai-company-learning-candidate-preview-plan\.md/,
  /docs\/73_ai-company-learning-candidate-preview-implementation-decision-handoff\.md/,
  /schema v11 unchanged/,
  /One explicit POST returns only a deterministic deeply frozen response-only preview with\s+`persisted=false`/,
  /Durable LearningCandidate persistence planning-only authority is accepted by `DEC-110`/,
  /complete fielded implementation handoff is recorded by `DEC-111`/,
  /exact implementation is\s+accepted by `DEC-112`/,
  /docs\/74_ai-company-durable-learning-candidate-persistence-plan\.md/,
  /docs\/75_ai-company-durable-learning-candidate-implementation-decision-handoff\.md/,
  /Invalid v11 input causes no\s+migration write/,
  /LearningCandidate review outcome planning-only authority is accepted by `DEC-113`/,
  /exact implementation is accepted by\s+`DEC-115`/,
  /docs\/76_ai-company-learning-candidate-review-outcome-plan\.md/,
  /docs\/77_ai-company-learning-candidate-review-outcome-implementation-decision-handoff\.md/,
  /MemoryCandidate preview planning-only authority is accepted by `DEC-116`/,
  /complete fielded\s+implementation handoff is recorded by `DEC-117`/,
  /exact response-only implementation is accepted\s+by `DEC-118`/,
  /docs\/78_ai-company-memory-candidate-preview-plan\.md/,
  /docs\/79_ai-company-memory-candidate-preview-implementation-decision-handoff\.md/,
  /current path\s+keeps schema v13 unchanged and accepts only one exact source-current unexpired LearningCandidate/,
  /scripts\/smoke-ai-company-memory-candidate-preview\.mjs/,
  /scripts\/smoke-ui-slice-663\.mjs/,
  /Durable MemoryItem persistence planning-only authority is accepted by `DEC-119`/,
  /complete\s+fielded implementation handoff is recorded by `DEC-120`/,
  /docs\/80_ai-company-durable-memory-item-persistence-plan\.md/,
  /docs\/81_ai-company-durable-memory-item-implementation-decision-handoff\.md/,
  /`DEC-121` accepts the\s+exact schema-v14 implementation/,
  /scripts\/smoke-ai-company-durable-memory-item-planning\.mjs/,
  /scripts\/smoke-ai-company-durable-memory-item\.mjs/,
  /scripts\/smoke-ui-slice-664\.mjs/,
  /MemoryRecall preview planning-only authority is accepted by `DEC-122`/,
  /complete fielded\s+implementation handoff is recorded by `DEC-123`/,
  /exact response-only implementation is accepted by `DEC-124`/,
  /docs\/82_ai-company-memory-recall-preview-plan\.md/,
  /docs\/83_ai-company-memory-recall-preview-implementation-decision-handoff\.md/,
  /scripts\/smoke-ai-company-memory-recall-preview-planning\.mjs/,
  /scripts\/smoke-ai-company-memory-recall-preview\.mjs/,
  /scripts\/smoke-ui-slice-665\.mjs/,
  /That response-only slice preserved schema v14 and created no durable recall record/,
  /Durable MemoryRecall persistence planning-only authority is accepted by `DEC-125`/,
  /complete\s+fielded implementation handoff is recorded by `DEC-126`/,
  /exact implementation is accepted by\s+`DEC-127`/,
  /docs\/84_ai-company-durable-memory-recall-persistence-plan\.md/,
  /docs\/85_ai-company-durable-memory-recall-implementation-decision-handoff\.md/,
  /scripts\/smoke-ai-company-durable-memory-recall-planning\.mjs/,
  /scripts\/smoke-ai-company-durable-memory-recall\.mjs/,
  /scripts\/smoke-ui-slice-666\.mjs/,
  /schema-v15 runtime\s+recomputes DEC-124/,
  /Mission memory context preview planning-only authority is accepted by `DEC-128`/,
  /complete\s+fielded implementation handoff is recorded by `DEC-129`/,
  /exact implementation is accepted by\s+`DEC-130`/,
  /docs\/86_ai-company-mission-memory-context-preview-plan\.md/,
  /docs\/87_ai-company-mission-memory-context-preview-implementation-decision-handoff\.md/,
  /scripts\/smoke-ai-company-mission-memory-context-preview-planning\.mjs/,
  /scripts\/smoke-ai-company-mission-memory-context-preview\.mjs/,
  /scripts\/smoke-ui-slice-667\.mjs/,
  /Mission\/WorkOrder\/prompt\/policy injection, durable context, memory\s+application, automatic retrieval\/ranking\/recommendation/,
  /docs\/88_external-pattern-native-adoption-plan\.md/,
  /external-pattern native adoption sequence is accepted by `DEC-131` through `DEC-136`/,
  /AcceptanceCriteria under schema v16/,
  /Append-only VerificationProof attempts preserve failed and passed history/,
  /response-only bounded continuation preview/,
  /wigolo adapter is\s+disabled unless an operator enables it and supplies a repo-external executable/,
  /Context telemetry measures\s+operator-supplied JSON by UTF-8 bytes, characters, leaf fields, and exact\/gist classification/,
  /\/api\/execution-plans\/:executionPlanId\/continuation-preview/,
  /\/api\/research\/exact-fetch\/readiness/,
  /\/api\/telemetry\/context-budget-report/,
  /ORCHESTRATION_WIGOLO_EXACT_FETCH_ENABLED/,
  /DEC-131` through `DEC-133`/,
  /DEC-134` adds a response-only one-step continuation preview/,
  /DEC-135` adds one disabled-by-default exact-URL wigolo adapter/,
  /DEC-136` adds measurement-only context telemetry/,
  /docs\/22_completion-gate-inventory\.md/,
  /scripts\/smoke-completion-gate-inventory-current-evidence\.mjs/,
  /aggregate\s+registration, UI QA registration, zero-open backlog/,
  /defaultCompletionImplementationOpen=false/,
  /DEC-158 passes aggregate required `1\/1`, informational\s+`266\/266`, total `267\/267`, and UI QA required `70\/70`/,
  /Focused browser checks at 1440x1000,\s+821x900, 820x900, and 390x844 verify the default-closed Task disclosure/,
  /DEC-157 whole-shell matrix remains the evidence for natural primary labels/,
  /allowed explicit-entry posture is intentionally narrow/,
  /read-only vNext routing\/status\/doc-smoke slice first/,
  /runtime mutation, UI mutation, provider\s+calls, memory persistence, connector reach, automation, lifecycle semantic changes, commit, and push\s+remain closed/,
  /Loop readiness is intentionally read-only/,
  /does not accept\s+arguments, execute work, call providers, persist memory, schedule jobs, create commits, push, or open\s+external connectors/,
  /scripts\/smoke-loop-readiness-status\.mjs/,
  /post-completion router keeps the next safe posture at read-only status or doc-smoke work first/,
  /without opening background automation or widening the\s+default development pack/,
];

const lifecycleCloseFocusEvidence = [
  /The vNext audit still consumes the completed proposal-record lifecycle review status/,
  /growth-evidence-ledger-proposal-record-lifecycle-review-maintenance/,
  /maintenance evidence with\s+`implementationRequired=false`/,
  /does not present the completed alias as a new implementation\s+queue/,
  /reports `explicit-entry-required` for new implementation/,
  /explicit operator request, concrete regression, usability issue, or accepted vNext\s+decision/,
];

const growthFocusEvidence = [
  /The immediately preceding growth evidence focus normalized repeated/,
  /preserves the long route as `sourceCandidate`/,
  /39 lifecycle transition helper\s+calls/,
  /62\s+top-level read-only route helper calls/,
  /2\/71\/45\s+contract-finding guard\/advanced\/base routes/,
  /26\/102 aggregate\s+base\/advanced routes/,
  /4\/122\/1\s+next-candidate guard\/advanced\/base routes/,
  /129 read-only next\s+candidates/,
  /23 post-completion candidate\/finding-update rows/,
  /11\/11 post-completion copy rows/,
];

const growthSourceEvidence = [
  /Completion gate inventory:/,
  /registered aggregate `265` checks, UI QA `69` checks, zero-open backlog/,
  /Proposal generation decision packet:/,
  /scripts\/vnext-proposal-generation-decision-packet-status\.mjs/,
  /one deterministic local\s+draft planning target/,
  /copy-ready planning wording/,
  /Proposal generation operator decision handoff is not approval:/,
  /docs\/41_proposal-generation-operator-decision-handoff\.md/,
  /scripts\/vnext-proposal-generation-operator-decision-handoff-status\.mjs/,
  /exact fielded\s+planning response shape/,
  /without recording a decision or opening planning authority/,
  /vNext audit maintenance route:/,
  /scripts\/vnext-development-audit-status\.mjs/,
  /scripts\/growth-evidence-ledger-proposal-record-lifecycle-review-status\.mjs/,
  /completed\s+proposal-record lifecycle review alias is now maintenance evidence, not a new implementation\s+queue/,
  /New implementation requires an explicit operator request, concrete regression, usability\s+issue, or accepted vNext decision/,
  /proposal generation\/application, provider\s+calls, memory persistence, source mutation outside the approved named path, commit, and push\s+blocked/,
  /Proposal generation decision packet:/,
  /docs\/40_proposal-generation-decision-packet\.md/,
  /scripts\/vnext-proposal-generation-decision-packet-status\.mjs/,
  /one deterministic local\s+draft planning target/,
  /blocked provider\/memory\/record\/application\/source\/commit\/push\s+authority without approving planning or implementation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /current lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review-acceptance\s+recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the\s+next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review-acceptance\s+recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review-acceptance\s+recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the\s+next lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the\s+next lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the\s+next lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the\s+next lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review-acceptance\s+recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close-final-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preceding lifecycle-close-final-close status packet remains read-only/,
  /preserves\s+the next lifecycle-close recommendation/,
  /Growth lifecycle-close-finalization-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close-finalization-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-finalization-review-acceptance status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-acceptance recommendation/,
  /Growth lifecycle-close-finalization-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preceding lifecycle-close-finalization-review status packet remains read-only/,
  /preserves the next\s+lifecycle-close-finalization-review-acceptance recommendation/,
  /Growth lifecycle-close-finalization status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preceding lifecycle-close-finalization status packet remains read-only/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preceding lifecycle-close-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close-review-acceptance status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preceding lifecycle-close-review-acceptance status packet remains read-only/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close-review status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preceding lifecycle-close-review status packet remains read-only/,
  /preserves\s+the next lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status recheck:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /preceding lifecycle-close status packet remains read-only/,
  /preserves the next\s+lifecycle-close-review recommendation/,
  /Growth lifecycle-close final-close status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /preserves the next\s+lifecycle-close recommendation/,
  /Growth lifecycle-close finalization acceptance status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /preserves the next lifecycle-close-final-close recommendation/,
  /Growth lifecycle-close finalization review acceptance status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /preserves the next lifecycle-close-finalization-acceptance\s+recommendation/,
  /Growth lifecycle-close finalization review status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /preserves the next lifecycle-close-finalization-review-acceptance\s+recommendation/,
  /Growth lifecycle-close finalization status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /preserves the next lifecycle-close-finalization-review recommendation/,
  /Growth lifecycle-close acceptance status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /preserves the next lifecycle-close-finalization recommendation/,
  /Growth lifecycle-close review acceptance status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /preserves the next lifecycle-close-acceptance recommendation/,
  /Growth lifecycle-close review status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /preserves the next\s+lifecycle-close-review-acceptance recommendation/,
  /Growth lifecycle-close status:/,
  /scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /assertion grouping as evidence cleanup rather than product behavior change/,
  /Growth reflection close-out:/,
  /Growth proposal-record lifecycle review:/,
  /scripts\/growth-evidence-ledger-proposal-record-lifecycle-review-status\.mjs/,
  /scripts\/smoke-growth-evidence-ledger-proposal-record-lifecycle-review-status\.mjs/,
  /scripts\/growth-reflection-evaluator\.mjs/,
  /scripts\/smoke-growth-reflection-evaluator\.mjs/,
  /scripts\/growth-evidence-ledger-proposal-readiness-status\.mjs/,
  /aggregate score `100`/,
  /growth-evidence-ledger-proposal-record-lifecycle-review/,
  /growth-evidence-ledger-proposal-record-lifecycle-review-maintenance/,
  /sourceCandidate/,
  /old\s+nested-marker absence/,
  /Growth reflection evaluator route\/readability work is a read-only evaluation and evidence cleanup/,
];

assertReadmeHasAll(completionFocusEvidence);
assertReadmeHasAll(lifecycleCloseFocusEvidence);
assertReadmeHasAll(growthFocusEvidence);
assertReadmeHasAll(growthSourceEvidence);

const productRuntimeBoundaryEvidence = [
  /does not create durable proposal records, apply\s+proposals, call providers, persist memory, mutate project source through the product runtime/,
];

assertReadmeHasAll(productRuntimeBoundaryEvidence);

const extractionEvidence = [
  /The immediately preceding development arc concluded a behavior-preserving module extraction campaign/,
  /docs\/inspection-20260703-final\.md/,
  /src\/runtime\/task-gates\.js/,
  /ui\/artifact-structured-render\.js/,
  /ui\/availability\.js/,
  /src\/runtime\/retention-policy\.js/,
  /ui\/control-snapshots\.js/,
  /Extraction verdict and metrics:/,
  /src\/execution\/coordinator\/artifact-content\.js/,
  /src\/execution\/execution-text-utils\.js/,
  /normalizeRelativePath` path-traversal/,
  /`busy`-boolean injection so its logic is state-shape independent/,
];

const knowledgeWorkBoundaryEvidence = [
  /Opt-in knowledge-work pack/,
  /`knowledge-work` pack is explicit opt-in/,
  /does not replace the `development` pack/,
  /additional non-development packs beyond the explicit opt-in `knowledge-work`/,
];

const proposalAndMemoryBoundaryEvidence = [
  /성장 증거 원장/,
  /개선 후보 대기열/,
  /제안 검토 게이트/,
  /create\/persist durable proposal records/,
  /Proposal review is not proposal approval/,
  /DEC-048/,
  /Durable proposal record creation and persistence are implemented only/,
  /Proposal application source mutation decision packet is consumed planning evidence/,
  /docs\/36_proposal-application-source-mutation-decision-packet\.md/,
  /Proposal application source mutation operator handoff is consumed planning evidence/,
  /docs\/37_proposal-application-source-mutation-operator-decision-handoff\.md/,
  /Proposal application source mutation planning plan is planning-only evidence/,
  /docs\/38_proposal-application-source-mutation-planning-plan\.md/,
  /Long-term memory is readiness only/,
  /DEC-049/,
  /raw transcript ingestion/,
  /cross-workspace memory/,
  /skill promotion blocked/,
  /Long-term memory storage remains blocked/,
  /raw transcript exclusion/,
  /redaction, export, expiry/,
  /orchestration\.ui-preferences\.v1/,
];

const uiEvidenceCommandEvidence = [
  /node scripts\/smoke-ui-slice-311\.mjs/,
  /node scripts\/smoke-ui-slice-312\.mjs/,
  /node scripts\/smoke-ui-slice-314\.mjs/,
  /node scripts\/smoke-ui-slice-328\.mjs/,
  /node scripts\/smoke-ui-slice-344\.mjs/,
  /node scripts\/smoke-ui-slice-351\.mjs/,
  /node scripts\/smoke-ui-slice-352\.mjs/,
  /node scripts\/smoke-ui-slice-353\.mjs/,
  /node scripts\/smoke-ui-slice-380\.mjs/,
  /node scripts\/smoke-ui-slice-382\.mjs/,
  /node scripts\/smoke-ui-slice-605\.mjs/,
  /node scripts\/smoke-ui-slice-623\.mjs/,
  /node scripts\/smoke-ui-slice-649\.mjs/,
  /node scripts\/smoke-ui-slice-612\.mjs/,
  /node scripts\/smoke-ui-slice-614\.mjs/,
  /node scripts\/smoke-ui-slice-615\.mjs/,
  /node scripts\/smoke-ui-slice-619\.mjs/,
  /node scripts\/smoke-ui-slice-629\.mjs/,
  /node scripts\/smoke-ui-slice-630\.mjs/,
  /node scripts\/smoke-ui-slice-627\.mjs/,
  /output\/playwright\/vnext-desktop-top-final\.png/,
  /output\/playwright\/vnext-mobile\.png/,
];

assertReadmeHasAll(extractionEvidence);
assertReadmeHasAll(knowledgeWorkBoundaryEvidence);
assertReadmeHasAll(proposalAndMemoryBoundaryEvidence);
assertReadmeHasAll(uiEvidenceCommandEvidence);

const readmeTestingCommandEvidence = [
  new RegExp(`${smokeFileCount} smoke files`),
  new RegExp(`${qaSliceFileCount} QA slice files`),
  new RegExp(`${uiSmokeFileCount} UI smoke files`),
  /node scripts\/run-smoke\.mjs --list/,
  /node scripts\/run-smoke\.mjs --filter smoke-readme-scope-evidence/,
  /node scripts\/run-smoke\.mjs --all --fail-fast/,
];

assertReadmeHasAll(readmeTestingCommandEvidence);

const missionGraphExplorationEvidence = [
  /docs\/90_mission-evidence-graph-exploration-phase-3-plan\.md/,
  /Mission evidence graph Phase 3 exploration is accepted by `DEC-139`/,
  /browser-memory search over short node fields/,
  /node scripts\/smoke-ui-slice-673\.mjs/,
  /output\/playwright\/orchestration-mission-evidence-graph-phase3-desktop\.png/,
  /output\/playwright\/orchestration-mission-evidence-graph-phase3-mobile\.png/,
  /Runtime search\/index, persisted explorer state,[\s\S]*authority-bearing actions remain[\s\S]*outside the implemented scope/,
];

assertReadmeHasAll(missionGraphExplorationEvidence);

const activeMissionFocusEvidence = [
  /docs\/91_llm-native-active-mission-focus-plan\.md/,
  /LLM-native active Mission focus is accepted by `DEC-140`/,
  /selected Mission now opens directly on its title\s+and `Thread \| Graph` workstream/,
  /node scripts\/smoke-ui-slice-674\.mjs/,
  /output\/playwright\/orchestration-active-mission-focus-desktop\.png/,
  /output\/playwright\/orchestration-active-mission-focus-mobile\.png/,
  /Durable\s+drafts, autosave, automatic Mission creation or dispatch,[\s\S]*outside\s+the implemented scope/,
];

assertReadmeHasAll(activeMissionFocusEvidence);

const missionModeControlEvidence = [
  /docs\/92_llm-native-mission-mode-control-plan\.md/,
  /LLM-native Mission mode control is accepted by `DEC-141`/,
  /basic, independent-role,[\s\S]*OpenAI Council paths as one native segmented configuration field/,
  /single\s+`안건 등록` submit command/,
  /node scripts\/smoke-ui-slice-675\.mjs/,
  /output\/playwright\/orchestration-mission-mode-control-desktop\.png/,
  /output\/playwright\/orchestration-mission-mode-control-mobile\.png/,
  /`DEC-141` permits only browser-memory Council mode presentation[\s\S]*connector reach/,
];

assertReadmeHasAll(missionModeControlEvidence);

const firstRunProjectConnectionEvidence = [
  /docs\/93_llm-native-first-run-project-connection-plan\.md/,
  /LLM-native first-run project connection is accepted by `DEC-142`/,
  /removes the nested bootstrap cards and redundant empty\s+state/,
  /one `프로젝트 연결`\s+command/,
  /node scripts\/smoke-ui-slice-676\.mjs/,
  /output\/playwright\/orchestration-first-run-project-connection-desktop\.png/,
  /output\/playwright\/orchestration-first-run-project-connection-mobile\.png/,
  /`DEC-142` permits only first-run project connection presentation[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(firstRunProjectConnectionEvidence);

const sourceBackedMissionThreadEvidence = [
  /docs\/94_llm-native-source-backed-mission-thread-plan\.md/,
  /LLM-native source-backed Mission thread is accepted by `DEC-143`/,
  /renders only the\s+Operator, Council, Execution, and Deliverables turns supported by current records/,
  /Future stages no\s+longer appear as synthetic conversation rows/,
  /node scripts\/smoke-ui-slice-677\.mjs/,
  /output\/playwright\/orchestration-source-backed-mission-thread-desktop\.png/,
  /output\/playwright\/orchestration-source-backed-mission-thread-mobile\.png/,
  /`DEC-143` permits only source-backed Mission Thread presentation[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(sourceBackedMissionThreadEvidence);

const sourceBackedCouncilMeetingEvidence = [
  /docs\/95_llm-native-source-backed-council-meeting-plan\.md/,
  /LLM-native source-backed Council meeting is accepted by `DEC-144`/,
  /Mission context, independent Strategist\/Architect\/Decomposer positions,[\s\S]*one Conductor synthesis/,
  /Source ids,[\s\S]*WorkOrder preparation remain available[\s\S]*under collapsed secondary details/,
  /node scripts\/smoke-ui-slice-678\.mjs/,
  /output\/playwright\/orchestration-source-backed-council-meeting-desktop\.png/,
  /output\/playwright\/orchestration-source-backed-council-meeting-mobile\.png/,
  /`DEC-144` permits only source-backed Council presentation[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(sourceBackedCouncilMeetingEvidence);

const sourceBackedExecutionFlowEvidence = [
  /docs\/96_llm-native-source-backed-execution-flow-plan\.md/,
  /LLM-native source-backed Execution flow is accepted by `DEC-145`/,
  /current source-backed checkpoint,[\s\S]*one existing\s+bounded operator command/,
  /Strategist, Architect, Decomposer, Maker, and Critic[\s\S]*progress/,
  /run, approval, Decision Inbox, artifact, preflight, readiness, and harness evidence[\s\S]*collapsed secondary details/,
  /node scripts\/smoke-ui-slice-679\.mjs/,
  /output\/playwright\/orchestration-source-backed-execution-flow-desktop\.png/,
  /output\/playwright\/orchestration-source-backed-execution-flow-mobile\.png/,
  /`DEC-145` permits only source-backed Execution presentation[\s\S]*connectors/,
];

assertReadmeHasAll(sourceBackedExecutionFlowEvidence);

const sourceBackedDeliverablesFlowEvidence = [
  /docs\/97_llm-native-source-backed-deliverables-flow-plan\.md/,
  /LLM-native source-backed Deliverables flow is accepted by `DEC-146`/,
  /current source-backed delivery state,[\s\S]*one existing bounded\s+operator command/,
  /Result, Verification, Package, Acceptance, and Close-out progress/,
  /artifact and record refs,[\s\S]*post-close-out learning or memory\s+handoffs remain available under collapsed secondary details/,
  /node scripts\/smoke-ui-slice-680\.mjs/,
  /output\/playwright\/orchestration-source-backed-deliverables-flow-desktop\.png/,
  /output\/playwright\/orchestration-source-backed-deliverables-flow-mobile\.png/,
  /`DEC-146` permits only source-backed Deliverables presentation[\s\S]*connectors/,
];

assertReadmeHasAll(sourceBackedDeliverablesFlowEvidence);

const llmNativeAdvancedOpsNavigationEvidence = [
  /docs\/98_llm-native-advanced-ops-navigation-plan\.md/,
  /LLM-native Advanced Ops navigation is accepted by `DEC-147`/,
  /Mission, Council, Execution, and Deliverables\s+remain continuously visible as the primary workstream/,
  /Decision Inbox, Artifacts, Logs, and Taskboard\s+remain the exact authoritative operator surfaces inside one native Advanced Ops disclosure/,
  /pending Decision Inbox gate count visible/,
  /Existing routes, dynamic\s+counts, `aria-current` state, handlers,[\s\S]*remain\s+unchanged/,
  /node scripts\/smoke-ui-slice-681\.mjs/,
  /output\/playwright\/orchestration-llm-advanced-ops-navigation-desktop\.png/,
  /output\/playwright\/orchestration-llm-advanced-ops-navigation-mobile\.png/,
  /`DEC-147` permits only browser navigation hierarchy[\s\S]*connector\s+authority/,
];

assertReadmeHasAll(llmNativeAdvancedOpsNavigationEvidence);

const llmNativeMissionHistoryNavigationEvidence = [
  /docs\/99_llm-native-mission-history-navigation-plan\.md/,
  /LLM-native Mission history navigation is accepted by `DEC-148`/,
  /current Mission\s+title and project-scoped Mission count beside the existing new-Mission command/,
  /every Mission in the existing newest-first source order/,
  /reuses the current `select-mission` route/,
  /detailed full Mission register remains in\s+the Mission workspace/,
  /node scripts\/smoke-ui-slice-682\.mjs/,
  /output\/playwright\/orchestration-mission-history-navigation-desktop\.png/,
  /output\/playwright\/orchestration-mission-history-navigation-mobile\.png/,
  /`DEC-148` permits only sidebar Mission context and selection presentation[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(llmNativeMissionHistoryNavigationEvidence);

const llmNativeWorkspaceHeaderEvidence = [
  /docs\/100_llm-native-workspace-header-plan\.md/,
  /LLM-native Workspace Header consolidation is accepted by `DEC-149`/,
  /current project,\s+normalized provider mode, current surface, open gate count, refresh state, and existing refresh\s+command together/,
  /Repeated project and status presence rows were removed from Mission, Council,\s+Execution, and Deliverables/,
  /node scripts\/smoke-ui-slice-683\.mjs/,
  /output\/playwright\/orchestration-workspace-header-desktop\.png/,
  /output\/playwright\/orchestration-workspace-header-mobile\.png/,
  /`DEC-149` permits only Workspace Header presentation[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(llmNativeWorkspaceHeaderEvidence);

const llmNativeMobileNavigationEvidence = [
  /docs\/101_llm-native-mobile-navigation-plan\.md/,
  /LLM-native mobile navigation compaction is accepted by `DEC-150`/,
  /collapsed rail now uses three rows/,
  /Opening either existing native disclosure gives its source-current choices the full rail width/,
  /node scripts\/smoke-ui-slice-684\.mjs/,
  /output\/playwright\/orchestration-mobile-navigation-desktop\.png/,
  /output\/playwright\/orchestration-mobile-navigation-compact\.png/,
  /`DEC-150` permits only responsive navigation presentation below 820px[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(llmNativeMobileNavigationEvidence);

const llmNativeSparseMissionGraphEvidence = [
  /docs\/102_llm-native-sparse-mission-graph-density-plan\.md/,
  /LLM-native sparse Mission Graph density is accepted by `DEC-151`/,
  /derive[\s\S]*canvas height from the densest visible lifecycle stage/,
  /mobile semantic fallback[\s\S]*all six stage headings and counts/,
  /node scripts\/smoke-ui-slice-685\.mjs/,
  /output\/playwright\/orchestration-current-graph-desktop\.png/,
  /output\/playwright\/orchestration-current-graph-mobile\.png/,
  /`DEC-151` permits only source-density-derived Mission Graph presentation[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(llmNativeSparseMissionGraphEvidence);

const llmNativeMobileMissionTitleReadabilityEvidence = [
  /docs\/103_llm-native-mobile-mission-title-readability-plan\.md/,
  /LLM-native mobile Mission title readability is accepted by `DEC-152`/,
  /complete current Mission title through natural wrapping instead of a one-line\s+ellipsis/,
  /Mission count, disclosure indicator, Advanced Ops and pending-gate status/,
  /node scripts\/smoke-ui-slice-686\.mjs/,
  /output\/playwright\/orchestration-current-desktop-mission-title\.png/,
  /output\/playwright\/orchestration-current-mobile-mission-title-2\.png/,
  /`DEC-152` permits only responsive current-Mission title presentation[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(llmNativeMobileMissionTitleReadabilityEvidence);

const llmNativeUnchangedSnapshotRefreshEvidence = [
  /docs\/104_llm-native-unchanged-snapshot-refresh-plan\.md/,
  /LLM-native unchanged snapshot refresh is accepted by `DEC-153`/,
  /identical\s+`snapshot`, `derived`, and `runtimeRoot` content as a browser no-op/,
  /visible selected run log\s+keeps its selection-bound append-only detail refresh/,
  /stale responses are discarded and timer-only log failure remains a visible retryable status/,
  /node scripts\/smoke-ui-slice-687\.mjs/,
  /`DEC-153` permits only timer-path browser reconciliation[\s\S]*Out-of-band edits to runtime artifact files/,
];

assertReadmeHasAll(llmNativeUnchangedSnapshotRefreshEvidence);

const llmNativeDesktopWorkspaceFocusOffsetEvidence = [
  /docs\/105_llm-native-desktop-workspace-focus-offset-plan\.md/,
  /LLM-native desktop workspace focus offset is accepted by `DEC-154`/,
  /At 821px and wider, the existing\s+`main\.surface-stack` reserves 46px above a focused workspace/,
  /current `workspaceMain\.focus\(\)` handoff and skip-link target remain intact/,
  /820px-and-below static header and mobile scroll behavior remain unchanged/,
  /node scripts\/smoke-ui-slice-688\.mjs/,
  /`DEC-154` permits only the desktop `scroll-margin-top` focus offset[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(llmNativeDesktopWorkspaceFocusOffsetEvidence);

const llmNativeAdvancedOpsOverviewPlacementEvidence = [
  /docs\/106_llm-native-advanced-ops-overview-placement-plan\.md/,
  /LLM-native Advanced Ops secondary overview placement is accepted by `DEC-155`/,
  /control overview now\s+follows the authoritative workspace inside default-closed native `details`/,
  /`추가 운영 도구` as\s+its summary/,
  /stays hidden for workflows and becomes available only as secondary inspection in\s+Advanced Ops/,
  /node scripts\/smoke-ui-slice-689\.mjs/,
  /`DEC-155` permits only secondary placement of the existing control overview[\s\S]*connectors remain outside/,
];

assertReadmeHasAll(llmNativeAdvancedOpsOverviewPlacementEvidence);

const llmNativeMissionNextGateNavigationEvidence = [
  /docs\/107_llm-native-mission-next-gate-navigation-plan\.md/,
  /LLM-native Mission next-gate navigation is accepted by `DEC-156`/,
  /source-backed non-Mission next action, its lead shows the current gate and one native link/,
  /existing lower gate after the recorded evidence/,
  /Within this new lead-to-gate navigation pair, only\s+the lower gate keeps an `open-surface-for-mission` action/,
  /Graph, the composer, recorded turns, routes, runtime\/API\/schema\/\s+dependencies, persistence, provider behavior, and every authority boundary remain unchanged/,
];

assertReadmeHasAll(llmNativeMissionNextGateNavigationEvidence);

const completionVerificationEvidence = [
  /Completion close-out verification is split deliberately/,
  /focused README and completion-inventory\s+smokes pin the public claims and inventory counts/,
  /aggregate and UI QA commands confirm those\s+same counts remain registered in the wider gate/,
  /The README evidence smoke also keeps forbidden\s+public-claim patterns, route list coverage, and source-route registrations in the same checked\s+surface/,
  /Recent verifier maintenance keeps this close-out evidence easier to audit without widening product\s+authority/,
  /The vNext audit, growth dashboard evidence depth, authority review\/decision packet,\s+durable proposal record, and proposal application status scripts now run their status-script and\s+focused-smoke dependencies through the shared `scripts\/vnext-status-assertions\.mjs` `runStatus`\s+helper/,
  /the authority review\/decision packet scripts also share source-evidence assertion\s+helpers from the same module/,
  /The durable proposal record planning preview and implementation plan\s+status scripts use those shared source-evidence assertion helpers too/,
  /the helper uses the current\s+Node binary and the shared large JSON buffer, while before\/after JSON diffs keep the emitted status\s+payloads unchanged/,
  /The proposal application handoff and implementation planning status scripts now\s+use those shared source-evidence assertion helpers as well/,
  /The operator decision handoff and\s+proposal application decision packet status scripts now use the same shared assertion helpers/,
  /The\s+runtime implementation status scripts for durable proposal records, proposal application attempts,\s+and single-path proposal source mutation now share source file loading and regex match assertion\s+helpers too/,
  /The vNext audit and growth dashboard evidence depth status scripts now share source\s+file loading plus exact-string, regex-match, and forbidden-action assertion helpers from that same\s+module/,
  /node scripts\/smoke-completion-gate-inventory-current-evidence\.mjs/,
  /node scripts\/vnext-development-audit-status\.mjs[\s\S]*The vNext audit status runs its upstream growth, reflection, proposal\s+readiness, lifecycle review, and source mutation implementation checks through the shared\s+`scripts\/vnext-status-assertions\.mjs` `runStatus` helper and reuses shared source file loading,\s+exact-string, and regex-match assertion helpers without changing the emitted status payload/,
  /node scripts\/vnext-growth-dashboard-evidence-depth-status\.mjs[\s\S]*It runs the vNext audit status through the shared\s+`scripts\/vnext-status-assertions\.mjs` `runStatus` helper and reuses shared source file loading,\s+regex-match, and forbidden-action assertion helpers without changing the emitted status payload/,
  /node scripts\/vnext-authority-expansion-review-status\.mjs[\s\S]*It runs upstream vNext audit, growth dashboard, proposal review, and\s+memory readiness statuses through the shared `scripts\/vnext-status-assertions\.mjs` `runStatus`\s+helper, and it reuses shared source file loading, markdown-section, backticked-field,\s+source-evidence, and forbidden-action assertion helpers without changing the emitted status\s+payload/,
  /node scripts\/vnext-authority-implementation-decision-packet-status\.mjs[\s\S]*It runs upstream vNext\s+audit and authority expansion review statuses through the shared\s+`scripts\/vnext-status-assertions\.mjs` `runStatus` helper, and it reuses shared source file\s+loading, markdown-section, backticked-field, and source-evidence assertion helpers without\s+changing the emitted status payload/,
  /node scripts\/vnext-durable-proposal-record-planning-preview-status\.mjs[\s\S]*It runs upstream status checks\s+through the shared `scripts\/vnext-status-assertions\.mjs` `runStatus` helper, and it reuses shared\s+source file loading, markdown-section, backticked-field, source-evidence, and forbidden-action\s+assertion helpers without changing the emitted status payload/,
  /node scripts\/vnext-durable-proposal-record-implementation-plan-status\.mjs[\s\S]*It runs upstream status checks through the shared\s+`scripts\/vnext-status-assertions\.mjs` `runStatus` helper, and it reuses shared source file\s+loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion\s+helpers without changing the emitted status payload/,
  /node scripts\/vnext-durable-proposal-record-implementation-status\.mjs[\s\S]*It runs the focused smoke through the\s+shared `scripts\/vnext-status-assertions\.mjs` `runStatus` helper and reuses shared source file\s+loading, regex match, and forbidden-action assertion helpers without changing the emitted status\s+payload/,
  /node scripts\/vnext-operator-decision-handoff-status\.mjs[\s\S]*It\s+reuses shared source file loading, markdown-section, backticked-field, source-evidence, and\s+forbidden-action assertion helpers without changing the emitted status payload/,
  /node scripts\/vnext-proposal-application-decision-packet-status\.mjs[\s\S]*It runs upstream status checks through the shared\s+`scripts\/vnext-status-assertions\.mjs` `runStatus` helper, using the current Node binary and shared\s+large JSON buffer, and it reuses shared source file loading, markdown-section, backticked-field,\s+source-evidence, and forbidden-action assertion helpers without changing the emitted status\s+payload/,
  /node scripts\/vnext-proposal-application-operator-decision-handoff-status\.mjs[\s\S]*It runs upstream status checks through the shared\s+`scripts\/vnext-status-assertions\.mjs` `runStatus` helper, and it reuses shared source file\s+loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion\s+helpers without changing the emitted status payload/,
  /node scripts\/vnext-proposal-application-implementation-plan-status\.mjs[\s\S]*It runs upstream status checks through the\s+shared `scripts\/vnext-status-assertions\.mjs` `runStatus` helper, and it reuses shared source file\s+loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion\s+helpers without changing the emitted status payload/,
  /node scripts\/vnext-proposal-application-implementation-decision-handoff-status\.mjs[\s\S]*It runs upstream status checks through\s+the shared `scripts\/vnext-status-assertions\.mjs` `runStatus` helper, and it reuses shared source\s+file loading, markdown-section, backticked-field, source-evidence, and forbidden-action assertion\s+helpers without changing the emitted status payload/,
  /node scripts\/vnext-proposal-application-implementation-status\.mjs[\s\S]*It runs\s+the focused smoke through the shared `scripts\/vnext-status-assertions\.mjs` `runStatus` helper and\s+reuses shared source file loading and regex match assertion helpers without changing the emitted\s+status payload/,
  /node scripts\/vnext-proposal-application-source-mutation-implementation-status\.mjs[\s\S]*It runs the focused\s+smoke through the shared `scripts\/vnext-status-assertions\.mjs` `runStatus` helper and reuses\s+shared source file loading and regex match assertion helpers without changing the emitted status\s+payload/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status\.mjs/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /node scripts\/smoke-growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status\.mjs/,
  /Current verification evidence from this README and completion close-out refresh/,
  /completion inventory counts,\s+aggregate registration `265`, UI QA registration `69`, zero-open backlog/,
  /reports `ok=true`, read-only lifecycle-close status readiness/,
  /pins the lifecycle-close status source markers, vocabulary, schema required fields, readiness,\s+safety boundary, invalid-argument rejection, growth gateway plan evidence, and cross-document\s+ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close-review acceptance readiness/,
  /pins the lifecycle-close-review status source markers, vocabulary, schema required fields,\s+readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and\s+cross-document ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close acceptance readiness/,
  /pins the lifecycle-close-review-acceptance status source markers, vocabulary, schema required\s+fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and\s+cross-document ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close finalization readiness/,
  /pins the lifecycle-close-acceptance status source markers, vocabulary, schema required fields,\s+readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and\s+cross-document ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close-finalization-review\s+readiness/,
  /pins the lifecycle-close-finalization status source markers, vocabulary, schema required fields,\s+readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and\s+cross-document ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close-finalization-review-acceptance\s+readiness/,
  /pins the lifecycle-close-finalization-review status source markers, vocabulary, schema required\s+fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and\s+cross-document ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close-finalization-acceptance\s+readiness/,
  /blocked lifecycle close finalization acceptance, blocked lifecycle close finalization\s+review acceptance/,
  /pins the lifecycle-close-finalization-review-acceptance status source markers, vocabulary, schema\s+required fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan\s+evidence, and cross-document ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close-final-close readiness/,
  /blocked lifecycle close final\s+close, blocked lifecycle close finalization acceptance/,
  /pins the lifecycle-close-finalization-acceptance status source markers, vocabulary, schema\s+required fields, readiness, safety boundary, invalid-argument rejection, growth gateway plan\s+evidence, and cross-document ledger evidence/,
  /reports `ok=true`, read-only lifecycle-close readiness/,
  /blocked lifecycle close, blocked lifecycle\s+close final-close/,
  /pins the lifecycle-close-final-close status source markers, vocabulary, schema required fields,\s+readiness, safety boundary, invalid-argument rejection, growth gateway plan evidence, and\s+cross-document ledger evidence/,
];

assertReadmeHasAll(completionVerificationEvidence);

const staleReadmeClaimRejections = [
  /838\s+\(smoke-slice/,
];

const forbiddenPublicClaimRejections = [
  /production-ready/i,
  /enterprise/i,
  /99\.8/,
  /94\.2/,
  /정확도 95/,
  /요청당/,
  /상용 운영/,
  /엔터프라이즈/,
];

assertReadmeDoesNotHaveAll(staleReadmeClaimRejections);
assertReadmeDoesNotHaveAll(forbiddenPublicClaimRejections);

const readmeRouteEvidence = [
  '/api/snapshot',
  '/api/projects',
  '/api/projects/:projectId/select',
  '/api/projects/:projectId/provider-config',
  '/api/projects/:projectId/linked-worktrees',
  '/api/missions',
  '/api/missions/:missionId/evidence-graph',
  '/api/tasks/:taskId/execution-provenance',
  '/api/missions/:missionId/create-linked-task',
  '/api/missions/:missionId/draft-council',
  '/api/missions/:missionId/approve-council',
  '/api/missions/:missionId/learning-candidate-preview',
  '/api/missions/:missionId/council/start',
  '/api/council-sessions/:sessionId/resume',
  '/api/council-sessions/:sessionId/decision',
  '/api/tasks',
  '/api/tasks/:taskId/run-planner',
  '/api/tasks/:taskId/run-builder-live-mutation',
  '/api/tasks/:taskId/run-reviewer',
  '/api/tasks/:taskId/run-commit-package',
  '/api/tasks/:taskId/run-local-commit',
  '/api/tasks/:taskId/run-release-package',
  '/api/tasks/:taskId/run-close-out',
  '/api/decision-inbox/:itemId/actions',
  '/api/runs/:runId/logs',
  '/api/artifacts/:artifactId',
];

assertReadmeHasRoutes(readmeRouteEvidence);

const sourceRouteHandlerEvidence = [
  /url\.pathname === '\/api\/snapshot'/,
  /url\.pathname === '\/api\/projects'/,
  /\/\^\\\/api\\\/projects\\\/\(\[\^\/\]\+\)\\\/select\$\/\)/,
  /\/\^\\\/api\\\/missions\\\/\(\[\^\/\]\+\)\\\/create-linked-task\$\/,/,
  /missionEvidenceGraphMatch/,
  /\/\^\\\/api\\\/missions\\\/\(\[\^\/\]\+\)\\\/learning-candidate-preview\$\/,/,
  /missionStartRealCouncilMatch/,
  /realCouncilResumeMatch/,
  /realCouncilDecisionMatch/,
  /url\.pathname === '\/api\/tasks'/,
  /\/\^\\\/api\\\/tasks\\\/\(\[\^\/\]\+\)\\\/run-planner\$\/\)/,
  /\/\^\\\/api\\\/tasks\\\/\(\[\^\/\]\+\)\\\/run-close-out\$\/\)/,
  /\/\^\\\/api\\\/decision-inbox\\\/\(\[\^\/\]\+\)\\\/actions\$\/\)/,
  /\/\^\\\/api\\\/runs\\\/\(\[\^\/\]\+\)\\\/logs\$\/\)/,
  /\/\^\\\/api\\\/artifacts\\\/\(\[\^\/\]\+\)\$\/\)/,
];

assertTextHasAll(serveUi, sourceRouteHandlerEvidence);

const liveProviderEnvEvidence = [
  /`OPENAI_API_KEY`/,
  /`OPENAI_RESPONSES_MODEL`/,
  /`OPENAI_RESPONSES_TIMEOUT_MS`/,
  /`OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS`/,
  /`OPENAI_RESPONSES_RETRY_DELAY_MS`/,
];

const verificationRegistryEvidence = [
  /smoke-readme-scope-evidence\.mjs/,
  /smoke-ui-slice-649\.mjs/,
  /smoke-runner-status\.mjs/,
  /knowledge-work-pack/,
  /vnext-proposal-application-source-mutation-decision-packet-status\.mjs/,
  /vnext-proposal-application-source-mutation-operator-decision-handoff-status\.mjs/,
  /vnext-proposal-application-source-mutation-planning-plan-status\.mjs/,
];

const harnessTokenSourceEvidence = [
  /export function getHarnessExecutionTimestampLabel\(execution, fallbackLabel = '기록 없음'\) \{/,
  /export function getHarnessExecutionRequestId\(execution\) \{/,
  /export function getHarnessExecutionActionOutputPath\(execution\) \{/,
  /export function getHarnessHistoryRequestLabel\(requestId, index\) \{/,
  /export function getHarnessOutputSummaryValue\(outputPath\) \{/,
  /export function getHarnessInputSummaryValue\(inputPath\) \{/,
  /export function getHarnessStatusSummaryValue\(value\) \{/,
];

const harnessTokenConsumerEvidence = [
  /data-growth-learning-surface="read-only"/,
  /from '\.\/harness-execution-tokens\.js'/,
  /const visibleHarnessRequestId = getHarnessExecutionRequestId\(visibleHarnessExecutionResult\);/,
  /const hiddenHarnessRequestId = getHarnessExecutionRequestId\(hiddenHarnessExecutionResult\);/,
  /const historyHarnessRequestId = getHarnessExecutionRequestId\(execution\);/,
];

assertReadmeHasAll(liveProviderEnvEvidence);
assertTextHasAll(verificationStatus, verificationRegistryEvidence);
assertTextHasAll(harnessExecutionTokens, harnessTokenSourceEvidence);
assertTextHasAll(appJs, harnessTokenConsumerEvidence);

const visibleHarnessAppStructureEvidence = [
  /const harnessRunActionShelfMarkup = `\s+\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}\s+\$\{harnessRunPolicyReportPreviewActionMarkup\}\s+\$\{harnessRunSubmitActionMarkup\}/,
  /\$\{harnessRunActionShelfMarkup\}/,
  /const visibleHarnessExecutionSummaryMarkup = `\s+\$\{visibleHarnessInputSummaryMarkup\}\s+\$\{visibleHarnessModeSummaryMarkup\}\s+\$\{visibleHarnessHandoffSummaryMarkup\}\s+\$\{visibleHarnessOutputSummaryMarkup\}/,
  /const visibleHarnessSupplementalSummaryMarkup = `\s+\$\{visibleHarnessRequestSummaryMarkup\}\s+\$\{visibleHarnessPolicyReportSummaryMarkup\}\s+\$\{visibleHarnessOutputBriefSummaryMarkup\}/,
  /const visibleHarnessSummaryRackMarkup = `\s+\$\{visibleHarnessExecutionSummaryMarkup\}\s+\$\{visibleHarnessSupplementalSummaryMarkup\}/,
  /\$\{visibleHarnessSummaryRackMarkup\}/,
  /const visibleHarnessTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>\$\{escapeHtml\(visibleHarnessResultTitle\)\}<\/strong>\s+\$\{visibleHarnessResultStateTokenMarkup\}/,
  /const visibleHarnessTokenRowFrameMarkup = `\s+<div class="token-row token-row-compact">\s+\$\{visibleHarnessTokenRowMarkup\}/,
  /const visibleHarnessHeaderMarkup = `\s+\$\{visibleHarnessTitleRowMarkup\}\s+\$\{visibleHarnessTokenRowFrameMarkup\}/,
  /\$\{visibleHarnessHeaderMarkup\}/,
  /const visibleHarnessResultPacketMarkup = `\s+<div class="harness-execution-result-packet" data-harness-execution-result-packet="true">\s+\$\{visibleHarnessHeaderMarkup\}\s+\$\{visibleHarnessSummaryRackMarkup\}\s+\$\{visibleHarnessActionShelfFrameMarkup\}\s+\$\{visibleHarnessPreviewMarkup\}/,
  /\$\{visibleHarnessResultPacketMarkup\}/,
];

const visibleHarnessInlineStructureRejections = [
  /data-harness-run-action-shelf="true"[\s\S]{0,260}\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}/,
  /data-harness-execution-result="true"[\s\S]{0,180}<div class="harness-execution-result-packet" data-harness-execution-result-packet="true">[\s\S]{0,260}\$\{visibleHarnessHeaderMarkup\}/,
  /data-harness-execution-result-packet="true"[\s\S]{0,320}<strong>\$\{escapeHtml\(visibleHarnessResultTitle\)\}<\/strong>/,
  /data-harness-execution-result="true">\s+[\s\S]{0,340}<strong>\$\{escapeHtml\(visibleHarnessResultTitle\)\}<\/strong>[\s\S]{0,520}\$\{visibleHarnessInputSummaryMarkup\}\s+\$\{visibleHarnessModeSummaryMarkup\}/,
];

const hiddenHarnessAppStructureEvidence = [
  /const hiddenHarnessRunContextSummaryMarkup = `\s+\$\{hiddenHarnessRequestSummaryMarkup\}\s+\$\{hiddenHarnessExecutedAtSummaryMarkup\}\s+\$\{hiddenHarnessModeSummaryMarkup\}\s+\$\{hiddenHarnessHandoffSummaryMarkup\}\s+\$\{hiddenHarnessInputSummaryMarkup\}\s+\$\{hiddenHarnessOutputSummaryMarkup\}/,
  /\$\{hiddenHarnessRunContextSummaryMarkup\}/,
  /const hiddenHarnessContextSummaryMarkup = `\s+\$\{hiddenHarnessIdSummaryMarkup\}\s+\$\{hiddenHarnessKindSummaryMarkup\}\s+\$\{hiddenHarnessPrimaryCommandSummaryMarkup\}\s+\$\{hiddenHarnessPrimaryRunnerSummaryMarkup\}\s+\$\{hiddenHarnessPostureSummaryMarkup\}\s+\$\{hiddenHarnessStateSummaryMarkup\}\s+\$\{hiddenHarnessHostSummaryMarkup\}/,
  /\$\{hiddenHarnessContextSummaryMarkup\}/,
  /const hiddenHarnessOperatorContextSummaryMarkup = `\s+\$\{hiddenHarnessOperatorActionSummaryMarkup\}\s+\$\{hiddenHarnessOperatorCommandSummaryMarkup\}\s+\$\{hiddenHarnessOperatorMessageSummaryMarkup\}/,
  /\$\{hiddenHarnessOperatorContextSummaryMarkup\}/,
  /const hiddenHarnessContextSectionsMarkup = `\s+\$\{hiddenHarnessRunContextSectionMarkup\}\s+\$\{hiddenHarnessHarnessContextSectionMarkup\}\s+\$\{hiddenHarnessOperatorContextSectionMarkup\}/,
  /\$\{hiddenHarnessContextSectionsMarkup\}/,
  /const hiddenHarnessRunContextTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>실행 기록<\/strong>/,
  /const hiddenHarnessHarnessContextTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>하네스 컨텍스트<\/strong>/,
  /const hiddenHarnessOperatorContextTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>운영 컨텍스트<\/strong>/,
  /data-harness-result-hidden-run-context="true">\s+\$\{hiddenHarnessRunContextTitleRowMarkup\}\s+\$\{hiddenHarnessRunContextSummaryMarkup\}/,
  /data-harness-result-hidden-harness-context="true">\s+\$\{hiddenHarnessHarnessContextTitleRowMarkup\}\s+\$\{hiddenHarnessContextSummaryMarkup\}/,
  /data-harness-result-hidden-operator-context="true">\s+\$\{hiddenHarnessOperatorContextTitleRowMarkup\}\s+\$\{hiddenHarnessOperatorContextSummaryMarkup\}/,
];

const hiddenHarnessInlineStructureRejections = [
  /data-harness-result-hidden-run-context="true">\s+[\s\S]{0,240}<strong>실행 기록<\/strong>[\s\S]{0,240}\$\{hiddenHarnessRequestSummaryMarkup\}\s+\$\{hiddenHarnessExecutedAtSummaryMarkup\}/,
  /data-harness-result-hidden-harness-context="true">\s+[\s\S]{0,260}<strong>하네스 컨텍스트<\/strong>[\s\S]{0,260}\$\{hiddenHarnessIdSummaryMarkup\}\s+\$\{hiddenHarnessKindSummaryMarkup\}/,
  /data-harness-result-hidden-operator-context="true">\s+[\s\S]{0,260}<strong>운영 컨텍스트<\/strong>[\s\S]{0,260}\$\{hiddenHarnessOperatorActionSummaryMarkup\}\s+\$\{hiddenHarnessOperatorCommandSummaryMarkup\}/,
  /data-harness-execution-result-hidden="true"[\s\S]{0,900}data-harness-result-hidden-run-context="true"[\s\S]{0,900}data-harness-result-hidden-harness-context="true"[\s\S]{0,900}data-harness-result-hidden-operator-context="true"/,
];

assertTextHasAll(appJs, visibleHarnessAppStructureEvidence);
assertTextDoesNotHaveAll(appJs, visibleHarnessInlineStructureRejections);
assertTextHasAll(appJs, hiddenHarnessAppStructureEvidence);
assertTextDoesNotHaveAll(appJs, hiddenHarnessInlineStructureRejections);

const harnessActionOutputPathEvidence = [
  /const visibleHarnessActionOutputPath =\s+getHarnessExecutionActionOutputPath\(visibleHarnessExecutionResult\);/,
  /const hiddenHarnessActionOutputPath =\s+getHarnessExecutionActionOutputPath\(hiddenHarnessExecutionResult\);/,
];

assertTextHasAll(appJs, harnessActionOutputPathEvidence);

const historyHarnessAppStructureEvidence = [
  /const historyHarnessPathReuseActionMarkup = `\s+<button[\s\S]*?data-action="reuse-harness-execution-paths"/,
  /const historyHarnessPathRerunActionMarkup = `\s+<button[\s\S]*?data-action="rerun-harness-execution-paths"/,
  /const historyHarnessPathActionsMarkup = `\s+\$\{historyHarnessPathReuseActionMarkup\}\s+\$\{historyHarnessPathRerunActionMarkup\}/,
  /const historyHarnessSummaryRackMarkup = `\s+\$\{historyHarnessRequestSummaryMarkup\}\s+\$\{historyHarnessExecutedAtSummaryMarkup\}\s+\$\{historyHarnessModeSummaryMarkup\}\s+\$\{historyHarnessHandoffSummaryMarkup\}\s+\$\{historyHarnessInputSummaryMarkup\}\s+\$\{historyHarnessOutputSummaryMarkup\}/,
  /\$\{historyHarnessSummaryRackMarkup\}/,
  /const historyHarnessSummaryRackFrameMarkup = `\s+<div class="harness-execution-history-summary-rack" data-harness-execution-history-summary-rack="true">\s+\$\{historyHarnessSummaryRackMarkup\}/,
  /\$\{historyHarnessSummaryRackFrameMarkup\}/,
  /const historyHarnessPreviewCopyActionMarkup =\s+canRenderHistoryHarnessPreview/,
  /const historyHarnessOutputBriefActionMarkup =\s+canRenderHistoryHarnessPreview/,
  /const historyHarnessPreviewActionsMarkup = `\s+\$\{historyHarnessPreviewCopyActionMarkup\}\s+\$\{historyHarnessOutputBriefActionMarkup\}/,
  /const historyHarnessActionShelfMarkup = `\s+\$\{historyHarnessInputPathCopyMarkup\}\s+\$\{historyHarnessRestorePreviewMarkup\}\s+\$\{historyHarnessOutputPathCopyMarkup\}\s+\$\{historyHarnessRequestIdCopyMarkup\}\s+\$\{historyHarnessExecutionPacketCopyMarkup\}\s+\$\{historyHarnessPolicyReportCopyMarkup\}\s+\$\{historyHarnessPathActionsMarkup\}\s+\$\{historyHarnessPreviewActionsMarkup\}/,
  /\$\{historyHarnessActionShelfMarkup\}/,
  /const historyHarnessActionShelfFrameMarkup = `\s+<div class="harness-execution-history-action-shelf" data-harness-execution-history-action-shelf="true">\s+<div class="form-actions form-actions-inline form-actions-compact">\s+\$\{historyHarnessActionShelfMarkup\}/,
  /\$\{historyHarnessActionShelfFrameMarkup\}/,
  /const historyHarnessItemRegisterMarkup = `\s+<div class="control-overview-register control-overview-register-compact" data-harness-execution-history-item="true">\s+\$\{historyHarnessSummaryRackFrameMarkup\}\s+\$\{historyHarnessActionShelfFrameMarkup\}/,
  /const historyHarnessItemPacketMarkup = `\s+<div class="harness-execution-history-item-packet" data-harness-execution-history-item-packet="true">\s+\$\{historyHarnessItemRegisterMarkup\}/,
  /return historyHarnessItemPacketMarkup;/,
];

const historyHarnessInlineStructureRejections = [
  /data-harness-execution-history-summary-rack="true">\s+\$\{historyHarnessRequestSummaryMarkup\}\s+\$\{historyHarnessExecutedAtSummaryMarkup\}\s+\$\{historyHarnessModeSummaryMarkup\}/,
  /data-harness-execution-history-item="true">\s+<div class="harness-execution-history-summary-rack" data-harness-execution-history-summary-rack="true">/,
  /form-actions-compact">\s+\$\{historyHarnessInputPathCopyMarkup\}\s+\$\{historyHarnessRestorePreviewMarkup\}\s+\$\{historyHarnessOutputPathCopyMarkup\}/,
  /data-harness-execution-history-summary-rack="true">\s+\$\{historyHarnessSummaryRackMarkup\}\s+<\/div>\s+<div class="harness-execution-history-action-shelf" data-harness-execution-history-action-shelf="true">/,
  /return `\s+<div class="harness-execution-history-item-packet" data-harness-execution-history-item-packet="true">\s+<div class="control-overview-register control-overview-register-compact" data-harness-execution-history-item="true">/,
];

assertTextHasAll(appJs, historyHarnessAppStructureEvidence);
assertTextDoesNotHaveAll(appJs, historyHarnessInlineStructureRejections);

const visibleHarnessPreviewActionHandoffEvidence = [
  /const visibleHarnessPreviewCopyActionMarkup =\s+canRenderVisibleHarnessPreview/,
  /const visibleHarnessOutputBriefActionMarkup =\s+canRenderVisibleHarnessPreview/,
  /const visibleHarnessPreviewActionsMarkup = `\s+\$\{visibleHarnessPreviewCopyActionMarkup\}\s+\$\{visibleHarnessOutputBriefActionMarkup\}/,
];

const hiddenHarnessPreviewActionHandoffEvidence = [
  /const hiddenHarnessPreviewCopyActionMarkup =\s+canRenderHiddenHarnessPreview/,
  /const hiddenHarnessOutputBriefActionMarkup =\s+canRenderHiddenHarnessPreview/,
  /const hiddenHarnessPreviewActionsMarkup = `\s+\$\{hiddenHarnessPreviewCopyActionMarkup\}\s+\$\{hiddenHarnessOutputBriefActionMarkup\}/,
];

const harnessExecutionTokenSourceEvidence = [
  /export function isHarnessPolicyReportExecution\(execution\) \{/,
];

const harnessCopyFormatterSourceEvidence = [
  /export function getHarnessExecutionCompletionLead\(execution, harnessId\) \{/,
  /export function getHarnessExecutionCompletionOutputCopy\(execution, fallbackOutputCopy\) \{/,
  /export function formatHarnessPolicyReportForCopy\(payload\) \{/,
  /if \(!payload\) \{\s+return '';\s+\}/,
  /export function formatHarnessExecutionPacketForCopy\(execution, context = \{\}\) \{/,
  /if \(!execution\?\.harnessId\) \{\s+return '';\s+\}/,
];

assertTextHasAll(appJs, visibleHarnessPreviewActionHandoffEvidence);
assertTextHasAll(appJs, hiddenHarnessPreviewActionHandoffEvidence);
assertTextHasAll(harnessExecutionTokens, harnessExecutionTokenSourceEvidence);
assertTextHasAll(harnessLabels, harnessCopyFormatterSourceEvidence);

const visibleHarnessTokenStructureEvidence = [
  /const visibleHarnessPrimaryTokenTone = 'neutral';/,
  /const visibleHarnessRequestTokenTone = 'neutral';/,
  /const visibleHarnessExecutedAtTokenTone = 'neutral';/,
  /const visibleHarnessPolicyReportTokenTone = 'neutral';/,
  /const visibleHarnessPrimaryTokenMarkup = canRenderVisibleHarnessPrimaryToken/,
  /const visibleHarnessPolicyReportTokenMarkup = canRenderVisibleHarnessPolicyReportToken/,
  /const visibleHarnessRequestTokenMarkup = canRenderVisibleHarnessRequestToken/,
  /const visibleHarnessOutputChannelTokenMarkup = createToken\(\s+visibleHarnessOutputChannelLabel,\s+visibleHarnessOutputChannelTone,\s+\);/,
  /const visibleHarnessExecutedAtTokenMarkup = canRenderVisibleHarnessExecutedAtToken/,
  /const visibleHarnessTokenRowMarkup = `\s+\$\{visibleHarnessPrimaryTokenMarkup\}\s+\$\{visibleHarnessPolicyReportTokenMarkup\}\s+\$\{visibleHarnessRequestTokenMarkup\}\s+\$\{visibleHarnessOutputChannelTokenMarkup\}\s+\$\{visibleHarnessExecutedAtTokenMarkup\}/,
  /\$\{visibleHarnessTokenRowMarkup\}/,
  /createToken\(visibleHarnessPrimaryTokenLabel, visibleHarnessPrimaryTokenTone\)/,
  /createToken\(visibleHarnessRequestTokenLabel, visibleHarnessRequestTokenTone\)/,
  /createToken\(visibleHarnessExecutedAtTokenLabel, visibleHarnessExecutedAtTokenTone\)/,
  /createToken\(visibleHarnessPolicyReportTokenLabel, visibleHarnessPolicyReportTokenTone\)/,
];

const visibleHarnessTokenInlineRejections = [
  /<div class="token-row token-row-compact">\s+\$\{visibleHarnessPrimaryTokenMarkup\}\s+\$\{visibleHarnessPolicyReportTokenMarkup\}/,
  /createToken\(visibleHarnessPrimaryTokenLabel, 'neutral'\)/,
  /createToken\(visibleHarnessRequestTokenLabel, 'neutral'\)/,
  /createToken\(visibleHarnessExecutedAtTokenLabel, 'neutral'\)/,
  /createToken\(visibleHarnessPolicyReportTokenLabel, 'neutral'\)/,
];

assertTextHasAll(appJs, visibleHarnessTokenStructureEvidence);
assertTextDoesNotHaveAll(appJs, visibleHarnessTokenInlineRejections);

const harnessRunActionStructureEvidence = [
  /const harnessRunCommandCopyMarkup = `/,
  /const harnessRunClearHistoryActionMarkup = hasExecutionHistory/,
  /const harnessRunPolicyReportPreviewActionMarkup = `/,
  /const harnessRunSubmitActionMarkup = `/,
  /\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}\s+\$\{harnessRunPolicyReportPreviewActionMarkup\}\s+\$\{harnessRunSubmitActionMarkup\}/,
];

const harnessRunActionInlineRejections = [
  /data-harness-run-action-shelf="true"[\s\S]{0,1800}<button/,
];

assertTextHasAll(appJs, harnessRunActionStructureEvidence);
assertTextDoesNotHaveAll(appJs, harnessRunActionInlineRejections);

const visibleHarnessPreviewActionEvidence = [
  /const visibleHarnessPreviewMarkup = canRenderVisibleHarnessPreview/,
  /\$\{visibleHarnessPreviewMarkup\}/,
  /const visibleHarnessInputPathCopyActionMarkup =\s+canRenderVisibleHarnessInputPathActions/,
  /const visibleHarnessPathReuseActionMarkup =\s+canRenderVisibleHarnessInputPathActions/,
  /const visibleHarnessPathRerunActionMarkup =\s+canRenderVisibleHarnessInputPathActions/,
  /const visibleHarnessInputPathActionsMarkup = `\s+\$\{visibleHarnessInputPathCopyActionMarkup\}\s+\$\{visibleHarnessPathReuseActionMarkup\}\s+\$\{visibleHarnessPathRerunActionMarkup\}/,
];

const visibleHarnessPreviewInlineRejections = [
  /\$\{\s*canRenderVisibleHarnessPreview\s+\?\s+`<pre class="log-viewer log-viewer-compact" data-harness-execution-preview="true">/,
];

assertTextHasAll(appJs, visibleHarnessPreviewActionEvidence);
assertTextDoesNotHaveAll(appJs, visibleHarnessPreviewInlineRejections);

const hiddenHarnessActionStructureEvidence = [
  /const hiddenHarnessInputPathCopyActionMarkup =\s+canRenderHiddenHarnessInputPathActions/,
  /const hiddenHarnessPathReuseActionMarkup =\s+canRenderHiddenHarnessInputPathActions/,
  /const hiddenHarnessPathRerunActionMarkup =\s+canRenderHiddenHarnessInputPathActions/,
  /const hiddenHarnessInputPathActionsMarkup = `\s+\$\{hiddenHarnessInputPathCopyActionMarkup\}\s+\$\{hiddenHarnessPathReuseActionMarkup\}\s+\$\{hiddenHarnessPathRerunActionMarkup\}/,
  /const hiddenHarnessActionShelfMarkup = `\s+\$\{hiddenHarnessShowActionMarkup\}\s+\$\{hiddenHarnessInputPathActionsMarkup\}\s+\$\{hiddenHarnessOutputPathCopyMarkup\}\s+\$\{hiddenHarnessRequestIdCopyMarkup\}\s+\$\{hiddenHarnessExecutionPacketCopyMarkup\}\s+\$\{hiddenHarnessPolicyReportCopyMarkup\}\s+\$\{hiddenHarnessPreviewActionsMarkup\}/,
  /const hiddenHarnessActionShelfFrameMarkup = `\s+<div class="form-actions form-actions-inline form-actions-hidden-compact">\s+\$\{hiddenHarnessActionShelfMarkup\}/,
  /\$\{hiddenHarnessActionShelfMarkup\}/,
  /\$\{hiddenHarnessActionShelfFrameMarkup\}/,
];

const hiddenHarnessActionInlineRejections = [
  /form-actions-hidden-compact">\s+\$\{hiddenHarnessShowActionMarkup\}\s+\$\{hiddenHarnessInputPathActionsMarkup\}/,
  /data-harness-execution-result-hidden-packet="true"[\s\S]{0,520}<div class="form-actions form-actions-inline form-actions-hidden-compact">\s+\$\{hiddenHarnessActionShelfMarkup\}/,
];

assertTextHasAll(appJs, hiddenHarnessActionStructureEvidence);
assertTextDoesNotHaveAll(appJs, hiddenHarnessActionInlineRejections);

const visibleHarnessActionShelfEvidence = [
  /const visibleHarnessOutputPathCopyMarkup = canRenderVisibleHarnessOutputPathCopy/,
  /\$\{visibleHarnessOutputPathCopyMarkup\}/,
  /const visibleHarnessHideActionMarkup = `/,
  /const visibleHarnessActionShelfMarkup = `\s+\$\{visibleHarnessInputPathActionsMarkup\}\s+\$\{visibleHarnessOutputPathCopyMarkup\}\s+\$\{visibleHarnessRequestIdCopyMarkup\}\s+\$\{visibleHarnessExecutionPacketCopyMarkup\}\s+\$\{visibleHarnessPreviewActionsMarkup\}\s+\$\{visibleHarnessOutputBriefCopyMarkup\}\s+\$\{visibleHarnessPolicyReportCopyMarkup\}\s+\$\{visibleHarnessHideActionMarkup\}/,
  /const visibleHarnessActionShelfFrameMarkup = canRenderVisibleHarnessPathActionShelf\s+\? `\s+<div class="form-actions form-actions-inline form-actions-compact">\s+\$\{visibleHarnessActionShelfMarkup\}/,
  /\$\{visibleHarnessHideActionMarkup\}/,
  /\$\{visibleHarnessActionShelfMarkup\}/,
  /\$\{visibleHarnessActionShelfFrameMarkup\}/,
];

const visibleHarnessActionShelfInlineRejections = [
  /\$\{\s*canRenderVisibleHarnessOutputPathCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-output-path"/,
  /\$\{visibleHarnessPolicyReportCopyMarkup\}\s+<button[\s\S]*?data-action="hide-harness-execution-result"/,
  /form-actions-compact">\s+\$\{visibleHarnessInputPathActionsMarkup\}\s+\$\{visibleHarnessOutputPathCopyMarkup\}/,
  /data-harness-execution-result-packet="true"[\s\S]{0,420}canRenderVisibleHarnessPathActionShelf\s+\?\s+`\s+<div class="form-actions form-actions-inline form-actions-compact">\s+\$\{visibleHarnessActionShelfMarkup\}/,
];

assertTextHasAll(appJs, visibleHarnessActionShelfEvidence);
assertTextDoesNotHaveAll(appJs, visibleHarnessActionShelfInlineRejections);

const harnessActionTokenHandoffEvidence = [
  /const harnessOperatorActionLabel = getHarnessOperatorActionLabel\(operatorAction\);/,
  /const harnessOperatorActionTone = getHarnessOperatorActionTone\(operatorAction\);/,
  /const harnessOperatorActionTokenLabel = harnessOperatorActionLabel;/,
  /const harnessOperatorActionTokenTone = harnessOperatorActionTone;/,
  /const harnessOperatorActionTokenMarkup = createToken\(\s+harnessOperatorActionTokenLabel,\s+harnessOperatorActionTokenTone,\s+\);/,
  /\$\{harnessOperatorActionTokenMarkup\}/,
  /const visibleHarnessResultStateToken =\s+getHarnessResultStateToken\(visibleHarnessIsPolicyReport\);/,
  /const visibleHarnessResultStateTokenLabel = visibleHarnessResultStateToken\.label;/,
  /const visibleHarnessResultStateTokenTone = visibleHarnessResultStateToken\.tone;/,
  /const visibleHarnessResultStateTokenMarkup = createToken\(\s+visibleHarnessResultStateTokenLabel,\s+visibleHarnessResultStateTokenTone,\s+\);/,
  /\$\{visibleHarnessResultStateTokenMarkup\}/,
];

const harnessActionTokenInlineRejections = [
  /createToken\(\s+harnessOperatorActionLabel,\s+harnessOperatorActionTone,\s+\)/,
  /createToken\(\s+visibleHarnessResultStateLabel,\s+visibleHarnessResultStateTone,\s+\)/,
];

assertTextHasAll(appJs, harnessActionTokenHandoffEvidence);
assertTextDoesNotHaveAll(appJs, harnessActionTokenInlineRejections);

const historyHarnessRestoreActionEvidence = [
  /const historyHarnessInputPathCopyMarkup =\s+canRenderHistoryHarnessInputPathCopy/,
  /\$\{historyHarnessInputPathCopyMarkup\}/,
  /const historyHarnessRestorePreviewMarkup = `\s+<button[\s\S]*?data-action="restore-harness-execution-preview"/,
  /\$\{historyHarnessRestorePreviewMarkup\}/,
];

const historyHarnessRestoreActionInlineRejections = [
  /\$\{\s*canRenderHistoryHarnessInputPathCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-input-path"/,
  /\$\{historyHarnessInputPathCopyMarkup\}\s+<button[\s\S]*?data-action="restore-harness-execution-preview"/,
];

assertTextHasAll(appJs, historyHarnessRestoreActionEvidence);
assertTextDoesNotHaveAll(appJs, historyHarnessRestoreActionInlineRejections);

const hiddenHarnessStateTokenHandoffEvidence = [
  /const hiddenHarnessResultStateTokenLabel = '숨김';/,
  /const hiddenHarnessResultStateTokenTone = 'neutral';/,
  /const hiddenHarnessResultStateTokenMarkup = createToken\(\s+hiddenHarnessResultStateTokenLabel,\s+hiddenHarnessResultStateTokenTone,\s+\);/,
  /\$\{hiddenHarnessResultStateTokenMarkup\}/,
];

const hiddenHarnessStateTokenInlineRejections = [
  /\$\{createToken\('숨김', 'neutral'\)\}/,
  /const hiddenHarnessResultStateTokenMarkup = createToken\('숨김', 'neutral'\);/,
  /const hiddenHarnessResultStateLabel = '숨김';/,
  /const hiddenHarnessResultStateTone = 'neutral';/,
];

assertTextHasAll(appJs, hiddenHarnessStateTokenHandoffEvidence);
assertTextDoesNotHaveAll(appJs, hiddenHarnessStateTokenInlineRejections);

const hiddenHarnessPacketHeaderEvidence = [
  /const hiddenHarnessResultPacketMarkup = `\s+<div\s+class="harness-execution-result-hidden-packet"\s+data-harness-execution-result-hidden-packet="true"\s+>\s+\$\{hiddenHarnessHeaderMarkup\}\s+\$\{hiddenHarnessContextSectionsMarkup\}\s+\$\{hiddenHarnessActionShelfFrameMarkup\}\s+\$\{hiddenHarnessPreviewMarkup\}/,
  /\$\{hiddenHarnessResultPacketMarkup\}/,
  /const hiddenHarnessTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>\$\{escapeHtml\(hiddenHarnessResultTitle\)\}가 숨겨져 있습니다<\/strong>\s+\$\{hiddenHarnessResultStateTokenMarkup\}/,
  /const hiddenHarnessHeaderMarkup = `\s+\$\{hiddenHarnessTitleRowMarkup\}\s+\$\{hiddenHarnessRestoreHintMarkup\}/,
  /\$\{hiddenHarnessHeaderMarkup\}/,
];

const hiddenHarnessPacketHeaderInlineRejections = [
  /data-harness-execution-result-hidden="true"[\s\S]{0,220}<div\s+class="harness-execution-result-hidden-packet"\s+data-harness-execution-result-hidden-packet="true"/,
  /data-harness-execution-result-hidden-packet="true"[\s\S]{0,360}<strong>\$\{escapeHtml\(hiddenHarnessResultTitle\)\}가 숨겨져 있습니다<\/strong>/,
];

assertTextHasAll(appJs, hiddenHarnessPacketHeaderEvidence);
assertTextDoesNotHaveAll(appJs, hiddenHarnessPacketHeaderInlineRejections);

const historyHarnessCountTokenEvidence = [
  /const recentHarnessExecutionCount = recentHarnessExecutions\.length;/,
  /const recentHarnessExecutionCountTokenLabel = `\$\{recentHarnessExecutionCount\}건`;/,
  /const recentHarnessExecutionCountTokenTone = 'neutral';/,
  /const recentHarnessExecutionCountTokenMarkup = recentHarnessExecutionCount\s+\? createToken\(\s+recentHarnessExecutionCountTokenLabel,\s+recentHarnessExecutionCountTokenTone,\s+\)\s+: '';/,
  /\$\{recentHarnessExecutionCountTokenMarkup\}/,
  /const historyHarnessHeaderMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>실행 기록<\/strong>\s+\$\{recentHarnessExecutionCountTokenMarkup\}/,
  /data-harness-execution-history-packet="true">\s+\$\{historyHarnessHeaderMarkup\}\s+<div class="stack harness-execution-history-list-compact"/,
];

const historyHarnessCountTokenInlineRejections = [
  /data-harness-execution-history-packet="true">\s+<div class="card-title-row card-title-row-tight">\s+<strong>실행 기록<\/strong>/,
  /createToken\(`\$\{recentHarnessExecutionCount\}건`, 'neutral'\)/,
];

assertTextHasAll(appJs, historyHarnessCountTokenEvidence);
assertTextDoesNotHaveAll(appJs, historyHarnessCountTokenInlineRejections);

const growthAuthorityBoundaryEvidence = [
  /data-personalization-scope="local-only"/,
  /data-long-term-memory-store-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.longTermMemoryStoreAllowed\}"/,
  /data-memory-readiness-gate="blocked"/,
  /data-raw-transcript-ingestion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.rawTranscriptIngestionAllowed\}"/,
  /data-cross-workspace-memory-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.crossWorkspaceMemoryAllowed\}"/,
  /data-skill-promotion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.skillPromotionAllowed\}"/,
  /<option value="knowledge-work"[^>]*>\$\{missionMode \? '지식 작업' : '지식 작업 \(knowledge-work\)'\}<\/option>/,
  /from '\.\/growth-config\.js'/,
  /from '\.\/growth-learning\.js'/,
  /from '\.\/preference-config\.js'/,
  /from '\.\/personalization-snapshot\.js'/,
];

const growthPanelAuthorityEvidence = [
  /data-proposal-record-creation-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordCreationAllowed\}"/,
  /data-proposal-record-persistence-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordPersistenceAllowed\}"/,
];

const growthModuleBoundaryEvidence = [
  /export const GROWTH_AUTHORITY_BOUNDARY = Object\.freeze\(\{/,
  /proposalRecordCreationAllowed: false/,
  /sourceMutationAllowed: false/,
];

const growthLearningModuleEvidence = [
  /export function getGrowthLearningSnapshot\(data, context, formatters = \{\}\) \{/,
];

const personalizationSnapshotModuleEvidence = [
  /export function getPersonalizationSnapshot\(\{/,
];

const preferenceConfigModuleEvidence = [
  /export const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/,
];

const knowledgeWorkContractEvidence = [
  /KNOWLEDGE_WORK: 'knowledge-work'/,
];

const knowledgeWorkPackEvidence = [
  /`knowledge-work` is an explicit opt-in pack\. It does not replace the `development` pack\./,
];

const masterBriefKnowledgeWorkEvidence = [
  /`DEC-066` records the code-present `knowledge-work` pack as explicit opt-in/,
];

const decisionLogKnowledgeWorkEvidence = [
  /`DEC-066` records `knowledge-work` as that code-present opt-in path/,
  /The code-present `knowledge-work` pack is explicit opt-in and non-default/,
];

const architectureRoadmapKnowledgeWorkEvidence = [
  /`DEC-066` records the code-present `knowledge-work` pack as explicit opt-in, non-default/,
];

const agentsKnowledgeWorkEvidence = [
  /`DEC-066` records the code-present `knowledge-work` pack as explicit opt-in and non-default/,
];

const referenceAuditEvidence = [
  /Linear/,
  /LangSmith Studio/,
  /Retool/,
  /Dify/,
  /n8n HITL/,
  /Zapier/,
  /NN\/g 2026 UX/,
  /DEC-048/,
  /DEC-049/,
];

assertTextHasAll(appJs, growthAuthorityBoundaryEvidence);
assertTextHasAll(growthPanels, growthPanelAuthorityEvidence);
assertTextHasAll(growthConfig, growthModuleBoundaryEvidence);
assertTextHasAll(growthLearning, growthLearningModuleEvidence);
assertTextHasAll(personalizationSnapshot, personalizationSnapshotModuleEvidence);
assertTextHasAll(preferenceConfig, preferenceConfigModuleEvidence);
assertTextHasAll(contracts, knowledgeWorkContractEvidence);
assertTextHasAll(knowledgeWorkPack, knowledgeWorkPackEvidence);
assertTextHasAll(masterBrief, masterBriefKnowledgeWorkEvidence);
assertTextHasAll(decisionLog, decisionLogKnowledgeWorkEvidence);
assertTextHasAll(architectureRoadmap, architectureRoadmapKnowledgeWorkEvidence);
assertTextHasAll(agents, agentsKnowledgeWorkEvidence);
assertTextHasAll(referenceAudit, referenceAuditEvidence);

console.log(
  JSON.stringify(
    {
      ok: true,
      readmeScopeEvidence: {
        smokeFileCount,
        qaSliceFileCount,
        uiSmokeFileCount,
        packageJsonPresent: fs.existsSync(path.join(repoRoot, 'package.json')),
        envExamplePresent: fs.existsSync(path.join(repoRoot, '.env.example')),
      },
    },
    null,
    2,
  ),
);
