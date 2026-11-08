import { afterEach, expect, test, beforeEach, vi } from 'vitest';
// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => window.localStorage.clear());

afterEach(cleanup);

test('モバイルのハンバーガーでピラーとパネルをまとめて出し入れする', () => {
  const matchMedia = window.matchMedia.bind(window);
  const media = vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
    const result = matchMedia(query);
    Object.defineProperty(result, 'matches', { value: true });
    return result;
  });
  try {
    render(<App />);
    const menu = screen.getByRole('button', { name: 'Open menu' });
    expect(screen.queryByRole('navigation')).toBeNull();
    fireEvent.click(menu);
    expect(screen.getByRole('navigation')).toBeTruthy();
    expect(screen.getByRole('complementary', { name: 'WEAPONS' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'WEAPONS' }));
    expect(screen.getByRole('complementary', { name: 'WEAPONS' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
    expect(screen.getByRole('complementary', { name: 'TARGETS' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.getByRole('main').hasAttribute('inert')).toBe(false);
    fireEvent.click(menu);
    expect(screen.getByRole('complementary', { name: 'TARGETS' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'SETTINGS' }));
    fireEvent.click(screen.getByRole('button', { name: 'ATTACKER' }));
    fireEvent.click(menu);
    fireEvent.click(menu);
    expect(screen.getByRole('complementary', { name: 'SETTINGS' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'ATTACKER' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    fireEvent.keyDown(screen.getByRole('complementary'), { key: 'Escape' });
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(document.activeElement).toBe(menu);
  } finally {
    cleanup();
    media.mockRestore();
  }
});

test('MISSIONはALLを含む排他選択で、選んだ任務の対象を表に自動選択する', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filter targets' }));
  expect(screen.getByRole('radio', { name: 'ALL' })).toHaveProperty('checked', true);
  fireEvent.click(screen.getByRole('radio', { name: 'M1' }));
  expect(screen.getAllByRole('rowheader')).toHaveLength(4);
  expect(screen.getByRole('radio', { name: 'ALL' })).toHaveProperty('checked', false);
  fireEvent.click(screen.getByRole('radio', { name: 'ALL' }));
  expect(screen.getAllByRole('rowheader')).toHaveLength(139);
});

test('操作列にフォーカスしてもEscapeは検索を先に閉じる', () => {
  render(<App />);
  const weapons = screen.getByRole('button', { name: 'WEAPONS' });
  fireEvent.click(weapons);
  fireEvent.click(screen.getByRole('button', { name: 'Search weapons' }));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'QAAM' } });
  weapons.focus();
  fireEvent.keyDown(weapons, { key: 'Escape' });
  expect(screen.queryByRole('searchbox')).toBeNull();
  expect(screen.getByRole('complementary', { name: 'WEAPONS' })).toBeTruthy();
});

test('左端の操作で開閉・切り替えでき、Escapeで閉じて操作元に戻る', () => {
  render(<App />);
  const weapons = screen.getByRole('button', { name: 'WEAPONS' });
  const targets = screen.getByRole('button', { name: 'TARGETS' });
  expect(screen.queryByRole('complementary')).toBeNull();
  fireEvent.click(weapons);
  expect(screen.getByRole('complementary', { name: 'WEAPONS' })).toBeTruthy();
  expect(weapons.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(targets);
  expect(screen.getByRole('complementary', { name: 'TARGETS' })).toBeTruthy();
  expect(weapons.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(targets);
  expect(screen.queryByRole('complementary')).toBeNull();
  fireEvent.click(weapons);
  fireEvent.keyDown(screen.getByRole('complementary'), { key: 'Escape' });
  expect(screen.queryByRole('complementary')).toBeNull();
  expect(document.activeElement).toBe(weapons);
});

test('アイコンから設定を開閉できる', () => {
  render(<App />);
  const menu = screen.getByRole('button', { name: 'SETTINGS' });
  fireEvent.click(menu);
  expect(screen.getByRole('group', { name: 'ROLE' })).toBeTruthy();
  fireEvent.click(menu);
  expect(screen.queryByRole('complementary')).toBeNull();
  fireEvent.click(menu);
  expect(screen.getByRole('complementary', { name: 'SETTINGS' })).toBeTruthy();
  expect(screen.queryByText(/WEAPONS \/ /)).toBeNull();
});

test('重複見出しを持たず、分類折り畳みと中分類を表示する', () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: 'Close sidebar' })).toBeNull();
  expect(screen.queryByRole('heading', { name: 'WEAPONS' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'WEAPONS' }));
  const group = screen.getByRole('button', { name: /^MSL$/, expanded: true });
  fireEvent.click(group);
  expect(group.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  expect(screen.getByRole('checkbox', { name: 'AIRCRAFT FIGHTER all' })).toBeTruthy();
});

test('対象表示フィルターを全体リセットで戻す', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filter targets' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'MISSION VARIANTS' }));
  fireEvent.click(screen.getByRole('button', { name: 'Reset all' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filter targets' }));
  expect(screen.getByRole('checkbox', { name: 'MISSION VARIANTS' })).toHaveProperty(
    'checked',
    false
  );
  fireEvent.click(screen.getByRole('button', { name: 'SETTINGS' }));
  expect(screen.queryByRole('checkbox', { name: 'MISSION VARIANTS' })).toBeNull();
  expect(screen.getByRole('heading', { name: 'SETTINGS' })).toBeTruthy();
});

test('検索は候補だけを絞り、任務選択は表に反映される', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(screen.queryByRole('searchbox')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Search targets' }));
  expect(screen.getByRole('searchbox')).toBe(document.activeElement);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'NO MATCH' } });
  expect(screen.getAllByRole('rowheader')).toHaveLength(139);
  fireEvent.click(screen.getByRole('button', { name: 'Filter targets' }));
  fireEvent.click(screen.getByRole('radio', { name: /^M1$/ }));
  expect(screen.getAllByRole('rowheader')).toHaveLength(4);
  expect(screen.getByRole('button', { name: 'Remove M1 filter' })).toBeTruthy();
});

test('対象表示オプションはフィルター内にありEscapeでパネルを残して閉じる', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filter targets' }));
  expect(screen.getByRole('dialog', { name: 'Target filters' })).toBeTruthy();
  expect(screen.getByRole('checkbox', { name: 'TARGET PARTS' })).toBeTruthy();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('complementary', { name: 'TARGETS' })).toBeTruthy();
});

test('設定の各項目は初期展開し、閉じても値を保ち要約を表示しない', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'SETTINGS' }));
  fireEvent.click(screen.getByRole('button', { name: 'ATTACKER' }));
  for (const name of ['ROLE', 'DAMAGE TYPE', 'PARTS']) {
    const toggle = screen.getByRole('button', { name, expanded: true });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  }
  expect(screen.queryByRole('button', { name: 'ATTACKER' })).toBeNull();
  expect(screen.queryByRole('checkbox', { name: 'MSL.POW+' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'ROLE' }));
  expect(screen.getByRole('button', { name: 'ATTACKER' }).getAttribute('aria-pressed')).toBe(
    'true'
  );
});

test('ミッションのチップはTARGETSだけに表示する', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filter targets' }));
  fireEvent.click(screen.getByRole('radio', { name: 'M1' }));
  fireEvent.click(screen.getByRole('button', { name: 'WEAPONS' }));
  expect(screen.queryByRole('button', { name: 'Remove M1 filter' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'TARGETS' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'Remove M1 filter' })).toBeTruthy();
});

test('候補にフォーカスしていてもEscapeは検索、パネルの順に閉じる', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'WEAPONS' }));
  fireEvent.click(screen.getByRole('button', { name: 'Search weapons' }));
  fireEvent.keyDown(screen.getByRole('checkbox', { name: 'MSL all' }), { key: 'Escape' });
  expect(screen.getByRole('complementary', { name: 'WEAPONS' })).toBeTruthy();
  expect(screen.queryByRole('searchbox')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Search weapons' }));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('complementary')).toBeNull();
});
