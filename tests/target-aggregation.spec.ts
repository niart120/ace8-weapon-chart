import { expect, test } from '@playwright/test';

test('所属検索で一部解除した集約行を混合表示し、保存復元後も一行にまとめる', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  await page.getByRole('button', { name: 'Filter targets' }).click();
  await page.getByRole('checkbox', { name: 'TARGET PARTS' }).check();
  await page.getByRole('checkbox', { name: 'MISSION VARIANTS' }).check();
  await expect(page.locator('tbody tr')).toHaveCount(217);
  await page.getByRole('button', { name: 'Filter targets' }).click();
  await page.getByRole('button', { name: 'Search targets', exact: true }).click();
  await page.getByRole('searchbox').fill('AA GUN《FRIGATE》');
  await page.getByRole('checkbox', { name: 'AA GUN《SHIP》', exact: true }).uncheck();
  await expect(page.locator('tbody tr')).toHaveCount(217);
  await page.getByRole('button', { name: 'Close search targets' }).click();
  await expect(page.getByRole('checkbox', { name: 'AA GUN《SHIP》', exact: true })).toHaveAttribute(
    'aria-checked',
    'mixed'
  );
  await page.reload();
  await expect(page.locator('tbody tr')).toHaveCount(217);
  const row = page.locator('tr[data-target-id="53"]');
  await row.locator('summary').click();
  await expect(row.locator('details > div')).toContainText('AA GUN《AEGIS》');
  await expect(row.locator('details > div')).not.toContainText('FRIGATE');
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  const merged = page.getByRole('checkbox', { name: 'AA GUN《SHIP》', exact: true });
  await expect(merged).toHaveAttribute('aria-checked', 'mixed');
  await merged.click();
  await expect(merged).toBeChecked();
  await expect(row.locator('details > div')).toContainText('FRIGATE');
});

test('モバイルでM27標準値を表示し、親注記省略後も所属を開ける', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  await page.getByRole('button', { name: 'Filter targets' }).click();
  await page.getByRole('radio', { name: 'M27', exact: true }).check();
  await page.getByRole('checkbox', { name: 'TARGET PARTS' }).check();
  await expect(page.getByRole('checkbox', { name: 'MISSION VARIANTS' })).not.toBeChecked();
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  await expect(page.locator('.sidebar-panel')).toHaveCSS('visibility', 'hidden');
  const row = page.locator('tr[data-target-id="419"]');
  await expect(row.locator('summary')).toHaveText('PILLAR (Front)');
  await row.locator('summary').click();
  await expect(row.locator('details > div')).toContainText('MEGAFLOAT');
  await expect(page.locator('tr[data-target-id="500"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/target-aggregation-mobile.png' });
});
