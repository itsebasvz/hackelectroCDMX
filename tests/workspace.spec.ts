import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
});
test('navega por tema y conserva una sola cartografía, selecciones y foco', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByText('Escenario actualizado · los resultados cambian al editar los parámetros.'),
  ).toBeVisible();
  await expect(page.locator('.workspace-panel')).toBeHidden();
  await page.getByRole('link', { name: 'Saltar al contenido' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#map-distance')).toBeFocused();
  const canvas = await page.locator('.map-canvas').elementHandle();
  await page.getByRole('link', { name: 'Economía', exact: true }).click();
  await expect(page).toHaveURL(/#\/economia\/caja$/);
  await page.getByRole('link', { name: 'Saltar al contenido' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#workspace-panel-title')).toBeFocused();
  await expect(page).toHaveURL(/#\/economia\/caja$/);
  await page.getByRole('link', { name: 'Costos', exact: true }).click();
  await page.getByText('Consultar el desglose económico', { exact: true }).click();
  await page.getByRole('button', { name: 'Ampliar panel' }).click();
  await expect(page.getByRole('dialog', { name: 'Economía' })).toBeVisible();
  await page.getByRole('button', { name: 'Restaurar panel' }).click();
  await page.getByRole('button', { name: 'Cerrar panel' }).click();
  await expect(page.getByRole('link', { name: 'Economía', exact: true })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/#\/economia\/costos$/);
  await expect(
    page.getByRole('region', { name: 'Comparación detallada desplazable' }).last(),
  ).toBeVisible();
  expect(await canvas?.evaluate((node) => node.isConnected)).toBe(true);
  await page.goto('/#/configurar?campo=finance.months');
  await expect(page.getByLabel('Plazo del crédito')).toBeFocused();
  await page.getByRole('button', { name: 'Cerrar panel' }).click();
  await page.goto('/#desconocida');
  await expect(page).toHaveURL(/#\/mapa$/);
});

test('reproduce, pausa en reserva y conserva escenario y archivos', async ({ page }) => {
  const { defaultScenario } = await import('../src/data/defaults');
  const scenario = defaultScenario();
  scenario.operation.cycles = 12;
  await page.addInitScript(
    (s) => localStorage.setItem('hackelectro:scenario:v1', JSON.stringify(s)),
    scenario,
  );
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reproducir recorrido' })).toBeEnabled();
  const before = await page.evaluate(() => localStorage.getItem('hackelectro:scenario:v1'));
  const report = await page.locator('.print-report').textContent();
  await page.clock.install();
  await page.getByRole('button', { name: 'Reproducir recorrido' }).click();
  await page.clock.runFor(100);
  await page.clock.fastForward(60_000);
  await expect(page.getByText('Reserva alcanzada · reproducción pausada')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reproducir recorrido' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar exploración' }).click();
  await page.clock.runFor(100);
  await page.clock.fastForward(60_000);
  await expect(page.getByText('Recorrido explorado', { exact: true })).toBeVisible();
  await expect(page.locator('#map-distance')).toHaveValue('12000');
  await page.getByRole('button', { name: 'Reiniciar recorrido' }).click();
  await expect(page.locator('#map-distance')).toHaveValue('0');
  await page.getByRole('button', { name: 'Reproducir recorrido' }).click();
  await page.clock.runFor(1000);
  await page.getByRole('link', { name: 'Ambiente', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reproducir recorrido' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar panel' }).click();
  const paused = await page.locator('#map-distance').inputValue();
  await page.clock.runFor(1000);
  expect(await page.locator('#map-distance').inputValue()).toBe(paused);
  expect(await page.evaluate(() => localStorage.getItem('hackelectro:scenario:v1'))).toBe(before);
  expect(await page.locator('.print-report').textContent()).toBe(report);
});

test('todas las áreas admiten teclado, panel ampliado y pantalla equivalente a zoom 200%', async ({
  page,
}) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reproducir recorrido' })).toBeEnabled();
  for (const path of [
    '/configurar',
    '/economia/caja',
    '/economia/costos',
    '/economia/pruebas',
    '/economia/alternativas',
    '/ambiente',
    '/operacion/energia',
    '/operacion/condiciones',
    '/operacion/pruebas',
    '/archivos',
    '/fuentes',
  ]) {
    await page.evaluate((v) => (location.hash = v), path);
    await expect(page.locator('.workspace-view:not([hidden])')).toBeVisible();
    const violations = (await new AxeBuilder({ page }).analyze()).violations;
    expect(violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
  }
  await page.getByRole('button', { name: 'Ampliar panel' }).click();
  const dialog = page.getByRole('dialog', { name: 'Fuentes' });
  await expect(dialog).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar panel' }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Restaurar panel' })).toBeFocused();
  const links = dialog.locator('a[href]');
  await links.last().focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Restaurar panel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.setViewportSize({ width: 720, height: 450 });
  await page.getByRole('link', { name: 'Configurar', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Configurar' })).toBeVisible();
  const bounds = (await page.locator('.workspace-panel').boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(450);
  await page.getByLabel('Longitud del ciclo de prueba').fill('21');
  await expect(page.getByLabel('Longitud del ciclo de prueba')).toHaveValue('21');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Cerrar panel' }).click();
  await expect(page.getByRole('link', { name: 'Configurar', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
