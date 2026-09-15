# Qué puedes descargar y qué sigue en desarrollo

Revisión: **14 de septiembre de 2026**. Este registro diferencia artefactos publicados de código integrado.
Un issue cerrado demuestra el cierre de ese cambio; no publica por sí solo un instalador.

| Entrega | Estado comprobado | Fuente |
| --- | --- | --- |
| Companion para Windows x64 | **0.1.0 publicada**, desde commit `4b863af12df351b402dc4fda3683de1f3a445da2` | [Release y sus tres archivos](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.1.0) |
| Núcleo CLI y biblioteca | **0.5.0 publicado**; la app fija esa dependencia | [Release del núcleo](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/v0.5.0), [paquete de la app](../apps/companion/package.json) |
| Mejoras del Companion posteriores a 0.1.0 | Integradas en `0c632a38e45d41f741b54e68777102a03d0bf3d0`; **pendientes de instalador** | [PR #114](https://github.com/IgnacioBarEsp/project-engineering-os/pull/114), [próxima release #117](https://github.com/IgnacioBarEsp/project-engineering-os/issues/117) |
| Landing actual | Sigue publicada desde este repositorio | [Página actual](https://ignaciobaresp.github.io/project-engineering-os/), [workflow](../.github/workflows/landing.yml) |
| Nueva landing | Dirección y base técnica integradas; página final y publicación pendientes | [Repositorio](https://github.com/IgnacioBarEsp/project-engineering-os-landing), [artefacto sin despliegue verificado](https://github.com/IgnacioBarEsp/project-engineering-os-landing/actions/runs/34916126178) |

## Qué cambió después del instalador

Los cambios #97–#100 y #105–#107 incorporaron o revisaron navegación, estado de proyectos,
instrucciones por perfil, apertura de aplicaciones de escritorio, herramientas opcionales, exclusiones,
mediciones y selección explícita de modelos. Sus PR están integrados; #117 reunirá esos cambios en una
versión nueva. El paquete de la app aún declara 0.1.0: ese número en el source no convierte los cambios
nuevos en los bytes de la release anterior.

Las [capturas actuales](companion/SCREENSHOTS.md) muestran ese código integrado en una prueba de navegador.
No representan instalación, actualización ni desinstalación del próximo artefacto.

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
