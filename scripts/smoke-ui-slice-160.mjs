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

assert.match(appJs, /function renderCouncilHeartbeatStrip\(mission, councilSession, linkedTask\)/);
assert.match(appJs, /회의 흐름/);
assert.match(appJs, /참석 역할, 정렬 상태, 인계 상태를 같은 회의 흐름에서 이어서 확인합니다\./);
assert.match(appJs, /council-heartbeat-card/);
assert.match(appJs, /council-heartbeat-pulse/);

assert.match(styles, /\.council-heartbeat-strip \{/);
assert.match(styles, /\.council-heartbeat-grid \{/);
assert.match(styles, /\.council-heartbeat-card \{/);
assert.match(styles, /\.council-heartbeat-pulse-success \{/);
assert.match(styles, /\.council-heartbeat-role \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilHeartbeatStrip: {
        heading: '회의 흐름',
        preservedSignals: ['org-chart', 'governance', 'handoff'],
      },
    },
    null,
    2,
  ),
);
