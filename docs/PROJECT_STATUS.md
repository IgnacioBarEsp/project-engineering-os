# Qué puedes descargar y qué sigue en desarrollo

Revisión: **24 de septiembre de 2026**. Este registro diferencia artefactos publicados de código integrado.
Un issue cerrado demuestra el cierre de ese cambio; no publica por sí solo un instalador.

| Entrega | Estado comprobado | Fuente |
| --- | --- | --- |
| Companion para Windows x64 | **0.3.6 publicado**, con assets canónicos comprobados y ciclo protegido de instalación, actualización, desinstalación y preservación de datos aprobado | [Release 0.3.6](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.3.6), [notas](../apps/companion/RELEASE_NOTES_0.3.6.md) |
| Opciones asistidas del instalador de #168 | Release 0.3.6 publicada; el change está archivado y #168 se cierra al integrar el PR protegido de cierre | [change archivado](../openspec/changes/archive/2026-09-24-companion-installer-choices/README.md) |
| Núcleo CLI y biblioteca | **0.5.0 publicado**; la app fija esa dependencia | [Release del núcleo](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/v0.5.0), [paquete de la app](../apps/companion/package.json) |
| Landing actual | Armonizada con estética Obsidian Studio y contraste AAA | [Página actual](https://ignaciobaresp.github.io/project-engineering-os/), [código fuente](../site/index.html) |
| Nueva landing | Dirección y base técnica integradas; página final y publicación pendientes | [Repositorio](https://github.com/IgnacioBarEsp/project-engineering-os-landing) |

## Qué corrige Companion 0.3.2

0.3.1, construido desde `a3b1efd`
([PR #140](https://github.com/IgnacioBarEsp/project-engineering-os/pull/140)), no permitía terminar el
asistente. Los tres primeros defectos están reproducidos y medidos en el
[issue #142](https://github.com/IgnacioBarEsp/project-engineering-os/issues/142); los dos últimos
aparecieron durante la corrección ([validación](../openspec/changes/archive/2026-09-19-companion-0-3-2-hotfix-actions-bar-clipboard/evidence/validation.md)):

- La barra de acciones del asistente queda anclada al contenido animado y no a la ventana. Tapa «¿Cuánta
  guía prefieres?», la última tarjeta de Delimitación, las sugerencias de Visión y los dos botones de
  Instalación, y desplazar la página no los descubre.
- «Copiar ruta» y «Copiar Prompt Maestro» no copian nada en la aplicación instalada, y no avisan del fallo.
- «Preparar proyecto» deja de estar marcado en Instalación y en la pantalla final.
- Una sugerencia o un salto de línea en Visión hacen fallar la instalación con `GOAL_INVALID`.
- El prompt de «Instalación rápida» le dice a la IA que las dependencias base ya están preparadas, y no se
  instala ninguna.

0.3.2 corrige los cinco ([notas](../apps/companion/RELEASE_NOTES_0.3.2.md)). Se construyó desde `c044d2d`
([PR #169](https://github.com/IgnacioBarEsp/project-engineering-os/pull/169)) con el workflow de release, que
lo instaló, lo actualizó desde 0.1.0 y lo desinstaló en un runner Windows aislado antes de publicarlo.

Las [capturas de esta documentación](companion/SCREENSHOTS.md) son de la ventana real de 0.3.2, con
procedencia comprobada en `npm run check`; el [prototipo de diseño](stitch%20uxui/) está rotulado como tal.

Siguen en 0.3.2:

- Las dos formas de instalar hacen lo mismo, aunque «Instalación rápida» diga que instala dependencias:
  [issue #147](https://github.com/IgnacioBarEsp/project-engineering-os/issues/147).
- A 1040 px la navegación de la cabecera parte palabras, y la aplicación instalada no aplica cuatro
  separaciones del asistente porque su política de seguridad bloquea estilos en línea:
  [issue #144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144).
- Tras activar con el teclado una acción, como copiar, el foco a veces se pierde:
  [issue #149](https://github.com/IgnacioBarEsp/project-engineering-os/issues/149).

## Límites que siguen vigentes

- Instalador sin firma de editor y solo Windows x64. Compatibilidad en otros equipos requiere evidencia.
- No hay actualización automática, cuenta propia ni servicio de inferencia operado por el proyecto.
- La redacción con modelos es opcional; el modo de plantillas funciona sin proveedor.
- Una herramienta configurada no equivale a una integración ejecutada y verificada.
- No hay ahorro general de tiempo o dinero demostrado. [Mediciones](companion/EVIDENCE.md).
- La comprensión con personas ajenas al proyecto sigue pendiente de [lectura en frío](companion/COLD_READING.md).

## Orden de cierre

1. [#116 — Entrada pública](https://github.com/IgnacioBarEsp/project-engineering-os/issues/116):
   README, guías, estado, capturas con procedencia y mapa del repositorio.
2. [#117 — Instalador actualizado](https://github.com/IgnacioBarEsp/project-engineering-os/issues/117):
   nueva versión, pruebas nativas, identidad del artefacto y descarga verificada.
3. Nueva landing: [#3 — página final](https://github.com/IgnacioBarEsp/project-engineering-os-landing/issues/3)
   y [#4 — lanzamiento](https://github.com/IgnacioBarEsp/project-engineering-os-landing/issues/4).
4. [#118 — Consolidación](https://github.com/IgnacioBarEsp/project-engineering-os/issues/118):
   retirar duplicados con reemplazo probado y añadir las capturas de la página terminada.

La limitación del doctor con perfiles técnicos activos queda en
[#115](https://github.com/IgnacioBarEsp/project-engineering-os/issues/115).
Su adaptador temporal en la landing conserva el fallo original; no se documenta como reparación del núcleo.

## En cada publicación

Quien publique debe reconciliar esta tabla, README, guía de instalación, changelog, capturas y enlaces de
la landing contra el tag, commit y hashes finales. No se mueven tags ni se reemplazan assets anteriores.
La [guía de releases](RELEASES.md) separa los dos ciclos.

Vuelve a [empezar con Companion](USER_GUIDE.md) o consulta el [mapa de piezas](REPOSITORY_MAP.md).
