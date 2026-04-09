import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /review-overview-packet/);
assert.match(appJs, /review-overview-inspector/);
assert.match(appJs, /review-queue-summary/);
assert.match(appJs, /review-packet-strip/);
assert.match(appJs, /Review inspector/);
assert.match(appJs, /판단 메모/);
assert.match(appJs, /ops-team-board/);
assert.match(appJs, /ops-create-card/);
assert.match(appJs, /ops-staffing-table/);
assert.match(appJs, /ops-staffing-row/);

assert.match(styles, /\.review-overview-packet,/);
assert.match(styles, /\.review-queue-summary \{/);
assert.match(styles, /\.review-packet-strip \{/);
assert.match(styles, /\.review-packet-note \{/);
assert.match(styles, /\.review-inspector-register,/);
assert.match(styles, /\.ops-team-board \{/);
assert.match(styles, /\.ops-create-card \{/);
assert.match(styles, /\.ops-staffing-table \{/);
assert.match(styles, /\.ops-staffing-row \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      groupedWorkspaceLayoutPolish: {
        review: ['review-overview-packet', 'review-overview-inspector', 'review-queue-summary', 'review-packet-strip'],
        ops: ['ops-team-board', 'ops-create-card', 'ops-staffing-table', 'ops-staffing-row'],
      },
    },
    null,
    2,
  ),
);
