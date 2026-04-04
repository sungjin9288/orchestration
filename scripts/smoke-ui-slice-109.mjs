import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /id="surface-mission" class="surface is-active" data-surface="mission"/);
assert.match(indexHtml, /id="surface-decision-inbox" class="surface" data-surface="decision-inbox"/);

assert.match(appJs, /briefing-hero briefing-hero-compact surface-entry-frame/);
assert.match(appJs, /surface-lead-strip viewport-handoff-strip surface-entry-frame/);
assert.match(appJs, /surface-lead-strip surface-entry-frame/);
assert.match(appJs, /entryFrame: true/);

assert.match(styles, /\.surface\[data-surface="mission"\] \{/);
assert.match(styles, /\.surface\[data-surface="decision-inbox"\] \{/);
assert.match(styles, /\.surface-entry-frame \{/);
assert.match(styles, /\.surface-entry-frame::before \{/);
assert.match(styles, /\.surface-entry-frame\.briefing-hero \{/);
assert.match(styles, /\.surface-entry-frame \.command-deck-label,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfaceEntranceAccent: {
        markers: ['data-surface', 'surface-entry-frame', 'entryFrame: true'],
        surfaces: ['mission', 'council', 'execution', 'deliverables', 'taskboard', 'logs', 'artifacts', 'decision-inbox'],
      },
    },
    null,
    2,
  ),
);
