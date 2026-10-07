# Gobierno de la Ciudad de México — Style Reference
> Plataforma pública, clara y amable: identidad institucional en guinda y dorado, grandes puntos de entrada orientados a tareas, superficies blancas y rosadas muy suaves, tarjetas redondeadas y subproductos digitales —como Llave CDMX— con acentos morado/magenta controlados.

**Theme:** light

Este documento consolida dos capas que conviven en el ecosistema digital de la Ciudad de México: la **identidad institucional oficial 2024–2030** y los **patrones observados en cdmx.gob.mx y portales derivados de trámites/servicios**. Los valores del manual institucional se consideran fuente normativa; los valores propios de interfaz web marcados como **normalizados** son reconstrucciones prácticas a partir del portal vigente y sus derivados, no tokens oficiales publicados por el Gobierno.

La experiencia de CDMX no debe sentirse como un dashboard SaaS genérico. La página principal se comporta como un **portal de resolución de necesidades ciudadanas**: primero orienta con una pregunta grande —“¿Qué quieres hacer hoy?”—, después ofrece búsqueda, accesos frecuentes y rutas directas hacia trámites, programas y Llave CDMX. La composición usa mucho blanco, bandas rosa/lila casi neutras, agrupaciones redondeadas y fotografía funcional. La identidad guinda/dorado permanece como ancla institucional; el morado/magenta pertenece principalmente a productos digitales y campañas específicas, no sustituye al sistema maestro.

## Source-of-truth hierarchy

1. **Manual de Identidad Gráfica Institucional 2024–2030:** logotipo, colores institucionales, tipografías institucionales, patrones, narrativa visual, fotografía e iconografía.
2. **cdmx.gob.mx:** arquitectura de información, jerarquía de tareas, hero, búsqueda, accesos de servicio, estado de la ciudad y composición de la portada.
3. **Llave CDMX y portales transaccionales:** acentos morado/magenta, flujos de acción, llamadas a iniciar, pasos, requisitos y formularios.
4. **Sitios de dependencias:** navegación utilitaria, contenidos editoriales, filtros, transparencia, listados y páginas institucionales más densas.

Cuando exista conflicto, **no modificar nunca el logotipo ni los colores institucionales para imitar un subproducto digital**. El subproducto puede tener su propio acento, pero debe convivir con la marca del Gobierno de la Ciudad de México.

## Tokens — Colors

### Institutional Core — oficiales

| Name | Value | Token | Role |
|------|-------|-------|------|
| CDMX Guinda | `#9D2148` | `--color-cdmx-guinda` | Color institucional principal; encabezados de marca, CTA institucionales, enlaces de alto énfasis y acentos de identidad |
| CDMX Dorado | `#B28E5C` | `--color-cdmx-dorado` | Color institucional complementario; detalles, filetes, iconografía decorativa y elementos de marca |
| CDMX Gris | `#55585A` | `--color-cdmx-gris` | Texto principal institucional y UI de alta legibilidad |
| CDMX Marfil | `#FFFAE9` | `--color-cdmx-marfil` | Fondo cálido secundario y superficie editorial; también puede acompañar aplicaciones institucionales sobre guinda |

### Secondary Institutional Palette — oficiales

| Name | Value | Token | Role |
|------|-------|-------|------|
| Amarillo | `#FDC60A` | `--color-cdmx-yellow` | Acento gráfico; no usar como texto normal sobre blanco |
| Naranja | `#F08217` | `--color-cdmx-orange` | Acento gráfico y visualizaciones |
| Ámbar | `#AC6D14` | `--color-cdmx-amber` | Acento gráfico oscuro |
| Rosa Claro | `#F5AEB8` | `--color-cdmx-pink` | Fondos suaves, ilustración y sistema visual |
| Fucsia | `#D72F89` | `--color-cdmx-fuchsia` | Acento gráfico; usar con moderación en UI |
| Rojo Magenta | `#E5074C` | `--color-cdmx-red` | Acento fuerte; puede funcionar como estado crítico si el contexto semántico lo permite |
| Azul Claro | `#73CAE6` | `--color-cdmx-sky` | Acento gráfico e información secundaria |
| Azul | `#266CB4` | `--color-cdmx-blue` | Enlaces/estados informativos cuando no se use guinda como acción principal |
| Morado | `#8F4889` | `--color-cdmx-purple` | Acento gráfico y puente con productos digitales de la familia CDMX |
| Verde | `#027A35` | `--color-cdmx-green` | Estados positivos, indicadores y acento gráfico |

### Digital Portal Palette — normalizada desde cdmx.gob.mx y derivados

| Name | Value | Token | Role |
|------|-------|-------|------|
| Portal White | `#FFFFFF` | `--color-portal-white` | Canvas principal, header, tarjetas y formularios |
| Portal Tint | `#FBF7F9` | `--color-portal-tint` | Banda principal de búsqueda, agrupaciones suaves y fondos alternos |
| Portal Blush | `#F8E8ED` | `--color-portal-blush` | Secciones promocionales/identitarias como Llave CDMX |
| Portal Hairline | `#E7E2E5` | `--color-portal-hairline` | Bordes, divisores y contornos de baja intensidad |
| Portal Muted | `#7B797D` | `--color-portal-muted` | Texto secundario, metadatos y placeholders |
| Portal Lavender | `#8B7893` | `--color-portal-lavender` | Texto de apoyo y acentos suaves en superficies lila/rosa |
| Search Pink | `#E7A8B7` | `--color-search-pink` | Iconos o detalles decorativos del buscador; no usar como texto principal |
| Llave Purple | `#7A3E88` | `--color-llave-purple` | Acción y marca de producto Llave CDMX |
| Llave Magenta | `#B9449D` | `--color-llave-magenta` | Final de gradiente/acción de Llave; valor normalizado con contraste más seguro |

### Semantic UI Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Success | `#027A35` | `--color-success` | Confirmaciones, estado correcto, disponibilidad |
| Info | `#266CB4` | `--color-info` | Mensajes informativos y enlaces alternos |
| Warning | `#AC6D14` | `--color-warning` | Advertencias no destructivas |
| Danger | `#E5074C` | `--color-danger` | Error, cancelación o acción destructiva |
| Focus | `#7A3E88` | `--color-focus` | Anillo de foco visible en productos digitales; usar guinda en superficies institucionales puras |

### Color rules

- **Guinda + dorado + gris** forman el núcleo institucional; no reemplazarlos por morado en piezas o páginas que representen al Gobierno como institución.
- **Dorado `#B28E5C` no debe usarse como texto normal sobre blanco**: su contraste es insuficiente para cuerpo pequeño. Úsalo en detalles, íconos, filetes o tipografía grande/decorativa acompañada por una alternativa accesible.
- CDMX Gris `#55585A` y CDMX Guinda `#9D2148` tienen contraste alto sobre blanco y son apropiados para texto/acciones.
- El morado/magenta de Llave es un **subbrand accent**. No debe recolorear el escudo, el símbolo institucional ni sustituir el guinda en navegación institucional.
- Los colores secundarios del símbolo no deben convertirse en una interfaz multicolor permanente. Úsalos por función semántica, datos, campañas o ilustración.

## Tokens — Typography

El ecosistema combina dos familias de uso digital observadas en el portal actual —**Montserrat** e **Inter**— con la tipografía institucional definida en el manual —**Roboto**—. **Cabin Bold** pertenece al tratamiento del logotipo/institución y no debe reconstruirse manualmente si existe el activo oficial.

### Montserrat — Hero, navegación y títulos de descubrimiento

- **Substitute:** Arial, Helvetica, ui-sans-serif, system-ui
- **Weights:** 500, 600, 700
- **Sizes:** 13px, 14px, 16px, 20px, 24px, 32px, 40px, 56px
- **Line height:** 1.05–1.45
- **Letter spacing:** `-0.02em` en hero; `-0.01em` en headings; normal en controles
- **Role:** Preguntas de entrada, encabezados de secciones, títulos de tarjetas, navegación y CTAs del portal de servicios.

### Inter — UI transaccional y lectura funcional

- **Substitute:** Arial, Helvetica, ui-sans-serif, system-ui
- **Weights:** 400, 500, 600, 700
- **Sizes:** 12px, 13px, 14px, 16px, 18px, 20px
- **Line height:** 1.35–1.65
- **Role:** Formularios, requisitos, descripciones, etiquetas, datos, mensajes de estado y microcopy.

### Roboto — Capa institucional y compatibilidad con dependencias

- **Substitute:** Arial, Helvetica, ui-sans-serif, system-ui
- **Weights:** 400, 500, 700
- **Sizes:** 14px, 16px, 18px, 24px, 32px, 40px
- **Line height:** 1.4–1.6
- **Role:** Comunicación institucional, páginas de dependencias, contenidos editoriales y piezas alineadas directamente al manual de identidad.

### Cabin Bold — Logotipo institucional únicamente

- **Weight:** 700
- **Role:** Nombre institucional dentro del sistema de marca oficial.
- **Rule:** No redibujar ni reescribir el logotipo usando texto HTML. Usar el SVG/PNG oficial y respetar su retícula, área de protección y versiones autorizadas.

### Type Scale

| Role | Family | Weight | Size | Line Height | Tracking | Token |
|------|--------|--------|------|-------------|----------|-------|
| utility | Inter | 500 | 12px | 1.35 | 0 | `--text-utility` |
| global-nav | Montserrat | 600 | 13px | 1.2 | 0 | `--text-global-nav` |
| label | Inter | 600 | 13px | 1.35 | 0.01em | `--text-label` |
| body-small | Inter | 400 | 14px | 1.5 | 0 | `--text-body-small` |
| body | Inter | 400 | 16px | 1.55 | 0 | `--text-body` |
| card-title | Montserrat | 700 | 16px | 1.3 | -0.005em | `--text-card-title` |
| button | Montserrat | 600 | 14px | 1.2 | 0 | `--text-button` |
| lead | Inter | 400 | 18px | 1.55 | 0 | `--text-lead` |
| subsection | Montserrat | 700 | 24px | 1.2 | -0.01em | `--text-subsection` |
| section | Montserrat | 700 | 32px | 1.15 | -0.015em | `--text-section` |
| page-title | Montserrat | 700 | 40px | 1.12 | -0.02em | `--text-page-title` |
| hero | Montserrat | 700 | 56px | 1.05 | -0.025em | `--text-hero` |

**Responsive hero:** usar `clamp(36px, 5vw, 56px)` para mantener el tono monumental sin desbordar móvil.

## Tokens — Spacing & Shapes

**Base unit:** 4px  
**Density:** comfortable  
**Minimum interactive target:** 44×44px; preferir 48px en formularios y acciones primarias.

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 4 | 4px | `--spacing-4` |
| 8 | 8px | `--spacing-8` |
| 12 | 12px | `--spacing-12` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 64 | 64px | `--spacing-64` |
| 80 | 80px | `--spacing-80` |
| 96 | 96px | `--spacing-96` |
| 120 | 120px | `--spacing-120` |

### Border Radius

| Element | Value |
|---------|-------|
| image thumbnails | 8px |
| compact chips | 8px |
| cards | 16px |
| grouped panels | 20px |
| promotional bands | 20px |
| inputs | 12px or 9999px for search |
| buttons | 9999px for portal CTAs; 10–12px allowed in dense institutional forms |
| icon buttons | 9999px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| hairline | `0 1px 0 rgba(46, 43, 47, 0.08)` | `--shadow-hairline` |
| chip | `0 2px 10px rgba(46, 43, 47, 0.08)` | `--shadow-chip` |
| floating | `0 4px 16px rgba(46, 43, 47, 0.10)` | `--shadow-floating` |

Use sombras sólo para **micro-elevación funcional**: chips de estado, buscador, acciones flotantes o overlays. Las grandes tarjetas de contenido deben separarse principalmente por fondo, borde tenue y espacio.

### Layout

- **Max content width:** 1200px
- **Reading width:** 720–760px
- **Desktop gutters:** 32px
- **Tablet gutters:** 24px
- **Mobile gutters:** 16px
- **Section gap:** 80px desktop / 56px tablet / 40px mobile
- **Card padding:** 20–24px
- **Element gap:** 16px
- **Grid:** 12 columnas en desktop; degradar a 6 y 4 según viewport

## Core Layout Modes

### 1. Citizen Service Portal

La portada y hubs de servicios deben ser **task-first**. Orden recomendado:

1. Header institucional.
2. Estado breve de “La Ciudad hoy”.
3. Marca/identificador del portal.
4. Pregunta principal de intención: “¿Qué quieres hacer hoy?”.
5. Buscador dominante.
6. Accesos frecuentes en cuadrícula.
7. Exploración de trámites/programas.
8. Banner de Llave CDMX o identidad digital.
9. Contenido de apoyo, atención ciudadana y footer.

### 2. Transactional Service Flow

Para un trámite específico:

1. Breadcrumb o contexto del servicio.
2. Título humano, no nombre burocrático críptico.
3. Pregunta/acción principal.
4. CTA claro: “Iniciar”, “Continuar”, “Agendar”, etc.
5. Requisitos.
6. Pasos o proceso.
7. Costos, tiempos y vigencia.
8. Ayuda / Atención Ciudadana.
9. Estado del trámite y confirmación.

### 3. Institutional / Agency Content Site

Para secretarías, órganos y dependencias:

1. Utility header del Gobierno.
2. Identidad de la dependencia.
3. Navegación compacta.
4. Breadcrumb.
5. H1 de contenido.
6. Cuerpo editorial, listados, filtros o documentos.
7. Transparencia/contacto/atención ciudadana.
8. Footer institucional.

Aquí la densidad puede ser mayor y los radios más discretos. No convertir cada párrafo en tarjeta.

### 4. Subbrand / Product Mode — Llave CDMX

Llave puede usar **morado, magenta, blush y gradiente** como identidad de producto, manteniendo el header y marcas institucionales intactas. Las pantallas de autenticación y expediente digital deben sentirse más cercanas a producto digital que a portal editorial: formularios claros, pasos, confirmaciones y CTA persistente.

## Components

### Institutional Global Header
**Role:** navegación persistente y anclaje de confianza.

- Fondo `#FFFFFF`.
- Logotipo institucional oficial alineado a la izquierda.
- Links principales en CDMX Gris o tono oscuro equivalente.
- Borde inferior `1px solid #E7E2E5` o `--shadow-hairline`.
- Alto recomendado: 64–72px desktop; 56–64px mobile.
- CTA de acceso a Llave puede presentarse a la derecha como botón compacto o control de cuenta.
- En mobile, mantener logo visible y reducir navegación a menú; no ocultar identidad detrás de una splash screen.

### City Today Status Rail
**Role:** contexto urbano rápido antes del hero.

Fila de pequeños módulos para clima, calidad del aire, Hoy No Circula, Wi‑Fi u otros indicadores. Debe sentirse informativa, no como un dashboard analítico.

- Chips de 40–48px de alto.
- Superficie blanca.
- Radio 8–12px.
- `--shadow-chip` o borde tenue.
- Iconografía pequeña y color sólo como señal.
- En móvil: scroll horizontal con `scroll-snap` o rejilla 2×N; nunca comprimir texto ilegiblemente.

### Hero Intent Question
**Role:** orientar la experiencia alrededor de la necesidad ciudadana.

Usar Montserrat 56px/700 desktop, `clamp(36px,5vw,56px)`, CDMX Gris. Centrado en hubs generales; alineado a la izquierda en páginas transaccionales. Mantener 16–24px de separación respecto a logo/kicker y 24–32px respecto al buscador.

### Hero Service Search
**Role:** acceso universal a trámites y servicios.

- Fondo `#FFFFFF`.
- Altura 48–52px.
- Radio completo `9999px`.
- Borde `1px solid #E7E2E5`.
- Sombra ligera `--shadow-chip`.
- Placeholder Inter 14–16px en Portal Muted.
- Icono de búsqueda circular a la derecha; puede usar rosa suave/morado como acento.
- Estado focus: `2px` visible en guinda o Llave Purple según contexto, con offset de 2px.
- Debe admitir teclado, lector de pantalla y submit explícito.

### Featured Services Group
**Role:** accesos frecuentes desde la portada.

En desktop, presentar 6–8 servicios como cuadrícula de 4 columnas dentro de una gran superficie blanca redondeada. El grupo puede convivir con una columna lateral de exploración.

- Contenedor: `#FFFFFF`, radio 16–20px, sin sombra pesada.
- Grid interno: 4 columnas desktop, 2 tablet, 1 mobile.
- Gap: 16–20px.
- No usar borde alrededor de cada tarjeta si el agrupador ya provee estructura.

### Service Media Tile
**Role:** acceso visual a una acción concreta.

- Imagen de servicio aproximadamente 16:9, radio 8px.
- Título Montserrat 16px/700, CDMX Gris.
- Descripción Inter 14px/1.5, Portal Muted.
- Área completa clicable.
- Hover desktop: leve elevación o cambio de borde; no escalar agresivamente la imagen.
- Focus: anillo claro y visible.
- Preferir verbos o nombres ciudadanos: “Licencia para conducir”, “Pagos a la Tesorería”, “Citas de verificación”.

### Explore All Panel
**Role:** mover de accesos frecuentes a catálogo completo.

Panel lateral o bloque secundario con fondo blanco dentro de la banda teñida. Puede contener dos o más accesos grandes a categorías —por ejemplo programas, trámites o servicios— con fotografía tintada y flecha circular.

- Heading en Portal Lavender o CDMX Gris.
- Media cards con overlay rosa/lila controlado.
- Texto blanco sólo cuando el overlay garantice contraste.
- Botón de flecha circular de 40–44px.
- En tablet/mobile: bajar debajo de la cuadrícula y ocupar ancho completo.

### Llave CDMX Access Banner
**Role:** promover acceso a identidad digital sin desplazar la tarea principal.

- Fondo `--color-portal-blush`.
- Radio 20px.
- Logo Llave oficial, nunca recreado con texto.
- Copy corto, máximo 2–3 líneas en desktop.
- CTA específico de Llave con gradiente permitido:
  `linear-gradient(90deg, #87489A 0%, #B9449D 100%)`.
- Texto blanco 14px/600.
- Radio de botón 9999px.
- Imagen de dispositivo o captura puede sobresalir del borde derecho si no compromete legibilidad.
- En mobile: apilar logo, texto, CTA e imagen; no superponer texto sobre el dispositivo.

### Transaction Action Hero
**Role:** iniciar un trámite concreto.

Usar título, descripción breve y una acción principal inequívoca. El patrón “¿Qué quieres hacer?” puede repetirse como encabezado de decisión cuando existan varias rutas.

- H1 Montserrat 40px/700.
- Body Inter 16–18px.
- CTA primary: guinda en flujo institucional; morado en Llave/subproducto.
- CTA secundaria: blanco con borde gris/guinda.
- Una sola acción visualmente dominante por viewport.

### Requirements Block
**Role:** explicar qué necesita la persona antes de iniciar.

- Fondo blanco o Marfil muy sutil.
- H2 24–32px.
- Lista con check/icono discreto.
- Evitar acordeones si hay menos de 5 requisitos.
- Si un requisito tiene excepciones, usar callout informativo separado.

### Process Stepper
**Role:** explicar pasos o progreso.

- Números dentro de círculos guinda o morado según el producto.
- Conector lineal tenue.
- Título de paso 16px/700.
- Descripción 14–16px.
- En mobile, stepper vertical.
- No depender sólo del color para indicar el paso activo/completado.

### Primary Button — Institutional
**Role:** acción principal gubernamental.

- Fill `#9D2148`.
- Text `#FFFFFF`, Montserrat 14px/600.
- Min-height 44px, preferir 48px.
- Padding horizontal 20–24px.
- Radius 9999px en portal moderno; 10–12px permitido en herramientas administrativas densas.
- Hover: oscurecer aproximadamente 6–8% sin introducir un nuevo color de marca.
- Focus: outline visible independiente del hover.

### Secondary Button
**Role:** acción alternativa.

- Fondo blanco.
- Texto `#55585A` o `#9D2148`.
- Borde 1px `#BFC0C1` o guinda cuando la relación sea claramente institucional.
- Misma altura y tipografía que primary.

### Llave Product Button
**Role:** autenticación, expediente o acción propia de Llave.

- Fill `#7A3E88` o gradiente Llave autorizado para ese producto.
- Texto blanco.
- No usar este tratamiento para acciones gubernamentales genéricas fuera del ecosistema Llave.

### Form Field
**Role:** captura de datos ciudadana.

- Label persistente arriba, Inter 13px/600.
- Input 48px de alto, 12px radius.
- Borde `#CFCACE` 1px.
- Texto `#55585A` 16px.
- Placeholder `#7B797D`.
- Error: borde Danger + mensaje textual debajo; nunca sólo borde rojo.
- Success: icono/estado verde sólo después de validación útil.
- Help text: 13–14px, máximo 70ch.

### Select / Date / Filter Controls
**Role:** exploración de listados institucionales.

Mantener controles compactos pero no menores de 44px de alto. En páginas de transparencia, noticias o documentos, los filtros pueden formar una toolbar horizontal y pasar a stack vertical en móvil.

### Breadcrumb
**Role:** ubicación dentro de dependencia o trámite.

- Inter/Roboto 13–14px.
- CDMX Gris y Muted.
- Separador simple `/` o chevron.
- Último elemento no clicable.
- Evitar breadcrumbs en la portada.

### Status Badge
**Role:** estado de trámite o dato.

- Radius 9999px.
- Texto 12–13px/600.
- No usar los 10 colores de la marca indiscriminadamente.
- Success → verde; Info → azul; Warning → ámbar; Error → rojo magenta; Neutral → gris.
- Siempre incluir texto semántico, no sólo color.

### Citizen Help / 311 Floating Action
**Role:** atención inmediata sin interrumpir el flujo.

Puede aparecer como botón flotante tipo “Habla con una operadora” o acceso a LOCATEL/311.

- Position fixed en esquina inferior derecha.
- No cubrir CTAs, navegación móvil ni mensajes de error.
- Min-height 44px.
- Sombra `--shadow-floating`.
- Etiqueta textual visible en desktop; icono + etiqueta accesible en móvil.

### Footer
**Role:** cierre institucional, contacto y confianza.

Debe contener como mínimo marca institucional, atención ciudadana, enlaces legales, accesibilidad/privacidad y enlaces de gobierno relevantes. Puede ser blanco con división tenue o usar una franja institucional más fuerte cuando el sitio lo requiera. No introducir un color de footer ajeno a la paleta oficial sólo por convención de diseño.

## Navigation Patterns

### Portal navigation

Pocas opciones superiores, orientadas a destinos amplios: Atención Ciudadana, Gobierno, Guía de Visitantes y acceso de cuenta/Llave. Las tareas concretas pertenecen al buscador y a los accesos del contenido, no al header.

### Agency navigation

Puede incluir dependencia, secciones, transparencia, atención ciudadana, trámites y buscador. Mantener una jerarquía clara entre el **Gobierno de la Ciudad** y la **dependencia específica**.

### Mobile navigation

- Logo siempre visible.
- Menú de navegación en sheet/drawer o panel desplegable.
- Search debe seguir siendo accesible en máximo 1 interacción.
- Evitar megamenús desktop comprimidos dentro de un viewport móvil.

## Content Patterns

### Task-first language

Priorizar verbos y necesidades ciudadanas sobre nombres administrativos internos. Ejemplos adecuados:

- “Pagar un trámite”.
- “Agendar una cita”.
- “Consultar mi expediente”.
- “Renovar mi licencia”.
- “Conocer los requisitos”.

### Service description

Una tarjeta de servicio debe responder rápidamente:

1. Qué puedo hacer.
2. Para quién es.
3. Qué necesito o qué resultado obtengo.

La descripción en portada no debe convertirse en manual de procedimiento; el detalle vive dentro del trámite.

### Empty / error states

- Explicar qué ocurrió con lenguaje directo.
- Proponer el siguiente paso.
- Mantener un CTA concreto.
- Incluir canal de ayuda cuando la persona pueda quedar bloqueada.
- Evitar códigos técnicos como mensaje principal.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Portal White | `#FFFFFF` | Canvas general, header, formulario y cards |
| 1 | Portal Tint | `#FBF7F9` | Banda de búsqueda y agrupación de servicios |
| 2 | Portal Blush | `#F8E8ED` | Promoción de identidad digital / Llave |
| 3 | CDMX Marfil | `#FFFAE9` | Superficie editorial institucional cálida |
| 4 | Hairline | `#E7E2E5` | Bordes y divisiones, no superficie principal |

## Elevation

La separación visual debe provenir primero de **espacio + cambio de superficie + radio**, y sólo después de sombra. Los chips de “La Ciudad hoy”, buscadores y acciones flotantes pueden elevarse; las grandes superficies de contenido normalmente no necesitan `box-shadow` perceptible.

Nunca aplicar efectos, sombras, contornos o degradados al logotipo institucional.

## Imagery

La fotografía debe comunicar **ciudad, servicio y personas reales**. Priorizar escenas cálidas, diversas y relacionadas directamente con la acción pública: movilidad, trámites, espacio público, salud, educación, cultura y vida urbana.

- Thumbnails de servicio: 16:9 o 3:2, crop centrado, radio 8px.
- Banners: permitir composición horizontal con sujeto desplazado hacia un lado para dejar área de copy.
- Overlays: guinda, rosa o morado sólo cuando mejoren contraste y pertenezcan al contexto de marca/subproducto.
- No usar fotografías genéricas de oficina para representar trámites que pueden mostrarse con contexto urbano o ciudadano real.
- En productos digitales, capturas/dispositivos pueden funcionar como evidencia de uso.

## Patterns & Graphic Language

El manual institucional incluye patrones construidos a partir de los elementos del símbolo. Deben tratarse como **activos oficiales**, no como geometría que un frontend deba improvisar.

- Usar archivos de patrón aprobados.
- Mantener colores y proporciones originales.
- No reconstruir el patrón con CSS aleatorio.
- Reservar patrones para campañas, hero editoriales o fondos de baja densidad; no colocarlos detrás de formularios complejos.

## Iconography

- Preferir íconos simples, de lectura inmediata y grosor consistente.
- Usar 20–24px para controles estándar y 16px para utilidades compactas.
- El color del ícono debe seguir su función, no “decorar” cada elemento con un color secundario distinto.
- Los íconos críticos deben acompañarse de etiqueta textual.
- Para símbolos institucionales, usar el set oficial cuando exista.

## Responsive Behavior

### ≥ 1200px

- Container máximo 1200px.
- Hero centrado con headline hasta 56px.
- Servicios frecuentes en 4 columnas.
- Panel “Explora todos…” en columna lateral.
- Status rail en una sola fila cuando haya espacio.

### 768–1199px

- Grid de servicios en 2 columnas.
- Panel de exploración pasa debajo o a una segunda fila.
- Hero 44–48px.
- Banner Llave conserva dos columnas si el copy no se comprime.

### < 768px

- Gutters 16px.
- Hero 36–40px.
- Servicios en 1 columna o 2 sólo si cada tile conserva al menos ~160px útiles.
- Status rail con scroll horizontal.
- Banner Llave en stack vertical.
- Formularios siempre a una columna.
- Botones primarios full-width cuando eso reduzca ambigüedad.
- Elementos interactivos mínimo 44px.

## Accessibility

- Objetivo mínimo: **WCAG 2.2 AA**.
- Mantener ratio de contraste ≥ 4.5:1 para texto normal y ≥ 3:1 para texto grande/controles gráficos.
- CDMX Guinda `#9D2148` sobre blanco ≈ **7.65:1**.
- CDMX Gris `#55585A` sobre blanco ≈ **7.17:1**.
- Llave Purple `#7A3E88` sobre blanco ≈ **7.31:1**.
- CDMX Dorado `#B28E5C` sobre blanco ≈ **3.04:1**: no usar para texto normal.
- Todos los controles deben tener `:focus-visible` claro.
- No indicar estados sólo con color.
- Formularios: labels visibles, `aria-describedby` para ayuda/errores y resumen de errores cuando falle un submit largo.
- Navegación completa por teclado.
- Respetar `prefers-reduced-motion`.
- Fotografías informativas necesitan alt text; decorativas deben llevar `alt=""`.

## Motion

El sistema debe sentirse estable y cívico, no promocional.

- Duración estándar: 160–220ms.
- Easing: `cubic-bezier(.2,.8,.2,1)`.
- Hover: cambios de color, borde o elevación de 1–2px; evitar zooms llamativos.
- Accordions/drawers: 200–280ms.
- No usar parallax, rebotes o scroll-jacking en trámites.
- Desactivar/transicionar instantáneamente si `prefers-reduced-motion: reduce`.

## Do's and Don'ts

### Do

- Usa Guinda `#9D2148`, Dorado `#B28E5C`, Gris `#55585A` y Marfil `#FFFAE9` como núcleo institucional.
- Separa la **marca institucional** de los **acentos de producto** como Llave CDMX.
- Mantén la experiencia orientada a tareas: pregunta → búsqueda → acceso frecuente → trámite.
- Usa blanco y fondos rosa/lila extremadamente suaves para estructurar sin ruido visual.
- Usa tarjetas redondeadas de 16–20px en el portal moderno, pero sin convertir cada bloque de texto en una tarjeta.
- Mantén imágenes pequeñas y funcionales en tarjetas de servicio; usa fotografía más grande sólo cuando cuenta una historia o identifica un servicio.
- Conserva títulos ciudadanos y CTAs verbales: “Iniciar”, “Consultar”, “Agendar”, “Pagar”.
- Usa sombras mínimas sólo para búsqueda, chips y elementos flotantes.
- Mantén formularios accesibles, de una columna en móvil y con labels persistentes.
- Usa activos oficiales para logotipo, patrones e iconografía institucional.

### Don't

- No recolorees, redibujes, comprimas ni apliques sombra al logotipo del Gobierno.
- No uses morado de Llave como sustituto universal del guinda institucional.
- No uses Dorado como body text pequeño sobre blanco.
- No conviertas la paleta secundaria del símbolo en una UI arcoíris.
- No uses gradientes de forma general; resérvalos para subproductos/campañas donde ya formen parte de su lenguaje visual.
- No uses sombras grandes tipo “SaaS dashboard” en todas las tarjetas.
- No ocultes la tarea principal detrás de carruseles promocionales.
- No uses nombres administrativos internos como copy principal cuando exista una formulación ciudadana más clara.
- No reduzcas touch targets por debajo de 44px.
- No mezcles indiscriminadamente Montserrat, Inter y Roboto en una misma pantalla: elige una capa y conserva consistencia.
- No recrees los patrones institucionales con CSS aproximado; usa el arte oficial.

## Design Mode Matrix

| Context | Primary Accent | Typography | Surface Style | Radius | Density |
|---------|----------------|------------|---------------|--------|---------|
| cdmx.gob.mx / discovery | Guinda + lilac neutrals | Montserrat + Inter | White + soft blush bands | 16–20px | Comfortable |
| Trámite transaccional | Guinda | Inter + Montserrat | Mostly white | 12–16px | Comfortable |
| Llave CDMX | Purple/Magenta | Montserrat + Inter | White + blush/lilac | 16–20px / pills | Comfortable |
| Dependencia institucional | Guinda + gray + gold | Roboto or site-consistent sans | Flat white/marfil | 8–12px | Medium |
| Campaña | Official core + approved secondary accent | Roboto/Montserrat per asset | Flexible | Flexible | Variable |

## Agent Prompt Guide

### Quick Color Reference

- CDMX Guinda: `#9D2148` — primary institutional action and identity
- CDMX Dorado: `#B28E5C` — institutional detail; avoid for small body text on white
- CDMX Gris: `#55585A` — primary readable text
- CDMX Marfil: `#FFFAE9` — warm institutional background
- Portal White: `#FFFFFF` — primary canvas/cards
- Portal Tint: `#FBF7F9` — search/services background band
- Portal Blush: `#F8E8ED` — Llave/promo section
- Portal Hairline: `#E7E2E5` — borders/dividers
- Llave Purple: `#7A3E88` — Llave action
- Llave Magenta: `#B9449D` — Llave gradient/action accent
- Success: `#027A35`
- Info: `#266CB4`
- Warning: `#AC6D14`
- Danger: `#E5074C`

### Prompt recipes

Create a CDMX citizen-service homepage with a white institutional header, a compact “La Ciudad hoy” status rail, a centered Montserrat 56px/700 question “¿Qué quieres hacer hoy?”, and a rounded white search field over a very pale `#FBF7F9` band. Below, place a large white 16px-radius group with service tiles in a 4-column desktop grid and a separate exploration panel for all trámites/programas.

Create a CDMX service card using a 16:9 image with 8px radius, Montserrat 16px/700 `#55585A` title, Inter 14px/1.5 muted description, no visible card border when nested inside a shared white group, and a clear `:focus-visible` ring.

Create a CDMX institutional primary button with `#9D2148` fill, white Montserrat 14px/600 text, 48px height, 20–24px horizontal padding and full pill radius. Keep the button compact and use only one dominant primary action per section.

Create a Llave CDMX promotional banner on `#F8E8ED` with the official Llave asset, a short Inter 16px description, an optional device mockup aligned to the right, and a pill CTA using `linear-gradient(90deg, #87489A 0%, #B9449D 100%)`. Do not recolor the Government of CDMX logo.

Create a transactional page with a Montserrat 40px/700 title, one prominent primary action, a requirements section, a numbered vertical/mobile-friendly stepper, cost/time metadata, and an assistance block. Keep the page mostly white; use guinda only for action and orientation, not as a full-page background.

Create an institutional dependency page with a compact Government header, dependency name, breadcrumb, Roboto/Inter body text, restrained 8–12px radius controls, a filter toolbar and a 720–760px reading column. Preserve high information density without turning every content group into a card.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Institutional colors — official */
  --color-cdmx-guinda: #9D2148;
  --color-cdmx-dorado: #B28E5C;
  --color-cdmx-gris: #55585A;
  --color-cdmx-marfil: #FFFAE9;
  --color-cdmx-yellow: #FDC60A;
  --color-cdmx-orange: #F08217;
  --color-cdmx-amber: #AC6D14;
  --color-cdmx-pink: #F5AEB8;
  --color-cdmx-fuchsia: #D72F89;
  --color-cdmx-red: #E5074C;
  --color-cdmx-sky: #73CAE6;
  --color-cdmx-blue: #266CB4;
  --color-cdmx-purple: #8F4889;
  --color-cdmx-green: #027A35;

  /* Digital portal colors — normalized */
  --color-portal-white: #FFFFFF;
  --color-portal-tint: #FBF7F9;
  --color-portal-blush: #F8E8ED;
  --color-portal-hairline: #E7E2E5;
  --color-portal-muted: #7B797D;
  --color-portal-lavender: #8B7893;
  --color-search-pink: #E7A8B7;
  --color-llave-purple: #7A3E88;
  --color-llave-magenta: #B9449D;

  /* Semantic */
  --color-success: #027A35;
  --color-info: #266CB4;
  --color-warning: #AC6D14;
  --color-danger: #E5074C;
  --color-focus: #7A3E88;

  /* Typography */
  --font-display: 'Montserrat', 'Arial', 'Helvetica', ui-sans-serif, system-ui, sans-serif;
  --font-ui: 'Inter', 'Arial', 'Helvetica', ui-sans-serif, system-ui, sans-serif;
  --font-institutional: 'Roboto', 'Arial', 'Helvetica', ui-sans-serif, system-ui, sans-serif;

  --text-utility: 12px;
  --text-global-nav: 13px;
  --text-label: 13px;
  --text-body-small: 14px;
  --text-body: 16px;
  --text-card-title: 16px;
  --text-button: 14px;
  --text-lead: 18px;
  --text-subsection: 24px;
  --text-section: 32px;
  --text-page-title: 40px;
  --text-hero: clamp(36px, 5vw, 56px);

  --leading-body: 1.55;
  --leading-heading: 1.15;
  --tracking-heading: -0.015em;
  --tracking-hero: -0.025em;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-120: 120px;

  /* Layout */
  --container-max: 1200px;
  --reading-max: 760px;
  --gutter-desktop: 32px;
  --gutter-tablet: 24px;
  --gutter-mobile: 16px;
  --section-gap: 80px;
  --card-padding: 24px;
  --element-gap: 16px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-card: 16px;
  --radius-panel: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-hairline: 0 1px 0 rgba(46, 43, 47, 0.08);
  --shadow-chip: 0 2px 10px rgba(46, 43, 47, 0.08);
  --shadow-floating: 0 4px 16px rgba(46, 43, 47, 0.10);

  /* Product-specific */
  --gradient-llave: linear-gradient(90deg, #87489A 0%, #B9449D 100%);
}
```

### Tailwind v4

```css
@theme {
  /* Institutional */
  --color-cdmx-guinda: #9D2148;
  --color-cdmx-dorado: #B28E5C;
  --color-cdmx-gris: #55585A;
  --color-cdmx-marfil: #FFFAE9;
  --color-cdmx-yellow: #FDC60A;
  --color-cdmx-orange: #F08217;
  --color-cdmx-amber: #AC6D14;
  --color-cdmx-pink: #F5AEB8;
  --color-cdmx-fuchsia: #D72F89;
  --color-cdmx-red: #E5074C;
  --color-cdmx-sky: #73CAE6;
  --color-cdmx-blue: #266CB4;
  --color-cdmx-purple: #8F4889;
  --color-cdmx-green: #027A35;

  /* Portal */
  --color-portal-white: #FFFFFF;
  --color-portal-tint: #FBF7F9;
  --color-portal-blush: #F8E8ED;
  --color-portal-hairline: #E7E2E5;
  --color-portal-muted: #7B797D;
  --color-portal-lavender: #8B7893;
  --color-search-pink: #E7A8B7;
  --color-llave-purple: #7A3E88;
  --color-llave-magenta: #B9449D;

  /* Fonts */
  --font-display: 'Montserrat', 'Arial', 'Helvetica', ui-sans-serif, system-ui, sans-serif;
  --font-ui: 'Inter', 'Arial', 'Helvetica', ui-sans-serif, system-ui, sans-serif;
  --font-institutional: 'Roboto', 'Arial', 'Helvetica', ui-sans-serif, system-ui, sans-serif;

  /* Type */
  --text-utility: 12px;
  --text-global-nav: 13px;
  --text-label: 13px;
  --text-body-small: 14px;
  --text-body: 16px;
  --text-card-title: 16px;
  --text-button: 14px;
  --text-lead: 18px;
  --text-subsection: 24px;
  --text-section: 32px;
  --text-page-title: 40px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-120: 120px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-card: 16px;
  --radius-panel: 20px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-hairline: 0 1px 0 rgba(46, 43, 47, 0.08);
  --shadow-chip: 0 2px 10px rgba(46, 43, 47, 0.08);
  --shadow-floating: 0 4px 16px rgba(46, 43, 47, 0.10);
}
```

### Minimal component primitives

```css
.cdmx-container {
  width: min(100% - 2 * var(--gutter-desktop), var(--container-max));
  margin-inline: auto;
}

.cdmx-hero-title {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  line-height: 1.05;
  letter-spacing: var(--tracking-hero);
  font-weight: 700;
  color: var(--color-cdmx-gris);
}

.cdmx-search {
  min-height: 52px;
  border: 1px solid var(--color-portal-hairline);
  border-radius: var(--radius-full);
  background: var(--color-portal-white);
  box-shadow: var(--shadow-chip);
}

.cdmx-button-primary {
  min-height: 48px;
  padding-inline: 24px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-cdmx-guinda);
  color: #fff;
  font: 600 var(--text-button)/1.2 var(--font-display);
}

.cdmx-card {
  border-radius: var(--radius-card);
  background: var(--color-portal-white);
}

.cdmx-focusable:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .cdmx-container {
    width: calc(100% - 2 * var(--gutter-mobile));
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

## Implementation Checklist

- [ ] Logotipo oficial usado como asset, sin reconstrucción tipográfica.
- [ ] Guinda/dorado/gris/marfil definidos como tokens institucionales exactos.
- [ ] Acentos Llave aislados del sistema institucional global.
- [ ] Hero orientado a intención/tarea.
- [ ] Búsqueda accesible y prominente.
- [ ] Accesos frecuentes en grid responsive.
- [ ] Un CTA dominante por sección.
- [ ] Formularios con labels, errores textuales y targets ≥44px.
- [ ] Contraste AA verificado.
- [ ] Navegación completa por teclado.
- [ ] `prefers-reduced-motion` implementado.
- [ ] Fotos relacionadas con servicio/personas/ciudad, no stock genérico.
- [ ] Patrones e iconografía institucional usados desde assets oficiales.
- [ ] Mobile resuelto explícitamente, no sólo “desktop encogido”.

## Provenance & Measurement Notes

**Valores normativos:** los colores institucionales, Roboto como tipografía del sistema visual y Cabin Bold como parte del tratamiento de marca provienen del Manual de Identidad Gráfica Institucional del Gobierno de la Ciudad de México 2024–2030.

**Portal digital:** la estructura, jerarquía, uso de la pregunta “¿Qué quieres hacer hoy?”, status rail, buscador, accesos de servicios, banda de Llave y el uso conjunto de Montserrat/Inter se basan en la portada de cdmx.gob.mx y recursos cargados por el portal durante 2025–2026.

**Valores normalizados:** `Portal Tint`, `Portal Blush`, `Portal Hairline`, `Portal Lavender`, `Search Pink`, `Llave Purple`, `Llave Magenta`, radios, sombras y medidas web son aproximaciones diseñadas para reproducir fielmente el lenguaje visual observado cuando no existe un token CSS público/documentado. No deben presentarse como valores oficiales del manual.

### Primary references

- Gobierno de la Ciudad de México: https://www.cdmx.gob.mx/
- Manual de Identidad Gráfica Institucional 2024–2030, Jefatura de Gobierno: https://jefaturadegobierno.cdmx.gob.mx/storage/app/uploads/public/69e/a52/e82/69ea52e8270f9839787048.pdf
- Manual de Identidad Gráfica / Atención Ciudadana, ADIP: https://adip.cdmx.gob.mx/centros/atencion-ciudadana/manual-de-identidad-grafica
- Llave CDMX: https://llave.cdmx.gob.mx/

