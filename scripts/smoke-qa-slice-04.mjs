import { runQaSlice04SyntheticSmoke } from './qa-slice-04-runner.mjs';

const result = await runQaSlice04SyntheticSmoke();

console.log(`${JSON.stringify(result, null, 2)}\n`);
