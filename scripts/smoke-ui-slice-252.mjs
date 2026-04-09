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

assert.match(app, /control-overview-register-label/);
assert.match(app, /control-overview-register-row/);
assert.match(app, /surface-lead-register-label/);
assert.match(app, /viewport-handoff-register-label/);
assert.match(app, /현재 데스크/);
assert.match(app, /담당/);
assert.match(app, /안건/);
assert.match(app, /실행/);
assert.match(app, /근거/);
assert.match(app, /실행 라인업/);
assert.match(app, /검토 라인업/);
assert.match(app, /팀별 배정/);
assert.match(app, /company-directory-section-title/);
assert.match(app, /\$\{label\} 팀/);
assert.match(app, /ops-team-section-title/);
assert.match(app, /현재 분장 정보 없음/);
assert.match(app, /현재 분장 확인/);
assert.match(app, /다음 이동/);

assert.match(styles, /\.control-overview-register \{/);
assert.match(styles, /\.office-sidebar-status-register \{/);
assert.match(styles, /\.surface-lead-register \{/);
assert.match(styles, /\.viewport-handoff-register \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      enterpriseRegisterContract: {
        helpers: ['control-overview-register', 'office-sidebar-status-register', 'surface-lead-register'],
        markers: ['현재 데스크', '담당', '안건', '실행', '근거', '실행 라인업', '검토 라인업', '팀별 배정', 'company-directory-section-title', 'ops-team-section-title', '다음 이동'],
      },
    },
    null,
    2,
  ),
);
