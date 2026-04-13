import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /<h1>Orchestration<\/h1>/);
assert.match(indexHtml, /Workflow Control/);
assert.match(indexHtml, /Workflow desk/);
assert.doesNotMatch(indexHtml, /<div class="shell-window-dots">/);

assert.match(styles, /\.shell-window-dots \{\s*display: none;/s);
assert.match(
  styles,
  /\.boardroom-seat-avatar-head,\s*\.boardroom-seat-avatar-body,\s*\.boardroom-seat-avatar-eye,\s*\.boardroom-seat-avatar-smile,\s*\.boardroom-seat-avatar-accessory \{\s*display: none;/s,
);
assert.match(
  styles,
  /\.surface\[data-surface="mission"\] \.mission-intake-board \{\s*gap: 18px;\s*padding: 16px;\s*border-radius: 12px;\s*background: rgba\(255, 255, 255, 0\.98\);/s,
);
assert.match(
  styles,
  /\.surface\[data-surface="council"\] \.council-meeting-board \{\s*gap: 18px;\s*padding: 16px;\s*border-radius: 12px;\s*background: rgba\(255, 255, 255, 0\.98\);/s,
);
assert.match(
  styles,
  /\.surface\[data-surface="execution"\] \.execution-control-board \{\s*gap: 18px;\s*padding: 16px;\s*border-radius: 12px;\s*background: rgba\(255, 255, 255, 0\.98\);/s,
);
assert.match(
  styles,
  /\.surface\[data-surface="deliverables"\] \.deliverables-delivery-board \{\s*gap: 18px;\s*padding: 16px;\s*border-radius: 12px;\s*background: rgba\(255, 255, 255, 0\.98\);/s,
);

console.log(
  JSON.stringify(
        {
          ok: true,
          enterpriseSurfaceFlattening: {
        shell: ['Orchestration', 'Workflow Control', 'Workflow desk'],
        guards: ['shell-window-dots removed from index', 'boardroom avatar parts hidden'],
        boards: ['mission-intake-board', 'council-meeting-board', 'execution-control-board', 'deliverables-delivery-board'],
      },
    },
    null,
    2,
  ),
);
