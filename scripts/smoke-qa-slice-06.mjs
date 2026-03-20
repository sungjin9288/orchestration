import { runQaSlice06SyntheticSmoke } from './qa-slice-06-runner.mjs';

const result = await runQaSlice06SyntheticSmoke();

console.log(`${JSON.stringify(result, null, 2)}\n`);
