import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /data-action="run-builder-live-mutation"/);
assert.match(appJs, /data-action="run-reviewer"/);
assert.match(appJs, /data-action="run-commit-package"/);
assert.match(appJs, /data-action="run-release-package"/);
assert.match(appJs, /data-action="run-close-out"/);

assert.match(styles, /\.surface\[data-surface="execution"\] \.relation-strip > \.form-actions \{/);
assert.match(styles, /\.surface\[data-surface="execution"\] \.relation-strip > \.form-actions \.form-help \{/);
assert.match(styles, /\.surface\[data-surface="execution"\] \.relation-strip > \.form-actions \.danger-button \{/);
assert.match(styles, /\.surface\[data-surface="execution"\] \.relation-strip > \.form-actions \.primary-button:hover:not\(:disabled\),/);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionActionShelf: {
        selectors: [
          'relation-strip > .form-actions',
          'execution action hover accent',
          'run-builder-live-mutation',
          'run-reviewer',
        ],
      },
    },
    null,
    2,
  ),
);
