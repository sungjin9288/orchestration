import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countScripts(predicate) {
  return fs.readdirSync(path.join(repoRoot, 'scripts')).filter(predicate).length;
}

const inventory = read('docs/22_completion-gate-inventory.md');
const readme = read('README.md');
const verificationStatus = read('scripts/verification_status.mjs');
const uiQaStatus = read('scripts/ui_qa_status.mjs');

const smokeFileCount = countScripts((name) => /^smoke-.*\.mjs$/.test(name));
const uiSmokeFileCount = countScripts((name) => /^smoke-ui-slice-.*\.mjs$/.test(name));

function assertInventoryHas(pattern) {
  assert.match(inventory, pattern);
}

function assertInventoryDoesNotHave(pattern) {
  assert.doesNotMatch(inventory, pattern);
}

function assertReadmeHas(pattern) {
  assert.match(readme, pattern);
}

const inventoryGateRows = [
  /Starting head checked before this inventory edit: `965a35b`/,
  /Planning baseline head checked before this document update: `965a35b`/,
  /\| Required aggregate synthetic gate \| pass \| `node scripts\/verification_status\.mjs` \| Current worktree returns `ok=true`: required `1\/1` passes; informational `247\/308` pass and `61` non-blocking readiness\/status checks fail; total passed is `248\/309`\. \| Keep the required docs\/runtime aggregate gate authoritative; track informational readiness gaps separately and do not report them as passed\. \|/,
  /\| UI QA synthetic gate \| pass \| `node scripts\/ui_qa_status\.mjs` \| Current-worktree required `92\/92` pass; the optional port-4315 snapshot check is informationally skipped\. \| Keep snapshot reachability optional unless that UI server is intentionally started\. \|/,
  /\| Completion gate inventory current evidence \| pass \| `node scripts\/smoke-completion-gate-inventory-current-evidence\.mjs`, `node scripts\/verification_status\.mjs` \| Current worktree inventory is pinned to aggregate required `1\/1`, informational `247\/308` pass with `61` non-blocking failures, total `248\/309` pass, UI QA `92\/92`, zero unchecked task lines, AI Company implementation through DEC-221, and Stage 6C planning through DEC-223\. \| Keep this smoke in aggregate so required versus informational results do not drift behind README, UI QA, or growth routing evidence\. \|/,
  /\| AI Company Reviewer re-execution planning \| pass \| `DEC-204`, `DEC-205`, `docs\/139_ai-company-reviewer-reexecution-plan\.md`, `docs\/140_ai-company-reviewer-reexecution-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-reviewer-reexecution-planning\.mjs` \|/,
  /\| AI Company Reviewer re-execution implementation \| pass \| `DEC-206`, `src\/runtime\/reviewer-reexecution\.js`, `node scripts\/smoke-ai-company-reviewer-reexecution\.mjs`, `node scripts\/smoke-ui-slice-709\.mjs` \|/,
  /\| AI Company rework QA execution planning \| pass \| `DEC-207`, `DEC-208`, `docs\/141_ai-company-rework-qa-execution-plan\.md`, `docs\/142_ai-company-rework-qa-execution-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-rework-qa-execution-planning\.mjs` \|/,
  /\| vNext proposal generation decision packet \| pass \| `docs\/40_proposal-generation-decision-packet\.md`, `node scripts\/vnext-proposal-generation-decision-packet-status\.mjs` \|/,
  /\| vNext proposal generation operator decision handoff \| pass \| `docs\/41_proposal-generation-operator-decision-handoff\.md`, `node scripts\/vnext-proposal-generation-operator-decision-handoff-status\.mjs` \|/,
  /\| vNext proposal generation planning plan \| pass \| `docs\/42_proposal-generation-planning-plan\.md`, `node scripts\/vnext-proposal-generation-planning-plan-status\.mjs` \|/,
  /\| vNext proposal generation implementation \| pass \| `docs\/43_proposal-generation-implementation\.md`, `node scripts\/smoke-deterministic-proposal-draft-generation\.mjs`, `node scripts\/vnext-proposal-generation-implementation-status\.mjs` \|/,
  /\| vNext proposal draft human review \| pass \| `docs\/44_proposal-draft-human-review\.md`, `node scripts\/smoke-proposal-draft-human-review\.mjs`, `node scripts\/vnext-proposal-draft-human-review-status\.mjs` \|/,
  /\| vNext proposal draft human review decision packet \| pass \| `docs\/45_proposal-draft-human-review-decision-packet\.md`, `node scripts\/vnext-proposal-draft-human-review-decision-packet-status\.mjs` \|/,
  /\| vNext proposal draft human review evidence decision \| pass \| `docs\/46_proposal-draft-human-review-evidence-decision\.md`, `node scripts\/vnext-proposal-draft-human-review-evidence-decision-status\.mjs` \|/,
  /\| vNext proposal draft downstream authority decision packet \| pass \| `docs\/47_proposal-draft-downstream-authority-decision-packet\.md`, `node scripts\/vnext-proposal-draft-downstream-authority-decision-packet-status\.mjs` \|/,
  /\| AI Company runtime blueprint planning \| pass \| `docs\/52_ai-company-runtime-blueprint-implementation-plan\.md`, `docs\/53_ai-company-runtime-blueprint-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-runtime-blueprint-planning\.mjs` \|/,
  /\| AI Company runtime blueprint implementation \| pass \| `company\/blueprint\.json`, `company\/roles\/\*\.md`, `src\/runtime\/company-blueprint\.js`, `node scripts\/smoke-ai-company-runtime-blueprint\.mjs` \|/,
  /\| AI Company Real Council planning \| pass \| `docs\/54_ai-company-real-council-implementation-plan\.md`, `docs\/55_ai-company-real-council-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-real-council-planning\.mjs` \|/,
  /\| AI Company Real Council implementation \| pass \| `src\/runtime\/council-sessions\.js`, `src\/execution\/council-coordinator\.js`, `src\/execution\/providers\/council-local-stub-adapter\.js`, `node scripts\/smoke-ai-company-real-council\.mjs`, `node scripts\/smoke-ui-slice-651\.mjs` \|/,
  /\| AI Company Council live-provider implementation \| pass \| `DEC-085`, `node scripts\/smoke-ai-company-council-live-provider\.mjs`, `node scripts\/smoke-ui-slice-652\.mjs`, optional `node scripts\/smoke-ai-company-council-live-provider-live\.mjs` \|/,
  /\| AI Company Mission compiler and inert WorkOrder planning \| pass \| `docs\/58_ai-company-mission-workorder-compiler-implementation-plan\.md`, `docs\/59_ai-company-mission-workorder-compiler-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-mission-workorder-compiler-planning\.mjs` \|/,
  /\| AI Company Mission compiler and inert WorkOrder implementation \| pass \| `DEC-088`, `src\/runtime\/mission-workorder-compiler\.js`, `node scripts\/smoke-ai-company-mission-workorder-compiler\.mjs`, `node scripts\/smoke-ui-slice-653\.mjs` \|/,
  /\| AI Company WorkOrder persistence and sequential execution planning \| pass \| `docs\/60_ai-company-workorder-persistence-execution-plan\.md`, `docs\/61_ai-company-workorder-persistence-execution-decision-handoff\.md`, `node scripts\/smoke-ai-company-workorder-persistence-execution-planning\.mjs` \|/,
  /\| AI Company WorkOrder persistence and sequential execution implementation \| pass \| `DEC-091`, `node scripts\/smoke-ai-company-workorder-persistence-execution\.mjs`, `node scripts\/smoke-ui-slice-654\.mjs` \|/,
  /\| AI Company reviewed-delivery planning \| pass \| `docs\/62_ai-company-reviewed-delivery-planning-plan\.md`, `docs\/63_ai-company-reviewed-delivery-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-reviewed-delivery-planning\.mjs` \|/,
  /\| AI Company reviewed-delivery implementation \| pass \| `DEC-094`, `src\/execution\/qa-node-check-runner\.js`, `node scripts\/smoke-ai-company-reviewed-delivery\.mjs`, `node scripts\/smoke-ui-slice-655\.mjs` \|/,
  /\| AI Company checkpoint resume and recovery implementation \| pass \| `DEC-097`, `docs\/64_ai-company-checkpoint-resume-recovery-plan\.md`, `node scripts\/smoke-ai-company-checkpoint-resume-recovery\.mjs`, `node scripts\/smoke-ui-slice-656\.mjs` \|/,
  /\| AI Company durable DeliveryPackage persistence planning \| pass \| `docs\/66_ai-company-durable-delivery-package-persistence-plan\.md`, `docs\/67_ai-company-durable-delivery-package-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-delivery-package-planning\.mjs` \|/,
  /\| AI Company durable DeliveryPackage persistence implementation \| pass \| `DEC-100`, `node scripts\/smoke-ai-company-durable-delivery-package\.mjs`, `node scripts\/smoke-ui-slice-657\.mjs` \|/,
  /\| AI Company DeliveryPackage acceptance planning \| pass \| `docs\/68_ai-company-delivery-package-acceptance-plan\.md`, `docs\/69_ai-company-delivery-package-acceptance-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-delivery-package-acceptance-planning\.mjs` \|/,
  /\| AI Company DeliveryPackage acceptance implementation \| pass \| `DEC-103`, `node scripts\/smoke-ai-company-delivery-package-acceptance\.mjs`, `node scripts\/smoke-ui-slice-658\.mjs` \|/,
  /\| AI Company Mission and task close-out planning \| pass \| `docs\/70_ai-company-mission-task-close-out-plan\.md`, `docs\/71_ai-company-mission-task-close-out-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-mission-task-close-out-planning\.mjs` \|/,
  /\| AI Company Mission and task close-out implementation \| pass \| `DEC-106`, `node scripts\/smoke-ai-company-mission-task-close-out\.mjs`, `node scripts\/smoke-ui-slice-659\.mjs` \|/,
  /\| AI Company LearningCandidate preview planning \| pass \| `docs\/72_ai-company-learning-candidate-preview-plan\.md`, `docs\/73_ai-company-learning-candidate-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-learning-candidate-preview-planning\.mjs` \|/,
  /\| AI Company LearningCandidate preview implementation \| pass \| `DEC-109`, `src\/runtime\/file-store\.js`, `src\/runtime\/learning-candidate-preview\.js`, `node scripts\/smoke-ai-company-learning-candidate-preview\.mjs`, `node scripts\/smoke-ui-slice-660\.mjs` \|/,
  /\| AI Company durable LearningCandidate persistence planning \| pass \| `docs\/74_ai-company-durable-learning-candidate-persistence-plan\.md`, `docs\/75_ai-company-durable-learning-candidate-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-learning-candidate-planning\.mjs` \|/,
  /\| AI Company durable LearningCandidate persistence implementation \| pass \| `DEC-112`, `src\/runtime\/learning-candidates\.js`, `node scripts\/smoke-ai-company-durable-learning-candidate\.mjs`, `node scripts\/smoke-ui-slice-661\.mjs` \|/,
  /\| AI Company LearningCandidate review outcome planning \| pass \| `docs\/76_ai-company-learning-candidate-review-outcome-plan\.md`, `docs\/77_ai-company-learning-candidate-review-outcome-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-learning-candidate-review-outcome-planning\.mjs` \|/,
  /\| AI Company LearningCandidate review outcome implementation \| pass \| `DEC-115`, `src\/runtime\/learning-candidate-reviews\.js`, `node scripts\/smoke-ai-company-learning-candidate-review-outcome\.mjs`, `node scripts\/smoke-ui-slice-662\.mjs` \|/,
  /\| AI Company MemoryCandidate preview planning \| pass \| `docs\/78_ai-company-memory-candidate-preview-plan\.md`, `docs\/79_ai-company-memory-candidate-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-memory-candidate-preview-planning\.mjs` \|/,
  /\| AI Company MemoryCandidate preview implementation \| pass \| `DEC-118`, `src\/runtime\/memory-candidate-preview\.js`, `node scripts\/smoke-ai-company-memory-candidate-preview\.mjs`, `node scripts\/smoke-ui-slice-663\.mjs` \|/,
  /\| AI Company durable MemoryItem persistence \| pass \| `docs\/80_ai-company-durable-memory-item-persistence-plan\.md`, `docs\/81_ai-company-durable-memory-item-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-memory-item-planning\.mjs`, `node scripts\/smoke-ai-company-durable-memory-item\.mjs`, `node scripts\/smoke-ui-slice-664\.mjs` \|/,
  /\| AI Company MemoryRecall preview planning \| pass \| `docs\/82_ai-company-memory-recall-preview-plan\.md`, `docs\/83_ai-company-memory-recall-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-memory-recall-preview-planning\.mjs` \|/,
  /\| AI Company MemoryRecall preview implementation \| pass \| `DEC-124`, `src\/runtime\/memory-recall-preview\.js`, `node scripts\/smoke-ai-company-memory-recall-preview\.mjs`, `node scripts\/smoke-ui-slice-665\.mjs` \|/,
  /\| AI Company durable MemoryRecall persistence planning \| pass \| `docs\/84_ai-company-durable-memory-recall-persistence-plan\.md`, `docs\/85_ai-company-durable-memory-recall-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-memory-recall-planning\.mjs` \|/,
  /\| AI Company durable MemoryRecall persistence implementation \| pass \| `DEC-127`, `src\/runtime\/memory-recalls\.js`, `node scripts\/smoke-ai-company-durable-memory-recall\.mjs`, `node scripts\/smoke-ui-slice-666\.mjs` \|/,
  /\| AI Company Mission memory context preview planning \| pass \| `docs\/86_ai-company-mission-memory-context-preview-plan\.md`, `docs\/87_ai-company-mission-memory-context-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-mission-memory-context-preview-planning\.mjs` \|/,
  /\| AI Company Mission memory context preview implementation \| pass \| `DEC-130`, `src\/runtime\/mission-memory-context-preview\.js`, `node scripts\/smoke-ai-company-mission-memory-context-preview\.mjs`, `node scripts\/smoke-ui-slice-667\.mjs` \|/,
  /\| WorkOrder verification plan preview \| pass \| `DEC-131`, `docs\/88_external-pattern-native-adoption-plan\.md`, `node scripts\/smoke-ai-company-workorder-verification-plan-preview\.mjs`, `node scripts\/smoke-ui-slice-668\.mjs` \|/,
  /\| Runtime state transaction guard \| pass \| `DEC-132`, `src\/runtime\/file-store\.js`, `node scripts\/smoke-state-transaction-guard\.mjs` \|/,
  /\| AcceptanceCriterion and VerificationProof ledger \| pass \| `DEC-133`, `src\/runtime\/acceptance-criteria\.js`, `src\/runtime\/verification-proofs\.js`, `node scripts\/smoke-ai-company-acceptance-criterion-proof\.mjs`, `node scripts\/smoke-ui-slice-669\.mjs` \|/,
  /\| Bounded continuation preview \| pass \| `DEC-134`, `src\/runtime\/execution-continuation-preview\.js`, `node scripts\/smoke-ai-company-bounded-continuation\.mjs`, `node scripts\/smoke-ui-slice-670\.mjs` \|/,
  /\| Optional wigolo exact fetch \| pass \| `DEC-135`, `src\/research\/wigolo-exact-fetch-adapter\.js`, `node scripts\/smoke-wigolo-exact-fetch-adapter\.mjs`, `node scripts\/smoke-wigolo-exact-fetch-live\.mjs` \|/,
  /\| Context budget telemetry \| pass \| `DEC-136`, `src\/runtime\/context-budget-telemetry\.js`, `node scripts\/smoke-context-budget-telemetry\.mjs` \|/,
  /\| LLM-native primary shell \| pass \| `DEC-137`, `DESIGN\.md`, `node scripts\/smoke-ui-slice-671\.mjs`, `node scripts\/ui_qa_status\.mjs` \|/,
  /\| Mission evidence graph Phase 2 \| pass \| `DEC-138`, `docs\/89_mission-evidence-graph-phase-2-plan\.md`, `node scripts\/smoke-ai-company-mission-evidence-graph\.mjs`, `node scripts\/smoke-ui-slice-672\.mjs` \|/,
  /\| Mission evidence graph Phase 3 exploration \| pass \| `DEC-139`, `docs\/90_mission-evidence-graph-exploration-phase-3-plan\.md`, `node scripts\/smoke-ui-slice-673\.mjs` \|/,
  /\| LLM-native active Mission focus \| pass \| `DEC-140`, `docs\/91_llm-native-active-mission-focus-plan\.md`, `node scripts\/smoke-ui-slice-674\.mjs` \|/,
  /\| LLM-native Mission mode control \| pass \| `DEC-141`, `docs\/92_llm-native-mission-mode-control-plan\.md`, `node scripts\/smoke-ui-slice-675\.mjs` \|/,
  /\| LLM-native first-run project connection \| pass \| `DEC-142`, `docs\/93_llm-native-first-run-project-connection-plan\.md`, `node scripts\/smoke-ui-slice-676\.mjs` \|/,
  /\| LLM-native source-backed Mission thread \| pass \| `DEC-143`, `docs\/94_llm-native-source-backed-mission-thread-plan\.md`, `node scripts\/smoke-ui-slice-677\.mjs` \|/,
  /\| LLM-native source-backed Council meeting \| pass \| `DEC-144`, `docs\/95_llm-native-source-backed-council-meeting-plan\.md`, `node scripts\/smoke-ui-slice-678\.mjs` \|/,
  /\| LLM-native source-backed Execution flow \| pass \| `DEC-145`, `docs\/96_llm-native-source-backed-execution-flow-plan\.md`, `node scripts\/smoke-ui-slice-679\.mjs` \|/,
  /\| LLM-native source-backed Deliverables flow \| pass \| `DEC-146`, `docs\/97_llm-native-source-backed-deliverables-flow-plan\.md`, `node scripts\/smoke-ui-slice-680\.mjs` \|/,
  /\| LLM-native Advanced Ops navigation \| pass \| `DEC-147`, `docs\/98_llm-native-advanced-ops-navigation-plan\.md`, `node scripts\/smoke-ui-slice-681\.mjs` \|/,
  /\| LLM-native Mission history navigation \| pass \| `DEC-148`, `docs\/99_llm-native-mission-history-navigation-plan\.md`, `node scripts\/smoke-ui-slice-682\.mjs` \|/,
  /\| LLM-native Workspace Header \| pass \| `DEC-149`, `docs\/100_llm-native-workspace-header-plan\.md`, `node scripts\/smoke-ui-slice-683\.mjs` \|/,
  /\| LLM-native mobile navigation \| pass \| `DEC-150`, `docs\/101_llm-native-mobile-navigation-plan\.md`, `node scripts\/smoke-ui-slice-684\.mjs` \|/,
  /\| LLM-native sparse Mission Graph density \| pass \| `DEC-151`, `docs\/102_llm-native-sparse-mission-graph-density-plan\.md`, `node scripts\/smoke-ui-slice-685\.mjs` \|/,
  /\| LLM-native mobile Mission title readability \| pass \| `DEC-152`, `docs\/103_llm-native-mobile-mission-title-readability-plan\.md`, `node scripts\/smoke-ui-slice-686\.mjs` \|/,
  /\| LLM-native unchanged snapshot refresh \| pass \| `DEC-153`, `docs\/104_llm-native-unchanged-snapshot-refresh-plan\.md`, `node scripts\/smoke-ui-slice-687\.mjs` \|/,
  /\| LLM-native desktop workspace focus offset \| pass \| `DEC-154`, `docs\/105_llm-native-desktop-workspace-focus-offset-plan\.md`, `node scripts\/smoke-ui-slice-688\.mjs` \|/,
  /\| LLM-native Advanced Ops secondary overview placement \| pass \| `DEC-155`, `docs\/106_llm-native-advanced-ops-overview-placement-plan\.md`, `node scripts\/smoke-ui-slice-689\.mjs` \|/,
  /\| LLM-native Mission next-gate navigation \| pass \| `DEC-156`, `docs\/107_llm-native-mission-next-gate-navigation-plan\.md`, `node scripts\/smoke-ui-slice-690\.mjs` \|/,
  /\| LLM-native primary workstream language \| pass \| `DEC-157`, `docs\/108_llm-native-primary-workstream-language-plan\.md`, `node scripts\/smoke-ui-slice-691\.mjs` \|/,
  /\| Task execution provenance graph \| pass \| `DEC-158`, `docs\/109_task-execution-provenance-graph-plan\.md`, `node scripts\/smoke-ai-company-execution-provenance-graph\.mjs`, `node scripts\/smoke-ui-slice-692\.mjs` \|/,
  /\| LLM-native visual-system convergence \| pass \| `DEC-159`, `docs\/110_llm-native-visual-system-convergence-plan\.md`, `node scripts\/smoke-ui-slice-693\.mjs` \|/,
  /\| LLM-native first-viewport corrective redesign \| pass \| `DEC-160`, `docs\/111_llm-native-first-viewport-corrective-redesign-plan\.md`, `node scripts\/smoke-ui-slice-694\.mjs` \|/,
  /\| Agent Operations Desk visual redesign \| pass \| `DEC-161`, `docs\/112_agent-operations-desk-visual-redesign-plan\.md`, `node scripts\/smoke-ui-slice-695\.mjs` \|/,
  /\| AI Company multi-agent completion planning \| pass \| `DEC-162`, `DEC-163`, `DEC-164`, `DEC-165`, `DEC-166`, `docs\/113_ai-company-multi-agent-completion-plan\.md`, `docs\/114_ai-company-durable-staffing-plan-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-multi-agent-completion-planning\.mjs` \|/,
  /\| AI Company durable StaffingPlan implementation \| pass \| `DEC-166`, `src\/runtime\/staffing-plans\.js`, `src\/runtime\/company-blueprint\.js`, `node scripts\/smoke-ai-company-durable-staffing-plan\.mjs`, `node scripts\/smoke-ui-slice-696\.mjs` \|/,
  /\| AI Company StaffingEntry Council binding implementation \| pass \| `DEC-167`, `DEC-168`, `DEC-169`, `docs\/115_ai-company-staffing-entry-binding-plan\.md`, `docs\/116_ai-company-staffing-entry-binding-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-staffing-entry-binding-planning\.mjs`, `node scripts\/smoke-ai-company-staffing-entry-binding\.mjs`, `node scripts\/smoke-ui-slice-697\.mjs` \|/,
  /\| AI Company operator-stepped WorkOrder scheduler implementation \| pass \| `DEC-170`, `DEC-171`, `DEC-172`, `docs\/117_ai-company-operator-stepped-workorder-scheduler-plan\.md`, `docs\/118_ai-company-operator-stepped-workorder-scheduler-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-operator-stepped-workorder-scheduler-planning\.mjs`, `node scripts\/smoke-ai-company-operator-stepped-workorder-scheduler\.mjs`, `node scripts\/smoke-ui-slice-698\.mjs` \|/,
  /\| AI Company bounded parallel read-only specialists planning \| pass \| `DEC-173`, `DEC-174`, `DEC-175`, `docs\/119_ai-company-bounded-parallel-read-only-specialists-plan\.md`, `docs\/120_ai-company-specialist-batch-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-bounded-parallel-read-only-specialists-planning\.mjs` \|/,
  /\| AI Company SpecialistBatchPreview implementation \| pass \| `DEC-176`, `src\/runtime\/specialist-batch-preview\.js`, `node scripts\/smoke-ai-company-specialist-batch-preview\.mjs`, `node scripts\/smoke-ui-slice-699\.mjs` \|/,
  /\| AI Company durable SpecialistBatch planning \| pass \| `DEC-177`, `DEC-178`, `docs\/121_ai-company-durable-specialist-batch-plan\.md`, `docs\/122_ai-company-durable-specialist-batch-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-specialist-batch-planning\.mjs` \|/,
  /\| AI Company SpecialistCellRetry planning \| pass \| `DEC-180`, `DEC-181`, `docs\/123_ai-company-specialist-cell-retry-plan\.md`, `docs\/124_ai-company-specialist-cell-retry-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-specialist-cell-retry-planning\.mjs` \|/,
  /\| AI Company SpecialistCellRetry implementation \| pass \| `DEC-182`, `src\/runtime\/specialist-cell-retries\.js`, `src\/execution\/specialist-cell-retry-coordinator\.js`, `node scripts\/smoke-ai-company-specialist-cell-retry\.mjs`, `node scripts\/smoke-ui-slice-701\.mjs` \|/,
  /\| AI Company OpsSupervisionPreview planning \| pass \| `DEC-183`, `DEC-184`, `docs\/125_ai-company-ops-supervision-preview-plan\.md`, `docs\/126_ai-company-ops-supervision-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-ops-supervision-preview-planning\.mjs` \|/,
  /\| AI Company OpsSupervisionPreview implementation \| pass \| `DEC-185`, `src\/runtime\/ops-supervision-preview\.js`, `node scripts\/smoke-ai-company-ops-supervision-preview\.mjs`, `node scripts\/smoke-ui-slice-702\.mjs` \|/,
  /\| AI Company ReviewerReworkPlanPreview planning \| pass \| `DEC-186`, `DEC-187`, `docs\/127_ai-company-reviewer-rework-preview-plan\.md`, `docs\/128_ai-company-reviewer-rework-preview-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-reviewer-rework-preview-planning\.mjs` \|/,
  /\| AI Company ReviewerReworkPlanPreview implementation \| pass \| `DEC-188`, `src\/runtime\/reviewer-rework-preview\.js`, `node scripts\/smoke-ai-company-reviewer-rework-preview\.mjs`, `node scripts\/smoke-ui-slice-703\.mjs` \|/,
  /\| AI Company durable Reviewer ReworkPlan planning \| pass \| `DEC-189`, `DEC-190`, `docs\/129_ai-company-durable-reviewer-rework-plan\.md`, `docs\/130_ai-company-durable-reviewer-rework-plan-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-reviewer-rework-plan-planning\.mjs` \|/,
  /\| AI Company durable Reviewer ReworkPlan implementation \| pass \| `DEC-191`, `src\/runtime\/rework-plans\.js`, `node scripts\/smoke-ai-company-durable-reviewer-rework-plan\.mjs`, `node scripts\/smoke-ui-slice-704\.mjs` \|/,
  /\| AI Company ReworkPlanAcceptance planning \| pass \| `DEC-192`, `DEC-193`, `docs\/131_ai-company-rework-plan-acceptance-plan\.md`, `docs\/132_ai-company-rework-plan-acceptance-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-rework-plan-acceptance-planning\.mjs` \|/,
  /\| AI Company ReworkPlanAcceptance implementation \| pass \| `DEC-194`, `src\/runtime\/rework-plan-acceptances\.js`, `node scripts\/smoke-ai-company-rework-plan-acceptance\.mjs`, `node scripts\/smoke-ui-slice-705\.mjs` \|/,
  /\| AI Company Builder rework preflight implementation \| pass \| `DEC-197`, `src\/runtime\/builder-rework-dispatches\.js`, `node scripts\/smoke-ai-company-builder-rework-preflight\.mjs`, `node scripts\/smoke-ui-slice-706\.mjs` \|/,
  /\| AI Company Builder rework mutation Approval planning \| pass \| `DEC-198`, `DEC-199`, `docs\/135_ai-company-builder-rework-mutation-approval-plan\.md`, `docs\/136_ai-company-builder-rework-mutation-approval-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-builder-rework-mutation-approval-planning\.mjs` \|/,
  /\| AI Company Builder rework mutation Approval implementation \| pass \| `DEC-200`, `src\/runtime\/builder-rework-mutation-approvals\.js`, `node scripts\/smoke-ai-company-builder-rework-mutation-approval\.mjs`, `node scripts\/smoke-ui-slice-707\.mjs` \|/,
  /\| AI Company Builder rework source mutation planning \| pass \| `DEC-201`, `DEC-202`, `docs\/137_ai-company-builder-rework-source-mutation-plan\.md`, `docs\/138_ai-company-builder-rework-source-mutation-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-builder-rework-source-mutation-planning\.mjs` \|/,
  /\| AI Company Builder rework source mutation implementation \| pass \| `DEC-203`, `src\/runtime\/builder-rework-source-mutations\.js`, `node scripts\/smoke-ai-company-builder-rework-source-mutation\.mjs`, `node scripts\/smoke-ui-slice-708\.mjs` \|/,
  /\| AI Company rework QA execution implementation \| pass \| `DEC-209`, `src\/runtime\/rework-qa-execution\.js`, `node scripts\/smoke-ai-company-rework-qa-execution\.mjs`, `node scripts\/smoke-ui-slice-710\.mjs` \|/,
  /\| AI Company rework DeliveryPackage preview implementation \| pass \| `DEC-210`, `DEC-211`, `DEC-212`, `src\/runtime\/rework-delivery-package-preview\.js`, `node scripts\/smoke-ai-company-rework-delivery-package-preview\.mjs`, `node scripts\/smoke-ui-slice-711\.mjs` \|/,
  /\| AI Company durable Rework DeliveryPackage planning \| pass \| `DEC-213`, `DEC-214`, `docs\/145_ai-company-durable-rework-delivery-package-plan\.md`, `docs\/146_ai-company-durable-rework-delivery-package-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-durable-rework-delivery-package-planning\.mjs` \|/,
  /\| AI Company durable Rework DeliveryPackage implementation \| pass \| `DEC-215`, `src\/runtime\/rework-delivery-packages\.js`, `node scripts\/smoke-ai-company-durable-rework-delivery-package\.mjs`, `node scripts\/smoke-ui-slice-712\.mjs` \|/,
  /\| AI Company ReworkDeliveryPackage acceptance planning \| pass \| `DEC-216`, `DEC-217`, `docs\/147_ai-company-rework-delivery-package-acceptance-plan\.md`, `docs\/148_ai-company-rework-delivery-package-acceptance-implementation-decision-handoff\.md`, `node scripts\/smoke-ai-company-rework-delivery-package-acceptance-planning\.mjs` \|/,
  /\| AI Company ReworkDeliveryPackage acceptance implementation \| pass \| `DEC-218`, `src\/runtime\/rework-delivery-package-acceptances\.js`, `node scripts\/smoke-ai-company-rework-delivery-package-acceptance\.mjs`, `node scripts\/smoke-ui-slice-713\.mjs` \|/,
  /The required implementation baseline is current through `DEC-218`\.[\s\S]*Planning-only `DEC-210`, handoff-only `DEC-211`, and implementation `DEC-212` define one[\s\S]*Planning-only `DEC-213`, handoff-only `DEC-214`, and implementation `DEC-215` define one schema-v25[\s\S]*Planning-only `DEC-216`, handoff-only `DEC-217`, and implementation `DEC-218` define one schema-v26/,
  /Planning-only `DEC-198` and handoff-only `DEC-199` define Stage 5E as one existing task-owned[\s\S]*`DEC-200` implements the\s+dedicated source-bound wrappers[\s\S]*Builder source mutation remains closed/,
  /Planning-only `DEC-201`, handoff-only `DEC-202`, and implementation `DEC-203` define one dedicated[\s\S]*before Reviewer\/QA/,
];

const lifecycleAliasEvidence = [
  /Growth status and reflection now route the zero-open baseline through the short read-only alias `growth-evidence-ledger-proposal-record-lifecycle-review`/,
  /preserve the longer repeated route as `sourceCandidate` evidence/,
  /growth engine routing now keeps the next default vNext workstream on\s+`growth-evidence-ledger-proposal-record-lifecycle-review`/,
  /Maintain the alias unless engine or reflection evidence drifts/i,
];

const staleInventoryEvidence = [
  /informational `161\/161`; total `162\/162`/,
  /required `27\/27`/,
  /after the 1916 short-alias/,
];

for (const pattern of inventoryGateRows) {
  assertInventoryHas(pattern);
}

for (const pattern of lifecycleAliasEvidence) {
  assertInventoryHas(pattern);
}

for (const pattern of staleInventoryEvidence) {
  assertInventoryDoesNotHave(pattern);
}

assertReadmeHas(new RegExp(`${smokeFileCount} smoke files`));
assertReadmeHas(new RegExp(`${uiSmokeFileCount} UI smoke files`));
assert.match(verificationStatus, /completion-gate-inventory-current-evidence/);
assert.match(verificationStatus, /smoke-completion-gate-inventory-current-evidence\.mjs/);
assert.match(verificationStatus, /ai-company-workorder-persistence-execution-planning/);
assert.match(verificationStatus, /ai-company-workorder-persistence-execution-implementation/);
assert.match(verificationStatus, /ai-company-reviewed-delivery-planning/);
assert.match(verificationStatus, /ai-company-reviewed-delivery-implementation/);
assert.match(verificationStatus, /ai-company-reviewed-delivery-ui-api/);
assert.match(verificationStatus, /ai-company-checkpoint-resume-recovery-planning/);
assert.match(verificationStatus, /ai-company-checkpoint-resume-recovery-implementation/);
assert.match(verificationStatus, /ai-company-checkpoint-resume-recovery-ui-api/);
assert.match(verificationStatus, /ai-company-durable-delivery-package-planning/);
assert.match(verificationStatus, /ai-company-durable-delivery-package-implementation/);
assert.match(verificationStatus, /ai-company-durable-delivery-package-ui-api/);
assert.match(verificationStatus, /ai-company-delivery-package-acceptance-planning/);
assert.match(verificationStatus, /ai-company-delivery-package-acceptance-implementation/);
assert.match(verificationStatus, /ai-company-delivery-package-acceptance-ui-api/);
assert.match(verificationStatus, /ai-company-mission-task-close-out-planning/);
assert.match(verificationStatus, /ai-company-mission-task-close-out-implementation/);
assert.match(verificationStatus, /ai-company-mission-task-close-out-ui-api/);
assert.match(verificationStatus, /ai-company-learning-candidate-preview-planning/);
assert.match(verificationStatus, /ai-company-learning-candidate-preview-implementation/);
assert.match(verificationStatus, /ai-company-learning-candidate-preview-ui-api/);
assert.match(verificationStatus, /ai-company-durable-learning-candidate-planning/);
assert.match(verificationStatus, /ai-company-durable-learning-candidate-implementation/);
assert.match(verificationStatus, /ai-company-durable-learning-candidate-ui-api/);
assert.match(verificationStatus, /ai-company-learning-candidate-review-outcome-planning/);
assert.match(verificationStatus, /ai-company-learning-candidate-review-outcome-implementation/);
assert.match(verificationStatus, /ai-company-learning-candidate-review-outcome-ui-api/);
assert.match(verificationStatus, /ai-company-memory-candidate-preview-planning/);
assert.match(verificationStatus, /ai-company-memory-candidate-preview-implementation/);
assert.match(verificationStatus, /ai-company-memory-candidate-preview-ui-api/);
assert.match(verificationStatus, /ai-company-durable-memory-item-planning/);
assert.match(verificationStatus, /ai-company-memory-recall-preview-planning/);
assert.match(verificationStatus, /ai-company-memory-recall-preview-implementation/);
assert.match(verificationStatus, /ai-company-memory-recall-preview-ui-api/);
assert.match(verificationStatus, /ai-company-durable-memory-recall-planning/);
assert.match(verificationStatus, /ai-company-durable-memory-recall-implementation/);
assert.match(verificationStatus, /ai-company-durable-memory-recall-ui-api/);
assert.match(verificationStatus, /ai-company-mission-memory-context-preview-planning/);
assert.match(verificationStatus, /ai-company-mission-memory-context-preview-implementation/);
assert.match(verificationStatus, /ai-company-mission-memory-context-preview-ui-api/);
assert.match(uiQaStatus, /smoke-ui-slice-651\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-652\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-653\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-654\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-655\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-656\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-657\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-658\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-659\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-660\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-661\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-662\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-663\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-664\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-665\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-666\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-668\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-669\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-670\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-671\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-672\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-673\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-674\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-675\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-676\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-677\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-678\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-679\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-680\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-681\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-682\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-683\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-684\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-685\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-686\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-687\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-688\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-689\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-690\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-691\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-692\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-693\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-694\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-695\.mjs/);
assert.match(verificationStatus, /smoke-state-transaction-guard\.mjs/);
assert.match(verificationStatus, /smoke-wigolo-exact-fetch-adapter\.mjs/);
assert.match(verificationStatus, /smoke-context-budget-telemetry\.mjs/);
assert.match(verificationStatus, /smoke-ai-company-mission-evidence-graph\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-672\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-673\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-674\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-675\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-676\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-677\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-678\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-679\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-680\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-681\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-682\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-683\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-684\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-685\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-686\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-687\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-688\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-689\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-690\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-691\.mjs/);
assert.match(verificationStatus, /smoke-ai-company-execution-provenance-graph\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-692\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-693\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-694\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-695\.mjs/);
assert.match(verificationStatus, /smoke-ai-company-multi-agent-completion-planning\.mjs/);
assert.match(verificationStatus, /smoke-ai-company-durable-staffing-plan\.mjs/);
assert.match(verificationStatus, /smoke-ai-company-staffing-entry-binding-planning\.mjs/);
assert.match(verificationStatus, /smoke-ai-company-staffing-entry-binding\.mjs/);
assert.match(
  verificationStatus,
  /smoke-ai-company-operator-stepped-workorder-scheduler-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-bounded-parallel-read-only-specialists-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-specialist-batch-preview\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-durable-specialist-batch-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-specialist-cell-retry-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-specialist-cell-retry\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-ops-supervision-preview\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-reviewer-rework-preview-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-reviewer-rework-preview\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-durable-reviewer-rework-plan-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-builder-rework-preflight-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-builder-rework-preflight\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-builder-rework-mutation-approval-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-reviewer-reexecution-planning\.mjs/,
);
assert.match(
  verificationStatus,
  /smoke-ai-company-ops-attempt-quarantine-planning\.mjs/,
);
assert.match(uiQaStatus, /smoke-ui-slice-696\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-697\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-698\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-699\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-700\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-701\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-702\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-703\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-704\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-705\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-706\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-707\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-708\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-709\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-710\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-712\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-713\.mjs/);
assert.match(uiQaStatus, /smoke-ui-slice-714\.mjs/);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: 'smoke-completion-gate-inventory-current-evidence',
      smokeFileCount,
      uiSmokeFileCount,
      aggregate: {
        required: '1/1',
        informational: '247/308',
        informationalFailed: 61,
        total: '248/309',
      },
    },
    null,
    2,
  )}\n`,
);
