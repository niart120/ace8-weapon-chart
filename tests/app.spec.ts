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
    const name = 'TYPHOON (SHADOW) [M25]';
    await expect(page.getByRole('rowheader', { name: 'TYPHOON', exact: true })).toHaveCount(1);
    await expect(page.getByRole('rowheader', { name, exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
    const panel = page.getByRole('dialog', { name: 'TARGETS' });
    const variants = panel.getByRole('checkbox', { name: 'MISSION VARIANTS', exact: true });
    await variants.check();
    await panel.getByRole('searchbox').fill('typhoon (shadow)');
    const choice = panel.getByRole('checkbox', { name: /^TYPHOON \(SHADOW\) \[M25\]/ });
    await expect(choice).toBeChecked();
    await variants.uncheck();
    await expect(choice).toHaveCount(0);
    await variants.check();
    await expect(choice).toBeChecked();
    await panel.getByRole('searchbox').fill('ventus');
    await expect(panel.getByRole('checkbox', { name: /^SU-35S \(VENTUS\) \[M23\]/ })).toBeChecked();
    await panel.getByRole('button', { name: 'Close targets' }).click();
    await expect(page.getByRole('rowheader', { name, exact: true })).toHaveCount(1);
    await expect(
      page.getByRole('rowheader', { name: 'SU-35S (VENTUS) [M23]', exact: true })
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

test('任務表示番号だけを更新し、旧保存ID・部位・識別名を保持する', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    localStorage.setItem(
      'ace8-weapon-guide.preferences',
      JSON.stringify({
        version: 1,
        conditions: { role: 'FIGHTER', parts: [], damageType: 'DIRECT' },
        weaponIds: [1],
        targetIds: [319, 333, 266, 343, 412],
        showParts: true,
        showMissionVariants: true,
      })
    );
  });
  await page.goto('/');
  for (const name of [
    'AIRSHIP [M24]',
    'TYPHOON (SHADOW) [M25]',
    'F-14D (SHADOW) [M20]',
    'AA GUN《AEGIS》 [M25]',
    'SU-57 (SHADOW) [M26]',
  ])
    await expect(page.getByRole('rowheader', { name, exact: true })).toHaveCount(1);
  await expect(page.getByRole('rowheader')).toHaveCount(5);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('ace8-weapon-guide.preferences')!).targetIds
    )
  ).toEqual([319, 333, 266, 343, 412]);
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'TARGETS' });
  await panel.getByRole('searchbox').fill('[M25-2]');
  await expect(panel.locator('.group-items label')).toHaveCount(0);
  await panel.getByRole('searchbox').fill('TYPHOON (SHADOW) [M25]');
  await expect(panel.locator('.group-items label')).toHaveCount(1);
});

test('ダミーと陸上戦艦本体の旧選択を除去し、通常目標と部位を結果と候補に残す', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'ace8-weapon-guide.preferences',
      JSON.stringify({
        version: 1,
        conditions: { role: 'FIGHTER', parts: [], damageType: 'DIRECT' },
        weaponIds: [1],
        targetIds: [
          504, 456, 489, 199, 496, 261, 50, 490, 204, 494, 247, 248, 147, 226, 330, 371, 372,
        ],
        showParts: true,
        showMissionVariants: true,
      })
    );
  });
  await page.goto('/');
  await expect(page.getByRole('rowheader')).toHaveCount(5);
  await expect(page.getByRole('rowheader', { name: 'AIR BASE [M28]', exact: true })).toHaveCount(0);
  await expect(page.getByRole('rowheader', { name: 'APC [M12]', exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('rowheader', { name: 'LAND BATTLESHIP 2 [M19]', exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole('rowheader', { name: 'MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》', exact: true })
  ).toHaveCount(1);
  await expect(
    page.getByRole('rowheader', { name: 'AA GUN《LAND BATTLESHIP 2》', exact: true })
  ).toHaveCount(1);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('ace8-weapon-guide.preferences')!).targetIds
    )
  ).toEqual([50, 490, 204, 248, 372]);
  await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'TARGETS' });
  for (const query of ['AIR BASE [M28]', 'APC [M12]']) {
    await panel.getByRole('searchbox').fill(query);
    await expect(panel.locator('.group-items label')).toHaveCount(0);
  }
  await panel.getByRole('searchbox').fill('LAND BATTLESHIP 2 [M19]');
  await expect(panel.locator('.group-items label')).toHaveCount(0);
  await panel.getByRole('searchbox').fill('MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》');
  await expect(panel.locator('.group-items label')).toHaveCount(1);
});

for (const width of [1440, 390]) {
  test(`SFFS: ${width}pxでBOMB.POW+の即時反映と旧保存を確認`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      if (localStorage.getItem('ace8-weapon-guide.preferences')) return;
      localStorage.setItem(
        'ace8-weapon-guide.preferences',
        JSON.stringify({
          version: 1,
          conditions: { role: 'FIGHTER', parts: ['bombPower'], damageType: 'DIRECT' },
          weaponIds: [21],
          targetIds: [26],
          showParts: false,
          showMissionVariants: false,
        })
      );
    });
    await page.goto('/');
    await expect(page.getByRole('columnheader', { name: 'SFFS', exact: true })).toHaveCount(1);
    const f16 = page.getByRole('row').filter({
      has: page.getByRole('rowheader', { name: 'F-16C', exact: true }),
    });
    const result = f16.locator('td').nth(1);
    const bombPower = page.getByRole('checkbox', { name: 'BOMB.POW+', exact: true });
    // HP55。FIGHTERは子弾40×1.25=50、BOMB.POW+ありは48×1.25=60。
    await expect(result).toHaveText('1');
    if (width === 390) await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
    await expect(bombPower).toBeChecked();
    await bombPower.uncheck();
    if (width === 390)
      await page.getByRole('button', { name: 'Close settings', exact: true }).click();
    await expect(result).toHaveText('2');
    if (width === 390) await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
    await bombPower.check();
    if (width === 390)
      await page.getByRole('button', { name: 'Close settings', exact: true }).click();
    await expect(result).toHaveText('1');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const saved = JSON.parse(localStorage.getItem('ace8-weapon-guide.preferences')!);
          return {
            weaponIds: saved.weaponIds,
            targetIds: saved.targetIds,
            parts: saved.conditions.parts,
          };
        })
      )
      .toEqual({ weaponIds: [21], targetIds: [26], parts: ['bombPower'] });
    await page.reload();
    await expect(result).toHaveText('1');
    if (width === 390) await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
    await expect(bombPower).toBeChecked();
  });

  test(`MEGAFLOAT: ${width}pxで親除外・旧選択・Front/EVと任務名を確認`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      if (localStorage.getItem('ace8-weapon-guide.preferences')) return;
      localStorage.setItem(
        'ace8-weapon-guide.preferences',
        JSON.stringify({
          version: 1,
          conditions: { role: 'MULTIROLE', parts: [], damageType: 'DIRECT' },
          weaponIds: [1],
          targetIds: [418, 423, 429, 424, 430, 420, 422, 500, 501, 419, 421, 503, 426, 502, 425],
          showParts: false,
          showMissionVariants: false,
        })
      );
    });
    await page.goto('/');
    const selectedIds = [424, 430, 420, 422, 500, 501, 419, 421, 503, 426, 502, 425];
    for (const showParts of [false, true])
      for (const showVariants of [false, true]) {
        await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
        const panel = page.getByRole('dialog', { name: 'TARGETS' });
        await panel
          .getByRole('checkbox', { name: 'TARGET PARTS', exact: true })
          .setChecked(showParts);
        await panel
          .getByRole('checkbox', { name: 'MISSION VARIANTS', exact: true })
          .setChecked(showVariants);
        for (const type of ['Front', 'EV']) {
          await panel.getByRole('searchbox').fill(`PILLAR (${type})`);
          await expect(panel.locator('.group-items label')).toHaveCount(
            showParts ? (showVariants ? 3 : 2) : 0
          );
        }
        await panel.getByRole('searchbox').fill('PILLAR《MEGAFLOAT》');
        await expect(panel.locator('.group-items label')).toHaveCount(0);
        await panel.getByRole('button', { name: 'Close targets', exact: true }).click();
        await expect(page.getByRole('rowheader')).toHaveCount(
          showParts ? (showVariants ? 12 : 8) : 0
        );
        await expect(page.getByRole('rowheader', { name: 'MEGAFLOAT', exact: true })).toHaveCount(
          0
        );
        await expect(
          page.getByRole('rowheader', { name: 'PILLAR《MEGAFLOAT》', exact: true })
        ).toHaveCount(0);
        if (showParts) {
          const reactor = page.getByRole('row').filter({
            has: page.getByRole('rowheader', { name: 'FUSION REACTOR《MEGAFLOAT》', exact: true }),
          });
          await expect(reactor.locator('td').nth(0)).toHaveText('40');
          await expect(reactor.locator('td').nth(1)).toHaveText('1');
          for (const type of ['Front', 'EV']) {
            await expect(
              page.getByRole('rowheader', { name: `PILLAR (${type})《MEGAFLOAT》`, exact: true })
            ).toHaveCount(2);
            await expect(
              page.getByRole('rowheader', {
                name: `PILLAR (${type})《MEGAFLOAT》 [M27]`,
                exact: true,
              })
            ).toHaveCount(showVariants ? 1 : 0);
          }
        }
        await expect
          .poll(() =>
            page.evaluate(
              () => JSON.parse(localStorage.getItem('ace8-weapon-guide.preferences')!).targetIds
            )
          )
          .toEqual(selectedIds);
      }
    await page.reload();
    await expect(page.getByRole('rowheader')).toHaveCount(12);
  });

  test(`陸上戦艦部位: ${width}pxで旧ID移行・新名検索・表示切替を確認`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      if (localStorage.getItem('ace8-weapon-guide.preferences')) return;
      localStorage.setItem(
        'ace8-weapon-guide.preferences',
        JSON.stringify({
          version: 1,
          conditions: { role: 'MULTIROLE', parts: [], damageType: 'DIRECT' },
          weaponIds: [1],
          targetIds: [249, 258, 151, 152, 372, 153, 488, 154],
          showParts: false,
          showMissionVariants: false,
        })
      );
    });
    await page.goto('/');
    await expect(page.getByRole('rowheader')).toHaveCount(0);
    const selectedIds = [248, 254, 151, 152, 372, 153, 488];
    for (const showParts of [false, true])
      for (const showVariants of [false, true]) {
        await page.getByRole('button', { name: 'TARGETS', exact: true }).click();
        const panel = page.getByRole('dialog', { name: 'TARGETS' });
        await panel
          .getByRole('checkbox', { name: 'TARGET PARTS', exact: true })
          .setChecked(showParts);
        await panel
          .getByRole('checkbox', { name: 'MISSION VARIANTS', exact: true })
          .setChecked(showVariants);
        if (showParts) {
          for (const [query, count] of [
            ['SUB CATERPILLAR', 2],
            ['ROCKY ISLAND', 1],
            ['AA GUN《LAND BATTLESHIP 2》', 1],
            ['VLS《LAND BATTLESHIP 2》', 1],
          ] as const) {
            await panel.getByRole('searchbox').fill(query);
            await expect(panel.locator('.group-items label')).toHaveCount(count);
          }
          await panel.getByRole('searchbox').fill('THRUSTER');
          await expect(panel.locator('.group-items label')).toHaveCount(showVariants ? 2 : 1);
          await expect(panel).not.toContainText('(左側)');
          await expect(panel).not.toContainText('(右側)');
        }
        await panel.getByRole('button', { name: 'Close targets', exact: true }).click();
        await expect(page.getByRole('rowheader')).toHaveCount(
          showParts ? (showVariants ? 7 : 6) : 0
        );
        if (showParts) {
          await expect(
            page.getByRole('rowheader', {
              name: 'MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》',
              exact: true,
            })
          ).toHaveCount(1);
          const sub = page
            .getByRole('row')
            .filter({ has: page.getByRole('rowheader', { name: 'SUB CATERPILLAR', exact: true }) });
          await expect(sub.locator('td').nth(1)).toHaveText('1');
        }
        await expect
          .poll(() =>
            page.evaluate(
              () => JSON.parse(localStorage.getItem('ace8-weapon-guide.preferences')!).targetIds
            )
          )
          .toEqual(selectedIds);
      }
    await page.reload();
    await expect(page.getByRole('rowheader')).toHaveCount(7);
  });
}
