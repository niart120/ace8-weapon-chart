import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type { Page, TestInfo } from '@playwright/test';
async function record(page: Page, info: TestInfo, values: Record<string, unknown>) {
  await writeFile(
    info.outputPath('metrics.json'),
    JSON.stringify(
      {
        browser: await page.context().browser()?.version(),
        viewport: page.viewportSize(),
        ...values,
      },
      null,
      2
    )
  );
}
async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
}
test('PC: 全列・即時計算・検索・分類操作・固定表示・保存', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  const start = Date.now();
  await page.goto('/');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('columnheader')).toHaveCount(36);
  const initialMs = Date.now() - start;
  const f16 = page
    .getByRole('row')
    .filter({ has: page.getByRole('rowheader', { name: 'F-16C', exact: true }) });
  await expect(f16.locator('td').nth(1)).toHaveText('2');
  const changeStart = Date.now();
  await page.getByRole('checkbox', { name: 'MSL.POW+', exact: true }).check();
  await expect(f16.locator('td').nth(1)).toHaveText('1');
  const conditionMs = Date.now() - changeStart;
  await page.getByRole('button', { name: 'Reset conditions', exact: true }).click();
  await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'WEAPONS' });
  await expect(panel.getByRole('searchbox')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(panel.getByRole('button', { name: 'Close weapons' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  expect(await panel.locator(':focus').count()).toBe(1);
  await panel.getByRole('searchbox').focus();

  const searchStart = Date.now();
  await panel.getByRole('searchbox').fill('qaam');
  await expect(panel.getByRole('checkbox', { name: 'QAAM', exact: true })).toBeVisible();
  const searchMs = Date.now() - searchStart;
  await panel.getByRole('button', { name: 'MSL.AIR', exact: true }).click();
  await expect(panel.getByRole('checkbox', { name: 'QAAM', exact: true })).not.toBeVisible();
  await panel.getByRole('button', { name: 'MSL.AIR', exact: true }).click();
  await expect(panel.getByRole('checkbox', { name: 'QAAM', exact: true })).toBeVisible();

  await expect(page.getByRole('columnheader')).toHaveCount(36);
  await panel.getByRole('checkbox', { name: 'MSL.AIR all' }).uncheck();
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'WEAPONS', exact: true })).toBeFocused();
  await expect(page.getByRole('columnheader')).toHaveCount(25);
  await page.reload();
  await expect(page.getByRole('columnheader')).toHaveCount(25);
  await page.getByRole('button', { name: 'RESET', exact: true }).click();
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  const targetPanel = page.getByRole('dialog', { name: 'TARGETS' });
  await targetPanel.getByRole('checkbox', { name: 'TARGET PARTS', exact: true }).check();
  await targetPanel.getByRole('checkbox', { name: 'MISSION VARIANTS', exact: true }).check();
  await targetPanel.getByRole('button', { name: 'Close targets' }).click();
  await expect(
    page.getByRole('rowheader', { name: 'MAIN ENGINE《LADON》', exact: true })
  ).toBeAttached();
  const rows = await page.getByRole('rowheader').count();
  const region = page.getByRole('region', { name: 'Results' });
  const head = page.getByRole('columnheader', { name: 'TARGET', exact: true });
  const corner = await head.boundingBox();
  const targetX = (await page.getByRole('rowheader').first().boundingBox())?.x;
  const hpX = (await page.getByRole('columnheader', { name: 'HP', exact: true }).boundingBox())?.x;
  const scrollStart = Date.now();
  await region.evaluate((element) => {
    element.scrollLeft = 600;
    element.scrollTop = 300;
  });
  await settle(page);
  const scrollMs = Date.now() - scrollStart;
  expect((await head.boundingBox())?.y).toBe(corner?.y);
  expect((await page.getByRole('rowheader').first().boundingBox())?.x).toBe(targetX);
  expect(
    (await page.getByRole('columnheader', { name: 'HP', exact: true }).boundingBox())!.x
  ).toBeLessThan(hpX!);
  await region.focus();
  const before = await region.evaluate((e) => e.scrollLeft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate((e) => e.scrollLeft)).toBeGreaterThan(before);
  await region.evaluate((e) => {
    e.scrollLeft = 0;
    e.scrollTop = 0;
  });
  await settle(page);
  await page.screenshot({ path: info.outputPath('pc.png') });
  expect(errors).toEqual([]);
  expect(requests.every((url) => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
  await record(page, info, {
    initialMs,
    conditionMs,
    searchMs,
    scrollMs,
    rows,
    weaponColumns: 34,
    totalColumns: 36,
  });
});
test('スマートフォン: 初回3列・設定・同時選択・全解除と復元・リセット', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const start = Date.now();
  await page.goto('/');
  await expect(page.getByRole('columnheader')).toHaveCount(3);
  const initialMs = Date.now() - start;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  const settings = page.getByRole('dialog', { name: 'SETTINGS' });
  await expect(settings).toBeVisible();
  await settings.getByRole('button', { name: 'ATTACKER', exact: true }).click();
  await settings.getByRole('button', { name: 'Close settings' }).click();
  await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'WEAPONS' });
  await panel.getByRole('checkbox', { name: 'MSL (Rookie)', exact: true }).check();
  for (const name of ['GUN TypeA', 'GUN TypeB', 'GUN TypeC'])
    await panel.getByRole('checkbox', { name, exact: true }).check();
  await panel.getByRole('button', { name: 'Close weapons' }).click();
  await expect(page.getByRole('columnheader')).toHaveCount(7);
  const region = page.getByRole('region', { name: 'Results' });
  expect(await region.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole('columnheader')).toHaveCount(7);
  await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
  for (const category of ['MSL', 'MSL.AIR', 'MSL.GND', 'BOMB', 'GUN', 'RKT', 'OTHER']) {
    const checkbox = panel.getByRole('checkbox', { name: `${category} all`, exact: true });
    if ((await checkbox.getAttribute('aria-checked')) === 'mixed') await checkbox.click();
    if (await checkbox.isChecked()) await checkbox.uncheck();
  }
  await panel.getByRole('button', { name: 'Close weapons' }).click();
  await expect(page.getByRole('columnheader')).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('columnheader')).toHaveCount(2);
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  const targets = page.getByRole('dialog', { name: 'TARGETS' });
  for (const category of ['AIRCRAFT', 'GROUND', 'SHIP', 'STRUCTURE', 'OTHER'])
    await targets.getByRole('checkbox', { name: `${category} all`, exact: true }).uncheck();
  await targets.getByRole('button', { name: 'Close targets' }).click();
  await expect(page.getByRole('rowheader')).toHaveCount(0);
  await page.getByRole('button', { name: 'RESET', exact: true }).click();
  await expect(page.getByRole('columnheader')).toHaveCount(3);
  await expect(page.getByRole('rowheader').first()).toBeVisible();
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  await expect(settings.getByRole('button', { name: 'FIGHTER', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await settings.getByRole('button', { name: 'Close settings' }).click();
  await page.screenshot({ path: info.outputPath('mobile.png') });
  await record(page, info, {
    initialMs,
    rows: await page.getByRole('rowheader').count(),
    weaponColumns: 1,
    totalColumns: 3,
  });
});

test('R004: SpaceとEnterでパネル内の操作を継続できる', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'WEAPONS', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'WEAPONS' });
  const missile = panel.getByRole('checkbox', { name: 'MSL', exact: true });
  await missile.focus();
  await page.keyboard.press('Space');
  await expect(panel).toBeVisible();
  await expect(missile).not.toBeChecked();
  const group = panel.getByRole('button', { name: 'MSL.AIR', exact: true });
  await group.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await expect(group).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'WEAPONS', exact: true })).toBeFocused();
});

for (const width of [1440, 390]) {
  test(`航空機識別名: ${width}pxで検索・任務表示・選択保持を確認`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const name = 'TYPHOON (SHADOW) [M25-2]';
    await expect(page.getByRole('rowheader', { name: 'TYPHOON', exact: true })).toHaveCount(1);
    await expect(page.getByRole('rowheader', { name, exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
    const panel = page.getByRole('dialog', { name: 'TARGETS' });
    const variants = panel.getByRole('checkbox', { name: 'MISSION VARIANTS', exact: true });
    await variants.check();
    await panel.getByRole('searchbox').fill('typhoon (shadow)');
    const choice = panel.getByRole('checkbox', { name: /^TYPHOON \(SHADOW\) \[M25-2\]/ });
    await expect(choice).toBeChecked();
    await variants.uncheck();
    await expect(choice).toHaveCount(0);
    await variants.check();
    await expect(choice).toBeChecked();
    await panel.getByRole('searchbox').fill('ventus');
    await expect(panel.getByRole('checkbox', { name: /^SU-35S \(VENTUS\) \[M24\]/ })).toBeChecked();
    await panel.getByRole('button', { name: 'Close targets' }).click();
    await expect(page.getByRole('rowheader', { name, exact: true })).toHaveCount(1);
    await expect(
      page.getByRole('rowheader', { name: 'SU-35S (VENTUS) [M24]', exact: true })
    ).toHaveCount(1);
    await page.reload();
    await expect(page.getByRole('rowheader', { name, exact: true })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width
    );
  });
}

test('除外済み友軍の旧選択を復元せず、他艦の対空砲は保持する', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    localStorage.setItem(
      'ace8-weapon-guide.preferences',
      JSON.stringify({
        version: 1,
        conditions: { role: 'FIGHTER', parts: [], damageType: 'DIRECT' },
        weaponIds: [1],
        targetIds: [18, 22, 209, 211, 162, 461, 163, 123, 124],
        showParts: true,
        showMissionVariants: true,
      })
    );
  });
  await page.goto('/');
  await expect(page.getByRole('rowheader')).toHaveCount(2);
  await expect(
    page.getByRole('rowheader', { name: 'AA GUN《AIRCRAFT CARRIER》', exact: true })
  ).toHaveCount(1);
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'TARGETS' });
  for (const query of ['QUEEN', 'PURPLE MAGIC', 'GREEN', 'NAVAL GUN《AIRCRAFT CARRIER》']) {
    await panel.getByRole('searchbox').fill(query);
    await expect(panel.locator('.group-items label')).toHaveCount(0);
  }
  await panel.getByRole('searchbox').fill('AA GUN《AIRCRAFT CARRIER》');
  await expect(panel.locator('.group-items label')).toHaveCount(1);
});
