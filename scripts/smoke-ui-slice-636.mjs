import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docPath = path.join(repoRoot, 'docs', '07_mission-council-slice-m6-02.md');

const sliceDoc = fs.readFileSync(docPath, 'utf8');
const acceptanceSection = sliceDoc.match(
  /## Acceptance Checklist\n(?<body>[\s\S]*?)\n## Suggested Implementation Order/,
)?.groups?.body;

assert.ok(acceptanceSection, 'Acceptance Checklist section must exist.');
assert.doesNotMatch(sliceDoc, /이 문서는 아직 구현이 아니라 첫 구현 범위 명세다/);
assert.match(sliceDoc, /현재 `main`에서는 아래 `Current Main Status`/);
assert.match(sliceDoc, /## Current Main Status/);
assert.doesNotMatch(acceptanceSection, /- \[ \]/);
assert.equal([...acceptanceSection.matchAll(/- \[x\]/g)].length, 9);
assert.match(acceptanceSection, /사용자는 `Mission`에서 목표를 입력할 수 있다/);
assert.match(acceptanceSection, /mission 생성은 active project 없이 열리지 않는다/);
assert.match(acceptanceSection, /mission 하나는 linked task 하나만 만든다/);
assert.match(acceptanceSection, /`Council`은 최소 4개 역할의 visible contribution/);
assert.match(
  acceptanceSection,
  /approval 후 자동 진행은 `planner -> architect -> task-breaker -> builder preflight`까지만 허용/,
);
assert.match(
  acceptanceSection,
  /current source-of-truth task\/run\/artifact\/review\/approval contracts는 유지된다/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionCouncilSliceDocStatus: {
        document: 'docs/07_mission-council-slice-m6-02.md',
        acceptanceChecklistItems: 9,
        status: 'implemented-on-current-main',
      },
    },
    null,
    2,
  ),
);
