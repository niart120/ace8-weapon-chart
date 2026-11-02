import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { input } from './fixture';
import { writeMasters } from './write';
test('不正な入力では既存3ファイルを更新しない', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ace8-generation-'));
  try {
    for (const name of ['weapons', 'targets', 'modifiers'])
      await writeFile(join(directory, `${name}.json`), name);
    await expect(writeMasters({ ...input, sources: {} }, directory)).rejects.toThrow();
    for (const name of ['weapons', 'targets', 'modifiers'])
      expect(await readFile(join(directory, `${name}.json`), 'utf8')).toBe(name);
    await writeMasters(input, directory);
    expect(JSON.parse(await readFile(join(directory, 'targets.json'), 'utf8'))[0].hp).toBe(55);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
