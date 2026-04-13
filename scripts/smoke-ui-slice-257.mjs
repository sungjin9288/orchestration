import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(
  styles,
  /\.control-overview-panel \{[\s\S]*border-radius:\s*8px;[\s\S]*background:\s*rgba\(255, 255, 255, 0\.99\);[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.control-overview-register \{[\s\S]*border-radius:\s*8px;[\s\S]*background:\s*rgba\(247, 249, 251, 0\.96\);/s,
);
assert.match(
  styles,
  /\.workflow-stage-card \{[\s\S]*border-radius:\s*8px;[\s\S]*background:\s*rgba\(255, 255, 255, 0\.98\);/s,
);
assert.match(
  styles,
  /\.workflow-stage-index \{[\s\S]*border-radius:\s*999px;[\s\S]*background:\s*rgba\(20, 34, 42, 0\.08\);/s,
);
assert.match(
  styles,
  /\.control-overview-detail-cell \{[\s\S]*border-radius:\s*8px;[\s\S]*background:\s*rgba\(255, 255, 255, 0\.98\);/s,
);
assert.match(
  styles,
  /\.control-overview-grid \{[\s\S]*grid-template-columns:\s*minmax\(300px, 1\.1fr\) minmax\(0, 1\.15fr\) minmax\(280px, 0\.9fr\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      controlOverviewFlattening: {
        firstViewport: ['control-overview-panel flatter enterprise shell', 'control-overview-register flatter enterprise shell', 'workflow-stage-card flatter enterprise shell'],
        detailCells: ['control-overview-detail-cell flattened'],
        layout: ['control-overview-grid tri-pane layout'],
      },
    },
    null,
    2,
  ),
);
