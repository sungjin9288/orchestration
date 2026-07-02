import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const surfaceConfig = fs.readFileSync(surfaceConfigPath, 'utf8');

assert.match(surfaceConfig, /export const GROUP_PLAYBOOK_META = \{/);
assert.match(appJs, /GROUP_PLAYBOOK_META,/);
assert.match(appJs, /function renderWorkspacePlaybook\(activeGroupId, context = \{\}\)/);
assert.match(appJs, /운영 모드/);
assert.match(surfaceConfig, /업무 사용 순서/);
assert.match(surfaceConfig, /검토 사용 순서/);
assert.match(surfaceConfig, /운영 사용 순서/);
assert.match(surfaceConfig, /안건 정리/);
assert.match(surfaceConfig, /계획 정렬/);
assert.match(surfaceConfig, /패킷 선택/);
assert.match(surfaceConfig, /근거 교차/);
assert.match(surfaceConfig, /범위 선택/);
assert.match(surfaceConfig, /역할 배정/);
assert.equal((appJs.match(/\$\{renderWorkspacePlaybook\(activeGroupId, context\)\}/g) || []).length, 3);

assert.match(styles, /\.workspace-playbook \{/);
assert.match(styles, /\.workspace-playbook-grid \{/);
assert.match(styles, /\.workspace-playbook-card \{/);
assert.match(styles, /\.workspace-playbook-step \{/);
assert.match(styles, /\.workspace-playbook-note \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybook: {
        groups: ['업무 사용 순서', '검토 사용 순서', '운영 사용 순서'],
        cards: ['안건 정리', '계획 정렬', '패킷 선택', '근거 교차', '범위 선택', '역할 배정'],
        insertions: 3,
      },
    },
    null,
    2,
  ),
);
