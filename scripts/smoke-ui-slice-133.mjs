import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.mission-row-button \{[\s\S]*gap:\s*7px;/);
assert.match(styles, /\.mission-row-goal \{[\s\S]*font-size:\s*0\.9rem;[\s\S]*line-height:\s*1\.42;[\s\S]*letter-spacing:\s*0;/);
assert.match(styles, /\.mission-row-goal \{[\s\S]*-webkit-line-clamp:\s*2;[\s\S]*min-height:\s*calc\(1\.42em \* 2\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowGoalRhythm: {
        markers: [
          'gap: 7px',
          'font-size: 0.9rem',
          'line-height: 1.42',
          'letter-spacing: 0',
          'min-height: calc(1.42em * 2)',
        ],
      },
    },
    null,
    2,
  ),
);
