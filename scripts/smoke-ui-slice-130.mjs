import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.mission-row-card \{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;[\s\S]*transition:\s*transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease;/);
assert.match(styles, /\.mission-row-card::before \{/);
assert.match(styles, /\.mission-row-card:hover,\s*\.mission-row-card:focus-within \{[\s\S]*transform:\s*translateY\(-1px\);/);
assert.match(styles, /\.mission-row-card:hover::before,\s*\.mission-row-card:focus-within::before,\s*\.mission-row-card\.is-selected::before \{[\s\S]*opacity:\s*0\.94;/);
assert.match(styles, /\.mission-row-card\.is-selected \{[\s\S]*background:[\s\S]*rgba\(255, 249, 241, 0\.94\);[\s\S]*transform:\s*translateY\(-2px\);/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-goal,\s*\.mission-row-card\.is-selected \.mission-row-next \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowSelectionEmphasis: {
        markers: [
          'mission-row-card::before',
          'translateY(-1px)',
          'opacity: 0.94',
          'rgba(255, 249, 241, 0.94)',
          'translateY(-2px)',
        ],
      },
    },
    null,
    2,
  ),
);
