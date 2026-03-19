import path from 'node:path';

import { PLAYWRIGHT_CLI_VERSION, runQaSlice03 } from './qa-slice-03-runner.mjs';

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'output', 'playwright', `qa-live-slice-03-${process.pid}`);
const runtimeRoot = path.join(repoRoot, 'var', `runtime-qa-live-slice-03-${process.pid}`);
const playwrightBrowser = process.env.QA_SLICE_03_PLAYWRIGHT_BROWSER || 'chrome';
const apiKeyEnvVarName = 'OPENAI_API_KEY';
const apiKeyValue = process.env.OPENAI_API_KEY || '';
const model = process.env.OPENAI_RESPONSES_MODEL || '';
const sessionName = `qa-live-slice-03-${process.pid}`;

if (!apiKeyValue || !model) {
  console.log(
    JSON.stringify(
      {
        ok: true,
        skipped: true,
        reason:
          'OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live browser smoke.',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const flow = await runQaSlice03({
  apiKeyEnvVarName,
  apiKeyValue,
  label: 'qa-live-slice-03',
  model,
  outputRoot,
  playwrightBrowser,
  playwrightCliBinEnvVar: 'QA_SLICE_03_PLAYWRIGHT_CLI_BIN',
  runtimeRoot,
  sessionName,
});

console.log(
  JSON.stringify(
    {
      ok: true,
      outputRoot,
      playwright: {
        browser: playwrightBrowser,
        cliMode: process.env.QA_SLICE_03_PLAYWRIGHT_CLI_BIN ? 'override' : 'npx-fixed',
        cliVersion: PLAYWRIGHT_CLI_VERSION,
      },
      scenario: flow,
    },
    null,
    2,
  ),
);
