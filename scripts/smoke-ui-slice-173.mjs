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

assert.match(app, /const decisionOpsEntrySignals = getAdvancedOpsEntrySignals\(\{/);
assert.match(app, /const decisionOpsEntrySignalRow = renderAdvancedOpsEntrySignalRow\(decisionOpsEntrySignals\);/);
assert.match(
  app,
  /const decisionActionSignalRow = `\s*<div class="decision-action-signal-row">\s*\$\{decisionOpsEntrySignalRow\}\s*<\/div>\s*`;/s,
);

assert.match(
  app,
  /if \(selectedItem\?\.status === 'pending' && selectedItem\.kind === 'approval'\) \{\s*actionSurface = `[\s\S]*?\$\{decisionActionSignalRow\}[\s\S]*?class="form-actions form-actions-inline decision-action-row"/s,
);
assert.match(
  app,
  /else if \(selectedItem\?\.status === 'pending' && selectedItem\.kind === 'decision'\) \{\s*actionSurface = `[\s\S]*?\$\{decisionActionSignalRow\}[\s\S]*?class="form-actions form-actions-inline decision-action-row"/s,
);
assert.match(
  app,
  /else if \(selectedItem\?\.status === 'pending'\) \{\s*actionSurface = `[\s\S]*?이 안건은 결정함에서 상태만 확인하고 다른 화면으로 이어집니다\.[\s\S]*?\$\{decisionActionSignalRow\}[\s\S]*?이 결정함 항목에는 현재 결정함 경로에서 허용된 쓰기 액션이 없습니다\./s,
);

assert.match(styles, /\.decision-action-signal-row \{/);
assert.match(
  styles,
  /\.surface\[data-surface="decision-inbox"\] \.decision-action-signal-row \.advanced-ops-entry-signal-row \{/,
);
assert.match(
  styles,
  /\.surface\[data-surface="decision-inbox"\] \.decision-action-signal-row \.advanced-ops-entry-signal-status \{/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      decisionActionSignalBridge: {
        surface: 'decision-inbox',
        target: 'first-action-block',
      },
    },
    null,
    2,
  ),
);
