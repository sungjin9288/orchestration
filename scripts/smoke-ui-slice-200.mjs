import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

function getNarrativeDeckBlock(eyebrow) {
  const eyebrowIndex = app.indexOf(`eyebrow: '${eyebrow}'`);
  assert.notEqual(eyebrowIndex, -1, `expected eyebrow block for ${eyebrow}`);

  const deckStart = app.lastIndexOf('renderNarrativeDeck({', eyebrowIndex);
  const cardsIndex = app.indexOf('cards: [', eyebrowIndex);

  assert.notEqual(deckStart, -1, `expected renderNarrativeDeck start for ${eyebrow}`);
  assert.notEqual(cardsIndex, -1, `expected cards block for ${eyebrow}`);

  return app.slice(deckStart, cardsIndex);
}

const executionLeftDeck = getNarrativeDeckBlock('작업 지시 개요');
const executionRightDeck = getNarrativeDeckBlock('게이트 판단판');

assert.match(executionLeftDeck, /heading:\s*'실행 지시 데스크'/);
assert.match(
  executionLeftDeck,
  /copy:\s*'왼쪽 패널은 현재 작업 지시, 다음 처리, 연결 근거를 먼저 보여 줍니다\.'/,
);
assert.doesNotMatch(executionLeftDeck, /entryFrame:\s*true/);

assert.match(executionRightDeck, /heading:\s*'현재 게이트와 바로 처리할 후속을 먼저 봅니다'/);
assert.match(
  executionRightDeck,
  /copy:\s*'오른쪽 패널은 작업 지시보다 승인선, 차단 근거, 다음 처리 경로를 우선 보여 줍니다\.'/,
);
assert.doesNotMatch(executionRightDeck, /entryFrame:\s*true/);

console.log(
  JSON.stringify(
    {
      ok: true,
      executionNarrativeDeckDensity: {
        decks: ['작업 지시 개요', '게이트 판단판'],
        markers: ['renderNarrativeDeck', 'entryFrame removed'],
      },
    },
    null,
    2,
  ),
);
