import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.viewport-handoff-card \{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;[\s\S]*box-shadow:\s*0 12px 24px rgba\(64, 51, 38, 0\.05\);/);
assert.match(styles, /\.viewport-handoff-card::before \{/);
assert.match(styles, /\.viewport-handoff-card-emphasis \{[\s\S]*0 16px 28px rgba\(122, 88, 60, 0\.08\);/);
assert.match(styles, /\.viewport-handoff-card-emphasis::before \{/);
assert.match(styles, /\.viewport-handoff-card:hover,\s*\.viewport-handoff-card:focus-within \{[\s\S]*transform:\s*translateY\(-2px\);/);
assert.match(styles, /\.surface-entry-frame \.viewport-handoff-card,\s*\.surface-entry-frame \.charter-card,/);
assert.match(styles, /\.surface-entry-frame \.viewport-handoff-grid > \.viewport-handoff-card:nth-of-type\(1\) \{[\s\S]*animation-delay:\s*220ms;/);
assert.match(styles, /\.surface-entry-frame \.viewport-handoff-grid > \.viewport-handoff-card:nth-of-type\(3\) \{[\s\S]*animation-delay:\s*260ms;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      handoffRhythmSync: {
        markers: [
          'viewport-handoff-card::before',
          'translateY(-2px)',
          'animation-delay: 220ms',
          'animation-delay: 260ms',
        ],
      },
    },
    null,
    2,
  ),
);
