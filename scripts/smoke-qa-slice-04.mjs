import fs from 'node:fs';
import path from 'node:path';

import {
  PLAYWRIGHT_CLI_VERSION,
  createSyntheticPlannerArtifactMarkdown,
  createSyntheticPlannerResponse,
  runQaSlice03,
} from './qa-slice-03-runner.mjs';

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'output', 'playwright', `qa-slice-03-${process.pid}`);
const runtimeRoot = path.join(repoRoot, 'var', `runtime-qa-slice-03-${process.pid}`);
const captureFilePath = path.join(outputRoot, 'openai-fetch-calls.json');
const playwrightBrowser = process.env.QA_SLICE_03_PLAYWRIGHT_BROWSER || 'chrome';
const apiKeyEnvVarName = 'QA_SLICE_03_LIVE_PROVIDER_API_KEY';
const apiKeyValue = 'qa-slice-03-secret-sentinel-explicit';
const model = 'qa-slice-03-operator-model';
const sessionName = `qa-slice-03-${process.pid}`;

const flow = await runQaSlice03({
  apiKeyEnvVarName,
  apiKeyValue,
  captureFilePath,
  label: 'qa-slice-03',
  model,
  outputRoot,
  playwrightBrowser,
  playwrightCliBinEnvVar: 'QA_SLICE_03_PLAYWRIGHT_CLI_BIN',
  runtimeRoot,
  sessionName,
  syntheticFetchPayloads: [createSyntheticPlannerResponse('qa-slice-03')],
});

const artifactContent = createSyntheticPlannerArtifactMarkdown('qa-slice-03');

if (fs.existsSync(captureFilePath)) {
  const content = fs.readFileSync(captureFilePath, 'utf8');

  if (content.includes(apiKeyValue)) {
    throw new Error('Synthetic fetch capture unexpectedly stored the live secret value');
  }
}

if (artifactContent.includes(apiKeyValue)) {
  throw new Error('Synthetic planner artifact template must not include the live secret value');
}

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
