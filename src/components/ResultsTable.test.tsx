// @vitest-environment happy-dom
import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ResultsTable } from './ResultsTable';
import { target, missile } from '../test/fixtures/combat';
afterEach(cleanup);

test('HP非適用はHPをハイフン、命中数を疑問符とし、HP順の両方向で末尾に置く', () => {
  render(
    <ResultsTable
      targets={[
        { ...target, id: 1, name: 'SWARM', hp: null, standardDamage: false },
        { ...target, id: 2, name: 'LOW', hp: 40 },
        { ...target, id: 3, name: 'HIGH', hp: 80 },
      ]}
      weapons={[missile]}
      conditions={{ role: 'MULTIROLE', parts: [], damageType: 'DIRECT' }}
    />
  );
  const names = () => screen.getAllByRole('rowheader').map((e) => e.textContent);
  expect(names()).toEqual(['LOW', 'HIGH', 'SWARM']);
  expect(
    within(screen.getByRole('row', { name: 'SWARM - ?' }))
      .getAllByRole('cell')
      .map((e) => e.textContent)
  ).toEqual(['-', '?']);
  fireEvent.click(screen.getByRole('button', { name: 'HP' }));
  expect(names()).toEqual(['HIGH', 'LOW', 'SWARM']);
  fireEvent.click(screen.getByRole('button', { name: 'HP' }));
  expect(names()).toEqual(['LOW', 'HIGH', 'SWARM']);
});

test('列見出しで数値を昇順・降順・初期HP順へ切り替え、非数値を末尾に保つ', () => {
  const targets = [
    { ...target, id: 1, name: 'TWO', hp: 55 },
    { ...target, id: 2, name: 'TEN', hp: 400 },
    { ...target, id: 3, name: 'ZERO', hp: 1, damageMultipliers: { missile: 0 } },
    { ...target, id: 4, name: 'UNKNOWN', hp: 2, damageMultipliers: { missile: null } },
  ];
  render(
    <ResultsTable
      targets={targets}
      weapons={[missile]}
      conditions={{ role: 'MULTIROLE', parts: [], damageType: 'DIRECT' }}
    />
  );
  const names = () => screen.getAllByRole('rowheader').map((e) => e.textContent);
  expect(names()).toEqual(['ZERO', 'UNKNOWN', 'TWO', 'TEN']);
  fireEvent.click(screen.getByRole('button', { name: 'MSL' }));
  expect(names()).toEqual(['TWO', 'TEN', 'ZERO', 'UNKNOWN']);
  expect(screen.getByRole('columnheader', { name: 'MSL' }).getAttribute('aria-sort')).toBe(
    'ascending'
  );
  fireEvent.click(screen.getByRole('button', { name: 'MSL' }));
  expect(names()).toEqual(['TEN', 'TWO', 'ZERO', 'UNKNOWN']);
  fireEvent.click(screen.getByRole('button', { name: 'MSL' }));
  expect(names()).toEqual(['ZERO', 'UNKNOWN', 'TWO', 'TEN']);
  expect(screen.getByText('10').className).toContain('hits-5');
  expect(screen.getByText('2', { selector: '.hits' }).className).toContain('hits-2');
  expect(screen.getByText('?').className).toContain('hits-unknown');
});

test('初期HP昇順からのクリックは降順になり、列を隠したらソートを解除する', () => {
  const targets = [
    { ...target, id: 2, name: 'Z', hp: 40 },
    { ...target, id: 1, name: 'A', hp: 80 },
  ];
  const conditions = { role: 'MULTIROLE' as const, parts: [], damageType: 'DIRECT' as const };
  const view = render(
    <ResultsTable targets={targets} weapons={[missile]} conditions={conditions} />
  );
  const names = () => screen.getAllByRole('rowheader').map((e) => e.textContent);
  fireEvent.click(screen.getByRole('button', { name: 'HP' }));
  expect(names()).toEqual(['A', 'Z']);
  fireEvent.click(screen.getByRole('button', { name: 'TARGET' }));
  expect(names()).toEqual(['A', 'Z']);
  fireEvent.click(screen.getByRole('button', { name: 'TARGET' }));
  expect(names()).toEqual(['Z', 'A']);
  fireEvent.click(screen.getByRole('button', { name: 'MSL' }));
  fireEvent.click(screen.getByRole('button', { name: 'MSL' }));
  expect(names()).toEqual(['A', 'Z']);
  view.rerender(<ResultsTable targets={targets} weapons={[]} conditions={conditions} />);
  view.rerender(<ResultsTable targets={targets} weapons={[missile]} conditions={conditions} />);
  expect(names()).toEqual(['Z', 'A']);
  expect(screen.getByRole('columnheader', { name: 'MSL' }).getAttribute('aria-sort')).toBe('none');
});

test('命中数1/2/3/4/5以上の境界を区別する', () => {
  const targets = [1, 2, 3, 4, 5, 6].map((n) => ({ ...target, id: n, name: `N${n}`, hp: n * 40 }));
  render(
    <ResultsTable
      targets={targets}
      weapons={[missile]}
      conditions={{ role: 'MULTIROLE', parts: [], damageType: 'DIRECT' }}
    />
  );
  for (const n of [1, 2, 3, 4, 5, 6])
    expect(screen.getByText(String(n), { selector: '.hits' }).className).toContain(
      `hits-${Math.min(5, n)}`
    );
});

test('ROLE変更後の命中数で現在のソートを更新する', () => {
  const targets = [
    { ...target, id: 1, name: 'AIR', hp: 40 },
    { ...target, id: 2, name: 'GROUND', hp: 40, isAir: false, roleGroup: 'ground' as const },
  ];
  const view = render(
    <ResultsTable
      targets={targets}
      weapons={[missile]}
      conditions={{ role: 'FIGHTER', parts: [], damageType: 'DIRECT' }}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'MSL' }));
  expect(screen.getAllByRole('rowheader').map((e) => e.textContent)).toEqual(['AIR', 'GROUND']);
  view.rerender(
    <ResultsTable
      targets={targets}
      weapons={[missile]}
      conditions={{ role: 'ATTACKER', parts: [], damageType: 'DIRECT' }}
    />
  );
  expect(screen.getAllByRole('rowheader').map((e) => e.textContent)).toEqual(['GROUND', 'AIR']);
});
