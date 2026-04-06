import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, />개발 \(development\)<\/option>/);
assert.match(app, />지식 작업 \(knowledge-work\)<\/option>/);
assert.match(app, />로컬 스텁 \(local-stub\)<\/option>/);
assert.match(app, />OpenAI Responses \(openai-responses\)<\/option>/);

assert.doesNotMatch(app, />development<\/option>/);
assert.doesNotMatch(app, />knowledge-work<\/option>/);
assert.doesNotMatch(app, />local-stub<\/option>/);
assert.doesNotMatch(app, />openai-responses<\/option>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      optionDisplayLabelBatch: {
        markers: [
          '개발 (development)',
          '지식 작업 (knowledge-work)',
          '로컬 스텁 (local-stub)',
          'OpenAI Responses (openai-responses)',
        ],
      },
    },
    null,
    2,
  ),
);
