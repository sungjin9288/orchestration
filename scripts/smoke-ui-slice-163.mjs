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

assert.match(app, /function getCompanySignalEntries\(options = \{\}\)/);
assert.match(app, /card\.signal/);
assert.match(app, /viewport-handoff-signal/);
assert.match(app, /signal: missionSignalBySurface\.mission/);
assert.match(app, /signal: missionSignalBySurface\['decision-inbox'\]/);
assert.match(app, /signal: missionSignalBySurface\[missionNextSurface\] \|\| missionSignalBySurface\.mission/);
assert.match(app, /signal: councilSignalBySurface\.council/);
assert.match(app, /signal: councilSignalBySurface\['decision-inbox'\]/);
assert.match(app, /signal: councilSignalBySurface\[councilNextSurface\] \|\| councilSignalBySurface\.council/);

assert.match(styles, /\.viewport-handoff-signal \{/);
assert.match(styles, /\.viewport-handoff-signal-success \{/);
assert.match(styles, /\.viewport-handoff-signal-accent \{/);
assert.match(styles, /\.viewport-handoff-signal-warning \{/);
assert.match(styles, /\.viewport-handoff-signal-danger \{/);
assert.match(styles, /\.viewport-handoff-signal-dot \{/);
assert.match(styles, /\.viewport-handoff-signal-status \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      handoffSignalBridge: {
        sharedSource: 'getCompanySignalEntries',
        surfaces: ['mission', 'council'],
      },
    },
    null,
    2,
  ),
);
