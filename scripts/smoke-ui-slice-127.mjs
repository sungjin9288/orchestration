import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(app, /const briefingSteps = ORCHESTRATION_FLOW_STEPS\.map\(\(step, index\) => \{/);
assert.match(app, /briefing-step briefing-step-active/);
assert.match(app, /briefing-step briefing-step-complete/);
assert.match(app, /briefing-step-number/);
assert.match(app, /briefing-step-state/);

assert.match(styles, /\.briefing-steps \{[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(auto-fit, minmax\(148px, 1fr\)\);/);
assert.match(styles, /\.briefing-step \{[\s\S]*position:\s*relative;[\s\S]*padding:\s*10px 12px;[\s\S]*border-radius:\s*18px;/);
assert.match(styles, /\.briefing-step-active \{[\s\S]*transform:\s*translateY\(-1px\);/);
assert.match(styles, /\.briefing-step-complete::before \{/);
assert.match(styles, /\.surface-entry-frame \.viewport-handoff-card,\s*\.surface-entry-frame \.charter-card,\s*\.surface-entry-frame \.charter-flow-step,\s*\.surface-entry-frame \.charter-signal-chip,\s*\.surface-entry-frame \.briefing-step,\s*\.surface-entry-frame \.boardroom-table,\s*\.surface-entry-frame \.boardroom-seat \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      heroProgressRail: {
        markers: [
          'const briefingSteps = ORCHESTRATION_FLOW_STEPS.map',
          'briefing-step-active',
          'grid-template-columns: repeat(auto-fit, minmax(148px, 1fr))',
          '.surface-entry-frame .briefing-step',
        ],
      },
    },
    null,
    2,
  ),
);
