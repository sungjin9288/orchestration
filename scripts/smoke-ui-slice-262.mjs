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
  /\.shell-header,\s*\.primary-nav,\s*\.surface,\s*\.surface-panel,\s*\.card,\s*\.detail-card,\s*\.empty-state \{[\s\S]*?backdrop-filter: none;/s,
);
assert.match(
  styles,
  /\.office-brand-copy,\s*\.office-brand-badges,\s*\.nav-group-copy,\s*\.shell-lead-secondary,\s*\.shell-command-strip,\s*\.office-workflow \{[\s\S]*?display: none;/s,
);
assert.match(
  styles,
  /\.control-overview-panel \{[\s\S]*?background: rgba\(255, 255, 255, 0\.99\);[\s\S]*?box-shadow: 0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.ops-list-button \{[\s\S]*?background: rgba\(255, 255, 255, 0\.98\);[\s\S]*?box-shadow: 0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.taskboard-task-card \{[\s\S]*?background: rgba\(255, 255, 255, 0\.98\);[\s\S]*?box-shadow: 0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      readabilityPolish: {
        hiddenSecondaryChrome: [
          'office-brand-copy',
          'office-brand-badges',
          'nav-group-copy',
          'shell-lead-secondary',
          'shell-command-strip',
          'office-workflow',
        ],
        flatterPanels: ['control-overview-panel', 'ops-list-button', 'taskboard-task-card'],
        blur: 'removed',
      },
    },
    null,
    2,
  ),
);
