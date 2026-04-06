import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /<span class="field-label">API 키 환경변수<\/span>/);
assert.match(app, /<span class="field-label">워크트리 슬러그<\/span>/);
assert.match(app, /연결 워크트리 슬러그가 필요합니다\./);

assert.doesNotMatch(app, /<span class="field-label">API Key 환경변수<\/span>/);
assert.doesNotMatch(app, /<span class="field-label">워크트리 slug<\/span>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      apiKeySlugLabelBatch: {
        markers: [
          'API 키 환경변수',
          '워크트리 슬러그',
          '연결 워크트리 슬러그가 필요합니다.',
        ],
      },
    },
    null,
    2,
  ),
);
