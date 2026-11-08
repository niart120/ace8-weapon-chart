import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { targets } from '../../src/data/masters';

test('除外・命名・集約によって506行の計算値を変更しない', () => {
  const values = targets.map((t) => [
    t.id,
    t.hp,
    t.damageMultipliers,
    t.isAir,
    t.roleGroup,
    t.standardDamage,
  ]);
  // local_009実装前のHEADから取得した全計算値。所属・名称・任務表示属性は含めない。
  expect(createHash('sha256').update(JSON.stringify(values)).digest('hex')).toBe(
    '741a1f67756e2b3c0644c7eb2fcb630aae3d9dc9596ed921c161ecd3569037bb'
  );
});
