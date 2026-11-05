import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`サイドバー開閉 ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const weapons = page.getByRole('button', { name: 'WEAPONS', exact: true });
    const targets = page.getByRole('button', { name: 'TARGETS', exact: true });
    const before = await weapons.boundingBox();
    await weapons.click();
    await expect(page.getByRole('complementary', { name: 'WEAPONS' })).toBeVisible();
    expect(await weapons.boundingBox()).toEqual(before);
    const checkbox = page.getByRole('complementary').getByRole('checkbox').first();
    const selected = await checkbox.isChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked({ checked: !selected });
    await targets.click();
    await expect(page.getByRole('complementary', { name: 'TARGETS' })).toBeVisible();
    await targets.click();
    await expect(page.getByRole('complementary')).toHaveCount(0);
    await weapons.click();
    await page.getByRole('button', { name: 'Search weapons' }).click();
    await page.getByRole('searchbox').fill('QAAM');
    await expect(
      page.getByRole('complementary').getByRole('checkbox', { name: 'QAAM', exact: true })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(weapons).toBeFocused();
    await weapons.click();
    await page.screenshot({ path: `test-results/sidebar-weapons-${width}.png` });
  });
}

for (const width of [390, 1440]) {
  test(`操作列と設定 ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const targets = page.getByRole('button', { name: 'TARGETS', exact: true });
    const settings = page.getByRole('button', { name: 'SETTINGS', exact: true });
    await targets.click();
    await expect(page.getByRole('tablist')).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'MISSION VARIANTS' })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'AIRCRAFT FIGHTER all' })).toBeVisible();
    await settings.click();
    await page.getByRole('button', { name: 'ATTACKER', exact: true }).click();

    await page.getByRole('button', { name: 'Reset all' }).click();
    await expect(page.getByRole('button', { name: 'FIGHTER', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByRole('checkbox', { name: 'MISSION VARIANTS' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reset conditions' })).toHaveCount(0);
    const reset = await page.getByRole('button', { name: 'Reset all' }).boundingBox();
    expect(reset?.y).toBeGreaterThan(800);
    await expect(page.getByRole('complementary')).toHaveCSS(
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)'
    );
    expect((await settings.boundingBox())?.x).toBe(0);
    await page.screenshot({ path: `test-results/sidebar-icons-settings-${width}.png` });
    await targets.click();
    await page.screenshot({ path: `test-results/sidebar-icons-targets-${width}.png` });
    await targets.click();
    await expect(page.getByRole('complementary')).toHaveCount(0);
  });
}

for (const width of [390, 1440]) {
  test(`検索とミッションフィルター ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
    await page.getByRole('button', { name: 'Search weapons' }).click();
    const weaponSearchY = (await page.getByRole('searchbox').boundingBox())?.y;
    await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
    await page.getByRole('button', { name: 'Search targets' }).click();
    expect((await page.getByRole('searchbox').boundingBox())?.y).toBe(weaponSearchY);
    await expect(page.getByRole('searchbox')).toBeFocused();
    const tableBefore = await page.locator('table').textContent();
    const beforeY = (
      await page.getByRole('button', { name: 'AIRCRAFT', exact: true }).boundingBox()
    )?.y;
    await page.getByRole('button', { name: 'Filter targets' }).click();
    expect(
      (await page.getByRole('button', { name: 'AIRCRAFT', exact: true }).boundingBox())?.y
    ).toBe(beforeY);
    await expect(page.getByRole('checkbox', { name: 'TARGET PARTS' })).toBeAttached();
    await page.getByRole('radio', { name: 'M1', exact: true }).check();
    await expect(page.locator('tbody tr')).toHaveCount(4);
    await page.getByRole('button', { name: 'Filter targets' }).click();
    await page.getByRole('searchbox').fill('NO_MATCH_123');
    await expect(page.getByText('NO RESULTS', { exact: true })).toBeVisible();
    await page.getByRole('searchbox').fill('');
    await page.getByRole('button', { name: 'Close search targets' }).click();
    await expect(page.getByRole('heading', { name: 'TARGETS', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Filter targets' }).click();
    await expect(page.getByRole('complementary')).toHaveCSS(
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)'
    );
    await page.screenshot({ path: `test-results/sidebar-filter-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('complementary')).toBeVisible();
    await page.getByRole('button', { name: 'Remove M1 filter' }).click();
    expect(await page.locator('table').textContent()).toBe(tableBefore);
  });
}

test('設定アコーディオンの値保持とキーボード操作', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  await page.getByRole('button', { name: 'ATTACKER', exact: true }).click();
  for (const name of ['ROLE', 'DAMAGE TYPE', 'PARTS']) {
    const heading = page.getByRole('button', { name, exact: true });
    await expect(heading).toHaveAttribute('aria-expanded', 'true');
    await heading.press('Enter');
    await expect(heading).toHaveAttribute('aria-expanded', 'false');
  }
  await page.screenshot({ path: 'test-results/settings-collapsed.png' });
  for (const name of ['ROLE', 'DAMAGE TYPE', 'PARTS'])
    await page.getByRole('button', { name, exact: true }).click();
  await expect(page.getByRole('button', { name: 'ATTACKER', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await page.getByRole('checkbox', { name: 'EML.POW+', exact: true }).check();
  await page.screenshot({ path: 'test-results/settings-expanded.png' });
});

test('候補0件の狭い画面でもフィルターを操作し、外側クリックで閉じる', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  await page.getByRole('button', { name: 'Search targets' }).click();
  await page.getByRole('searchbox').fill('NO_MATCH_123');
  await page.getByRole('button', { name: 'Filter targets' }).click();
  await page.getByRole('checkbox', { name: 'TARGET PARTS', exact: true }).check();
  const dialog = await page.getByRole('dialog').boundingBox();
  expect(dialog!.x).toBeGreaterThanOrEqual(48);
  expect(dialog!.y + dialog!.height).toBeLessThanOrEqual(568);
  await page.screenshot({ path: 'test-results/sidebar-filter-empty-320.png' });
  await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`任務・INCLUDE自動選択と保存・数値・全体リセット ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      if (!localStorage.getItem('ace8-weapon-chart.preferences'))
        localStorage.setItem(
          'ace8-weapon-chart.preferences',
          JSON.stringify({
            version: 5,
            missionId: null,
            weaponIds: [21],
            targetIds: [26, 156, 465, 430, 153],
            showParts: false,
            showMissionVariants: false,
            conditions: { role: 'FIGHTER', parts: ['bombPower'], damageType: 'DIRECT' },
          })
        );
    });
    await page.goto('/');
    const f16 = page.locator('tr[data-target-id="26"]');
    await expect(f16.locator('td').nth(1)).toHaveText('1');
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('tr[data-target-id="156"] td')).toHaveText(['-', '?']);
    await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
    await page.getByRole('checkbox', { name: 'BOMB.POW+', exact: true }).uncheck();
    await expect(f16.locator('td').nth(1)).toHaveText('2');
    await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
    await page.getByRole('button', { name: 'Search targets' }).click();
    await page.getByRole('searchbox').fill('F-16C');
    await page.getByRole('button', { name: 'Filter targets' }).click();
    await page.getByRole('radio', { name: 'M3', exact: true }).check();
    await expect(page.locator('tbody tr')).toHaveCount(9);
    await page.getByRole('checkbox', { name: 'MISSION VARIANTS' }).check();
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await page.keyboard.press('Escape');
    await page.getByRole('checkbox', { name: 'AIRCRAFT all', exact: true }).uncheck();
    await expect(f16).toHaveCount(0);
    await expect(page.locator('tbody tr')).toHaveCount(9);
    await page.getByRole('button', { name: 'Filter targets' }).click();
    await page.getByRole('checkbox', { name: 'TARGET PARTS' }).check();
    await expect(f16).toHaveCount(0);
    await page.getByRole('radio', { name: 'M3', exact: true }).check();
    await expect(page.locator('tbody tr')).toHaveCount(9);
    await page.reload();
    await expect(page.locator('tbody tr')).toHaveCount(9);
    await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await page.getByRole('button', { name: 'Filter targets' }).click();
    await expect(page.getByRole('radio', { name: 'M3', exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'TARGET PARTS' })).toBeChecked();
    await page.getByRole('radio', { name: 'M1', exact: true }).check();
    await expect(page.locator('tbody tr')).toHaveCount(4);
    await expect(page.getByRole('radio', { name: 'M3', exact: true })).not.toBeChecked();
    await page.getByRole('button', { name: 'Reset all' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('thead th')).toHaveCount(width === 390 ? 3 : 33);
    await expect(page.locator('tbody tr')).toHaveCount(125);
  });
}
