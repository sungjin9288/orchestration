import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.mission-row-summary \{[\s\S]*font-size:\s*0\.82rem;[\s\S]*opacity:\s*0\.88;/);
assert.match(styles, /\.mission-row-foot \{[\s\S]*gap:\s*7px;[\s\S]*padding-top:\s*2px;/);
assert.match(styles, /\.mission-row-next \{[\s\S]*font-size:\s*0\.84rem;[\s\S]*letter-spacing:\s*-0\.01em;/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-summary \{/);
assert.match(styles, /\.mission-row-card\.is-selected \.mission-row-next \{[\s\S]*rgba\(24, 43, 36, 0\.98\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowBodyHierarchy: {
        markers: [
          'font-size: 0.82rem',
          'opacity: 0.88',
          'gap: 7px',
          'font-size: 0.84rem',
          'rgba(24, 43, 36, 0.98)',
        ],
      },
    },
    null,
    2,
  ),
);
