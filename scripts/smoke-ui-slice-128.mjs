import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.viewport-handoff-card \{[\s\S]*position:\s*relative;[\s\S]*overflow:\s*hidden;[\s\S]*border-radius:\s*8px;[\s\S]*background:\s*rgba\(255, 255, 255, 0\.99\);[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.04\);/);
assert.match(styles, /\.viewport-handoff-card::before \{/);
assert.match(styles, /\.viewport-handoff-card-emphasis \{[\s\S]*background:\s*rgba\(238, 242, 246, 0\.99\);[\s\S]*box-shadow:\s*0 1px 2px rgba\(122, 88, 60, 0\.05\);/);
assert.match(styles, /\.viewport-handoff-card-emphasis::before \{/);
assert.match(styles, /\.viewport-handoff-card:hover,\s*\.viewport-handoff-card:focus-within \{[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.04\);/);
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
          'border-radius: 8px',
          '0 1px 2px rgba(12, 22, 30, 0.04)',
          'animation-delay: 220ms',
          'animation-delay: 260ms',
        ],
      },
    },
    null,
    2,
  ),
);
