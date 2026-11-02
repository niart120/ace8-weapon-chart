import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateMasters, type GenerationInput } from './generate.ts';
export async function writeMasters(input: GenerationInput, directory: string) {
  const masters = generateMasters(input);
  const files = Object.entries(masters).map(
    ([name, rows]) =>
      [join(directory, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`] as const
  );
  // No destination is touched until all three masters have passed validation.
  await mkdir(directory, { recursive: true });
  for (const [path, content] of files) await writeFile(path, content, 'utf8');
  return masters;
}
