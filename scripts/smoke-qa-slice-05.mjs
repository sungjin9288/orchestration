import { runQaSlice05SyntheticSmoke } from './qa-slice-05-runner.mjs';

const result = await runQaSlice05SyntheticSmoke();

console.log(`${JSON.stringify(result, null, 2)}\n`);
