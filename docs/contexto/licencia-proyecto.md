# Licencias de hackelectroCDMX

Revisión: **2026-10-06**. **Decisión confirmada por el usuario: MIT para código propio y CC BY 4.0 para documentación propia.** Se incorporaron [LICENSE](../../LICENSE) y el [aviso de documentación](../LICENSE.md), con exclusiones para materiales de terceros.

## Qué dicen los documentos del hackatón

Se leyó el texto completo del PDF «Problemática electro hackatón», **diez páginas**, directamente con `pdftotext -layout`. También se inspeccionaron visualmente las páginas 9–10, que contienen reglas y notas finales.

**No se encontró una licencia obligatoria, una cesión de propiedad intelectual, exclusividad, ni una obligación de publicar el repositorio.** Las páginas 7–8 describen formatos de solución y metodología; las páginas 9–10 establecen asistencia, selección del reto, permanencia y evaluación. No regulan el licenciamiento del proyecto. [Fuente completa](fuentes-locales.md#problematica-electro-hackaton), [PDF 7](fuentes-locales.md#problematica-electro-hackaton), [PDF 9](fuentes-locales.md#problematica-electro-hackaton).

Esta conclusión se limita a los documentos disponibles. No se consultó una inscripción privada ni se acreditó la existencia o el contenido de bases contractuales adicionales. La ausencia de una condición en este PDF no demuestra que ningún otro término exista.

La búsqueda textual en los otros tres PDF locales no encontró una licencia de derechos de autor explícita. Las menciones de «licencia» en PIM y Reglamento son principalmente licencias de conducir. Esa búsqueda no acredita permiso de redistribución: sus registros conservan UNKNOWN.

## Decisión y justificación

**MIT para el código propio y CC BY 4.0 para los análisis y documentos originales del equipo.** El usuario eligió este esquema para facilitar que otras rutas, equipos e instituciones adapten el trabajo, manteniendo reconocimiento de autoría. Ambos permiten reutilización comercial. Las alternativas de copyleft se conservan como contexto de la decisión; no son las licencias aplicadas.

La licencia MIT permite reutilizar, modificar y distribuir software, conservando el aviso de derechos y el texto de licencia; no obliga a publicar todas las modificaciones. [Texto oficial MIT, OSI](https://opensource.org/license/mit).

CC BY 4.0 permite compartir y adaptar material, incluso comercialmente, con atribución, enlace a la licencia e indicación de cambios. Creative Commons recomienda licencias específicas para software y admite CC para documentación. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [FAQ sobre software](https://creativecommons.org/faq/#can-i-apply-a-creative-commons-license-to-software).

## Alternativas para comparar

| Esquema para código propio | Característica principal | Cuándo elegirlo |
| --- | --- | --- |
| MIT | Permisivo y breve; exige conservar avisos | Priorizar facilidad de adopción y reutilización. |
| Apache 2.0 | Permisivo; incluye concesión y condiciones explícitas sobre patentes y avisos de cambios | Priorizar claridad de patentes y colaboración entre organizaciones. |
| GPLv3 | Copyleft; la distribución del trabajo cubierto exige cumplir sus condiciones de código fuente y licencia | Exigir apertura del software derivado al distribuirlo. |

Fuentes primarias: [MIT](https://opensource.org/license/mit), [Apache 2.0, secciones 3–4](https://www.apache.org/licenses/LICENSE-2.0), [guía GPLv3 de GNU](https://www.gnu.org/licenses/quick-guide-gplv3.en.html). El texto GNU se recuperó mediante indexación; algunas aperturas directas fallaron.

Para documentación propia, la alternativa es **CC BY-SA 4.0**: añade la obligación de compartir las adaptaciones bajo la misma licencia o una compatible admitida. Esa condición no convierte automáticamente cualquier obra que sólo cite el documento en un derivado. [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Alcance: trabajo del equipo y materiales de terceros

| Material actual | Tratamiento propuesto |
| --- | --- |
| Script propio de extracción en `scripts/` y código futuro propio | Licencia de software elegida, previa identificación de autores y derechos. |
| Análisis originales en `docs/contexto/` e `investigacion/`, README y documentación propia | CC BY 4.0, excluyendo citas y otros materiales de terceros. |
| Registros de fuentes, referencias y tablas de parámetros | Identificar el aporte propio y conservar las condiciones de cada dato incorporado; no declarar que todas las fuentes adquieren una licencia común. |
| PDF en `docs/originales/` | Mantener originales locales e inventario; comprobar permiso de cada archivo antes de incorporarlo a una publicación. |
| Extracciones en `docs/fuentes/`, transcripciones visuales e imágenes en `docs/assets/` | Conservan derechos del material reproducido. Cambiar formato o transcribir no crea permiso para relicenciarlo. |
| Fuentes externas sólo citadas | Conservar URL, institución, fecha, localizador y estado de derechos; no considerar una ficha bibliográfica como original descargado. |

Los registros ya distinguen recursos abiertos, restringidos y UNKNOWN. Por ejemplo, H21 declara CC BY 3.0 IGO y H06 CC BY-NC-ND 3.0 IGO: **no son la misma licencia ni se sustituyen por la del proyecto**. [Registro de Latinoamérica](../investigacion/latinoamerica/fuentes-transicion-electrica-latinoamerica.json), [registro de Ruta 1](../investigacion/ruta1/fuentes-ruta1.json).

Para el primer envío se prepararon análisis propios, referencias, parámetros, matrices, inventario, licencias y la herramienta de extracción. `.gitignore` excluye los originales y reproducciones UNKNOWN, conservados localmente. Los enlaces de citas apuntan a la [nota de fuentes locales](fuentes-locales.md); los registros distinguen conservación local de inclusión en Git.

## Aplicación y publicación

1. Esquema confirmado: MIT y CC BY 4.0. Se usa «Colaboradores de hackelectroCDMX» para el aviso del trabajo propio; se conservan atribuciones individuales y derechos de terceros.
2. Se recuperó MIT del campo `body` de la [API oficial de licencias de GitHub](https://docs.github.com/en/rest/licenses/licenses#get-a-license), completando únicamente año y titular, y el [texto jurídico CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.txt) directamente de Creative Commons. Se guardaron `LICENSE` y `docs/CC-BY-4.0.txt`; el segundo conserva exactamente los bytes descargados. El aviso `docs/LICENSE.md` aclara aplicación y exclusiones, sin sustituir la licencia oficial. Los mensajes de commits en español no requieren traducir los textos jurídicos.
3. Las URL, método, transformaciones y hashes están en [procedencia-licencias.json](procedencia-licencias.json). Los cuatro PDF, extracciones completas, transcripciones e imágenes de terceros quedan excluidos del primer commit público; se mantienen localmente con sus hashes originales.
4. Comprobar Git local, conectividad y autenticación de `gh`; crear el remoto con el nombre exacto `hackelectroCDMX` y verificar su propietario/visibilidad.

Un repositorio público sin licencia explícita no concede por sí solo las libertades de un proyecto open source. [GitHub: licenciar un repositorio](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

## Estado de GitHub CLI en esta revisión

`gh` está instalado. `gh auth status` identifica como cuenta activa `itsebasvz`, pero informa un fallo de autenticación. La comprobación independiente `gh api user --jq .login` falla por conexión a `api.github.com`; por ello no se concluye que el token sea definitivamente inválido ni se confirma el propietario autenticado.

En la sesión inicial, `git status --short` confirmó que la carpeta todavía no era un repositorio funcional y `.git` estaba montada como solo lectura. Ninguno de estos fallos implicaba que el nombre remoto ya estuviera ocupado. El análisis de licencia y la convención de commits pudieron prepararse localmente.

Posteriormente, `gh repo create hackelectroCDMX --public --description …` terminó correctamente y devolvió [itsebasvz/hackelectroCDMX](https://github.com/itsebasvz/hackelectroCDMX). La conexión permitió crear el repositorio el 2026-10-06, aunque una consulta de verificación posterior volvió a fallar por conexión. No se atribuyó el problema de escritura en `.git` a las credenciales de GitHub.

El mismo día, tras habilitar el usuario acceso completo, `git init -b main` terminó correctamente. Se configuró `origin` con la URL del repositorio creado y `gh repo view` confirmó en esa etapa que el remoto era público y estaba vacío. Posteriormente, el usuario autorizó preparar el primer commit y enviarlo; el conjunto de publicación se delimitó como se describe arriba.

## Referencias y verificación

Fuentes web consultadas el **2026-10-06**: textos oficiales de MIT/OSI, Apache, Creative Commons, GNU y GitHub enlazados arriba. Se guardó análisis propio y referencias. Los cuatro PDF locales se mantuvieron intactos; no se regeneraron sus extracciones. MIT y CC BY 4.0 se aplicaron al trabajo propio tras la elección del usuario; ninguna licencia de una fuente de terceros fue sustituida por ellas.
