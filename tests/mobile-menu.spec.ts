import { expect, test } from '@playwright/test';

test('767pxと768pxの境界で開閉状態とフォーカスを引き継ぐ', async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  await page.getByRole('button', { name: 'Close menu' }).focus();
  await page.setViewportSize({ width: 768, height: 844 });
  const targets = page.getByRole('button', { name: 'TARGETS', exact: true });
  await expect(targets).toBeFocused();
  await expect(page.getByRole('complementary', { name: 'TARGETS' })).toBeVisible();
  await targets.click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('complementary')).toHaveCount(0);
  await page.setViewportSize({ width: 767, height: 844 });
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  await page.setViewportSize({ width: 768, height: 844 });
  await expect(targets).toBeFocused();
  await page.setViewportSize({ width: 767, height: 844 });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('complementary', { name: 'TARGETS' })).toBeVisible();
});

for (const width of [320, 390]) {
  test(`ヘッダーからピラーを出し入れする ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await expect(page.locator('main')).toHaveCSS('margin-left', '0px');
    await page.screenshot({ path: `test-results/mobile-menu-closed-${width}.png` });
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.locator('main')).toHaveCSS('margin-left', '48px');
    await expect(page.getByRole('complementary', { name: 'WEAPONS' })).toHaveCSS(
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)'
    );
    await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
    await expect(page.getByRole('complementary', { name: 'WEAPONS' })).toBeVisible();
    await page.screenshot({ path: `test-results/mobile-menu-weapons-${width}.png` });
    await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
    await expect(page.getByRole('complementary')).toHaveCSS(
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)'
    );
    await page.screenshot({ path: `test-results/mobile-menu-panel-${width}.png` });
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await expect(page.getByRole('complementary')).toHaveCount(0);
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('complementary', { name: 'TARGETS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'TARGETS', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
    await page.getByRole('button', { name: 'ATTACKER', exact: true }).click();
    await page.getByRole('button', { name: 'Close menu' }).click();
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('complementary', { name: 'SETTINGS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ATTACKER', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.reload();
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('complementary', { name: 'WEAPONS' })).toBeVisible();
  });
}
