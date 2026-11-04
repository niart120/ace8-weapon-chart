import { expect, test } from 'vitest';
import fixture from '../../src/test/fixtures/mission-numbers.json';
import { targets } from '../../src/data/masters';
import { withMissionLabel } from './mission-label';

// Expected numbers come from localized text, not internal-ID arithmetic.
const suffixes = new Map(
  fixture.entries.map(({ text }) => [
    text === 'PROLOGUE' ? 0 : Number(text.replace('MISSION ', '')),
    text === 'PROLOGUE' ? '[PROLOGUE]' : `[M${Number(text.replace('MISSION ', ''))}]`,
  ])
);

test('同梱文字列の全31識別子と生成ラベルが一致する', () => {
  for (const [missionId, suffix] of suffixes) {
    expect(withMissionLabel('TYPHOON (SHADOW)', missionId)).toBe(`TYPHOON (SHADOW) ${suffix}`);
  }
});

test('EXCLUDEDを含む全任務差分の配信名がゲーム内番号に一致する', () => {
  for (const target of targets) {
    if (!target.missionVariant) continue;
    const suffix = suffixes.get(target.missionVariant.missionId);
    expect(suffix).toBeDefined();
    expect(target.name.endsWith(` ${suffix}`)).toBe(true);
  }
});
