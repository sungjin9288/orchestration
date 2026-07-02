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

assert.match(app, /Workflow map/);
assert.match(app, /업무 흐름/);
assert.match(app, /Selected work order/);
assert.match(app, /실행 인계/);
assert.match(app, /Review queue/);
assert.match(app, /검토 큐/);
assert.match(app, /Company org/);
assert.match(app, /회사 구조/);
assert.match(app, /company-directory-section-list/);
assert.match(app, /workflow-stage-stack/);
assert.match(app, /review-lane-stack/);
assert.match(app, /ops-team-section-list/);
assert.match(app, /팀별 배정/);

assert.match(styles, /\.company-directory-section-list \{/);
assert.match(styles, /\.workflow-stage-stack \{/);
assert.match(styles, /\.workflow-stage-card \{/);
assert.match(styles, /\.review-lane-stack \{/);
assert.match(styles, /\.ops-team-section-list \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      groupedWorkspaceReadabilityReset: {
        sidebar: ['company-directory-section-list', '팀별 배정'],
        workspaces: ['Workflow map', 'Selected work order', 'Execution handoff', 'Review queue', 'Company org'],
        layouts: ['workflow-stage-stack', 'review-lane-stack', 'ops-team-section-list'],
      },
    },
    null,
    2,
  ),
);
