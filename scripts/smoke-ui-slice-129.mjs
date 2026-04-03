import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.mission-row-rail \{[\s\S]*gap:\s*10px;/);
assert.match(styles, /\.mission-row-rail-button \{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;[\s\S]*box-shadow:\s*0 12px 24px rgba\(64, 51, 38, 0\.05\);/);
assert.match(styles, /\.mission-row-rail-button::before \{/);
assert.match(styles, /\.mission-row-rail-button:hover:not\(:disabled\),\s*\.mission-row-rail-button:focus-visible:not\(:disabled\) \{[\s\S]*transform:\s*translateY\(-2px\);/);
assert.match(styles, /\.mission-row-rail-button-next \{[\s\S]*box-shadow:\s*0 16px 28px rgba\(122, 88, 60, 0\.08\);/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-rail-button \{[\s\S]*animation:\s*surface-entry-rise 400ms cubic-bezier\(0\.22, 1, 0\.36, 1\) both;/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-rail-button:nth-of-type\(4\) \{[\s\S]*animation-delay:\s*130ms;/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-rail-button-next::before \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowRailRhythm: {
        markers: [
          'mission-row-rail gap: 10px',
          'mission-row-rail-button::before',
          'translateY(-2px)',
          'surface-entry-rise 400ms',
          'animation-delay: 130ms',
        ],
      },
    },
    null,
    2,
  ),
);
