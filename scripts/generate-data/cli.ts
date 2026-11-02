import { readFile } from 'node:fs/promises';
import { writeMasters } from './write.ts';
import type { GenerationInput } from './generate.ts';
// Local inputs are maintained by the generation adapter; every output value and
// reference is validated by generateMasters before any destination is modified.
const input = JSON.parse(
  await readFile(process.argv[2] ?? 'data/local/generation-input.json', 'utf8')
) as GenerationInput;
const masters = await writeMasters(input, process.argv[3] ?? 'src/data');
console.log(`weapons=${masters.weapons.length}, targets=${masters.targets.length}`);
