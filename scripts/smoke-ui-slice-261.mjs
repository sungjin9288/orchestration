import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.doesNotMatch(styles, /\.shell-summary \{/);
assert.doesNotMatch(styles, /\.company-floor-board \{/);
assert.doesNotMatch(styles, /\.company-floor-row \{/);
assert.doesNotMatch(styles, /\.summary-card \{/);
assert.doesNotMatch(styles, /\.summary-card-primary \{/);
assert.doesNotMatch(styles, /\.surface-focus-strip \{/);
assert.doesNotMatch(styles, /\.surface-focus-grid \{/);
assert.doesNotMatch(styles, /\.surface-focus-card \{/);
assert.doesNotMatch(styles, /\.company-pulse-strip \{/);
assert.doesNotMatch(styles, /\.company-pulse-row \{/);
assert.doesNotMatch(styles, /\.company-pulse-banner-register \{/);
assert.doesNotMatch(styles, /\.company-pulse-register \{/);

assert.match(styles, /\.control-overview \{/);
assert.match(styles, /\.control-overview-register \{/);
assert.match(styles, /\.office-sidebar-status-register \{/);
assert.match(styles, /\.surface-lead-register \{/);
assert.match(styles, /\.viewport-handoff-register \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      controlOverviewCssCleanup: {
        removed: ['shell-summary', 'company-floor-board', 'summary-card', 'surface-focus-strip', 'company-pulse-strip'],
        retained: ['control-overview', 'control-overview-register', 'office-sidebar-status-register', 'surface-lead-register', 'viewport-handoff-register'],
      },
    },
    null,
    2,
  ),
);
