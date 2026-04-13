import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(
  styles,
  /\.office-sidebar \{\s*position: sticky;[\s\S]*?border-radius: 12px;[\s\S]*?background: rgba\(252, 253, 254, 0\.98\);[\s\S]*?box-shadow: 0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.office-rule-list,\s*\.office-workflow-list \{[\s\S]*?color: #5a6670;[\s\S]*?font-size: 0\.83rem;/s,
);
assert.match(
  styles,
  /\.office-sidebar-status-register \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?gap: 8px;/s,
);
assert.match(
  styles,
  /\.control-overview-register \{[\s\S]*?border-radius: 8px;[\s\S]*?background: rgba\(247, 249, 251, 0\.96\);/s,
);
assert.match(
  styles,
  /\.nav-button\.is-active\[data-surface="mission"\] \{[\s\S]*?box-shadow: 0 1px 2px rgba\(154, 94, 47, 0\.05\);/s,
);
assert.match(
  styles,
  /\.detail-block-action \{[\s\S]*?border-radius: 8px;[\s\S]*?background: rgba\(255, 255, 255, 0\.96\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      enterprisePolish: {
        sidebar: ['rgba(252, 253, 254, 0.98)', '0 1px 2px rgba(12, 22, 30, 0.04)'],
        text: ['office-rule-list muted copy = #5a6670'],
        cards: ['office-sidebar-status-register live', 'control-overview-register flattened', 'detail-block-action flattened'],
        activeNav: ['mission active shadow reduced to 0 1px 2px rgba(154, 94, 47, 0.05)'],
      },
    },
    null,
    2,
  ),
);
