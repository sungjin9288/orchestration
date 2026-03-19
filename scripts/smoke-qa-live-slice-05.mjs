import { runQaSlice05RealSmoke } from './qa-slice-05-runner.mjs';

const result = await runQaSlice05RealSmoke();

console.log(`${JSON.stringify(result, null, 2)}\n`);
