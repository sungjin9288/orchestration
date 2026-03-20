import { runQaSlice06RealSmoke } from './qa-slice-06-runner.mjs';

const result = await runQaSlice06RealSmoke();

console.log(`${JSON.stringify(result, null, 2)}\n`);
