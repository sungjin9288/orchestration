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

assert.match(app, /담당·상태·다음만 먼저 봅니다\./);
assert.match(app, /담당/);
assert.match(app, /막힘/);
assert.match(app, /다음/);

assert.match(
  styles,
  /\.surface-entry-frame\.briefing-hero,\s*\.surface-entry-frame\.surface-lead-strip \{[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.surface\[data-surface="taskboard"\] \.surface-entry-frame\.surface-lead-strip,[\s\S]*border-style:\s*solid;[\s\S]*background:\s*rgba\(255, 255, 255, 0\.99\);[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.surface\[data-surface\] \.surface-entry-frame \.secondary-button,[\s\S]*background:\s*rgba\(255, 255, 255, 0\.99\);[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.04\);/s,
);
assert.match(
  styles,
  /\.surface\[data-surface\] \.surface-entry-frame \.primary-button,[\s\S]*background:\s*color-mix\(in srgb, var\(--surface-entry-accent\) 86%, #213931 14%\);[\s\S]*box-shadow:\s*0 1px 2px rgba\(12, 22, 30, 0\.06\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfaceEntryReadability: {
        copy: ['담당·상태·다음만 먼저 봅니다.', '담당', '막힘', '다음'],
        flattening: ['surface-entry-frame flatter shadow', 'surface-lead-strip solid board tone', 'entry-frame primary/secondary buttons flattened'],
      },
    },
    null,
    2,
  ),
);
