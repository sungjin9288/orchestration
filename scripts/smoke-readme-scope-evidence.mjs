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
  /execution state is schema v15/,
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
  /docs\/22_completion-gate-inventory\.md/,
  /scripts\/smoke-completion-gate-inventory-current-evidence\.mjs/,
  /aggregate\s+registration, UI QA registration, zero-open backlog/,
  /defaultCompletionImplementationOpen=false/,
  /required `1\/1`, informational `229\/229`, total `230\/230`/,
  /UI QA is required `44\/44`/,
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
  /aggregate `230\/230`, UI QA `44\/44`, zero-open backlog/,
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
  /completion inventory counts,\s+aggregate `230\/230`, UI QA `44\/44`, zero-open backlog/,
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
  />지식 작업 \(knowledge-work\)<\/option>/,
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
