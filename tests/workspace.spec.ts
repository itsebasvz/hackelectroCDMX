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
  const canvas = await page.locator('.map-canvas').elementHandle();
  await page.getByRole('link', { name: 'Economía', exact: true }).click();
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
