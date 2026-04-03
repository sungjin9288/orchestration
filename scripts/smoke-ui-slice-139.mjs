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

assert.match(app, /detail-block detail-block-action council-approval-block/);
assert.match(app, /council-approval-head/);
assert.match(app, /council-approval-copy/);
assert.match(app, /class="form-actions council-approval-row"/);
assert.match(app, /class="form-help council-approval-help"/);
assert.match(app, /이 결론을 승인하면 builder preflight까지만 넘기고, 다음 게이트에서 멈춥니다\./);

assert.match(styles, /\.council-approval-head \{[\s\S]*justify-content:\s*space-between;[\s\S]*gap:\s*12px;/);
assert.match(styles, /\.surface\[data-surface="council"\] \.council-approval-block \{[\s\S]*border-color:\s*var\(--surface-control-border\);[\s\S]*box-shadow:\s*0 18px 34px/);
assert.match(styles, /\.surface\[data-surface="council"\] \.council-approval-row \{[\s\S]*gap:\s*12px;/);
assert.match(styles, /\.surface\[data-surface="council"\] \.council-approval-help \{[\s\S]*max-width:\s*50ch;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilApprovalShelf: {
        markers: [
          'council-approval-block',
          'council-approval-head',
          'council-approval-row',
          'council-approval-help',
        ],
      },
    },
    null,
    2,
  ),
);
