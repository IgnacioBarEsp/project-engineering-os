## Context

`package.json#files` actualmente permite `docs/**/*.md` y PNGs, por lo que npm selecciona documentación de varias superficies del repositorio. npm también incluye automáticamente el README y el manifest; el primero hoy enlaza localmente a documentos del Companion que dejarán de viajar. `pack-release.mjs` ya registra los bytes comprimidos, mientras que `npm pack --json` ofrece `entryCount` y `unpackedSize` para la misma copia probada.

La allowlist de `config/export-allowlist.json` describe el checkout exportable del repositorio, no el paquete npm. Se mantiene sin cambios: el package allowlist es un límite de distribución distinto y más pequeño.

## Goals / Non-Goals

**Goals:** limitar el tarball a runtime/blueprint/esquemas y guías neutrales para el núcleo; fallar ante archivos empacados fuera de `files`; comprobar enlaces Markdown relativos desde la copia extraída; incluir conteo y bytes sin comprimir en la evidencia de releases nuevas.

**Non-Goals:** borrar documentación del repositorio, alterar Companion, cambiar `bin/`, `src/`, `schema/` o `blueprint/`, publicar otra versión, mover tags ni reescribir releases históricas.

## Decisions

1. **Rutas npm explícitas.** Mantener completos los árboles `bin/`, `blueprint/`, `schema/` y `src/`, pero declarar uno a uno los documentos Markdown de raíz que son parte del núcleo; solo `docs/adr/`, `docs/architecture/`, `docs/prompts/` y `docs/security/` son subárboles de documentación permitidos. `docs/README.md` queda explícitamente incluido como índice solo del núcleo porque el packlist de npm también lo selecciona; el índice deja de enlazar a superficies ausentes. No se distribuyen `docs/companion/`, `docs/stitch uxui/`, `docs/assets/`, `docs/USER_GUIDE.md`, `docs/PROJECT_STATUS.md` ni `docs/RELEASES.md`. El resto de los documentos del repositorio permanece en Git.
2. **Comprobar lo que npm empaca.** El check usa el cliente npm resuelto por la herramienta de release para generar un `.tgz` temporal. Valida cada ruta reportada contra `package.json#files` (sin admitir globs o rutas de traversal), extrae el archivo con el `tar` del sistema y compara el árbol extraído con el inventario de npm. La extracción temporal y su limpieza quedan limitadas a un subdirectorio nuevo de `tmpdir()`.
3. **Enlaces dentro del artefacto.** La comprobación recorre todos los Markdown empaquetados, incluido README y documentos sembrados. Para enlaces Markdown inline y de referencia, elimina query/fragment, decodifica rutas URI y exige que el destino exista dentro de la extracción; destinos absolutos/esquemas externos no se resuelven localmente. Los enlaces del repo a guías upstream no distribuidas se convierten en URLs HTTPS explícitas.
4. **Evidencia y compatibilidad histórica.** El packer copia `entryCount` a `fileCount` y `unpackedSize` a `unpackedBytes`, además del `bytes` comprimido existente. Los verificadores de candidatos nuevos exigen los campos. El verificador publicado acepta que ambos falten solo para conservar releases históricas, pero rechaza métricas parciales, inválidas o fuera de límites.
5. **Lista de docs verificable.** `docs/REPOSITORY_MAP.md`, `docs/RELEASES.md` y el changelog explican el contenido excluido y dónde sigue disponible. La decisión no requiere dependencias nuevas ni toca `config/export-allowlist.json`.

Alternativas consideradas: conservar `docs/**/*.md` con exclusiones puntuales no protege contra futuras carpetas; una allowlist externa duplicaría otra lista mutable además de `package.json#files`; comprobar solo fuentes del checkout no demostraría que el tarball extraído tenga los enlaces esperados.

## Risks / Trade-offs

- [Un consumidor puede depender de una guía retirada del paquete] → La guía sigue versionada y accesible en el repositorio; el README/changelog indicarán esa ubicación pública y no se reemplazan artefactos ya publicados.
- [El parser Markdown puede no comprender extensiones futuras] → Cubrir enlaces inline y referencias comunes con pruebas; fallar ante URI malformada en vez de omitirla y mantener los documentos distribuidos en Markdown estándar.
- [`tar` puede faltar o fallar en una plataforma] → CI ejecuta la comprobación en Windows, Ubuntu y macOS; ausencia/fracaso de extracción es FAIL, nunca se omite la verificación.
- [Pack temporal añade tiempo al `check`] → El tarball actual es pequeño; usar un único artefacto temporal por invocación, sin guardar salida en el checkout.
- [Manifiestos históricos no tienen inventario] → Mantener el verificador de publicación tolerante solo a ausencia conjunta de los dos campos; toda nueva release se construye desde el packer que los exige.

## Migration Plan

1. Reducir `package.json#files`; convertir `docs/README.md` en un índice neutral del paquete y actualizar los enlaces de documentos que permanecen.
2. Añadir el guard de tarball, link-check y métricas al manifest; cubrir casos positivos, exclusiones, enlaces rotos y compatibilidad legacy.
3. Correr OpenSpec, suite completa, revisión adversarial, deuda y el flujo de archive oficial.
4. Integrar solo por PR protegido. No publicar ni modificar `v1.0.0`; una futura release seguirá SemVer y su manifest incluirá `fileCount` y `unpackedBytes`.

Rollback: revertir el PR. No se cambia ninguna ruta de archivos del repositorio ni release/tag/asset ya publicados.

## Open Questions

Ninguna. El alcance de selección de contenido ya está aprobado en el issue #156.
