import { describe, expect, it } from 'vitest';
import { parseWorkspaceHash } from './navigation';

describe('destinos del espacio de simulación', () => {
  it('interpreta entradas directas y un campo de configuración', () => {
    expect(parseWorkspaceHash('#/economia/alternativas').area).toBe('economia');
    expect(parseWorkspaceHash('#/configurar?campo=finance.months')).toMatchObject({
      path: '/configurar',
      field: 'finance.months',
      area: 'configurar',
    });
  });
  it('traduce enlaces históricos y devuelve rutas desconocidas al mapa', () => {
    expect(parseWorkspaceHash('#resultados').path).toBe('/economia/costos');
    expect(parseWorkspaceHash('#condiciones').path).toBe('/economia/alternativas');
    expect(parseWorkspaceHash('#sensibilidad').path).toBe('/operacion/pruebas');
    expect(parseWorkspaceHash('#')).toMatchObject({ path: '/mapa' });
    expect(parseWorkspaceHash('#/desconocida').path).toBe('/mapa');
    expect(parseWorkspaceHash('#__proto__').path).toBe('/mapa');
  });
});
