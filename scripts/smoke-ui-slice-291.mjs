import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.equal((appJs.match(/label: '다음'/g) || []).length >= 3, true);
assert.doesNotMatch(appJs, /label: '바로 이동'/);
assert.match(appJs, /selectedMissionBriefControl\.nextTitle/);
assert.match(appJs, /councilControl\.nextTitle/);
assert.match(appJs, /deliverablesControl\.nextTitle/);

console.log(
  JSON.stringify(
    {
      ok: true,
      narrativeDeckNextCardVocabulary: {
        cards: ['다음'],
        removed: ['바로 이동'],
      },
    },
    null,
    2,
  ),
);
