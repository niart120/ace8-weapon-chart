import { expect, test } from 'vitest';
import { targets } from './masters';

test('合意した19行を除外し、非搭載武装と保留の翼を維持する', () => {
  for (const id of [
    378, 181, 186, 190, 80, 136, 157, 250, 152, 373, 377, 374, 375, 376, 500, 501, 315, 488, 502,
  ])
    expect(targets.find((t) => t.id === id)?.category, `ID${id}`).toBe('EXCLUDED');
  for (const id of [107, 108, 109, 368, 369, 370, 151, 185, 188, 189, 191, 213, 215, 102, 104])
    expect(targets.find((t) => t.id === id)?.category, `ID${id}`).not.toBe('EXCLUDED');
  expect(targets.find((t) => t.id === 382)).toMatchObject({
    partOf: 381,
    name: 'AA GUN《PODARGE (SEA)》',
  });
  expect(targets.find((t) => t.id === 383)?.partOf).toBe(381);
});
