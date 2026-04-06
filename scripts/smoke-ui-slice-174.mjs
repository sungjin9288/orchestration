import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(app, /function renderPreselectedPendingItemHint\(item, approval, options = \{\}\)/);
assert.match(
  app,
  /const hintSignalRow = options\.signalRow\s*\?\s*`\s*<div class="breakdown-inbox-signal-row">\s*\$\{options\.signalRow\}\s*<\/div>\s*`\s*:\s*'';/s,
);
assert.match(app, /<p class="detail-copy">\$\{escapeHtml\(item\.prompt \|\| '기록된 안내 문구가 없습니다\.'\)\}<\/p>\s*\$\{hintSignalRow\}/s);

assert.match(
  app,
  /renderPreselectedPendingItemHint\(preselectedPendingItem, preselectedApproval, \{\s*signalRow: artifactsOpsEntrySignalRow,\s*helpText: '승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다\.',/s,
);
assert.match(
  app,
  /renderPreselectedPendingItemHint\(preselectedPendingItem, preselectedApproval, \{\s*signalRow: artifactsOpsEntrySignalRow,\s*helpText:\s*'승인 액션은 아티팩트 표면에 남고 서버 스냅샷을 그대로 따릅니다\. 푸시, 게시, 외부 릴리스는 계속 비활성 상태입니다\.',/s,
);

assert.match(styles, /\.breakdown-inbox-signal-row \{/);
assert.match(
  styles,
  /\.surface\[data-surface="artifacts"\] \.breakdown-inbox-signal-row \.advanced-ops-entry-signal-row \{/,
);
assert.match(
  styles,
  /\.surface\[data-surface="artifacts"\] \.breakdown-inbox-signal-row \.advanced-ops-entry-signal-status \{/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactsHintSignalBridge: {
        surface: 'artifacts',
        target: 'first-handling-hint',
      },
    },
    null,
    2,
  ),
);
