import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const councilConfigPath = path.join(repoRoot, 'ui', 'council-config.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const councilConfigJs = fs.readFileSync(councilConfigPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(councilConfigJs, /deskLabel: '중앙 판단 데스크'/);
assert.match(councilConfigJs, /deskLabel: '전략 판단 데스크'/);
assert.match(councilConfigJs, /deskLabel: '설계 검토 데스크'/);
assert.match(councilConfigJs, /deskLabel: '실행 편성 데스크'/);
assert.match(councilConfigJs, /officeLine: '최종 방향과 인계 승인을 보는 자리'/);
assert.match(councilConfigJs, /officeLine: '목표와 우선순위를 다듬는 자리'/);
assert.match(councilConfigJs, /officeLine: '구조 리스크와 경계를 지키는 자리'/);
assert.match(councilConfigJs, /officeLine: '첫 실행 셀과 체크포인트를 편성하는 자리'/);
assert.match(appJs, /참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다\./);
assert.match(appJs, /참석 역할, 정렬 상태, 인계 상태를 같은 회의 흐름에서 이어서 확인합니다\./);
assert.match(appJs, /boardroom-seat-presence/);
assert.match(appJs, /boardroom-avatar-wrap/);
assert.match(appJs, /boardroom-seat-desk/);
assert.match(appJs, /boardroom-seat-station/);
assert.match(appJs, /boardroom-seat-focus/);
assert.match(appJs, /cast-station-row/);
assert.match(appJs, /cast-station/);
assert.match(appJs, /cast-station-copy/);
assert.match(appJs, /createToken\('착석 완료', castEntry\.tone\)/);

assert.match(styles, /\.boardroom-seat-presence \{/);
assert.match(styles, /\.boardroom-avatar-wrap \{/);
assert.match(styles, /\.boardroom-avatar \{/);
assert.match(styles, /\.boardroom-seat-desk \{/);
assert.match(styles, /\.boardroom-seat-station \{/);
assert.match(styles, /\.boardroom-seat-focus \{/);
assert.match(styles, /\.cast-station-row \{/);
assert.match(styles, /\.cast-station \{/);
assert.match(styles, /\.cast-station-copy \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      hqOfficeStations: {
        desks: ['중앙 판단 데스크', '전략 판단 데스크', '설계 검토 데스크', '실행 편성 데스크'],
        stageClasses: [
          'boardroom-seat-presence',
          'boardroom-avatar',
          'boardroom-seat-desk',
          'boardroom-seat-station',
          'boardroom-seat-focus',
        ],
        castClasses: ['cast-station-row', 'cast-station', 'cast-station-copy'],
      },
    },
    null,
    2,
  ),
);
