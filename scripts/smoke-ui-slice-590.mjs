import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-target-surface="\$\{escapeHtml\(surface\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(surface\)\}"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(location\.targetSurface\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(location\.targetSurface\)\}"/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.action\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.doesNotMatch(appJs, /aria-label="결과 확인:/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookActionPanelControls: {
        shortcutButtons: 'surface-{target} panel ownership',
        resultButton: 'surface-{resultSurface} panel ownership',
        nextButton: 'surface-{targetSurface} panel ownership',
        actionPath: 'open-surface unchanged',
      },
    },
    null,
    2,
  ),
);
