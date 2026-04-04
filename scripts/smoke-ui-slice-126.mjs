import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /@keyframes surface-entry-rise \{/);
assert.match(
  styles,
  /\.surface-entry-frame \.charter-card,\s*\.surface-entry-frame \.charter-flow-step,\s*\.surface-entry-frame \.charter-signal-chip,\s*\.surface-entry-frame \.briefing-step,\s*\.surface-entry-frame \.boardroom-table,\s*\.surface-entry-frame \.boardroom-seat \{[\s\S]*animation:\s*surface-entry-rise 440ms cubic-bezier\(0\.22, 1, 0\.36, 1\) both;/,
);
assert.match(styles, /\.surface-entry-frame \.briefing-charter > \.charter-card:nth-of-type\(1\),\s*\.surface-entry-frame \.boardroom-table \{[\s\S]*animation-delay:\s*40ms;/);
assert.match(styles, /\.surface-entry-frame \.briefing-charter > \.charter-card:nth-of-type\(2\),\s*\.surface-entry-frame \.boardroom-seat-lead \{[\s\S]*animation-delay:\s*90ms;/);
assert.match(styles, /\.surface-entry-frame \.briefing-charter > \.charter-card:nth-of-type\(4\),\s*\.surface-entry-frame \.briefing-step,\s*\.surface-entry-frame \.boardroom-seat-bottom,\s*\.surface-entry-frame \.charter-flow-step \{[\s\S]*animation-delay:\s*190ms;/);
assert.match(styles, /\.surface-entry-frame \.charter-card:hover,[\s\S]*transform:\s*translateY\(-3px\);/);
assert.match(
  styles,
  /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\.surface-entry-frame \.charter-signal-chip,\s*\.surface-entry-frame \.briefing-step,\s*\.surface-entry-frame \.boardroom-table,\s*\.surface-entry-frame \.boardroom-seat,\s*\.mission-row-card\.is-selected \.mission-row-rail-button \{[\s\S]*animation:\s*none;/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      heroEntranceMotion: {
        markers: [
          '@keyframes surface-entry-rise',
          'animation: surface-entry-rise 440ms',
          'animation-delay: 40ms',
          'animation-delay: 190ms',
          'prefers-reduced-motion',
        ],
      },
    },
    null,
    2,
  ),
);
