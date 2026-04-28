import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docPath = path.join(repoRoot, 'docs', '08_openspace-integration-plan.md');

const integrationDoc = fs.readFileSync(docPath, 'utf8');
const checklistSection = integrationDoc.match(
  /## Minimal Acceptance Checklist\n(?<body>[\s\S]*?)\n## Current Verification Status/,
)?.groups?.body;
const verificationSection = integrationDoc.match(
  /## Current Verification Status\n(?<body>[\s\S]*?)\n## Validation After Adoption/,
)?.groups?.body;

assert.ok(checklistSection, 'Minimal Acceptance Checklist section must exist.');
assert.ok(verificationSection, 'Current Verification Status section must exist.');
assert.doesNotMatch(checklistSection, /- \[ \]/);
assert.equal([...checklistSection.matchAll(/- \[x\]/g)].length, 9);
assert.match(checklistSection, /shared OpenSpace install exists outside the repo/);
assert.match(checklistSection, /host MCP config registers `openspace`/);
assert.match(checklistSection, /configured host skill dirs include this repo's `.agents\/skills`/);
assert.match(checklistSection, /`delegate-task` and `skill-discovery`/);
assert.match(checklistSection, /Orchestration bridge skills exist under `.agents\/skills\/`/);
assert.match(checklistSection, /bridge skills point back to repo docs as authority/);
assert.match(checklistSection, /current smoke and freeze semantics remain unchanged/);

assert.match(integrationDoc, /## Current Smoke Commands/);
assert.match(integrationDoc, /`smoke-openspace-slice-01` checks:/);
assert.match(integrationDoc, /`smoke-openspace-slice-02` checks:/);
assert.match(integrationDoc, /node scripts\/smoke-openspace-slice-01\.mjs/);
assert.match(integrationDoc, /node scripts\/smoke-openspace-slice-02\.mjs/);
assert.match(verificationSection, /`node scripts\/smoke-openspace-slice-01\.mjs`/);
assert.match(verificationSection, /repo-local bridge skill directories are present/);
assert.match(verificationSection, /local OpenSpace skill discovery finds the expected/);
assert.match(verificationSection, /Codex MCP config contains `\[mcp_servers\.openspace\]`/);
assert.match(verificationSection, /`execute_task` reaches OpenSpace runtime initialization/);
assert.match(verificationSection, /`blocked_missing_host_llm_credentials`/);
assert.match(verificationSection, /host execution follow-up, not repo wiring\s+regression/);
assert.match(verificationSection, /Do not move OpenSpace state into repo source-of-truth files/);

console.log(
  JSON.stringify(
    {
      ok: true,
      openSpaceIntegrationDocStatus: {
        document: 'docs/08_openspace-integration-plan.md',
        acceptanceChecklistItems: 9,
        wiringSmoke: 'scripts/smoke-openspace-slice-01.mjs',
        hostExecutionFollowUp: 'blocked_missing_host_llm_credentials',
      },
    },
    null,
    2,
  ),
);
