import { format } from 'oxfmt';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateMasters, type GenerationInput } from './generate.ts';
export async function writeMasters(input: GenerationInput, directory: string) {
  const masters = generateMasters(input);
  const files = await Promise.all(
    Object.entries(masters).map(async ([name, rows]) => {
      const formatted = await format(`${name}.json`, JSON.stringify(rows, null, 2), {
        printWidth: 100,
        tabWidth: 2,
        endOfLine: 'lf',
      });
      if (formatted.errors.length) throw new Error(`JSON整形失敗: ${name}`);
      return [join(directory, `${name}.json`), formatted.code] as const;
    })
  );
  // No destination is touched until all three masters have passed validation.
  await mkdir(directory, { recursive: true });
  for (const [path, content] of files) await writeFile(path, content, 'utf8');
  return masters;
}
