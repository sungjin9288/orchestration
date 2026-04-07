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

const deliverablesLeftDeck = getNarrativeDeckBlock('보고 개요판');
const deliverablesRightDeck = getNarrativeDeckBlock('보고 판단판');

assert.match(deliverablesLeftDeck, /heading:\s*'결과 보고'/);
assert.match(
  deliverablesLeftDeck,
  /copy:\s*'결과 보고 왼쪽 패널도 현재 보고 판단, 다음 행동, 연결 근거부터 먼저 보여 줍니다\.'/,
);
assert.doesNotMatch(deliverablesLeftDeck, /entryFrame:\s*true/);

assert.match(deliverablesRightDeck, /heading:\s*'현재 보고 상태와 다음 후속만 먼저 봅니다'/);
assert.match(
  deliverablesRightDeck,
  /copy:\s*'결과 보고 오른쪽 패널은 현재 보고 묶음, 결재선, 다음 후속을 먼저 보여 주고 깊은 점검은 아래로 미룹니다\.'/,
);
assert.doesNotMatch(deliverablesRightDeck, /entryFrame:\s*true/);

console.log(
  JSON.stringify(
    {
      ok: true,
      deliverablesNarrativeDeckDensity: {
        decks: ['보고 개요판', '보고 판단판'],
        markers: ['renderNarrativeDeck', 'entryFrame removed'],
      },
    },
    null,
    2,
  ),
);
