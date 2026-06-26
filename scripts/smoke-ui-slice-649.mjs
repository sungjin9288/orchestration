import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const auditPath = path.join(repoRoot, 'docs', 'reference', 'vnext-reference-driven-ui-audit.md');
const uiQaStatusPath = path.join(repoRoot, 'scripts', 'ui_qa_status.mjs');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const audit = fs.readFileSync(auditPath, 'utf8');
const uiQaStatus = fs.readFileSync(uiQaStatusPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(audit, /Linear/);
assert.match(audit, /LangSmith Studio/);
assert.match(audit, /Retool/);
assert.match(audit, /Dify/);
assert.match(audit, /n8n HITL/);
assert.match(audit, /Zapier/);
assert.match(audit, /NN\/g 2026 UX/);
assert.match(audit, /provider calls/);
assert.match(audit, /memory persistence/);
assert.match(audit, /source mutation/);

assert.match(appJs, /const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/);
assert.match(appJs, /const GROWTH_AUTHORITY_BOUNDARY = Object\.freeze\(\{/);
assert.match(appJs, /providerCallsAllowed: false/);
assert.match(appJs, /memoryPersistenceAllowed: false/);
assert.match(appJs, /sourceMutationAllowed: false/);
assert.match(appJs, /commitPushAllowed: false/);
assert.match(appJs, /function renderIntelligenceOverview\(data, context\)/);
assert.match(appJs, /data-growth-learning-surface="read-only"/);
assert.match(appJs, /data-personalization-scope="local-only"/);
assert.match(appJs, /Growth Evidence Ledger/);
assert.match(appJs, /Improvement Candidate Queue/);
assert.match(appJs, /localStorage only/);
assert.match(appJs, /data-action="set-evidence-density"/);
assert.match(appJs, /rememberSurfaceVisit\(surface\)/);
assert.match(appJs, /document\.body\.dataset\.evidenceDensity/);

assert.match(styles, /--bg-top: #f4efe6/);
assert.match(styles, /--surface-entry-accent: #9a5e2f/);
assert.match(styles, /\.intelligence-overview/);
assert.match(styles, /\.intelligence-panel-growth::before/);
assert.match(styles, /body\[data-evidence-density='compact'\]/);
assert.doesNotMatch(appJs, /data-action="generate-growth-proposal"/);
assert.doesNotMatch(appJs, /data-action="apply-improvement-candidate"/);
assert.doesNotMatch(appJs, /data-action="persist-growth-memory"/);

assert.match(uiQaStatus, /smoke-ui-slice-649\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-649\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      referenceDrivenUi: {
        audit: path.relative(repoRoot, auditPath),
        growthSurface: 'read-only',
        personalizationScope: 'local-only',
        blockedAuthorities: [
          'provider calls',
          'memory persistence',
          'proposal generation/application',
          'source mutation',
          'commit/push',
        ],
      },
    },
    null,
    2,
  ),
);
