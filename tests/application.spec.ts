import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { defaultScenario } from '../src/data/defaults';
import { evaluateScenario } from '../src/domain/evaluate';
import {
  cashSummary,
  financialAnalysis,
  revenueStressScenario,
} from '../src/domain/financialAnalysis';
import { serializeScenario } from '../src/features/files';
import type { Scenario } from '../src/domain/schema';
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
async function open(page: import('@playwright/test').Page, path: string) {
  await page.evaluate((value) => {
    location.hash = value;
  }, path);
  await expect(page.locator('.workspace-view:not([hidden])')).toBeVisible();
}
async function map(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    location.hash = '/mapa';
  });
  await expect(page.locator('.workspace-panel')).toBeHidden();
}
async function options(page: import('@playwright/test').Page) {
  if (!(await page.locator('.journey-options').evaluate((el) => (el as HTMLDetailsElement).open)))
    await page.getByText('Opciones del recorrido', { exact: true }).click();
}
async function notes(page: import('@playwright/test').Page) {
  if (!(await page.locator('.map-notes').evaluate((el) => (el as HTMLDetailsElement).open)))
    await page.getByText('Acerca del mapa', { exact: true }).click();
}
test('evalúa, edita, conserva resultado inválido y encuentra condiciones', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await ready(page);
  await open(page, '/operacion/condiciones');
  await expect(page.getByRole('heading', { name: 'Hay condiciones por resolver' })).toBeVisible();
  await page
    .locator('[data-condition=initial]')
    .getByRole('button', { name: 'Revisar parámetro' })
    .first()
    .click();
  await expect(page.getByLabel('Capital inicial propio disponible')).toBeFocused();
  await page.getByLabel('Longitud del ciclo de prueba').fill('25');
  await ready(page);
  await expect(page.locator('.derived-note b')).toContainText('210 km diarios por unidad');
  await page.getByLabel('Longitud del ciclo de prueba').fill('');
  await expect(
    page.getByText(
      'Corrige las entradas. Se conserva el último resultado válido, ahora desactualizado.',
    ),
  ).toBeVisible();
  await open(page, '/economia/costos');
  await expect(page.getByRole('heading', { name: 'Comparación económica' })).toBeVisible();
  await open(page, '/economia/alternativas');
  await expect(page.getByRole('button', { name: 'Evaluar combinaciones' })).toBeDisabled();
  await open(page, '/configurar');
  await page.getByLabel('Longitud del ciclo de prueba').fill('20.340012617');
  await open(page, '/economia/alternativas');
  await ready(page);
  await page.getByRole('button', { name: 'Evaluar combinaciones' }).click();
  await expect(page.getByText(/180 combinaciones evaluadas/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Explorar esta combinación' }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Explorar esta combinación' }).first().click();
  await ready(page);
  await open(page, '/operacion/condiciones');
  await expect(page.getByRole('heading', { name: 'Los cálculos son favorables' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('exporta, importa, guarda copias y recalcula', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await open(page, '/archivos');
  await page.getByLabel('Nombre del escenario').fill('Piloto hospitalario');
  await page.getByRole('button', { name: 'Guardar escenario', exact: true }).click();
  await expect(page.getByText('Escenario guardado en este navegador.')).toBeVisible();
  await ready(page);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar escenario JSON' }).click();
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
  await open(page, '/configurar');
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
test('presupuesto agrupa etapas y permite consultar un mes con saldo de deuda', async ({
  page,
}) => {
  await page.goto('/');
  await ready(page);
  await open(page, '/economia/caja');
  const financePanel = page.locator('.finance-chart-panel');
  await expect(
    financePanel.getByRole('heading', { name: 'Distribución mensual del recaudo' }),
  ).toBeVisible();
  await expect(financePanel.locator('.budget-single-phase')).toContainText('Meses 1–60');
  await expect(financePanel.getByRole('button', { name: /Meses 1–60/ })).toHaveCount(0);
  await financePanel
    .getByText('Consultar deuda, intereses, comisiones y reservas', { exact: true })
    .click();
  await expect(financePanel.getByRole('heading', { name: 'Evolución de la deuda' })).toBeVisible();
  await financePanel.getByText('Consultar un mes específico').click();
  const monthSlider = financePanel.getByLabel('Mes del presupuesto');
  await expect(monthSlider).toHaveAttribute('type', 'range');
  await monthSlider.focus();
  await monthSlider.press('End');
  await expect(financePanel.locator('.exact-month summary')).toContainText('Mes 60 de 60');
  await expect(financePanel.locator('.debt-evolution-heading')).toContainText(
    'Mes seleccionado · 60 de 60',
  );
  await expect(financePanel.locator('.debt-balances')).toContainText('Eléctrico');
  await expect(financePanel.locator('.finance-event')).toHaveCount(2);
  await expect(financePanel.locator('.finance-event').first()).toContainText('liquidado al cierre');
});
test('accesibilidad del flujo, diálogo y móvil sin desbordamiento', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const base = await new AxeBuilder({ page }).analyze();
  expect(base.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await page.getByRole('link', { name: 'Fuentes', exact: true }).click();
  await page.getByRole('button', { name: 'Ampliar panel' }).click();
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
    page.getByRole('group', { name: 'Trazos históricos del ramal, sin mapa base' }),
  ).toBeVisible();
  await options(page);
  await page.getByRole('button', { name: 'Fin del día', exact: true }).click();
  await page.getByText('Opciones del recorrido', { exact: true }).click();
  await expect(page.locator('.map-point-card')).toContainText('42.71 kWh');
  await notes(page);
  await page.getByText('Zona de Hospitales: referencias y límites', { exact: true }).click();
  await page
    .locator('.hospital-references')
    .getByRole('button', { name: 'INCan', exact: true })
    .click();
  await page.getByText('Acerca del mapa', { exact: true }).click();
  await expect(page.locator('.hospital-callout')).toContainText('San Fernando 22');
  await expect(page.getByRole('button', { name: 'Centrar hospital', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Cerrar referencia hospitalaria' }).click();
  await page.context().setOffline(true);
  await open(page, '/configurar');
  await page.getByRole('button', { name: 'Minibús · diésel', exact: true }).click();
  await ready(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-report')).toBeVisible();
  await expect(page.locator('.simulation-app')).not.toBeVisible();
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
  await open(page, '/configurar');
  await page.getByRole('button', { name: 'Cambiar ruta' }).click();
  await page.getByLabel('Buscar ruta o destino').fill('Villa Coapa');
  await page.locator('.route-option').first().click();
  await map(page);
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
  await page.getByRole('button', { name: 'Batería en el recorrido', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Batería en el recorrido', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await options(page);
  await page.getByLabel('Vuelta del día').selectOption('8');
  await page.getByText('Opciones del recorrido', { exact: true }).click();
  await options(page);
  await page.getByRole('button', { name: 'Fin del día', exact: true }).click();
  await page.getByText('Opciones del recorrido', { exact: true }).click();
  await expect(
    page.locator('.map-point-card').getByText('42.71 kWh', { exact: true }),
  ).toBeVisible();
  await notes(page);
  await page.getByText('Zona de Hospitales: referencias y límites', { exact: true }).click();
  await page
    .locator('.hospital-references')
    .getByRole('button', { name: 'INCan', exact: true })
    .click();
  await page.getByText('Acerca del mapa', { exact: true }).click();
  await expect(page.locator('.hospital-callout')).toContainText('San Fernando 22');
  await page.getByRole('button', { name: 'Cerrar referencia hospitalaria' }).click();
  await open(page, '/operacion/pruebas');
  await expect(page.getByLabel('Valor explorado · Vueltas diarias')).toBeVisible();
  await open(page, '/configurar');
  await open(page, '/operacion/pruebas');
  const explorer = page.getByLabel('Valor explorado · Vueltas diarias');
  await explorer.focus();
  await explorer.press('Home');
  await explorer.press('ArrowRight');
  await explorer.press('ArrowRight');
  await explorer.press('ArrowRight');
  await expect(page.getByLabel('Ciclos diarios por unidad')).toHaveValue('8');
  await page.getByRole('button', { name: 'Aplicar al escenario' }).click();
  await ready(page);
  await expect(page.getByLabel('Ciclos diarios por unidad')).toHaveValue('4');
  await expect(page.getByLabel('Ascensos diarios por unidad')).toHaveValue('320');
  await expect(page.getByLabel('Tarifa de prueba')).toHaveValue('10');
  await page.getByLabel('Consumo neto en batería').fill('0.5');
  await ready(page);
  await open(page, '/configurar');
  await page.getByRole('button', { name: 'Cambiar ruta' }).click();
  await page.getByLabel('Buscar ruta o destino').fill('Villa Coapa');
  await page.locator('.route-option').first().click();
  await ready(page);
  await expect(page.getByLabel('Contexto hospitalario', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('mapa contextual navega al límite y conserva accesibilidad y parámetros', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-route-rendered', 'true');
  await expect(page.locator('.vehicle-symbol .lucide-van')).toBeVisible();
  await page.locator('.vehicle-symbol').click();
  await expect(page.locator('.map-vehicle-details')).toContainText('16 plazas');
  await options(page);
  await page.getByRole('button', { name: 'Fin del día', exact: true }).click();
  await page.getByText('Opciones del recorrido', { exact: true }).click();
  await expect(page.getByLabel('Vuelta del día')).toHaveValue('8');
  await expect(page.locator('#map-distance')).toHaveValue('8000');
  await expect(page.locator('.map-point-card')).toContainText('42.71 kWh');
  await options(page);
  await page.getByRole('button', { name: 'Inicio del día', exact: true }).click();
  await page.getByText('Opciones del recorrido', { exact: true }).click();
  await expect(page.getByLabel('Vuelta del día')).toHaveValue('1');
  await expect(page.locator('#map-distance')).toHaveValue('0');
  const canvas = page.locator('.map-canvas');
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box!.width - 80, y: 210 } });
  await expect(page.locator('#map-distance')).toHaveValue('0');
  await open(page, '/configurar');
  await page.getByLabel('Consumo neto en batería').fill('1');
  await map(page);
  await ready(page);
  await expect(page.locator('.map-day-card')).toContainText('Faltan');
  await page.getByRole('button', { name: 'Ver límite de batería', exact: true }).click();
  await expect(page.locator('.map-point-card')).toContainText('15%');
  await expect(page.getByRole('meter', { name: 'Batería restante estimada' })).toHaveAttribute(
    'aria-valuenow',
    /15/,
  );
  await expect(
    page.getByRole('button', { name: 'Límite de batería antes de la reserva' }),
  ).toBeVisible();
  await expect(page.getByLabel('Consumo neto en batería')).toHaveValue('1');
  await expect(page.getByLabel('Ascensos diarios por unidad')).toHaveValue('320');
  await expect(page.getByLabel('Ciclos diarios por unidad')).toHaveValue('8');
  await page.getByRole('button', { name: 'Encuadrar ruta', exact: true }).click();
  await notes(page);
  await page.getByText('Zona de Hospitales: referencias y límites', { exact: true }).click();
  await page
    .locator('.hospital-references')
    .getByRole('button', { name: 'INCan', exact: true })
    .click();
  await page.getByText('Acerca del mapa', { exact: true }).click();
  await expect(page.locator('.hospital-callout')).toContainText(
    'Instituto Nacional de Cancerología',
  );
  await page.getByRole('button', { name: 'Centrar hospital', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Hospital: INCan', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar referencia hospitalaria' }).click();
  await page.getByLabel('Contexto hospitalario', { exact: true }).uncheck();
  await expect(page.locator('.hospital-symbol')).toHaveCount(0);
  await open(page, '/configurar');
  await page.getByRole('button', { name: 'Minibús · diésel', exact: true }).click();
  await ready(page);
  await map(page);
  await expect(page.locator('.vehicle-symbol .lucide-bus-front')).toBeVisible();
  await open(page, '/configurar');
  await page.getByLabel('Longitud del ciclo de prueba').fill('');
  await map(page);
  await expect(page.locator('.map-point-card')).toContainText('Resultado anterior');
  await options(page);
  await expect(page.getByRole('button', { name: 'Fin del día', exact: true })).toBeDisabled();
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
});

test('exploración aplica sólo al confirmar y reinicia selección al editar, incluido precio cero', async ({
  page,
}) => {
  await page.goto('/');
  await ready(page);
  await open(page, '/configurar');
  await open(page, '/operacion/pruebas');
  const variable = page.locator('#pruebas-operacion').getByLabel('Variable a explorar');
  await variable.selectOption('consumption');
  const consumption = page.getByLabel('Valor explorado · Consumo eléctrico');
  await expect(consumption).toBeVisible();
  await consumption.focus();
  await consumption.press('End');
  await expect(consumption).toHaveAttribute('aria-valuetext', '0.375 kWh/km en batería');
  await expect(page.getByLabel('Consumo neto en batería')).toHaveValue('0.25');
  await page.getByRole('button', { name: 'Aplicar al escenario' }).click();
  await ready(page);
  await expect(page.getByLabel('Consumo neto en batería')).toHaveValue('0.375');
  await page.getByLabel('Consumo neto en batería').fill('0.4');
  await page.getByLabel('Consumo neto en batería').fill('0.6');
  await ready(page);
  await open(page, '/operacion/pruebas');
  await expect(consumption).toHaveAttribute('aria-valuetext', '0.6 kWh/km en batería');
  await consumption.focus();
  await consumption.press('End');
  await open(page, '/configurar');
  await page.getByLabel('Consumo neto en batería').fill('');
  await open(page, '/operacion/pruebas');
  await expect(page.getByRole('button', { name: 'Aplicar al escenario' })).toBeDisabled();
  await open(page, '/configurar');
  await page.getByLabel('Consumo neto en batería').fill('0.25');
  await ready(page);
  await page.locator('#advanced-energy summary').click();
  await page.getByLabel('Electricidad variable').fill('0');
  await ready(page);
  await open(page, '/economia/pruebas');
  const panel = page.locator('#pruebas-economia');
  const price = page.getByLabel('Valor explorado · Precio de electricidad');
  await expect(price).toHaveAttribute('aria-valuetext', '0 MXN/kWh comprado');
  await expect(panel).toContainText('cargos de potencia y fijos permanecen constantes');
  await price.focus();
  await price.press('End');
  await expect(price).toHaveAttribute('aria-valuetext', '8 MXN/kWh comprado');
  await expect(page.getByLabel('Electricidad variable')).toHaveValue('0');
  await page.getByRole('button', { name: 'Aplicar al escenario' }).click();
  await ready(page);
  await expect(page.getByLabel('Electricidad variable')).toHaveValue('8');
  await expect(page.getByLabel('Ciclos diarios por unidad')).toHaveValue('8');
});

test('ambiente cambia ámbito/período y el informe conserva estados y detalle completo', async ({
  page,
}) => {
  await page.goto('/');
  await ready(page);
  await open(page, '/operacion/condiciones');
  await open(page, '/ambiente');
  const environment = page.locator('#ambiente');
  await expect(page.getByLabel('Ámbito ambiental')).toHaveValue('fleet');
  await expect(page.getByLabel('Período ambiental')).toHaveValue('year');
  await expect(environment).toContainText('Año = doce meses equivalentes');
  const amount = () => environment.locator('.environment-results strong').allTextContents();
  const parse = (text: string) => Number(text.replace(/[^0-9.-]/g, ''));
  const year = (await amount()).map(parse);
  await page.getByLabel('Ámbito ambiental').selectOption('unit');
  await page.getByLabel('Período ambiental').selectOption('day');
  const day = (await amount()).map(parse);
  for (let i = 0; i < 3; i++) expect(year[i]!).toBeCloseTo(day[i]! * 3 * 26 * 12, -2);
  await expect(environment).toContainText('eléctrico: 0 kg CO₂ por escape');
  await expect(environment).not.toContainText('%');
  await expect(page.getByRole('heading', { name: '¿Qué necesita comprobarse?' })).toHaveCount(0);
  await expect(page.locator('[data-condition=connector]')).toContainText('Por confirmar');
  await page.emulateMedia({ media: 'print' });
  const report = page.locator('.print-report');
  await expect(report).toContainText('Conector — Por confirmar');
  await expect(report.locator('.comparison-table tbody tr')).toHaveCount(15);
  await expect(report.locator('table').last().locator('tbody tr')).toHaveCount(60);
  await expect(report).toContainText('Contexto científico ambiental');
});

test('paneles en escritorio y móvil conservan lectura, desplazamiento y herramientas', async ({
  page,
}) => {
  await page.goto('/');
  await ready(page);
  for (const width of [1920, 1440, 1280, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await map(page);
    const canvas = await page.locator('.map-shell').boundingBox();
    expect(canvas!.width).toBe(width);
    expect(canvas!.height).toBe(1000);
    for (const [path, selector] of [
      ['/economia/caja', '.finance-chart-panel'],
      ['/operacion/condiciones', '.diagnostic-panel'],
      ['/operacion/pruebas', '#pruebas-operacion'],
      ['/ambiente', '#ambiente'],
      ['/configurar', '.controls-panel'],
    ]) {
      await open(page, path!);
      await expect(page.locator(selector!)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const bounds = (await page.locator('.workspace-panel').boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      const scroll = page.locator('.workspace-view:not([hidden])');
      await scroll.evaluate((el) => el.scrollTo(0, el.scrollHeight));
      expect(await scroll.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      await scroll.evaluate((el) => el.scrollTo(0, 0));
    }
    await page.screenshot({ path: `test-results/dashboard-${width}.png` });
  }
});

test('sin alternativas muestra ausencia y motivos sin marcar éxito', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await open(page, '/configurar');
  await page.locator('#advanced-service summary').click();
  await page.getByLabel('Tarifa de prueba').fill('0');
  await ready(page);
  await open(page, '/economia/alternativas');
  await page.getByRole('button', { name: 'Evaluar combinaciones' }).click();
  await expect(page.locator('.search-summary.empty')).toContainText('ninguna cumple');
  await expect(page.locator('.alternative')).toHaveCount(0);
  await page.getByText('Por qué se descartaron combinaciones').click();
  await expect(page.locator('.search-results')).toContainText('Déficit mensual persistente');
});

const pesos = (v: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
async function importFinancialScenario(page: import('@playwright/test').Page, s: Scenario) {
  await open(page, '/archivos');
  await page.locator('input[type=file]').setInputFiles({
    name: 'finanzas.json',
    mimeType: 'application/json',
    buffer: Buffer.from(await serializeScenario(s)),
  });
  await ready(page);
  await open(page, '/economia/caja');
  await expect(page.getByLabel('Caída del recaudo supuesto')).toBeEnabled();
}

test('panel financiero abre el mes más exigente, reconcilia cifras y aísla la prueba temporal', async ({
  page,
}) => {
  await page.goto('/');
  await ready(page);
  const s = defaultScenario();
  s.finance = s.catalog.finances.find((f) => f.kind === 'credit' && f.months === 36)!;
  s.economy.batteryReplacementMonth = 24;
  s.economy.batteryReplacementCost = 500000;
  await importFinancialScenario(page, s);
  const r = evaluateScenario(s),
    summary = cashSummary(r.ev.months),
    analysis = financialAnalysis(r)[summary.month - 1]!;
  const panel = page.locator('.finance-chart-panel');
  await expect(panel.locator('.finance-conclusion')).toContainText(
    `${pesos(summary.minimum)} mínimo de caja · mes ${summary.month}`,
  );
  await expect(panel.locator('.finance-conclusion')).toContainText(
    `${summary.deficitMonths} de 60 meses con déficit`,
  );
  await expect(panel.locator('.exact-month summary')).toContainText(`Mes ${summary.month} de 60`);
  await expect(panel.locator('.capacity-row').last()).toContainText(pesos(analysis.ev.available));
  await expect(panel.locator('.cash-bridge')).toContainText(pesos(analysis.bridge.end));
  await expect(
    panel.getByRole('button', { name: /Mes 24: Reposición programada/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  const reportBefore = await page.locator('.print-report').textContent();
  const storageBefore = await page.evaluate(() => JSON.stringify(localStorage));
  const downloadText = async (label: string) => {
    await open(page, '/archivos');
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: label, exact: true }).click();
    const bytes = await readFile((await (await pending).path())!, 'utf8');
    await open(page, '/economia/caja');
    return bytes;
  };
  const jsonBefore = await downloadText('Descargar escenario JSON'),
    csvBefore = await downloadText('Descargar resultados CSV');
  const drop = page.getByLabel('Caída del recaudo supuesto');
  await expect(drop).toHaveValue('10');
  await drop.focus();
  await drop.press('End');
  await expect(drop).toHaveValue('30');
  const stress = evaluateScenario(revenueStressScenario(s, 30));
  const results = panel.locator('.stress-results');
  await expect(results.locator('article').last()).toContainText(
    pesos(stress.ev.months[23]!.freeCash),
  );
  await expect(results.locator('article').last()).toContainText(
    `${cashSummary(stress.ev.months).deficitMonths} / 60`,
  );
  const { generatedAt: previousGeneratedAt, ...previousJson } = JSON.parse(jsonBefore);
  const { generatedAt: currentGeneratedAt, ...currentJson } = JSON.parse(
    await downloadText('Descargar escenario JSON'),
  );
  expect(previousGeneratedAt).toBeTruthy();
  expect(currentGeneratedAt).toBeTruthy();
  expect(currentJson).toEqual(previousJson);
  expect(await downloadText('Descargar resultados CSV')).toBe(csvBefore);
  expect(await page.locator('.print-report').textContent()).toBe(reportBefore);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(storageBefore);
  await panel.getByText('Consultar un mes específico').click();
  const month = panel.getByLabel('Mes del presupuesto');
  await month.focus();
  await month.press('End');
  await expect(results.locator('article').last()).toContainText(
    pesos(stress.ev.months[59]!.freeCash),
  );
  await panel
    .getByText('Consultar deuda, intereses, comisiones y reservas', { exact: true })
    .click();
  await expect(panel.locator('.finance-detail')).toContainText(
    'Su descenso no demuestra capacidad de pago',
  );
  await expect(panel.locator('.finance-detail-values')).toContainText(
    `Faltante descontado de caja: ${pesos(analysis.reserve.shortfall)}`,
  );
  const afterCredit = panel.getByRole('button', { name: /Después de la última cuota/ });
  await afterCredit.focus();
  await afterCredit.press('Enter');
  await expect(month).toHaveValue('37');
  await open(page, '/configurar');
  await page.getByLabel('Longitud del ciclo de prueba').fill('');
  await open(page, '/economia/caja');
  await expect(panel).toContainText('Resultado anterior');
  await expect(drop).toBeDisabled();
  await expect(month).toBeDisabled();
  await expect(panel.getByRole('button').first()).toBeDisabled();
  await open(page, '/configurar');
  await page.getByLabel('Longitud del ciclo de prueba').fill(String(s.route.cycleKm));
  await open(page, '/economia/caja');
  await ready(page);
  await expect(drop).toBeEnabled();
  await expect(drop).toHaveValue('10');
  await expect(month).toHaveValue('24');
  expect(
    (await new AxeBuilder({ page }).include('.finance-chart-panel').analyze()).violations,
  ).toEqual([]);
});

test('finanzas distingue renta sin deuda, contado insuficiente y deuda posterior al horizonte', async ({
  page,
}) => {
  await page.goto('/');
  await ready(page);
  const panel = page.locator('.finance-chart-panel');
  const s = defaultScenario();
  s.finance = s.catalog.finances.find((f) => f.kind === 'lease')!;
  await importFinancialScenario(page, s);
  await expect(panel).toContainText('Renta mensual activa');
  await panel
    .getByText('Consultar deuda, intereses, comisiones y reservas', { exact: true })
    .click();
  await expect(panel).toContainText('Sin saldo de deuda financiada');
  await expect(panel.locator('.capacity-row').last()).toContainText(
    pesos(s.finance.leasePerUnitMonth * s.operation.fleet),
  );
  s.finance = s.catalog.finances.find((f) => f.kind === 'cash')!;
  s.operation.fare = 0;
  s.economy.laborCost = 1;
  await importFinancialScenario(page, s);
  await expect(panel).toContainText('una cuota cero tampoco resolvería');
  await expect(panel.locator('.finance-conclusion')).toContainText(
    'presupuesto laboral es inferior',
  );
  await expect(panel.locator('.capacity-row').last()).not.toContainText('equivalente al');
  s.finance = s.catalog.finances.find((f) => f.kind === 'credit' && f.months === 84)!;
  s.operation.fare = 10;
  s.economy.laborCost = 18000;
  await importFinancialScenario(page, s);
  await expect(panel.locator('.finance-detail')).toContainText('Deuda pendiente al mes 60');
  await expect(panel.locator('.finance-detail')).toContainText('El compromiso continúa');
});

test('holgura positiva equivale al recaudo y tooltip completo cabe en móvil', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const s = defaultScenario();
  s.operation.fare = 20;
  await importFinancialScenario(page, s);
  const panel = page.locator('.finance-chart-panel');
  await expect(panel.locator('.capacity-row').last()).toContainText('Holgura');
  await expect(panel.locator('.capacity-row').last()).toContainText('equivalente al');
  await expect(panel.locator('.finance-conclusion')).toContainText('0 de 60 meses con déficit');
  await page.setViewportSize({ width: 390, height: 1000 });
  const chart = panel.locator(':scope > .chart');
  await chart.scrollIntoViewIfNeeded();
  const box = (await chart.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.45);
  const tooltip = page.locator('.finance-tooltip');
  await expect(tooltip).toBeVisible();
  for (const label of [
    'Operación',
    'Personal presupuestado',
    'Ingreso concesionario presupuestado',
    'Financiamiento',
    'Reserva y reposición',
    'Resultado de caja',
  ])
    await expect(tooltip).toContainText(label);
  const bounds = (await tooltip.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
