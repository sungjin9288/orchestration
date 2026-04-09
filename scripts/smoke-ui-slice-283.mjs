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

assert.match(appJs, /data-selection-state="\$\{isActive \? 'active' : 'idle'\}"/);
assert.match(appJs, /data-selection-state="\$\{isCurrentSurface \? 'active' : isActiveGroup \? 'group' : 'idle'\}"/);
assert.match(appJs, /aria-current="\$\{isCurrentSurface \? 'true' : 'false'\}"/);
assert.match(appJs, /data-selection-state="\$\{groupId === editorGroupId \? 'active' : 'idle'\}"/);

assert.match(styles, /\.workflow-stage-card\[data-selection-state='idle'\],\s*\.review-lane-card\[data-selection-state='idle'\] \{/s);
assert.match(styles, /\.workflow-stage-card\[data-selection-state='idle'\] \.workflow-stage-field,\s*\.review-lane-card\[data-selection-state='idle'\] \.review-lane-card-field \{/s);
assert.match(styles, /\.company-directory-section\[data-selection-state='idle'\] \{/);
assert.match(styles, /\.company-directory-row\[data-selection-state='idle'\] \{/);
assert.match(styles, /\.company-directory-row\[data-selection-state='group'\] \{/);
assert.match(styles, /\.ops-team-section\[data-selection-state='idle'\] \{/);
assert.match(styles, /\.ops-current-lineup\[data-panel-state='readonly'\] \.ops-roster-row \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      inactiveRowDeemphasis: {
        app: [
          "workflow/review data-selection-state active|idle",
          "company-directory-row active|group|idle",
          "company-directory-row aria-current",
          "ops-team-section active|idle",
        ],
        styles: [
          "workflow-stage-card[data-selection-state='idle']",
          "review-lane-card[data-selection-state='idle']",
          "company-directory-section[data-selection-state='idle']",
          "company-directory-row[data-selection-state='group']",
          "ops-team-section[data-selection-state='idle']",
          "ops-current-lineup[data-panel-state='readonly'] .ops-roster-row",
        ],
      },
    },
    null,
    2,
  ),
);
