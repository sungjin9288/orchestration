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

assert.match(app, /function getCompanyFloorBoardEntries\(data, navGroupId\)/);
assert.match(app, /업무 흐름/);
assert.match(app, /검토 큐/);
assert.match(app, /회사 구조/);
assert.match(app, /선택된 work order/);
assert.match(app, /실행 인계/);
assert.match(app, /surface: 'mission'/);
assert.match(app, /surface: 'council'/);
assert.match(app, /surface: 'execution'/);
assert.match(app, /surface: 'deliverables'/);
assert.match(app, /surface: 'artifacts'/);
assert.match(app, /surface: 'logs'/);
assert.match(app, /surface: 'decision-inbox'/);
assert.match(app, /surface: 'taskboard'/);
assert.match(app, /workflow-stage-stack/);
assert.match(app, /review-lane-stack/);
assert.match(app, /ops-roster-matrix/);
assert.match(app, /ops-team-section-list/);

assert.match(styles, /\.workflow-stage-stack \{/);
assert.match(styles, /\.workflow-stage-card \{/);
assert.match(styles, /\.review-lane-stack \{/);
assert.match(styles, /\.review-lane-card \{/);
assert.match(styles, /\.ops-roster-matrix \{/);
assert.match(styles, /\.ops-team-section-list \{/);
assert.match(styles, /\.company-roster-row,\s*\.ops-roster-row \{/s);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeControlQueue: {
        headings: ['업무 흐름', '선택된 work order', '실행 인계', '검토 큐', '회사 구조'],
        lanes: ['mission', 'council', 'execution', 'deliverables', 'artifacts', 'logs', 'decision-inbox', 'taskboard'],
      },
    },
    null,
    2,
  ),
);
