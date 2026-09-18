# Qué puedes descargar y qué sigue en desarrollo

Revisión: **18 de septiembre de 2026**. Este registro diferencia artefactos publicados de código integrado.
Un issue cerrado demuestra el cierre de ese cambio; no publica por sí solo un instalador.

| Entrega | Estado comprobado | Fuente |
| --- | --- | --- |
| Companion para Windows x64 | **0.3.1 candidato verificado** (0.1.0, 0.2.3 y 0.3.0 previas publicadas) | [Release oficial](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.3.1) |
| Núcleo CLI y biblioteca | **0.5.0 publicado**; la app fija esa dependencia | [Release del núcleo](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/v0.5.0), [paquete de la app](../apps/companion/package.json) |
| Mejoras del Companion posteriores a 0.3.0 | Integradas en `main`; **pendientes de instalador** en GitHub Releases | [PR #140](https://github.com/IgnacioBarEsp/project-engineering-os/pull/140) |
| Landing actual | Armonizada con estética Obsidian Studio y contraste AAA | [Página actual](https://ignaciobaresp.github.io/project-engineering-os/), [código fuente](../site/index.html) |
| Nueva landing | Dirección y base técnica integradas; página final y publicación pendientes | [Repositorio](https://github.com/IgnacioBarEsp/project-engineering-os-landing) |

## Qué cambió en Companion 0.3.1

Se aplicó fielmente el diseño Obsidian Precision Studio / Stitch en la interfaz real de Companion:
tema oscuro profundo (#0B0F19), cabecera superior tipo Topbar con controles de ventana y pastillas de
navegación responsivas, doble tarjeta de acción en Inicio ("Crear nuevo proyecto" y "Abrir carpeta"),
tres pilares de valor ("Totalmente local", "Compatible con tu IA", "Estructura limpia"), nuevo icono
nativo de Windows en paleta Obsidian y supresión de destellos en el arranque.

Los cambios #126–#133 incorporaron el asistente de 4 pasos, los 7 perfiles canónicos con delimitación,
persistencia de `PROJECT_VISION.md` conservando archivos originales, el instalador contextual NSIS
(reparar/actualizar/desinstalar), el Master Activation Prompt estructurado, microcopia humana sin tecnicismos
y la suite de artesanía visual Impeccable con curvas cúbicas y loaders no bloqueantes.

Las [capturas actuales](companion/SCREENSHOTS.md) muestran el flujo completo de pantallas del asistente.

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
