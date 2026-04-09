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

assert.match(app, /empty-state council-empty-state council-empty-state-main/);
assert.match(app, /empty-state council-empty-state council-empty-state-detail/);
assert.match(app, /class="council-empty-title">회의 세션 없음<\/strong>/);
assert.match(app, /class="council-empty-title">권고안 선반 비어 있음<\/strong>/);
assert.match(app, /class="council-empty-copy">회의를 열면 참석 역할, 권고안, 승인 선반이 이곳에 뜹니다\.<\/p>/);

assert.match(styles, /\.council-empty-state \{[\s\S]*position:\s*relative;[\s\S]*padding:\s*18px 18px 17px;/);
assert.match(styles, /\.council-empty-state::before \{[\s\S]*height:\s*2px;[\s\S]*opacity:\s*0\.82;/);
assert.match(styles, /\.council-empty-title \{[\s\S]*font-size:\s*1rem;[\s\S]*letter-spacing:\s*-0\.012em;/);
assert.match(styles, /\.council-empty-copy \{[\s\S]*max-width:\s*46ch;[\s\S]*line-height:\s*1\.46;/);
assert.match(styles, /\.council-empty-state-main \{[\s\S]*gap:\s*14px;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilEmptyHierarchy: {
        markers: [
          'council-empty-state-main',
          'council-empty-state-detail',
          'council-empty-title',
          'council-empty-copy',
        ],
      },
    },
    null,
    2,
  ),
);
