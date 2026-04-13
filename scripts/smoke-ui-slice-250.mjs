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

assert.match(appJs, /전달 데스크/);
assert.match(appJs, /결과 패킷, 리뷰 라인, 승인 라인을 같은 인계선에서 다룹니다/);
assert.match(appJs, /현재 결과 패킷/);
assert.match(appJs, /리뷰 라인/);
assert.match(appJs, /승인 라인/);
assert.match(appJs, /종료 보고 데스크/);
assert.match(appJs, /전달 패킷 개요/);
assert.match(appJs, /승인 및 종료 데스크/);
assert.match(appJs, /인계 판단판/);
assert.match(appJs, /현재 패킷 상태와 다음 인계선을 먼저 봅니다/);
assert.match(appJs, /상류 준비 패킷/);
assert.match(appJs, /전달 패킷 선반/);
assert.match(styles, /\.deliverables-delivery-board \{/);
assert.match(styles, /\.deliverables-delivery-grid \{/);
assert.match(styles, /\.deliverables-delivery-card \{/);
assert.match(styles, /\.deliverables-delivery-card-primary \{/);
assert.match(styles, /\.deliverables-delivery-label \{/);
assert.match(styles, /\.deliverables-delivery-title \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      companyShellDeliverablesDeliveryDesk: {
        markers: [
          '전달 데스크',
          '결과 패킷, 리뷰 라인, 승인 라인을 같은 인계선에서 다룹니다',
          '현재 결과 패킷',
          '리뷰 라인',
          '승인 라인',
          '종료 보고 데스크',
          '전달 패킷 개요',
          '승인 및 종료 데스크',
        ],
      },
    },
    null,
    2,
  ),
);
