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
assert.match(readme, /root `package\.json` is not present/);
assert.match(readme, /Root `\.env\.example` is not present/);
assert.match(readme, /No public hosted demo URL is verified/);
assert.match(readme, /no verified hosted public demo URL/);
assert.match(readme, /Current-head local API evidence was rechecked on 2026-06-23/);
assert.match(readme, /"plannerArtifactId": "artifact-0001"/);
assert.match(readme, /Reference-driven operator shell/);
assert.match(readme, /Read-only growth evidence/);
assert.match(readme, /Local-only personalization/);
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
assert.match(readme, /node scripts\/smoke-ui-slice-649\.mjs/);
assert.match(readme, /output\/playwright\/vnext-desktop-top-final\.png/);
assert.match(readme, /output\/playwright\/vnext-mobile\.png/);

assert.match(readme, new RegExp(`${smokeFileCount} smoke files`));
assert.match(readme, new RegExp(`${qaSliceFileCount} QA slice files`));
assert.match(readme, new RegExp(`${uiSmokeFileCount} UI smoke files`));
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
assert.match(appJs, /data-personalization-scope="local-only"/);
assert.match(appJs, /data-proposal-record-creation-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordCreationAllowed\}"/);
assert.match(appJs, /data-proposal-record-persistence-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalRecordPersistenceAllowed\}"/);
assert.match(appJs, /data-long-term-memory-store-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.longTermMemoryStoreAllowed\}"/);
assert.match(appJs, /data-memory-readiness-gate="blocked"/);
assert.match(appJs, /data-raw-transcript-ingestion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.rawTranscriptIngestionAllowed\}"/);
assert.match(appJs, /data-cross-workspace-memory-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.crossWorkspaceMemoryAllowed\}"/);
assert.match(appJs, /data-skill-promotion-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.skillPromotionAllowed\}"/);
assert.match(appJs, />지식 작업 \(knowledge-work\)<\/option>/);
assert.match(appJs, /const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/);
assert.match(appJs, /const GROWTH_AUTHORITY_BOUNDARY = Object\.freeze\(\{/);
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
