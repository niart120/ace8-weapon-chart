import { expect, test } from '@playwright/test';

for (const width of [320, 390, 1440]) {
  test(`Escapeの優先順とフォーカス ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/');
    if (page.viewportSize()!.width < 768) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await expect(page.locator('.sidebar-rail')).toHaveCSS(
        'transform',
        'matrix(1, 0, 0, 1, 0, 0)'
      );
    }
    const trigger = page.getByRole('button', { name: 'TARGETS', exact: true });
    await trigger.click();
    await expect(page.getByRole('button', { name: 'Search targets', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Search targets', exact: true }).click();
    await page.getByRole('searchbox').fill('F-16C');
    await page.getByRole('button', { name: 'Filter targets' }).click();
    await trigger.focus();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('searchbox')).toHaveValue('F-16C');
    await trigger.focus();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.getByRole('complementary')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('complementary')).toHaveCount(0);
    await expect(
      width < 768 ? page.getByRole('button', { name: 'Open menu' }) : trigger
    ).toBeFocused();
  });
}

test('モバイルではTabがパネルと操作列を循環し、リサイズでも背後の表を操作しない', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 720 });
  await page.goto('/');
  if (page.viewportSize()!.width < 768) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.locator('.sidebar-rail')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  }
  await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
  await page.getByRole('button', { name: 'HP', exact: true }).focus();
  await page.setViewportSize({ width: 390, height: 720 });
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(page.getByRole('button', { name: 'Search weapons', exact: true })).toBeFocused();
  for (let index = 0; index < 55; index++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(() => !!document.activeElement?.closest('aside, nav, .mobile-heading'))
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Close menu', exact: true }).focus();
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('aside'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
});

for (const width of [320, 390, 1440]) {
  test(`INCLUDEの差分反映・罫線・ALL ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    if (page.viewportSize()!.width < 768) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await expect(page.locator('.sidebar-rail')).toHaveCSS(
        'transform',
        'matrix(1, 0, 0, 1, 0, 0)'
      );
    }
    await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
    await page.getByRole('button', { name: 'Filter targets' }).click();
    await page.getByRole('radio', { name: 'M27', exact: true }).check();
    await expect(page.locator('tbody tr')).toHaveCount(17);
    await page.getByRole('checkbox', { name: 'TARGET PARTS' }).check();
    await expect(page.locator('tr[data-target-id="430"]')).toHaveCount(1);
    await expect(page.locator('tr[data-target-id="419"]')).toHaveCount(1);
    await page.getByRole('checkbox', { name: 'MISSION VARIANTS' }).check();
    await expect(page.locator('tbody tr')).toHaveCount(27);
    await expect(page.locator('tr[data-target-id="419"]')).toHaveCount(1);
    const gap = await page.locator('.sidebar-include-filter legend').evaluate((legend) => {
      const line = document.querySelector('.sidebar-filter-divider')!;
      return legend.getBoundingClientRect().top - line.getBoundingClientRect().bottom;
    });
    expect(gap).toBeGreaterThanOrEqual(10);
    await page.screenshot({ path: `test-results/include-fixed-${width}.png` });
    await page.getByRole('checkbox', { name: 'TARGET PARTS' }).uncheck();
    await expect(page.locator('tr[data-target-id="430"]')).toHaveCount(0);
    await expect(page.locator('tr[data-target-id="419"]')).toHaveCount(0);
    await page.getByRole('checkbox', { name: 'MISSION VARIANTS' }).uncheck();
    await expect(page.locator('tbody tr')).toHaveCount(17);
    await page.getByRole('radio', { name: 'ALL', exact: true }).check();
    await expect(page.locator('tbody tr')).toHaveCount(139);
    await expect(page.getByRole('radio', { name: 'M27', exact: true })).not.toBeChecked();
  });
}
