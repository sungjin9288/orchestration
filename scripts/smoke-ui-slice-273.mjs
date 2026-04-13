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

assert.match(appJs, /function renderControlOverviewSignalStrip\(items\)/);
assert.match(appJs, /control-overview-signal-strip/);
assert.match(appJs, /현재 데스크/);
assert.match(appJs, /담당/);
assert.match(appJs, /다음/);
assert.match(appJs, /현재 패킷/);
assert.match(appJs, /전체 인력/);
assert.doesNotMatch(appJs, /label: 'owner'/);
assert.doesNotMatch(appJs, /review owner/);
assert.doesNotMatch(appJs, /현재 건만 처리합니다\./);
assert.doesNotMatch(appJs, /선택 패킷만 검토합니다\./);
assert.doesNotMatch(appJs, /인력만 관리합니다\./);

assert.match(styles, /\.control-overview-stack \{/);
assert.match(styles, /\.control-overview-signal-strip \{/);
assert.match(styles, /\.control-overview-signal-card \{/);
assert.match(styles, /\.control-overview-signal-label \{/);
assert.match(styles, /\.control-overview-signal-value \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      controlOverviewSignalStrip: {
        labels: ['현재 데스크', '담당', '다음', '현재 패킷', '전체 인력'],
        removedNoise: ["label: 'owner'", 'review owner', '현재 건만 처리합니다.', '선택 패킷만 검토합니다.', '인력만 관리합니다.'],
      },
    },
    null,
    2,
  ),
);
