import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Maximize2, Minimize2, X } from 'lucide-react';
import { navigate, type WorkspacePath, workspaceRoutes } from './navigation';

export function useCompactWorkspace() {
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 1023px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width: 1023px)');
    const change = () => setCompact(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return compact;
}
export default function WorkspacePanel({
  path,
  expanded,
  onExpand,
  modal,
  children,
}: {
  path: WorkspacePath;
  expanded: boolean;
  onExpand: () => void;
  modal: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const open = path !== '/mapa';
  const area = workspaceRoutes[path].area;
  useLayoutEffect(() => {
    if (!open) {
      if (trigger.current?.isConnected) trigger.current.focus();
      return;
    }
    if (
      document.activeElement instanceof HTMLElement &&
      !ref.current?.contains(document.activeElement)
    )
      trigger.current = document.activeElement;
    title.current?.focus({ preventScroll: true });
  }, [open, area]);
  useEffect(() => {
    if (!open) return;
    const keyboard = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        navigate('/mapa');
      }
      if (!modal || event.key !== 'Tab' || !ref.current) return;
      const elements = [
        ...ref.current.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex="0"]',
        ),
      ].filter(
        (el) =>
          !el.closest('[hidden], [inert]') &&
          !el.matches(':disabled') &&
          el.getClientRects().length,
      );
      const first = elements[0];
      const last = elements.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === title.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => document.removeEventListener('keydown', keyboard);
  }, [open, modal]);
  return (
    <section
      ref={ref}
      hidden={!open}
      className={`workspace-panel ${area === 'configurar' ? 'is-editor' : ''} ${expanded ? 'is-expanded' : ''}`}
      role={modal ? 'dialog' : 'region'}
      aria-modal={modal || undefined}
      aria-labelledby="workspace-panel-title"
    >
      <header className="workspace-panel-header">
        <div>
          <span className="small-label">TU ESCENARIO</span>
          <h2 ref={title} tabIndex={-1} id="workspace-panel-title">
            {workspaceRoutes[path].title}
          </h2>
        </div>
        <div className="workspace-panel-actions">
          <button
            className="icon-action panel-expand"
            onClick={onExpand}
            aria-label={expanded ? 'Restaurar panel' : 'Ampliar panel'}
            title={expanded ? 'Restaurar panel' : 'Ampliar panel'}
          >
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            className="icon-action"
            onClick={() => navigate('/mapa')}
            aria-label="Cerrar panel"
            title="Volver al mapa"
          >
            <X size={20} />
          </button>
        </div>
      </header>
      {children}
      <div className="panel-return">
        <a href="#/mapa">
          <ArrowLeft size={14} /> Volver al mapa
        </a>
      </div>
    </section>
  );
}
