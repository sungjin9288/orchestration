import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /office-sidebar/);
assert.match(indexHtml, /office-brand-card/);
assert.match(indexHtml, /office-brand-register/);
assert.match(indexHtml, /Orchestration/);
assert.match(indexHtml, /Workflow Control/);
assert.match(indexHtml, /Workflow desk/);
assert.match(indexHtml, /업무/);
assert.match(indexHtml, /회사 디렉터리/);
assert.match(indexHtml, /열린 승인선/);
assert.match(indexHtml, /id="company-directory-summary"/);
assert.match(indexHtml, /id="company-directory-shell"/);

assert.match(styles, /\.office-sidebar \{/);
assert.match(styles, /\.workspace-shell \{/);
assert.match(styles, /\.office-brand-card \{/);
assert.match(styles, /\.office-brand-register \{/);
assert.match(styles, /\.office-sidebar-status-register \{/);
assert.match(styles, /\.company-directory-summary-grid \{/);
assert.match(styles, /\.company-directory-row \{/);
assert.match(styles, /\.control-overview-register \{/);
assert.match(styles, /\.office-rule-list,/);
assert.match(styles, /\.shell-header-main \{/);

console.log(
  JSON.stringify(
        {
          ok: true,
          shellChromeRefine: {
            layout: ['office-sidebar', 'workspace-shell', 'shell-header-main'],
            labels: ['Orchestration', 'Workflow Control', 'Workflow desk', '업무', '회사 디렉터리'],
          },
        },
    null,
    2,
  ),
);
