import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /id="control-overview"/);
assert.doesNotMatch(indexHtml, /id="company-floor-board"/);
assert.doesNotMatch(indexHtml, /id="surface-focus-strip"/);

assert.match(app, /renderControlOverview\(data\);/);
assert.doesNotMatch(app, /renderSummary\(data\);/);
assert.doesNotMatch(app, /renderCompanyFloorBoard\(data\);/);
assert.doesNotMatch(app, /renderSurfaceFocusStrip\(data\);/);
assert.match(app, /Workflow map/);
assert.match(app, /Review queue/);
assert.match(app, /Company org/);
assert.match(app, /AI staffing desk/);

assert.match(styles, /\.control-overview \{/);
assert.match(styles, /\.control-overview-grid \{/);
assert.match(styles, /\.control-overview-panel \{/);
assert.match(styles, /\.control-overview-action \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      controlOverviewReset: {
        removed: ['company-floor-board', 'surface-focus-strip'],
        activeCall: ['renderControlOverview(data);'],
        panes: ['Workflow map', 'Review queue', 'Company org'],
      },
    },
    null,
    2,
  ),
);
