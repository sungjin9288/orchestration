import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const taskDetailSnapshotsPath = path.join(repoRoot, 'ui', 'task-detail-snapshots.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const taskDetailSnapshots = fs.readFileSync(taskDetailSnapshotsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(taskDetailSnapshots, /function getRunListSnapshot\(run, task, data\)/);
assert.match(taskDetailSnapshots, /function getArtifactListSnapshot\(artifact, task, data\)/);
assert.match(taskDetailSnapshots, /function getInboxListSnapshot\(item, task, approval, evidenceRail = null\)/);

assert.match(appJs, /class="card list-button ops-list-button/);
assert.match(appJs, /class="ops-list-head ops-list-register ops-list-register-primary"/);
assert.match(appJs, /class="ops-list-summary ops-list-register"/);
assert.match(appJs, /class="ops-list-label">현재 상태<\/p>/);
assert.match(appJs, /class="ops-list-label">다음 확인<\/p>/);
assert.match(appJs, /class="list-copy list-copy-compact ops-list-meta"/);
assert.match(appJs, /class="list-copy list-copy-compact ops-list-next"/);

assert.match(taskDetailSnapshots, /승인선 직전 상태를 남긴 실행 보고입니다\./);
assert.match(taskDetailSnapshots, /실행 전 범위와 점검 기준을 묶은 증적입니다\./);
assert.match(taskDetailSnapshots, /사람 승인 판단이 남아 있는 결재 안건입니다\./);
assert.match(taskDetailSnapshots, /다음: 원문 로그 확인/);
assert.match(taskDetailSnapshots, /다음: 미리보기와 원문 확인/);
assert.match(taskDetailSnapshots, /다음: 승인 또는 반려 검토/);

assert.match(styles, /\.ops-list-button \{/);
assert.match(styles, /\.ops-list-summary \{/);
assert.match(styles, /\.ops-list-label \{/);
assert.match(styles, /\.ops-list-next \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoOpsListControlShell: {
        helpers: ['getRunListSnapshot', 'getArtifactListSnapshot', 'getInboxListSnapshot'],
        classes: ['ops-list-button', 'ops-list-summary', 'ops-list-label', 'ops-list-next'],
        listCards: ['현재 상태', '다음 확인'],
      },
    },
    null,
    2,
  ),
);
