import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /라이브 모드는 절대 조용히 다른 모드로 바뀌지 않습니다\./);
assert.doesNotMatch(appJs, /live 모드는 절대 조용히 fallback하지 않습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      providerFallbackHelperCopy: {
        markers: ['라이브 모드는 절대 조용히 다른 모드로 바뀌지 않습니다.'],
      },
    },
    null,
    2,
  ),
);
