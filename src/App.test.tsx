// @vitest-environment happy-dom
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import App from './App';
import { storageKey } from './storage/preferences';
afterEach(cleanup);
beforeEach(() => window.localStorage.clear());

test('掲載パーツを表示し、現在の選択と条件を保存・復元する', () => {
  const saved = {
    version: 1,
    weaponIds: [1],
    targetIds: [26],
    showParts: true,
    showMissionVariants: true,
    conditions: {
      role: 'MULTIROLE',
      parts: ['missilePower'],
      damageType: 'BLAST',
    },
  };
  window.localStorage.setItem(storageKey, JSON.stringify(saved));
  render(<App />);
  expect(screen.queryByRole('checkbox', { name: 'TLS.POW+' })).toBeNull();
  expect(screen.getAllByRole('checkbox')).toHaveLength(9);
  expect(screen.getByRole('checkbox', { name: 'MSL.POW+' }).hasAttribute('checked')).toBe(true);
  expect(JSON.parse(window.localStorage.getItem(storageKey)!)).toEqual(saved);
});
test('主画面から兵装と目標を選択できる', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: 'WEAPONS' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'TARGETS' })).toBeTruthy();
});

test('兵装検索だけでは列を変えず、検索中の分類解除は全分類に作用する', () => {
  render(<App />);
  const count = screen.getAllByRole('columnheader').length;
  fireEvent.click(screen.getByRole('button', { name: 'WEAPONS' }));
  const panel = within(screen.getByRole('dialog', { name: 'WEAPONS' }));
  fireEvent.change(panel.getByRole('searchbox'), { target: { value: 'qaam' } });
  expect(screen.getAllByRole('columnheader').length).toBe(count);
  fireEvent.click(panel.getByRole('checkbox', { name: 'MSL.AIR all' }));
  fireEvent.click(panel.getByRole('button', { name: 'Close weapons' }));
  expect(screen.getAllByRole('columnheader').length).toBe(count - 10);
});
test('部位表示・個別解除・区分リセットと条件変更が即時反映する', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'ATTACKER' }));
  expect(screen.getByRole('button', { name: 'ATTACKER' }).getAttribute('aria-pressed')).toBe(
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  const panel = within(screen.getByRole('dialog', { name: 'TARGETS' }));
  fireEvent.click(panel.getByRole('checkbox', { name: 'TARGET PARTS' }));
  fireEvent.change(panel.getByRole('searchbox'), { target: { value: 'main engine《ladon》' } });
  const engine = panel.getByRole('checkbox', { name: /MAIN ENGINE《LADON》/ });
  expect(engine).toBeTruthy();
  fireEvent.click(engine);
  expect(screen.queryByRole('rowheader', { name: 'MAIN ENGINE《LADON》' })).toBeNull();
  fireEvent.click(panel.getByRole('button', { name: 'Reset targets' }));
  expect(panel.getByRole('checkbox', { name: 'TARGET PARTS' }).getAttribute('checked')).toBeNull();
  fireEvent.click(panel.getByRole('button', { name: 'Close targets' }));
  expect(screen.getByRole('button', { name: 'ATTACKER' }).getAttribute('aria-pressed')).toBe(
    'true'
  );
});

test('R004: パネル内の座標0のclickで閉じない', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'WEAPONS' }));
  const dialog = screen.getByRole('dialog', { name: 'WEAPONS' });
  dialog.getBoundingClientRect = () => ({
    x: 100,
    y: 0,
    left: 100,
    top: 0,
    right: 500,
    bottom: 800,
    width: 400,
    height: 800,
    toJSON: () => ({}),
  });
  fireEvent.click(within(dialog).getByRole('checkbox', { name: 'MSL' }), {
    clientX: 0,
    clientY: 0,
    detail: 0,
  });
  expect(screen.getByRole('dialog', { name: 'WEAPONS' })).toBeTruthy();
  fireEvent.click(dialog, { clientX: 50, clientY: 100, detail: 1 });
  expect(screen.queryByRole('dialog', { name: 'WEAPONS' })).toBeNull();
});
