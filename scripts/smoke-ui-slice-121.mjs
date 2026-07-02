import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /copy: selectedMission\s*\?\s*'안건과 다음 인계만 봅니다\.'/);
assert.match(appJs, /copy: activeTask\s*\?\s*'막힘과 다음 실행만 봅니다\.'/);
assert.match(appJs, /copy: selectedArtifact\s*\?\s*'패킷과 승인선만 봅니다\.'/);
assert.match(appJs, /'새 안건을 기다립니다\.'/);
assert.match(appJs, /'실행 셀을 기다립니다\.'/);
assert.match(appJs, /'결과 패킷을 기다립니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeSurfaceCopySync: {
        markers: [
          '안건과 다음 인계만 봅니다.',
          '막힘과 다음 실행만 봅니다.',
          '패킷과 승인선만 봅니다.',
        ],
      },
    },
    null,
    2,
  ),
);
