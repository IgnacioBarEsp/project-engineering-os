# Revisión manual de superficie y deriva

Fecha: 2026-09-24. Cambio: `fix-release-pack-eol-classification`, issue #155.

## Claridad y ownership

- `README.md` enlaza directamente a `docs/RELEASES.md`; el índice `docs/README.md` también enlaza la guía de releases. La guía describe la recuperación del fallo EOL y distingue la fuente de la etiqueta inmutable de las herramientas de release que provienen del SHA exacto de `main`. También documenta refs de tag plenamente calificados, validación del commit remoto, transporte de input como dato, environments protegidos por rama y rechazo preventivo de prereleases hasta que exista un canal npm explícito.
- El cambio modifica la implementación neutral del packer, su política de workflow y las pruebas del repositorio upstream. No agrega comportamiento específico de consumidor ni mueve ownership de producto, overlays o archivos no administrados; esto conserva [el mapa de ownership](../../../../docs/architecture/OWNERSHIP.md).
- El paquete público se comparó antes y después del overlay en el checkout exacto del tag: 193 rutas/tamaños/modos idénticos, `scripts/` excluido. No se cambió la API, dependencia, versión ni bytes históricos del tag.

## Decisiones de drift registradas

El comentario original de enriquecimiento del issue [#155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155#issuecomment-5806810525) conserva el alcance EOL y la identidad inmutable de `v1.0.0`; el comentario de endurecimiento [#155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155#issuecomment-5807695827) agrega el contrato de integridad de fuente sin publicar detalles de explotación. La reproducción de `pre-apply.md` confirma que el run original falló antes de crear artefactos; no hay publicación parcial que reconciliar.

## Degradaciones declaradas

No se introduce una degradación funcional al paquete. El pipeline actual admite releases estables y rechaza prereleases antes de candidate/Release hasta que exista un canal npm explícito. Todos los jobs omiten sus operaciones si el workflow no corre desde `main`; los environments privilegiados solo permiten `main` y no admiten bypass administrativo. El tarball sigue construyéndose desde el tag y no incluye tooling del release. Si el helper no está disponible, la recuperación es corregir el workflow en `main` y reintentar con el mismo tag; nunca cambiar su identidad.

## Alcance de esta revisión

Es una revisión manual de claridad, ownership y decisiones del cambio por el autor asistente; no equivale a aprobación humana ni a revisión independiente del PR. La revisión técnica adversarial separada y sus resoluciones constan en [adversarial-review.md](adversarial-review.md); no equivale al CI ni al review requerido del PR.
