import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.boardroom-stage \{[\s\S]*gap:\s*16px;/);
assert.match(styles, /\.boardroom-stage-compact \{[\s\S]*gap:\s*12px;/);
assert.match(styles, /\.boardroom-table \{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;[\s\S]*0 18px 36px rgba\(112, 85, 60, 0\.08\);/);
assert.match(styles, /\.boardroom-table::before \{/);
assert.match(styles, /\.boardroom-seat \{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;[\s\S]*padding:\s*15px 15px 13px;/);
assert.match(styles, /\.boardroom-seat::before \{/);
assert.match(styles, /\.boardroom-seat-accent::before,\s*\.boardroom-seat-lead::before \{/);
assert.match(styles, /\.boardroom-seat-success::before \{/);
assert.match(styles, /\.boardroom-seat-warning::before \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      boardroomVisualPolish: {
        markers: [
          'boardroom-table::before',
          'boardroom-seat::before',
          'gap: 16px',
          'padding: 15px 15px 13px',
        ],
      },
    },
    null,
    2,
  ),
);
