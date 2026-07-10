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

assert.match(readme, /PoC \/ MVP-quality local project/);
assert.match(readme, /local-first AI work operating system/);
assert.match(readme, /Mission \/ Council \/ Execution \/ Deliverables/);
assert.match(readme, /Taskboard \/ Logs \/ Artifacts \/ Decision Inbox/);
assert.match(readme, /Planning source files:/);
assert.match(readme, /docs\/06_ai-orchestration-pivot\.md/);
assert.match(readme, /packs\/development\/pack\.md/);
assert.match(readme, /minimal root `package\.json` is present for reviewer convenience/);
assert.match(readme, /root `\.env\.example` lists the optional live-provider variables/);
assert.match(readme, /No public hosted demo URL is verified/);
assert.match(readme, /no verified hosted public demo URL/);
assert.match(readme, /Current-head local API evidence was rechecked on 2026-06-23/);
assert.match(readme, /"plannerArtifactId": "artifact-0001"/);
assert.match(readme, /Reference-driven operator shell/);
assert.match(readme, /Read-only growth evidence/);
assert.match(readme, /Local-only personalization/);
assert.match(readme, /Advanced Ops harness evidence/);
assert.match(readme, /run action markup/);
assert.match(readme, /run action shelf markup/);
assert.match(readme, /operator action token label\/tone markup/);
assert.match(readme, /visible result packet markup/);
assert.match(readme, /visible header markup/);
assert.match(readme, /visible token row markup/);
assert.match(readme, /visible preview markup/);
assert.match(readme, /visible preview action markup/);
assert.match(readme, /visible input path action markup/);
assert.match(readme, /visible action shelf markup/);
assert.match(readme, /visible action shelf frame markup/);
assert.match(readme, /visible summary rack markup/);
assert.match(readme, /hidden preview markup/);
assert.match(readme, /hidden preview action markup/);
assert.match(readme, /hidden input path action markup/);
assert.match(readme, /hidden action shelf markup/);
assert.match(readme, /hidden action shelf frame markup/);
assert.match(readme, /hidden result packet markup/);
assert.match(readme, /hidden header markup/);
assert.match(readme, /hidden context sections markup/);
assert.match(readme, /hidden context title row markup/);
assert.match(readme, /hidden run context summary markup/);
assert.match(readme, /hidden harness context summary markup/);
assert.match(readme, /hidden operator context summary markup/);
assert.match(readme, /visible token label\/tone markup/);
assert.match(readme, /latest state token label\/tone markup/);
assert.match(readme, /hidden state token label\/tone markup/);
assert.match(readme, /history header markup/);
assert.match(readme, /history count token label\/tone markup/);
assert.match(readme, /output path copy/);
assert.match(readme, /history input path copy/);
assert.match(readme, /history path reuse\/rerun action markup/);
assert.match(readme, /history preview action markup/);
assert.match(readme, /history action shelf markup/);
assert.match(readme, /history action shelf frame markup/);
assert.match(readme, /history summary rack markup/);
assert.match(readme, /history summary rack frame markup/);
assert.match(readme, /history item register markup/);
assert.match(readme, /history item packet markup/);
assert.match(readme, /history restore preview/);
assert.match(readme, /execution packet copy/);
assert.match(readme, /output-brief copy/);
assert.match(readme, /policy-report copy/);
assert.match(readme, /hidden status summary fallback handoff/);
assert.match(readme, /node scripts\/smoke-ui-slice-305\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-306\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-310\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-329\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-331\.mjs/);
assert.match(readme, /`361`/);
assert.match(readme, /node scripts\/smoke-ui-slice-375\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-381\.mjs/);
assert.match(readme, /run action shelf markup handoff/);
assert.match(readme, /operator action token label\/tone markup handoff/);
assert.match(readme, /visible token label\/tone markup handoff/);
assert.match(readme, /visible header markup handoff/);
assert.match(readme, /visible token row markup handoff/);
assert.match(readme, /latest state token label\/tone markup handoff/);
assert.match(readme, /visible preview markup handoff/);
assert.match(readme, /visible preview action markup handoff/);
assert.match(readme, /visible input path action markup handoff/);
assert.match(readme, /visible summary rack markup handoff/);
assert.match(readme, /hidden preview action markup handoff/);
assert.match(readme, /hidden input path action markup handoff/);
assert.match(readme, /hidden header markup handoff/);
assert.match(readme, /hidden context sections markup handoff/);
assert.match(readme, /hidden context title row markup handoff/);
assert.match(readme, /hidden run context summary markup handoff/);
assert.match(readme, /hidden harness context summary markup handoff/);
assert.match(readme, /hidden operator context summary markup handoff/);
assert.match(readme, /history header markup handoff/);
assert.match(readme, /history count token label\/tone markup handoff/);
assert.match(readme, /history input path copy markup handoff/);
assert.match(readme, /history path reuse\/rerun action markup handoff/);
assert.match(readme, /history preview action markup handoff/);
assert.match(readme, /history action shelf markup handoff/);
assert.match(readme, /history action shelf frame markup handoff/);
assert.match(readme, /history summary rack markup handoff/);
assert.match(readme, /history summary rack frame markup handoff/);
assert.match(readme, /history item register markup handoff/);
assert.match(readme, /history item packet markup handoff/);
assert.match(readme, /visible result packet markup handoff/);
assert.match(readme, /execution\s+packet copy fallback formatting/);
assert.match(readme, /execution packet copy markup handoff/);
assert.match(readme, /hidden action markup handoff/);
assert.match(readme, /hidden action shelf markup handoff/);
assert.match(readme, /hidden action shelf frame markup handoff/);
assert.match(readme, /hidden result packet markup handoff/);
assert.match(readme, /visible action shelf markup handoff/);
assert.match(readme, /visible action shelf frame markup handoff/);
assert.match(readme, /visible hide action markup handoff/);
assert.match(readme, /output path copy label\/status handoff/);
assert.match(readme, /output-brief copy labels\/payload titles/);
assert.match(readme, /policy-report copy fallback\s+formatting/);
assert.match(readme, /completion status/);
assert.match(readme, /`ui\/harness-labels\.js`/);
assert.match(readme, /The most recent development arc concluded a behavior-preserving module extraction campaign/);
assert.match(readme, /docs\/inspection-20260703-final\.md/);
assert.match(readme, /src\/runtime\/task-gates\.js/);
assert.match(readme, /ui\/artifact-structured-render\.js/);
assert.match(readme, /ui\/availability\.js/);
assert.match(readme, /src\/runtime\/retention-policy\.js/);
assert.match(readme, /ui\/control-snapshots\.js/);
assert.match(readme, /Extraction verdict and metrics:/);
assert.match(readme, /src\/execution\/coordinator\/artifact-content\.js/);
assert.match(readme, /src\/execution\/execution-text-utils\.js/);
assert.match(readme, /normalizeRelativePath` path-traversal/);
assert.match(readme, /`busy`-boolean injection so its logic is state-shape independent/);
assert.match(readme, /Opt-in knowledge-work pack/);
assert.match(readme, /`knowledge-work` pack is explicit opt-in/);
assert.match(readme, /does not replace the `development` pack/);
assert.match(
  readme,
  /additional non-development packs beyond the explicit opt-in `knowledge-work`/,
);
assert.match(readme, /성장 증거 원장/);
assert.match(readme, /개선 후보 대기열/);
assert.match(readme, /제안 검토 게이트/);
assert.match(readme, /create\/persist durable proposal records/);
assert.match(readme, /Proposal review is not proposal approval/);
assert.match(readme, /DEC-048/);
assert.match(readme, /Durable proposal record creation and persistence are implemented only/);
assert.match(readme, /Proposal application source mutation decision packet is consumed planning evidence/);
assert.match(readme, /docs\/36_proposal-application-source-mutation-decision-packet\.md/);
assert.match(readme, /Proposal application source mutation operator handoff is consumed planning evidence/);
assert.match(
  readme,
  /docs\/37_proposal-application-source-mutation-operator-decision-handoff\.md/,
);
assert.match(readme, /Proposal application source mutation planning plan is planning-only evidence/);
assert.match(
  readme,
  /docs\/38_proposal-application-source-mutation-planning-plan\.md/,
);
assert.match(readme, /Long-term memory is readiness only/);
assert.match(readme, /DEC-049/);
assert.match(readme, /raw transcript ingestion/);
assert.match(readme, /cross-workspace memory/);
assert.match(readme, /skill promotion blocked/);
assert.match(readme, /Long-term memory storage remains blocked/);
assert.match(readme, /raw transcript exclusion/);
assert.match(readme, /redaction, export, expiry/);
assert.match(readme, /orchestration\.ui-preferences\.v1/);
assert.match(readme, /node scripts\/smoke-ui-slice-311\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-312\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-314\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-328\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-344\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-351\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-352\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-353\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-380\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-382\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-605\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-623\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-649\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-612\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-614\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-615\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-619\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-629\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-630\.mjs/);
assert.match(readme, /node scripts\/smoke-ui-slice-627\.mjs/);
assert.match(readme, /output\/playwright\/vnext-desktop-top-final\.png/);
assert.match(readme, /output\/playwright\/vnext-mobile\.png/);

assert.match(readme, new RegExp(`${smokeFileCount} smoke files`));
assert.match(readme, new RegExp(`${qaSliceFileCount} QA slice files`));
assert.match(readme, new RegExp(`${uiSmokeFileCount} UI smoke files`));
assert.match(readme, /node scripts\/run-smoke\.mjs --list/);
assert.match(readme, /node scripts\/run-smoke\.mjs --filter smoke-readme-scope-evidence/);
assert.match(readme, /node scripts\/run-smoke\.mjs --all --fail-fast/);
assert.doesNotMatch(readme, /838\s+\(smoke-slice/);

const forbiddenClaimPatterns = [
  /production-ready/i,
  /enterprise/i,
  /99\.8/,
  /94\.2/,
  /정확도 95/,
  /요청당/,
  /상용 운영/,
  /엔터프라이즈/,
];

for (const pattern of forbiddenClaimPatterns) {
  assert.doesNotMatch(readme, pattern);
}

const routePatterns = [
  '/api/snapshot',
  '/api/projects',
  '/api/projects/:projectId/select',
  '/api/projects/:projectId/provider-config',
  '/api/projects/:projectId/linked-worktrees',
  '/api/missions',
  '/api/missions/:missionId/create-linked-task',
  '/api/missions/:missionId/approve-council',
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

for (const route of routePatterns) {
  assert.ok(readme.includes(route), `README route missing: ${route}`);
}

const sourceRouteRegexes = [
  /url\.pathname === '\/api\/snapshot'/,
  /url\.pathname === '\/api\/projects'/,
  /\/\^\\\/api\\\/projects\\\/\(\[\^\/\]\+\)\\\/select\$\/\)/,
  /\/\^\\\/api\\\/missions\\\/\(\[\^\/\]\+\)\\\/create-linked-task\$\/,/,
  /url\.pathname === '\/api\/tasks'/,
  /\/\^\\\/api\\\/tasks\\\/\(\[\^\/\]\+\)\\\/run-planner\$\/\)/,
  /\/\^\\\/api\\\/tasks\\\/\(\[\^\/\]\+\)\\\/run-close-out\$\/\)/,
  /\/\^\\\/api\\\/decision-inbox\\\/\(\[\^\/\]\+\)\\\/actions\$\/\)/,
  /\/\^\\\/api\\\/runs\\\/\(\[\^\/\]\+\)\\\/logs\$\/\)/,
  /\/\^\\\/api\\\/artifacts\\\/\(\[\^\/\]\+\)\$\/\)/,
];

for (const pattern of sourceRouteRegexes) {
  assert.match(serveUi, pattern);
}

assert.match(readme, /`OPENAI_API_KEY`/);
assert.match(readme, /`OPENAI_RESPONSES_MODEL`/);
assert.match(readme, /`OPENAI_RESPONSES_TIMEOUT_MS`/);
assert.match(readme, /`OPENAI_RESPONSES_MAX_RETRY_ATTEMPTS`/);
assert.match(readme, /`OPENAI_RESPONSES_RETRY_DELAY_MS`/);
assert.match(verificationStatus, /smoke-readme-scope-evidence\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-649\.mjs/);
assert.match(verificationStatus, /smoke-runner-status\.mjs/);
assert.match(verificationStatus, /knowledge-work-pack/);
assert.match(
  verificationStatus,
  /vnext-proposal-application-source-mutation-decision-packet-status\.mjs/,
);
assert.match(
  verificationStatus,
  /vnext-proposal-application-source-mutation-operator-decision-handoff-status\.mjs/,
);
assert.match(
  verificationStatus,
  /vnext-proposal-application-source-mutation-planning-plan-status\.mjs/,
);
assert.match(appJs, /data-growth-learning-surface="read-only"/);
assert.match(appJs, /from '\.\/harness-execution-tokens\.js'/);
assert.match(harnessExecutionTokens, /export function getHarnessExecutionTimestampLabel\(execution, fallbackLabel = '기록 없음'\) \{/);
assert.match(harnessExecutionTokens, /export function getHarnessExecutionRequestId\(execution\) \{/);
assert.match(harnessExecutionTokens, /export function getHarnessExecutionActionOutputPath\(execution\) \{/);
assert.match(harnessExecutionTokens, /export function getHarnessHistoryRequestLabel\(requestId, index\) \{/);
assert.match(harnessExecutionTokens, /export function getHarnessOutputSummaryValue\(outputPath\) \{/);
assert.match(harnessExecutionTokens, /export function getHarnessInputSummaryValue\(inputPath\) \{/);
assert.match(harnessExecutionTokens, /export function getHarnessStatusSummaryValue\(value\) \{/);
assert.match(appJs, /const visibleHarnessRequestId = getHarnessExecutionRequestId\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessRequestId = getHarnessExecutionRequestId\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const historyHarnessRequestId = getHarnessExecutionRequestId\(execution\);/);
assert.match(
  appJs,
  /const harnessRunActionShelfMarkup = `\s+\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}\s+\$\{harnessRunPolicyReportPreviewActionMarkup\}\s+\$\{harnessRunSubmitActionMarkup\}/,
);
assert.match(appJs, /\$\{harnessRunActionShelfMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-run-action-shelf="true"[\s\S]{0,260}\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}/,
);
assert.match(
  appJs,
  /const visibleHarnessSummaryRackMarkup = `\s+\$\{visibleHarnessInputSummaryMarkup\}\s+\$\{visibleHarnessModeSummaryMarkup\}\s+\$\{visibleHarnessHandoffSummaryMarkup\}\s+\$\{visibleHarnessOutputSummaryMarkup\}\s+\$\{visibleHarnessRequestSummaryMarkup\}\s+\$\{visibleHarnessPolicyReportSummaryMarkup\}\s+\$\{visibleHarnessOutputBriefSummaryMarkup\}/,
);
assert.match(appJs, /\$\{visibleHarnessSummaryRackMarkup\}/);
assert.match(
  appJs,
  /const visibleHarnessTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>\$\{escapeHtml\(visibleHarnessResultTitle\)\}<\/strong>\s+\$\{visibleHarnessResultStateTokenMarkup\}/,
);
assert.match(
  appJs,
  /const visibleHarnessTokenRowFrameMarkup = `\s+<div class="token-row token-row-compact">\s+\$\{visibleHarnessTokenRowMarkup\}/,
);
assert.match(
  appJs,
  /const visibleHarnessHeaderMarkup = `\s+\$\{visibleHarnessTitleRowMarkup\}\s+\$\{visibleHarnessTokenRowFrameMarkup\}/,
);
assert.match(appJs, /\$\{visibleHarnessHeaderMarkup\}/);
assert.match(
  appJs,
  /const visibleHarnessResultPacketMarkup = `\s+<div class="harness-execution-result-packet" data-harness-execution-result-packet="true">\s+\$\{visibleHarnessHeaderMarkup\}\s+\$\{visibleHarnessSummaryRackMarkup\}\s+\$\{visibleHarnessActionShelfFrameMarkup\}\s+\$\{visibleHarnessPreviewMarkup\}/,
);
assert.match(appJs, /\$\{visibleHarnessResultPacketMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result="true"[\s\S]{0,180}<div class="harness-execution-result-packet" data-harness-execution-result-packet="true">[\s\S]{0,260}\$\{visibleHarnessHeaderMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result-packet="true"[\s\S]{0,320}<strong>\$\{escapeHtml\(visibleHarnessResultTitle\)\}<\/strong>/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result="true">\s+[\s\S]{0,340}<strong>\$\{escapeHtml\(visibleHarnessResultTitle\)\}<\/strong>[\s\S]{0,520}\$\{visibleHarnessInputSummaryMarkup\}\s+\$\{visibleHarnessModeSummaryMarkup\}/,
);
assert.match(
  appJs,
  /const hiddenHarnessRunContextSummaryMarkup = `\s+\$\{hiddenHarnessRequestSummaryMarkup\}\s+\$\{hiddenHarnessExecutedAtSummaryMarkup\}\s+\$\{hiddenHarnessModeSummaryMarkup\}\s+\$\{hiddenHarnessHandoffSummaryMarkup\}\s+\$\{hiddenHarnessInputSummaryMarkup\}\s+\$\{hiddenHarnessOutputSummaryMarkup\}/,
);
assert.match(appJs, /\$\{hiddenHarnessRunContextSummaryMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-result-hidden-run-context="true">\s+[\s\S]{0,240}<strong>실행 기록<\/strong>[\s\S]{0,240}\$\{hiddenHarnessRequestSummaryMarkup\}\s+\$\{hiddenHarnessExecutedAtSummaryMarkup\}/,
);
assert.match(
  appJs,
  /const hiddenHarnessContextSummaryMarkup = `\s+\$\{hiddenHarnessIdSummaryMarkup\}\s+\$\{hiddenHarnessKindSummaryMarkup\}\s+\$\{hiddenHarnessPrimaryCommandSummaryMarkup\}\s+\$\{hiddenHarnessPrimaryRunnerSummaryMarkup\}\s+\$\{hiddenHarnessPostureSummaryMarkup\}\s+\$\{hiddenHarnessStateSummaryMarkup\}\s+\$\{hiddenHarnessHostSummaryMarkup\}/,
);
assert.match(appJs, /\$\{hiddenHarnessContextSummaryMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-result-hidden-harness-context="true">\s+[\s\S]{0,260}<strong>하네스 컨텍스트<\/strong>[\s\S]{0,260}\$\{hiddenHarnessIdSummaryMarkup\}\s+\$\{hiddenHarnessKindSummaryMarkup\}/,
);
assert.match(
  appJs,
  /const hiddenHarnessOperatorContextSummaryMarkup = `\s+\$\{hiddenHarnessOperatorActionSummaryMarkup\}\s+\$\{hiddenHarnessOperatorCommandSummaryMarkup\}\s+\$\{hiddenHarnessOperatorMessageSummaryMarkup\}/,
);
assert.match(appJs, /\$\{hiddenHarnessOperatorContextSummaryMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-result-hidden-operator-context="true">\s+[\s\S]{0,260}<strong>운영 컨텍스트<\/strong>[\s\S]{0,260}\$\{hiddenHarnessOperatorActionSummaryMarkup\}\s+\$\{hiddenHarnessOperatorCommandSummaryMarkup\}/,
);
assert.match(
  appJs,
  /const hiddenHarnessContextSectionsMarkup = `\s+\$\{hiddenHarnessRunContextSectionMarkup\}\s+\$\{hiddenHarnessHarnessContextSectionMarkup\}\s+\$\{hiddenHarnessOperatorContextSectionMarkup\}/,
);
assert.match(appJs, /\$\{hiddenHarnessContextSectionsMarkup\}/);
assert.match(
  appJs,
  /const hiddenHarnessRunContextTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>실행 기록<\/strong>/,
);
assert.match(
  appJs,
  /const hiddenHarnessHarnessContextTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>하네스 컨텍스트<\/strong>/,
);
assert.match(
  appJs,
  /const hiddenHarnessOperatorContextTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>운영 컨텍스트<\/strong>/,
);
assert.match(
  appJs,
  /data-harness-result-hidden-run-context="true">\s+\$\{hiddenHarnessRunContextTitleRowMarkup\}\s+\$\{hiddenHarnessRunContextSummaryMarkup\}/,
);
assert.match(
  appJs,
  /data-harness-result-hidden-harness-context="true">\s+\$\{hiddenHarnessHarnessContextTitleRowMarkup\}\s+\$\{hiddenHarnessContextSummaryMarkup\}/,
);
assert.match(
  appJs,
  /data-harness-result-hidden-operator-context="true">\s+\$\{hiddenHarnessOperatorContextTitleRowMarkup\}\s+\$\{hiddenHarnessOperatorContextSummaryMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result-hidden="true"[\s\S]{0,900}data-harness-result-hidden-run-context="true"[\s\S]{0,900}data-harness-result-hidden-harness-context="true"[\s\S]{0,900}data-harness-result-hidden-operator-context="true"/,
);
assert.match(appJs, /const visibleHarnessActionOutputPath =\s+getHarnessExecutionActionOutputPath\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessActionOutputPath =\s+getHarnessExecutionActionOutputPath\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const historyHarnessPathReuseActionMarkup = `\s+<button[\s\S]*?data-action="reuse-harness-execution-paths"/);
assert.match(appJs, /const historyHarnessPathRerunActionMarkup = `\s+<button[\s\S]*?data-action="rerun-harness-execution-paths"/);
assert.match(appJs, /const historyHarnessPathActionsMarkup = `\s+\$\{historyHarnessPathReuseActionMarkup\}\s+\$\{historyHarnessPathRerunActionMarkup\}/);
assert.match(
  appJs,
  /const historyHarnessSummaryRackMarkup = `\s+\$\{historyHarnessRequestSummaryMarkup\}\s+\$\{historyHarnessExecutedAtSummaryMarkup\}\s+\$\{historyHarnessModeSummaryMarkup\}\s+\$\{historyHarnessHandoffSummaryMarkup\}\s+\$\{historyHarnessInputSummaryMarkup\}\s+\$\{historyHarnessOutputSummaryMarkup\}/,
);
assert.match(appJs, /\$\{historyHarnessSummaryRackMarkup\}/);
assert.match(
  appJs,
  /const historyHarnessSummaryRackFrameMarkup = `\s+<div class="harness-execution-history-summary-rack" data-harness-execution-history-summary-rack="true">\s+\$\{historyHarnessSummaryRackMarkup\}/,
);
assert.match(appJs, /\$\{historyHarnessSummaryRackFrameMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-history-summary-rack="true">\s+\$\{historyHarnessRequestSummaryMarkup\}\s+\$\{historyHarnessExecutedAtSummaryMarkup\}\s+\$\{historyHarnessModeSummaryMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-history-item="true">\s+<div class="harness-execution-history-summary-rack" data-harness-execution-history-summary-rack="true">/,
);
assert.match(appJs, /const historyHarnessPreviewCopyActionMarkup =\s+canRenderHistoryHarnessPreview/);
assert.match(appJs, /const historyHarnessOutputBriefActionMarkup =\s+canRenderHistoryHarnessPreview/);
assert.match(appJs, /const historyHarnessPreviewActionsMarkup = `\s+\$\{historyHarnessPreviewCopyActionMarkup\}\s+\$\{historyHarnessOutputBriefActionMarkup\}/);
assert.match(
  appJs,
  /const historyHarnessActionShelfMarkup = `\s+\$\{historyHarnessInputPathCopyMarkup\}\s+\$\{historyHarnessRestorePreviewMarkup\}\s+\$\{historyHarnessOutputPathCopyMarkup\}\s+\$\{historyHarnessRequestIdCopyMarkup\}\s+\$\{historyHarnessExecutionPacketCopyMarkup\}\s+\$\{historyHarnessPolicyReportCopyMarkup\}\s+\$\{historyHarnessPathActionsMarkup\}\s+\$\{historyHarnessPreviewActionsMarkup\}/,
);
assert.match(appJs, /\$\{historyHarnessActionShelfMarkup\}/);
assert.match(
  appJs,
  /const historyHarnessActionShelfFrameMarkup = `\s+<div class="harness-execution-history-action-shelf" data-harness-execution-history-action-shelf="true">\s+<div class="form-actions form-actions-inline form-actions-compact">\s+\$\{historyHarnessActionShelfMarkup\}/,
);
assert.match(appJs, /\$\{historyHarnessActionShelfFrameMarkup\}/);
assert.doesNotMatch(
  appJs,
  /form-actions-compact">\s+\$\{historyHarnessInputPathCopyMarkup\}\s+\$\{historyHarnessRestorePreviewMarkup\}\s+\$\{historyHarnessOutputPathCopyMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-history-summary-rack="true">\s+\$\{historyHarnessSummaryRackMarkup\}\s+<\/div>\s+<div class="harness-execution-history-action-shelf" data-harness-execution-history-action-shelf="true">/,
);
assert.match(
  appJs,
  /const historyHarnessItemRegisterMarkup = `\s+<div class="control-overview-register control-overview-register-compact" data-harness-execution-history-item="true">\s+\$\{historyHarnessSummaryRackFrameMarkup\}\s+\$\{historyHarnessActionShelfFrameMarkup\}/,
);
assert.match(
  appJs,
  /const historyHarnessItemPacketMarkup = `\s+<div class="harness-execution-history-item-packet" data-harness-execution-history-item-packet="true">\s+\$\{historyHarnessItemRegisterMarkup\}/,
);
assert.match(appJs, /return historyHarnessItemPacketMarkup;/);
assert.doesNotMatch(
  appJs,
  /return `\s+<div class="harness-execution-history-item-packet" data-harness-execution-history-item-packet="true">\s+<div class="control-overview-register control-overview-register-compact" data-harness-execution-history-item="true">/,
);
assert.match(appJs, /const visibleHarnessPreviewCopyActionMarkup =\s+canRenderVisibleHarnessPreview/);
assert.match(appJs, /const visibleHarnessOutputBriefActionMarkup =\s+canRenderVisibleHarnessPreview/);
assert.match(appJs, /const visibleHarnessPreviewActionsMarkup = `\s+\$\{visibleHarnessPreviewCopyActionMarkup\}\s+\$\{visibleHarnessOutputBriefActionMarkup\}/);
assert.match(appJs, /const hiddenHarnessPreviewCopyActionMarkup =\s+canRenderHiddenHarnessPreview/);
assert.match(appJs, /const hiddenHarnessOutputBriefActionMarkup =\s+canRenderHiddenHarnessPreview/);
assert.match(appJs, /const hiddenHarnessPreviewActionsMarkup = `\s+\$\{hiddenHarnessPreviewCopyActionMarkup\}\s+\$\{hiddenHarnessOutputBriefActionMarkup\}/);
assert.match(harnessExecutionTokens, /export function isHarnessPolicyReportExecution\(execution\) \{/);
assert.match(harnessLabels, /export function getHarnessExecutionCompletionLead\(execution, harnessId\) \{/);
assert.match(harnessLabels, /export function getHarnessExecutionCompletionOutputCopy\(execution, fallbackOutputCopy\) \{/);
assert.match(harnessLabels, /export function formatHarnessPolicyReportForCopy\(payload\) \{/);
assert.match(harnessLabels, /if \(!payload\) \{\s+return '';\s+\}/);
assert.match(harnessLabels, /export function formatHarnessExecutionPacketForCopy\(execution, context = \{\}\) \{/);
assert.match(harnessLabels, /if \(!execution\?\.harnessId\) \{\s+return '';\s+\}/);
assert.match(appJs, /const visibleHarnessPrimaryTokenTone = 'neutral';/);
assert.match(appJs, /const visibleHarnessRequestTokenTone = 'neutral';/);
assert.match(appJs, /const visibleHarnessExecutedAtTokenTone = 'neutral';/);
assert.match(appJs, /const visibleHarnessPolicyReportTokenTone = 'neutral';/);
assert.match(appJs, /const visibleHarnessPrimaryTokenMarkup = canRenderVisibleHarnessPrimaryToken/);
assert.match(appJs, /const visibleHarnessPolicyReportTokenMarkup = canRenderVisibleHarnessPolicyReportToken/);
assert.match(appJs, /const visibleHarnessRequestTokenMarkup = canRenderVisibleHarnessRequestToken/);
assert.match(appJs, /const visibleHarnessOutputChannelTokenMarkup = createToken\(\s+visibleHarnessOutputChannelLabel,\s+visibleHarnessOutputChannelTone,\s+\);/);
assert.match(appJs, /const visibleHarnessExecutedAtTokenMarkup = canRenderVisibleHarnessExecutedAtToken/);
assert.match(
  appJs,
  /const visibleHarnessTokenRowMarkup = `\s+\$\{visibleHarnessPrimaryTokenMarkup\}\s+\$\{visibleHarnessPolicyReportTokenMarkup\}\s+\$\{visibleHarnessRequestTokenMarkup\}\s+\$\{visibleHarnessOutputChannelTokenMarkup\}\s+\$\{visibleHarnessExecutedAtTokenMarkup\}/,
);
assert.match(appJs, /\$\{visibleHarnessTokenRowMarkup\}/);
assert.doesNotMatch(
  appJs,
  /<div class="token-row token-row-compact">\s+\$\{visibleHarnessPrimaryTokenMarkup\}\s+\$\{visibleHarnessPolicyReportTokenMarkup\}/,
);
assert.match(appJs, /createToken\(visibleHarnessPrimaryTokenLabel, visibleHarnessPrimaryTokenTone\)/);
assert.match(appJs, /createToken\(visibleHarnessRequestTokenLabel, visibleHarnessRequestTokenTone\)/);
assert.match(appJs, /createToken\(visibleHarnessExecutedAtTokenLabel, visibleHarnessExecutedAtTokenTone\)/);
assert.match(appJs, /createToken\(visibleHarnessPolicyReportTokenLabel, visibleHarnessPolicyReportTokenTone\)/);
assert.doesNotMatch(appJs, /createToken\(visibleHarnessPrimaryTokenLabel, 'neutral'\)/);
assert.doesNotMatch(appJs, /createToken\(visibleHarnessRequestTokenLabel, 'neutral'\)/);
assert.doesNotMatch(appJs, /createToken\(visibleHarnessExecutedAtTokenLabel, 'neutral'\)/);
assert.doesNotMatch(appJs, /createToken\(visibleHarnessPolicyReportTokenLabel, 'neutral'\)/);
assert.match(appJs, /const harnessRunCommandCopyMarkup = `/);
assert.match(appJs, /const harnessRunClearHistoryActionMarkup = hasExecutionHistory/);
assert.match(appJs, /const harnessRunPolicyReportPreviewActionMarkup = `/);
assert.match(appJs, /const harnessRunSubmitActionMarkup = `/);
assert.match(
  appJs,
  /\$\{harnessRunCommandCopyMarkup\}\s+\$\{harnessRunClearHistoryActionMarkup\}\s+\$\{harnessRunPolicyReportPreviewActionMarkup\}\s+\$\{harnessRunSubmitActionMarkup\}/,
);
assert.doesNotMatch(appJs, /data-harness-run-action-shelf="true"[\s\S]{0,1800}<button/);
assert.match(appJs, /const visibleHarnessPreviewMarkup = canRenderVisibleHarnessPreview/);
assert.match(appJs, /\$\{visibleHarnessPreviewMarkup\}/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderVisibleHarnessPreview\s+\?\s+`<pre class="log-viewer log-viewer-compact" data-harness-execution-preview="true">/);
assert.match(appJs, /const visibleHarnessInputPathCopyActionMarkup =\s+canRenderVisibleHarnessInputPathActions/);
assert.match(appJs, /const visibleHarnessPathReuseActionMarkup =\s+canRenderVisibleHarnessInputPathActions/);
assert.match(appJs, /const visibleHarnessPathRerunActionMarkup =\s+canRenderVisibleHarnessInputPathActions/);
assert.match(appJs, /const visibleHarnessInputPathActionsMarkup = `\s+\$\{visibleHarnessInputPathCopyActionMarkup\}\s+\$\{visibleHarnessPathReuseActionMarkup\}\s+\$\{visibleHarnessPathRerunActionMarkup\}/);
assert.match(appJs, /const hiddenHarnessInputPathCopyActionMarkup =\s+canRenderHiddenHarnessInputPathActions/);
assert.match(appJs, /const hiddenHarnessPathReuseActionMarkup =\s+canRenderHiddenHarnessInputPathActions/);
assert.match(appJs, /const hiddenHarnessPathRerunActionMarkup =\s+canRenderHiddenHarnessInputPathActions/);
assert.match(appJs, /const hiddenHarnessInputPathActionsMarkup = `\s+\$\{hiddenHarnessInputPathCopyActionMarkup\}\s+\$\{hiddenHarnessPathReuseActionMarkup\}\s+\$\{hiddenHarnessPathRerunActionMarkup\}/);
assert.match(
  appJs,
  /const hiddenHarnessActionShelfMarkup = `\s+\$\{hiddenHarnessShowActionMarkup\}\s+\$\{hiddenHarnessInputPathActionsMarkup\}\s+\$\{hiddenHarnessOutputPathCopyMarkup\}\s+\$\{hiddenHarnessRequestIdCopyMarkup\}\s+\$\{hiddenHarnessExecutionPacketCopyMarkup\}\s+\$\{hiddenHarnessPolicyReportCopyMarkup\}\s+\$\{hiddenHarnessPreviewActionsMarkup\}/,
);
assert.match(
  appJs,
  /const hiddenHarnessActionShelfFrameMarkup = `\s+<div class="form-actions form-actions-inline form-actions-hidden-compact">\s+\$\{hiddenHarnessActionShelfMarkup\}/,
);
assert.match(appJs, /\$\{hiddenHarnessActionShelfMarkup\}/);
assert.match(appJs, /\$\{hiddenHarnessActionShelfFrameMarkup\}/);
assert.doesNotMatch(
  appJs,
  /form-actions-hidden-compact">\s+\$\{hiddenHarnessShowActionMarkup\}\s+\$\{hiddenHarnessInputPathActionsMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result-hidden-packet="true"[\s\S]{0,520}<div class="form-actions form-actions-inline form-actions-hidden-compact">\s+\$\{hiddenHarnessActionShelfMarkup\}/,
);
assert.match(appJs, /const visibleHarnessOutputPathCopyMarkup = canRenderVisibleHarnessOutputPathCopy/);
assert.match(appJs, /\$\{visibleHarnessOutputPathCopyMarkup\}/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderVisibleHarnessOutputPathCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-output-path"/);
assert.match(appJs, /const visibleHarnessHideActionMarkup = `/);
assert.match(
  appJs,
  /const visibleHarnessActionShelfMarkup = `\s+\$\{visibleHarnessInputPathActionsMarkup\}\s+\$\{visibleHarnessOutputPathCopyMarkup\}\s+\$\{visibleHarnessRequestIdCopyMarkup\}\s+\$\{visibleHarnessExecutionPacketCopyMarkup\}\s+\$\{visibleHarnessPreviewActionsMarkup\}\s+\$\{visibleHarnessOutputBriefCopyMarkup\}\s+\$\{visibleHarnessPolicyReportCopyMarkup\}\s+\$\{visibleHarnessHideActionMarkup\}/,
);
assert.match(
  appJs,
  /const visibleHarnessActionShelfFrameMarkup = canRenderVisibleHarnessPathActionShelf\s+\? `\s+<div class="form-actions form-actions-inline form-actions-compact">\s+\$\{visibleHarnessActionShelfMarkup\}/,
);
assert.match(appJs, /\$\{visibleHarnessHideActionMarkup\}/);
assert.match(appJs, /\$\{visibleHarnessActionShelfMarkup\}/);
assert.match(appJs, /\$\{visibleHarnessActionShelfFrameMarkup\}/);
assert.doesNotMatch(appJs, /\$\{visibleHarnessPolicyReportCopyMarkup\}\s+<button[\s\S]*?data-action="hide-harness-execution-result"/);
assert.doesNotMatch(
  appJs,
  /form-actions-compact">\s+\$\{visibleHarnessInputPathActionsMarkup\}\s+\$\{visibleHarnessOutputPathCopyMarkup\}/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result-packet="true"[\s\S]{0,420}canRenderVisibleHarnessPathActionShelf\s+\?\s+`\s+<div class="form-actions form-actions-inline form-actions-compact">\s+\$\{visibleHarnessActionShelfMarkup\}/,
);
assert.match(appJs, /const harnessOperatorActionLabel = getHarnessOperatorActionLabel\(operatorAction\);/);
assert.match(appJs, /const harnessOperatorActionTone = getHarnessOperatorActionTone\(operatorAction\);/);
assert.match(appJs, /const harnessOperatorActionTokenLabel = harnessOperatorActionLabel;/);
assert.match(appJs, /const harnessOperatorActionTokenTone = harnessOperatorActionTone;/);
assert.match(
  appJs,
  /const harnessOperatorActionTokenMarkup = createToken\(\s+harnessOperatorActionTokenLabel,\s+harnessOperatorActionTokenTone,\s+\);/,
);
assert.match(appJs, /\$\{harnessOperatorActionTokenMarkup\}/);
assert.doesNotMatch(appJs, /createToken\(\s+harnessOperatorActionLabel,\s+harnessOperatorActionTone,\s+\)/);
assert.match(appJs, /const visibleHarnessResultStateToken =\s+getHarnessResultStateToken\(visibleHarnessIsPolicyReport\);/);
assert.match(appJs, /const visibleHarnessResultStateTokenLabel = visibleHarnessResultStateToken\.label;/);
assert.match(appJs, /const visibleHarnessResultStateTokenTone = visibleHarnessResultStateToken\.tone;/);
assert.match(
  appJs,
  /const visibleHarnessResultStateTokenMarkup = createToken\(\s+visibleHarnessResultStateTokenLabel,\s+visibleHarnessResultStateTokenTone,\s+\);/,
);
assert.match(appJs, /\$\{visibleHarnessResultStateTokenMarkup\}/);
assert.doesNotMatch(appJs, /createToken\(\s+visibleHarnessResultStateLabel,\s+visibleHarnessResultStateTone,\s+\)/);
assert.match(appJs, /const historyHarnessInputPathCopyMarkup =\s+canRenderHistoryHarnessInputPathCopy/);
assert.match(appJs, /\$\{historyHarnessInputPathCopyMarkup\}/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderHistoryHarnessInputPathCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-input-path"/);
assert.match(appJs, /const historyHarnessRestorePreviewMarkup = `\s+<button[\s\S]*?data-action="restore-harness-execution-preview"/);
assert.match(appJs, /\$\{historyHarnessRestorePreviewMarkup\}/);
assert.doesNotMatch(appJs, /\$\{historyHarnessInputPathCopyMarkup\}\s+<button[\s\S]*?data-action="restore-harness-execution-preview"/);
assert.match(appJs, /const hiddenHarnessResultStateLabel = '숨김';/);
assert.match(appJs, /const hiddenHarnessResultStateTone = 'neutral';/);
assert.match(
  appJs,
  /const hiddenHarnessResultStateTokenMarkup = createToken\(\s+hiddenHarnessResultStateLabel,\s+hiddenHarnessResultStateTone,\s+\);/,
);
assert.match(appJs, /\$\{hiddenHarnessResultStateTokenMarkup\}/);
assert.doesNotMatch(appJs, /\$\{createToken\('숨김', 'neutral'\)\}/);
assert.doesNotMatch(appJs, /const hiddenHarnessResultStateTokenMarkup = createToken\('숨김', 'neutral'\);/);
assert.match(
  appJs,
  /const hiddenHarnessResultPacketMarkup = `\s+<div\s+class="harness-execution-result-hidden-packet"\s+data-harness-execution-result-hidden-packet="true"\s+>\s+\$\{hiddenHarnessHeaderMarkup\}\s+\$\{hiddenHarnessContextSectionsMarkup\}\s+\$\{hiddenHarnessActionShelfFrameMarkup\}\s+\$\{hiddenHarnessPreviewMarkup\}/,
);
assert.match(appJs, /\$\{hiddenHarnessResultPacketMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result-hidden="true"[\s\S]{0,220}<div\s+class="harness-execution-result-hidden-packet"\s+data-harness-execution-result-hidden-packet="true"/,
);
assert.match(
  appJs,
  /const hiddenHarnessTitleRowMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>\$\{escapeHtml\(hiddenHarnessResultTitle\)\}가 숨겨져 있습니다<\/strong>\s+\$\{hiddenHarnessResultStateTokenMarkup\}/,
);
assert.match(
  appJs,
  /const hiddenHarnessHeaderMarkup = `\s+\$\{hiddenHarnessTitleRowMarkup\}\s+\$\{hiddenHarnessRestoreHintMarkup\}/,
);
assert.match(appJs, /\$\{hiddenHarnessHeaderMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result-hidden-packet="true"[\s\S]{0,360}<strong>\$\{escapeHtml\(hiddenHarnessResultTitle\)\}가 숨겨져 있습니다<\/strong>/,
);
assert.match(appJs, /const recentHarnessExecutionCount = recentHarnessExecutions\.length;/);
assert.match(appJs, /const recentHarnessExecutionCountTokenLabel = `\$\{recentHarnessExecutionCount\}건`;/);
assert.match(appJs, /const recentHarnessExecutionCountTokenTone = 'neutral';/);
assert.match(
  appJs,
  /const recentHarnessExecutionCountTokenMarkup = recentHarnessExecutionCount\s+\? createToken\(\s+recentHarnessExecutionCountTokenLabel,\s+recentHarnessExecutionCountTokenTone,\s+\)\s+: '';/,
);
assert.match(appJs, /\$\{recentHarnessExecutionCountTokenMarkup\}/);
assert.match(
  appJs,
  /const historyHarnessHeaderMarkup = `\s+<div class="card-title-row card-title-row-tight">\s+<strong>실행 기록<\/strong>\s+\$\{recentHarnessExecutionCountTokenMarkup\}/,
);
assert.match(
  appJs,
  /data-harness-execution-history-packet="true">\s+\$\{historyHarnessHeaderMarkup\}\s+<div class="stack harness-execution-history-list-compact"/,
);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-history-packet="true">\s+<div class="card-title-row card-title-row-tight">\s+<strong>실행 기록<\/strong>/,
);
assert.doesNotMatch(appJs, /createToken\(`\$\{recentHarnessExecutionCount\}건`, 'neutral'\)/);
assert.match(appJs, /data-personalization-scope="local-only"/);
assert.match(growthPanels, /data-proposal-record-creation-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordCreationAllowed\}"/);
assert.match(growthPanels, /data-proposal-record-persistence-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordPersistenceAllowed\}"/);
assert.match(appJs, /data-long-term-memory-store-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.longTermMemoryStoreAllowed\}"/);
assert.match(appJs, /data-memory-readiness-gate="blocked"/);
assert.match(appJs, /data-raw-transcript-ingestion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.rawTranscriptIngestionAllowed\}"/);
assert.match(appJs, /data-cross-workspace-memory-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.crossWorkspaceMemoryAllowed\}"/);
assert.match(appJs, /data-skill-promotion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.skillPromotionAllowed\}"/);
assert.match(appJs, />지식 작업 \(knowledge-work\)<\/option>/);
assert.match(appJs, /from '\.\/growth-config\.js'/);
assert.match(appJs, /from '\.\/growth-learning\.js'/);
assert.match(appJs, /from '\.\/preference-config\.js'/);
assert.match(appJs, /from '\.\/personalization-snapshot\.js'/);
assert.match(growthConfig, /export const GROWTH_AUTHORITY_BOUNDARY = Object\.freeze\(\{/);
assert.match(growthConfig, /proposalRecordCreationAllowed: false/);
assert.match(growthConfig, /sourceMutationAllowed: false/);
assert.match(growthLearning, /export function getGrowthLearningSnapshot\(data, context, formatters = \{\}\) \{/);
assert.match(personalizationSnapshot, /export function getPersonalizationSnapshot\(\{/);
assert.match(preferenceConfig, /export const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/);
assert.match(contracts, /KNOWLEDGE_WORK: 'knowledge-work'/);
assert.match(
  knowledgeWorkPack,
  /`knowledge-work` is an explicit opt-in pack\. It does not replace the `development` pack\./,
);
assert.match(
  masterBrief,
  /`DEC-066` records the code-present `knowledge-work` pack as explicit opt-in/,
);
assert.match(
  decisionLog,
  /`DEC-066` records `knowledge-work` as that code-present opt-in path/,
);
assert.match(
  decisionLog,
  /The code-present `knowledge-work` pack is explicit opt-in and non-default/,
);
assert.match(
  architectureRoadmap,
  /`DEC-066` records the code-present `knowledge-work` pack as explicit opt-in, non-default/,
);
assert.match(
  agents,
  /`DEC-066` records the code-present `knowledge-work` pack as explicit opt-in and non-default/,
);
assert.match(referenceAudit, /Linear/);
assert.match(referenceAudit, /LangSmith Studio/);
assert.match(referenceAudit, /Retool/);
assert.match(referenceAudit, /Dify/);
assert.match(referenceAudit, /n8n HITL/);
assert.match(referenceAudit, /Zapier/);
assert.match(referenceAudit, /NN\/g 2026 UX/);
assert.match(referenceAudit, /DEC-048/);
assert.match(referenceAudit, /DEC-049/);

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
