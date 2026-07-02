import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const surfaceConfigJs = fs.readFileSync(surfaceConfigPath, 'utf8');

assert.match(appJs, /const playbookTitleId = `workspace-playbook-title-\$\{activeGroupId\}`;/);
assert.match(appJs, /<section class="workspace-playbook" data-nav-group="\$\{escapeHtml\(activeGroupId\)\}" aria-labelledby="\$\{escapeHtml\(playbookTitleId\)\}"/);
assert.match(appJs, /<h3 class="workspace-playbook-title" id="\$\{escapeHtml\(playbookTitleId\)\}">\$\{escapeHtml\(meta\.title\)\}<\/h3>/);
assert.match(appJs, /class="workspace-playbook-grid" role="list" aria-label="\$\{escapeHtml\(meta\.title\)\} 단계"/);
assert.match(surfaceConfigJs, /title: '업무 사용 순서'/);
assert.match(surfaceConfigJs, /title: '검토 사용 순서'/);
assert.match(surfaceConfigJs, /title: '운영 사용 순서'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookLabelledSection: {
        section: 'aria-labelledby',
        title: 'visible h3',
        idSource: 'active nav group',
      },
    },
    null,
    2,
  ),
);
