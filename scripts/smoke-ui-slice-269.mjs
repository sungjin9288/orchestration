import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const qaSlice06RunnerPath = path.join(repoRoot, 'scripts', 'qa-slice-06-runner.mjs');
const qaSlice07RunnerPath = path.join(repoRoot, 'scripts', 'qa-slice-07-runner.mjs');

const appJs = fs.readFileSync(appPath, 'utf8');
const qaSlice06Runner = fs.readFileSync(qaSlice06RunnerPath, 'utf8');
const qaSlice07Runner = fs.readFileSync(qaSlice07RunnerPath, 'utf8');

assert.match(appJs, /function registerQaHooks\(\)/);
assert.match(appJs, /window\.__orchestrationQa = \{/);
assert.match(appJs, /getState\(\)/);
assert.match(appJs, /openSurface\(surface, options = \{\}\)/);
assert.match(appJs, /async refresh\(\)/);
assert.match(appJs, /await refreshData\(\);/);
assert.match(appJs, /QA hook idle timeout/);
assert.match(appJs, /state\.menuGroup = getNavGroupForSurface\(surface\);/);
assert.match(appJs, /state\.surface = surface;/);
assert.match(appJs, /syncSelectionsFromTask\(options\.taskId\);/);
assert.match(appJs, /render\(\);/);
assert.match(appJs, /registerQaHooks\(\);\s*void bootstrap\(\);/s);
assert.match(qaSlice06Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*visibility/);
assert.match(qaSlice07Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*visibility/);
assert.match(qaSlice06Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*Timed out waiting for/);
assert.match(qaSlice07Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*Timed out waiting for/);
assert.match(qaSlice06Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*ETIMEDOUT/);
assert.match(qaSlice07Runner, /QA_BROWSER_FLAKE_ERROR_PATTERN =\s*[\s\S]*ETIMEDOUT/);
assert.match(qaSlice06Runner, /qa\.refresh\(\)/);
assert.match(qaSlice07Runner, /qa\.refresh\(\)/);
assert.match(qaSlice06Runner, /function assertBrowserTextWithSelector\(\{/);
assert.match(qaSlice07Runner, /function assertBrowserTextWithSelector\(\{/);
assert.match(qaSlice06Runner, /import \{ execFileSync, spawn \} from 'node:child_process';/);
assert.match(qaSlice07Runner, /import \{ execFileSync, spawn \} from 'node:child_process';/);
assert.match(qaSlice06Runner, /function killPlaywrightCliSessionDaemons\(sessionName\)/);
assert.match(qaSlice07Runner, /function killPlaywrightCliSessionDaemons\(sessionName\)/);
assert.match(qaSlice06Runner, /commandLine\.includes\('run-cli-server'\)/);
assert.match(qaSlice07Runner, /commandLine\.includes\('run-cli-server'\)/);
assert.match(qaSlice06Runner, /commandLine\.includes\('--daemon-session='\)/);
assert.match(qaSlice07Runner, /commandLine\.includes\('--daemon-session='\)/);
assert.match(qaSlice06Runner, /commandLine\.includes\(sessionFileName\)/);
assert.match(qaSlice07Runner, /commandLine\.includes\(sessionFileName\)/);
assert.match(qaSlice06Runner, /function spawnPlaywrightCli\(\{ command, fullArgs, outputRoot, sessionName, timeoutMs \}\)/);
assert.match(qaSlice07Runner, /function spawnPlaywrightCli\(\{ command, fullArgs, outputRoot, sessionName, timeoutMs \}\)/);
assert.match(qaSlice06Runner, /detached: process\.platform !== 'win32'/);
assert.match(qaSlice07Runner, /detached: process\.platform !== 'win32'/);
assert.match(qaSlice06Runner, /killPlaywrightCliProcess\(child\)/);
assert.match(qaSlice07Runner, /killPlaywrightCliProcess\(child\)/);
assert.match(qaSlice06Runner, /playwright-cli \$\{args\[0\] \|\| 'command'\} failed: ETIMEDOUT/);
assert.match(qaSlice07Runner, /playwright-cli \$\{args\[0\] \|\| 'command'\} failed: ETIMEDOUT/);
assert.match(qaSlice06Runner, /\[sessionCleanup=\$\{formatSessionCleanup\(result\.sessionCleanupPids\)\}\]/);
assert.match(qaSlice07Runner, /\[sessionCleanup=\$\{formatSessionCleanup\(result\.sessionCleanupPids\)\}\]/);
assert.match(qaSlice06Runner, /async function runPlaywrightCli\(\{/);
assert.match(qaSlice07Runner, /async function runPlaywrightCli\(\{/);
assert.match(qaSlice06Runner, /playwright-cli \$\{args\[0\] \|\| 'command'\} failed/);
assert.match(qaSlice07Runner, /playwright-cli \$\{args\[0\] \|\| 'command'\} failed/);
assert.match(qaSlice06Runner, /\[timeoutMs=\$\{timeoutMs\}\]/);
assert.match(qaSlice07Runner, /\[timeoutMs=\$\{timeoutMs\}\]/);
assert.match(qaSlice06Runner, /async function refreshBrowser\(\{ baseUrl, outputRoot, overrideEnvVar, sessionName \}\)/);
assert.match(qaSlice07Runner, /async function refreshBrowser\(\{ baseUrl, outputRoot, overrideEnvVar, sessionName \}\)/);
assert.match(qaSlice06Runner, /async function clickSurface\(\{\s*baseUrl = '',/);
assert.match(qaSlice07Runner, /async function clickSurface\(\{\s*baseUrl = '',/);
assert.match(qaSlice06Runner, /const expectedUrl = \$\{JSON\.stringify\(baseUrl \|\| ''\)\};/);
assert.match(qaSlice07Runner, /const expectedUrl = \$\{JSON\.stringify\(baseUrl \|\| ''\)\};/);
assert.match(qaSlice06Runner, /const onExpectedApp = \(\) => Boolean\(expectedUrl && page\.url\(\)\.startsWith\(expectedUrl\)\);/);
assert.match(qaSlice07Runner, /const onExpectedApp = \(\) => Boolean\(expectedUrl && page\.url\(\)\.startsWith\(expectedUrl\)\);/);
assert.match(qaSlice06Runner, /if \(expectedUrl && \(!hookReady\(\) \|\| !onExpectedApp\(\)\)\) \{/);
assert.match(qaSlice07Runner, /if \(expectedUrl && \(!hookReady\(\) \|\| !onExpectedApp\(\)\)\) \{/);
assert.match(qaSlice06Runner, /if \(expectedUrl && \(!appReady\(\) \|\| !onExpectedApp\(\)\)\) \{/);
assert.match(qaSlice07Runner, /if \(expectedUrl && \(!appReady\(\) \|\| !onExpectedApp\(\)\)\) \{/);
assert.match(qaSlice06Runner, /page\.goto\(expectedUrl, \{ waitUntil: 'domcontentloaded' \}\)/);
assert.match(qaSlice07Runner, /page\.goto\(expectedUrl, \{ waitUntil: 'domcontentloaded' \}\)/);
assert.match(qaSlice06Runner, /document\.querySelector\('#workspace-main'\) && typeof window\.__orchestrationQa\?\.refresh === 'function'/);
assert.match(qaSlice07Runner, /document\.querySelector\('#workspace-main'\) && typeof window\.__orchestrationQa\?\.refresh === 'function'/);
assert.match(qaSlice06Runner, /document\.querySelector\('#workspace-main'\) && typeof window\.__orchestrationQa\?\.openSurface === 'function'/);
assert.match(qaSlice07Runner, /document\.querySelector\('#workspace-main'\) && typeof window\.__orchestrationQa\?\.openSurface === 'function'/);
assert.match(qaSlice06Runner, /const state = typeof qa\?\.getState === 'function' \? qa\.getState\(\) : null;/);
assert.match(qaSlice07Runner, /const state = typeof qa\?\.getState === 'function' \? qa\.getState\(\) : null;/);
assert.match(qaSlice06Runner, /await page\.waitForSelector\(selector, \{ timeout: 15000 \}\);/);
assert.match(qaSlice07Runner, /await page\.waitForSelector\(selector, \{ timeout: 15000 \}\);/);
assert.match(qaSlice06Runner, /leaked secret into browser DOM text/);
assert.match(qaSlice07Runner, /leaked secret into browser DOM text/);
assert.match(qaSlice06Runner, /QA surface hook rejected/);
assert.match(qaSlice07Runner, /QA surface hook rejected/);
assert.match(qaSlice06Runner, /baseUrl: harness\.baseUrl/);
assert.match(qaSlice07Runner, /baseUrl: harness\.baseUrl/);
assert.match(qaSlice06Runner, /qaOptions: \{ taskId \}/);
assert.match(qaSlice07Runner, /qaOptions: \{ taskId \}/);
assert.doesNotMatch(qaSlice06Runner, /navGroupSelector/);
assert.doesNotMatch(qaSlice07Runner, /navGroupSelector/);
assert.doesNotMatch(qaSlice06Runner, /nav group visibility/);
assert.doesNotMatch(qaSlice07Runner, /nav group visibility/);
assert.doesNotMatch(qaSlice06Runner, /nav-button\.is-active/);
assert.doesNotMatch(qaSlice07Runner, /nav-button\.is-active/);
assert.doesNotMatch(qaSlice06Runner, /waitForSurfaceNavReady/);
assert.doesNotMatch(qaSlice07Runner, /waitForSurfaceNavReady/);
assert.doesNotMatch(qaSlice06Runner, /taskboard task row visibility before live mutation/);
assert.doesNotMatch(qaSlice07Runner, /taskboard task row visibility before live mutation/);
assert.doesNotMatch(qaSlice06Runner, /live mutation run button visibility/);
assert.doesNotMatch(qaSlice07Runner, /live mutation run button visibility/);
assert.doesNotMatch(qaSlice07Runner, /reviewer run button visibility/);
assert.match(qaSlice06Runner, /args: \['open', `--browser=\$\{browser\}`, `--config=\$\{configPath\}`, url\],\s*timeoutMs: 60_000/s);
assert.match(qaSlice07Runner, /args: \['open', `--browser=\$\{browser\}`, `--config=\$\{configPath\}`, url\],\s*timeoutMs: 60_000/s);

console.log(
  JSON.stringify(
    {
      ok: true,
      qaSurfaceHook: {
        markers: [
          'registerQaHooks()',
          'window.__orchestrationQa',
          'getState()',
          'openSurface(surface, options = {})',
          'refresh()',
          'state.menuGroup = getNavGroupForSurface(surface);',
          'state.surface = surface;',
          'syncSelectionsFromTask(options.taskId);',
          'registerQaHooks(); void bootstrap();',
        ],
        runnerFlakeGuards: [
          'scripts/qa-slice-06-runner.mjs: browser visibility timeouts',
          'scripts/qa-slice-07-runner.mjs: browser visibility timeouts',
          'scripts/qa-slice-06-runner.mjs: browser wait timeouts',
          'scripts/qa-slice-07-runner.mjs: browser wait timeouts',
          'scripts/qa-slice-06-runner.mjs: prepare-browser-harness timeout retry',
          'scripts/qa-slice-07-runner.mjs: prepare-browser-harness timeout retry',
          'scripts/qa-slice-06-runner.mjs: QA refresh hook',
          'scripts/qa-slice-07-runner.mjs: QA refresh hook',
          'scripts/qa-slice-06-runner.mjs: app page recovery before QA refresh',
          'scripts/qa-slice-07-runner.mjs: app page recovery before QA refresh',
          'scripts/qa-slice-06-runner.mjs: stale app port recovery before QA hook',
          'scripts/qa-slice-07-runner.mjs: stale app port recovery before QA hook',
          'scripts/qa-slice-06-runner.mjs: hook-driven surface navigation',
          'scripts/qa-slice-07-runner.mjs: hook-driven surface navigation',
          'scripts/qa-slice-06-runner.mjs: session-scoped Playwright CLI daemon timeout cleanup',
          'scripts/qa-slice-07-runner.mjs: session-scoped Playwright CLI daemon timeout cleanup',
        ],
      },
    },
    null,
    2,
  ),
);
