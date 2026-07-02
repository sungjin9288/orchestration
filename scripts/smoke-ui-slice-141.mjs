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

assert.match(app, /empty-state mission-empty-state mission-empty-state-list/);
assert.match(app, /empty-state mission-empty-state mission-empty-state-detail/);
assert.match(app, /class="mission-empty-title">등록 안건 없음<\/strong>/);
assert.match(app, /class="mission-empty-title">선택된 안건 없음<\/strong>/);
assert.match(app, /class="mission-empty-copy">위 등록대장에서 첫 안건을 만들면 이곳에 바로 쌓입니다\.<\/p>/);
assert.match(app, /class="mission-empty-copy">왼쪽 등록대장에서 안건을 고르거나 위 입력선에서 새 안건을 등록합니다\.<\/p>/);

assert.match(styles, /\.surface\[data-surface="mission"\] \.mission-empty-state \{[\s\S]*padding:\s*18px 18px 17px;[\s\S]*border-color:\s*var\(--surface-control-border\);/);
assert.match(styles, /\.surface\[data-surface="mission"\] \.mission-empty-state::before \{[\s\S]*height:\s*2px;[\s\S]*opacity:\s*0\.82;/);
assert.match(styles, /\.mission-empty-title \{[\s\S]*font-size:\s*1rem;[\s\S]*letter-spacing:\s*-0\.012em;/);
assert.match(styles, /\.mission-empty-copy \{[\s\S]*max-width:\s*44ch;[\s\S]*line-height:\s*1\.46;/);
assert.match(styles, /\.mission-empty-state-list \{[\s\S]*gap:\s*14px;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionEmptyHierarchy: {
        markers: [
          'mission-empty-state-list',
          'mission-empty-state-detail',
          'mission-empty-title',
          'mission-empty-copy',
        ],
      },
    },
    null,
    2,
  ),
);
