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

assert.match(appJs, /currentSurface: 'artifacts'/);
assert.match(appJs, /renderBuilderLiveMutationApprovalPanel\(selectedArtifactTask, data\)/);
assert.match(appJs, /renderPreselectedPendingItemHint\(preselectedPendingItem, preselectedApproval/);

assert.match(styles, /\.surface\[data-surface="artifacts"\] \.guard-summary > \.form-actions,/);
assert.match(styles, /\.surface\[data-surface="artifacts"\] \.breakdown-inbox-hint > \.form-actions \{/);
assert.match(styles, /\.surface\[data-surface="artifacts"\] \.guard-summary > \.form-actions \.danger-button,/);
assert.match(styles, /\.surface\[data-surface="artifacts"\] \.guard-summary > \.form-actions \.primary-button:hover:not\(:disabled\),/);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactsActionShelf: {
        selectors: [
          'guard-summary > .form-actions',
          'breakdown-inbox-hint > .form-actions',
          'artifacts action hover accent',
        ],
      },
    },
    null,
    2,
  ),
);
