import { runQaSlice04RealSmoke } from './qa-slice-04-runner.mjs';

const result = await runQaSlice04RealSmoke();

console.log(`${JSON.stringify(result, null, 2)}\n`);
