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

assert.match(app, /relation-strip transcript-card/);
assert.match(app, /card-title-row card-title-row-tight transcript-card-head/);
assert.match(app, /transcript-card-role/);
assert.match(app, /detail-copy detail-copy-compact transcript-card-copy/);

assert.match(styles, /\.transcript-card \{[\s\S]*gap:\s*8px;[\s\S]*padding:\s*12px 13px;/);
assert.match(styles, /\.transcript-card-head \{[\s\S]*align-items:\s*flex-start;[\s\S]*gap:\s*8px 10px;/);
assert.match(styles, /\.transcript-card-role \{[\s\S]*font-size:\s*0\.92rem;[\s\S]*letter-spacing:\s*-0\.01em;/);
assert.match(styles, /\.transcript-card-head \.token \{[\s\S]*box-shadow:\s*inset 0 1px 0 rgba\(255, 255, 255, 0\.42\);/);
assert.match(styles, /\.transcript-card-copy \{[\s\S]*line-height:\s*1\.48;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilTranscriptHierarchy: {
        markers: [
          'relation-strip transcript-card',
          'transcript-card-head',
          'font-size: 0.92rem',
          'padding: 12px 13px',
          'line-height: 1.48',
        ],
      },
    },
    null,
    2,
  ),
);
