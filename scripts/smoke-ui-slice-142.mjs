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

assert.match(app, /empty-state empty-state-inline mission-empty-state mission-empty-state-row \$\{escapeHtml\(emptyStateClass\)\}/);
assert.match(app, /'mission-empty-state-active-row'/);
assert.match(app, /'mission-empty-state-complete-row'/);
assert.match(app, /위 등록대장에서 새 안건을 올리면 바로 이 줄에 이어집니다\./);
assert.match(app, /종료 정리까지 끝난 안건이 생기면 이 줄에 보관됩니다\./);

assert.match(styles, /\.mission-empty-state-row \{[\s\S]*padding:\s*15px 16px 14px;[\s\S]*border-radius:\s*18px;/);
assert.match(styles, /\.mission-empty-state-active-row \{[\s\S]*rgba\(255, 255, 255, 0\.92\)/);
assert.match(styles, /\.mission-empty-state-complete-row \{[\s\S]*rgba\(241, 250, 244, 0\.98\)/);
assert.match(styles, /\.mission-empty-state-row \.mission-empty-title \{[\s\S]*font-size:\s*0\.94rem;/);
assert.match(styles, /\.mission-empty-state-row \.mission-empty-copy \{[\s\S]*font-size:\s*0\.85rem;[\s\S]*line-height:\s*1\.42;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRowEmptyHierarchy: {
        markers: [
          'mission-empty-state-row',
          'mission-empty-state-active-row',
          'mission-empty-state-complete-row',
        ],
      },
    },
    null,
    2,
  ),
);
