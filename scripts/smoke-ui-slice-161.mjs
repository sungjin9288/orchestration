import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(app, /function renderHomeCompanyPulseStrip\(options\)/);
assert.match(app, /<strong>company pulse<\/strong>/);
assert.match(app, /같은 안건이 회의, 실행, 보고, 사람 게이트를 지나며 작은 회사 heartbeat처럼 이어집니다\./);
assert.match(app, /surface: 'mission'/);
assert.match(app, /surface: 'council'/);
assert.match(app, /surface: 'execution'/);
assert.match(app, /surface: 'deliverables'/);
assert.match(app, /surface: 'decision-inbox'/);
assert.match(app, /company-pulse-card company-pulse-card-\$\{escapeHtml\(card\.surface\)\}/);

assert.match(styles, /\.company-pulse-strip \{/);
assert.match(styles, /\.company-pulse-grid \{/);
assert.match(styles, /\.company-pulse-card \{/);
assert.match(styles, /\.company-pulse-card\.is-active \{/);
assert.match(styles, /\.company-pulse-signal-success \{/);
assert.match(styles, /\.company-pulse-card-deliverables \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeCompanyPulse: {
        heading: 'company pulse',
        lanes: ['mission', 'council', 'execution', 'deliverables', 'decision-inbox'],
      },
    },
    null,
    2,
  ),
);
