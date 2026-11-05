import { expect, test } from '@playwright/test';
for (const width of [1440, 390, 320]) {
  test(`表・書体・配色 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      const metrics = await page.evaluate(async () => {
        const loaded = await Promise.all(
          [400, 500, 600].map((weight) =>
            document.fonts.load(`${weight} 15px Rajdhani`, 'MSL 12345')
          )
        );
        const style = getComputedStyle(document.documentElement);
        const luminance = (hex: string) => {
          const rgb = hex
            .trim()
            .slice(1)
            .match(/../g)!
            .map((x) => parseInt(x, 16) / 255)
            .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
        const ratios = [1, 2, 3, 4, 5].flatMap((n) =>
          ['--surface', '--stripe', '--hover'].map((background) => {
            const a = luminance(style.getPropertyValue(`--hits-${n}`));
            const b = luminance(
              style.getPropertyValue(background).replace(/^\s*#fff\s*$/, '#ffffff')
            );
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          })
        );
        const cell = document.querySelector('td')!;
        return {
          loaded: loaded.every((fonts) => fonts.length > 0),
          family: getComputedStyle(cell).fontFamily,
          size: getComputedStyle(cell).fontSize,
          pageWidth: document.documentElement.scrollWidth,
          minimumContrast: Math.min(...ratios),
        };
      });
      expect(metrics.loaded).toBe(true);
      expect(metrics.family).toContain('Rajdhani');
      expect(metrics.size).toBe('15px');
      expect(metrics.pageWidth).toBeLessThanOrEqual(width);
      expect(metrics.minimumContrast).toBeGreaterThanOrEqual(4.5);
      await page.screenshot({ path: info.outputPath(`${colorScheme}.png`) });
    }
  });
}
