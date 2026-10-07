import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
// Teselas sintéticas sólo en pruebas: evita depender de Internet o cargar OSM en CI.
test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (r) =>
    r.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP49eM7AAXZAuqAGGrEAAAAAElFTkSuQmCC',
        'base64',
      ),
    }),
  );
});
async function ready(page: import('@playwright/test').Page) {
  await expect(
    page.getByText('Escenario actualizado · los resultados cambian al editar los parámetros.'),
  ).toBeVisible();
}
test('evalúa, edita, conserva resultado inválido y encuentra condiciones', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await ready(page);
  await expect(page.getByRole('heading', { name: '¿Qué cambia al electrificar?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cambiar ruta' })).toBeVisible();
  await page
    .locator('.diagnostic-panel')
    .getByRole('button', { name: 'Revisar parámetro' })
    .first()
    .click();
  await expect(page.getByLabel('Capital inicial propio disponible')).toBeFocused();
  await page.getByLabel('Longitud del ciclo de prueba').fill('25');
  await ready(page);
  await expect(page.getByText('210 km', { exact: true })).toBeVisible();
  await page.getByLabel('Longitud del ciclo de prueba').fill('');
  await expect(
    page.getByText(
      'Corrige las entradas. Se conserva el último resultado válido, ahora desactualizado.',
    ),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '¿Qué cambia al electrificar?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar combinación' })).toBeDisabled();
  await page.getByLabel('Longitud del ciclo de prueba').fill('20.340012617');
  await ready(page);
  await page.getByRole('button', { name: 'Buscar combinación' }).click();
  await expect(page.getByText(/180 combinaciones evaluadas/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Explorar esta combinación' }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Explorar esta combinación' }).first().click();
  await ready(page);
  await expect(page.getByText('Cumple cálculos · verificaciones pendientes')).toBeVisible();
  expect(errors).toEqual([]);
});
test('exporta, importa, guarda copias y recalcula', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.getByLabel('Nombre del escenario').fill('Piloto hospitalario');
  await page.getByRole('button', { name: 'Guardar escenario', exact: true }).click();
  await expect(page.getByText('Escenario guardado en este navegador.')).toBeVisible();
  await ready(page);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar JSON' }).click();
  const exported = await pending;
  const path = await exported.path();
  expect(path).toBeTruthy();
  const bytes = await readFile(path!);
  const bundle = JSON.parse(bytes.toString());
  expect(bundle.scenario.name).toBe('Piloto hospitalario');
  expect(bundle.checksum).toHaveLength(64);
  await page.getByRole('button', { name: 'Restaurar ejemplo' }).click();
  await ready(page);
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'scenario.json', mimeType: 'application/json', buffer: bytes });
  await ready(page);
  await expect(page.getByLabel('Nombre del escenario')).toHaveValue('Piloto hospitalario');
  await page.reload();
  await ready(page);
  await expect(page.getByLabel('Nombre del escenario')).toHaveValue('Piloto hospitalario');
});
test('otro ramal y autobús urbano mantienen parámetros explícitos', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.getByRole('button', { name: 'Cambiar ruta' }).click();
  await page.getByLabel('Buscar ruta o destino').fill('Villa Coapa');
  const first = page.locator('.route-option').first();
  await expect(first).toBeVisible();
  await first.click();
  await ready(page);
  await expect(page.getByText('Cambió la geometría.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Urbano · diésel', exact: true }).click();
  await ready(page);
  await expect(page.getByLabel('Referencia eléctrica')).toHaveValue('yutong-e12');
  await expect(page.getByLabel('Referencia de combustión')).toHaveValue('diesel-urban');
});
test('accesibilidad del flujo, diálogo y móvil sin desbordamiento', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const base = await new AxeBuilder({ page }).analyze();
  expect(base.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await page.getByRole('button', { name: 'Fuentes y supuestos' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const dialog = await new AxeBuilder({ page }).include('[role=dialog]').analyze();
  expect(dialog.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const edit = await new AxeBuilder({ page }).analyze();
  expect(edit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await page.screenshot({ path: 'test-results/movil.png', fullPage: true });
});
test('copia local funciona sin teselas ni WebGL, con salida imprimible', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.route('https://tile.openstreetmap.org/**', (r) => r.abort());
  await page.goto('/');
  await ready(page);
  await expect(
    page.getByRole('img', { name: 'Trazos históricos del ramal, sin mapa base' }),
  ).toBeVisible();
  await page.context().setOffline(true);
  await page.getByRole('button', { name: 'Minibús · diésel', exact: true }).click();
  await ready(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-report')).toBeVisible();
  await expect(page.locator('.header')).not.toBeVisible();
  await expect(
    page.locator('.print-report').getByRole('heading', { name: 'Entradas y procedencia' }),
  ).toBeVisible();
});

test('pinta el ramal incluso si la geometría llega después del estilo', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && m.text().includes('Worker failed')) errors.push(m.text());
  });
  await page.route('**/data/routes.geojson', async (r) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await r.continue();
  });
  await page.goto('/');
  await ready(page);
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-route-rendered', 'true');
  await page.getByRole('button', { name: 'Cambiar ruta' }).click();
  await page.getByLabel('Buscar ruta o destino').fill('Villa Coapa');
  await page.locator('.route-option').first().click();
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-route-rendered', 'true');
  expect(errors).toEqual([]);
});

test('explora consumo, hospitales y sensibilidad sin alterar el recaudo', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await ready(page);
  await expect(page).toHaveTitle('Electromovilidad CDMX 2026 · Evaluador de rutas');
  await expect(page.getByRole('link', { name: /Equipo Aragonenes/ })).toBeVisible();
  await page.getByRole('button', { name: 'Consumo estimado', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Consumo estimado', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByLabel('Vuelta del día').selectOption('8');
  await page.getByLabel('Explora el recorrido · trazo', { exact: false }).fill('1000');
  await expect(page.locator('.map-readout').getByText('42.71 kWh')).toBeVisible();
  await page.getByText('Zona de Hospitales: referencias y límites', { exact: true }).click();
  await page
    .locator('.hospital-references')
    .getByRole('button', { name: 'INCan', exact: true })
    .click();
  await expect(page.locator('.hospital-callout')).toContainText('San Fernando 22');
  await page.getByRole('button', { name: 'Cerrar referencia hospitalaria' }).click();
  await page.getByLabel('Explorar vueltas diarias').selectOption('4');
  await page.getByRole('button', { name: 'Aplicar estas vueltas' }).click();
  await ready(page);
  await expect(page.getByLabel('Ciclos diarios por unidad')).toHaveValue('4');
  await expect(page.getByLabel('Ascensos diarios por unidad')).toHaveValue('320');
  await expect(page.getByLabel('Tarifa de prueba')).toHaveValue('10');
  await page.getByLabel('Consumo neto en batería').fill('0.5');
  await ready(page);
  await page.getByRole('button', { name: 'Cambiar ruta' }).click();
  await page.getByLabel('Buscar ruta o destino').fill('Villa Coapa');
  await page.locator('.route-option').first().click();
  await ready(page);
  await expect(page.getByLabel('Contexto hospitalario', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});
