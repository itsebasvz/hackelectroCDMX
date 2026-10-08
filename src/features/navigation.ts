import { useEffect, useSyncExternalStore } from 'react';

export const workspaceRoutes = {
  '/mapa': { area: 'mapa', title: 'Mapa' },
  '/configurar': { area: 'configurar', title: 'Configurar' },
  '/economia/caja': { area: 'economia', title: 'Economía' },
  '/economia/costos': { area: 'economia', title: 'Economía' },
  '/economia/pruebas': { area: 'economia', title: 'Economía' },
  '/economia/alternativas': { area: 'economia', title: 'Economía' },
  '/ambiente': { area: 'ambiente', title: 'Ambiente' },
  '/operacion/energia': { area: 'operacion', title: 'Operación' },
  '/operacion/condiciones': { area: 'operacion', title: 'Operación' },
  '/operacion/pruebas': { area: 'operacion', title: 'Operación' },
  '/archivos': { area: 'archivos', title: 'Archivos' },
  '/fuentes': { area: 'fuentes', title: 'Fuentes' },
} as const;
export type WorkspacePath = keyof typeof workspaceRoutes;
const legacy: Record<string, WorkspacePath> = {
  ramal: '/mapa',
  contenido: '/mapa',
  parametros: '/configurar',
  resultados: '/economia/costos',
  sensibilidad: '/operacion/pruebas',
  condiciones: '/economia/alternativas',
  ambiente: '/ambiente',
};
export function parseWorkspaceHash(hash: string) {
  const raw = hash.replace(/^#/, '');
  const [pathname = '', query = ''] = raw.split('?');
  const path: WorkspacePath = Object.hasOwn(workspaceRoutes, pathname)
    ? (pathname as WorkspacePath)
    : ((Object.hasOwn(legacy, pathname) ? legacy[pathname] : undefined) ?? '/mapa');
  return { path, field: new URLSearchParams(query).get('campo'), ...workspaceRoutes[path] };
}
export function navigate(path: WorkspacePath, field?: string) {
  const target = `#${path}${field ? `?campo=${encodeURIComponent(field)}` : ''}`;
  if (location.hash !== target) location.hash = target;
}
const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
};
export function useWorkspaceRoute() {
  const hash = useSyncExternalStore(subscribe, () => location.hash);
  const route = parseWorkspaceHash(hash);
  useEffect(() => {
    const canonical = `#${route.path}${route.path === '/configurar' && route.field ? `?campo=${encodeURIComponent(route.field)}` : ''}`;
    if (location.hash !== canonical) {
      history.replaceState(null, '', canonical);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  }, [hash, route.path, route.field]);
  return route;
}
