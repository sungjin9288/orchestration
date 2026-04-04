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

assert.match(app, /stack council-outcome-stack/);
assert.match(app, /relation-strip council-outcome-card council-outcome-card-summary/);
assert.match(app, /relation-strip council-outcome-card council-outcome-card-recommendation/);
assert.match(app, /relation-strip council-outcome-card council-outcome-card-plan/);
assert.match(app, /relation-strip council-outcome-card council-outcome-card-questions/);
assert.match(app, /council-outcome-head/);
assert.match(app, /council-outcome-title/);
assert.match(app, /council-outcome-copy council-outcome-question/);

assert.match(styles, /\.council-outcome-card \{[\s\S]*padding:\s*12px 13px;[\s\S]*gap:\s*8px;/);
assert.match(styles, /\.council-outcome-card::before \{[\s\S]*height:\s*2px;[\s\S]*opacity:\s*0\.78;/);
assert.match(styles, /\.council-outcome-card-recommendation \{[\s\S]*border-color:\s*rgba\(154, 94, 47, 0\.22\);[\s\S]*box-shadow:\s*0 12px 24px rgba\(154, 94, 47, 0\.06\);/);
assert.match(styles, /\.council-outcome-title \{[\s\S]*font-size:\s*0\.93rem;[\s\S]*letter-spacing:\s*-0\.01em;/);
assert.match(styles, /\.council-outcome-question \{[\s\S]*padding-top:\s*7px;[\s\S]*border-top:\s*1px solid rgba\(33, 57, 49, 0\.08\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilOutcomeHierarchy: {
        markers: [
          'council-outcome-card-summary',
          'council-outcome-card-recommendation',
          'council-outcome-card-plan',
          'council-outcome-card-questions',
          'padding: 12px 13px',
        ],
      },
    },
    null,
    2,
  ),
);
