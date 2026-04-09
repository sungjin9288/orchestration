import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /<span class="control-overview-register-label">상태<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">담당<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">다음<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">안건<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">실행<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">근거<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">막힘<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">패킷<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">타입<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">기준<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">범위<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">프로젝트<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">승인선<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">인력<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">역할<\/span>/);
assert.match(appJs, /<span class="control-overview-register-label">desk<\/span>/);

assert.match(styles, /\.control-overview-register \{[\s\S]*gap:\s*5px;[\s\S]*padding:\s*6px 7px;/s);
assert.match(styles, /\.control-overview-register-row \{[\s\S]*gap:\s*8px;[\s\S]*padding:\s*1px 0;/s);
assert.match(styles, /\.control-overview-register-label,[\s\S]*font-size:\s*0\.63rem;[\s\S]*letter-spacing:\s*0\.02em;/s);
assert.match(styles, /\.control-overview-register-value,[\s\S]*font-size:\s*0\.81rem;/s);
assert.match(styles, /\.workflow-stage-meta,\s*\.review-lane-card-meta \{[\s\S]*gap:\s*5px;[\s\S]*padding-top:\s*6px;/s);
assert.match(styles, /\.workflow-stage-field,\s*\.review-lane-card-field \{[\s\S]*gap:\s*3px;[\s\S]*padding:\s*4px 5px;/s);
assert.match(styles, /\.workflow-stage-field \.control-overview-register-value,\s*\.review-lane-card-field \.control-overview-register-value \{[\s\S]*font-size:\s*0\.73rem;/s);

console.log(
  JSON.stringify(
    {
      ok: true,
      bodyRegisterShortening: {
        app: ['상태', '담당', '다음', '안건', '실행', '근거', '막힘', '패킷', '타입', '기준', '범위', '프로젝트', '승인선', '인력', '역할', 'desk'],
        styles: [
          'control-overview-register gap 5px',
          'control-overview-register-row gap 8px',
          'control-overview-register-label 0.63rem',
          'control-overview-register-value 0.81rem',
          'workflow/review field padding 4px 5px',
        ],
      },
    },
    null,
    2,
  ),
);
