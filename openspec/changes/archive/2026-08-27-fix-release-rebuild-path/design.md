## Context

La ejecución 33105347334 de `v0.2.0` completó el candidato y el GitHub Release, y se detuvo en el job npm
antes de publicar. `pack-release.mjs` restringe correctamente su salida al repositorio, crea el directorio
solicitado y después ejecuta el control de neutralidad. La ruta histórica `release/` está permitida por el
árbol público; la ruta `rebuilt/` no lo está y por eso el propio mecanismo de recuperación falla cerrado.

El tag protegido, el manifest, el checksum y el tarball del Release ya son la identidad canónica. La
corrección no puede mover el tag, regenerar esos assets, ampliar la allowlist ni usar un token persistente.
El workflow que se dispara desde `main` puede corregir la orquestación mientras cada job vuelve a checkout
del mismo tag para validar y reconstruir sus bytes.

## Goals / Non-Goals

**Goals:**

- Hacer que la reconstrucción verificadora pase los controles existentes del tag.
- Mantener inequívocamente separadas la copia reconstruida y la descarga canónica.
- Comparar los tres assets byte por byte y publicar solo el tarball canónico.
- Cubrir con pruebas negativas las rutas y el origen exacto de `npm publish`.
- Reejecutar de forma segura `v0.2.0` sin sustituir identidad alguna.

**Non-Goals:**

- Cambiar `pack-release.mjs` o la allowlist del tag ya publicado.
- Crear un nuevo tag o una versión sustituta para ocultar el fallo operativo.
- Eliminar aprobación, OIDC, provenance o verificación desde lockfile.
- Publicar manualmente o con un token persistente.

## Decisions

### `release/` será la copia reconstruida dentro del checkout

El job npm invocará `pack-release.mjs --output release`. Esa ruta ya pertenece al contrato del tag y pasa
neutralidad. Se descarta permitir `rebuilt/`: ampliaría el árbol público para acomodar una carpeta temporal
y no arreglaría `v0.2.0`, cuyo source ya es inmutable.

### `canonical-release/` contendrá la descarga de GitHub

Después de terminar el pack y sus gates se crea `canonical-release/` mediante `gh release download`. No se
vuelve a ejecutar neutralidad después de esa descarga. El comparador recibe primero `release/` y después
`canonical-release/`; exige los mismos tres nombres y bytes.

Se descarta descargar sobre `release/` porque mezclaría la copia verificadora con la identidad publicable y
haría imposible atribuir el tarball a una fuente única.

### La fuente publicable queda fijada en la política estática

`npm publish` apuntará explícitamente a `./canonical-release/*.tgz`. El checker de workflow fijará las
cuatro piezas como un solo contrato: pack en `release`, descarga en `canonical-release`, comparación entre
ambos y publicación desde `canonical-release`. Las pruebas sustituirán cada pieza para demostrar fallo.

### La recuperación reutiliza el mismo Release

El job GitHub ya es idempotente: si encuentra el Release, descarga sus assets y los compara con el nuevo
candidato. La reejecución usa `v0.2.0` sin moverlo; cualquier divergencia detiene el flujo antes de npm.

## Risks / Trade-offs

- [Los nombres parecen inversos al flujo histórico] -> documentación y checker nombran explícitamente
  `canonical-release` como única fuente publicable.
- [Un cambio futuro del pack vuelve a crear archivos antes de neutralidad] -> la prueba de workflow conserva
  la ruta permitida y `npm run check` ejecuta neutralidad.
- [El Release existente fue alterado] -> GitHub y npm comparan los tres assets con candidatos reconstruidos
  desde el mismo tag y fallan antes de publicar.
- [La reejecución requiere otra aprobación] -> el environment permanece como gate humano y el owner ya
  autorizó la publicación para iniciar MACA.

## Migration Plan

1. Cambiar las rutas del job npm y su checker estático.
2. Añadir pruebas negativas para ruta de pack, descarga, comparación y fuente de publicación.
3. Actualizar spec y guía de recuperación.
4. Ejecutar OpenSpec estricto, suite, audit, pack, revisión adversarial y readiness.
5. Fusionar el PR protegido en `main`.
6. Reejecutar el workflow con el mismo `v0.2.0`, aprobar el environment y verificar npm/provenance.

Rollback: revertir el commit del workflow. No se borra el GitHub Release ni se mueve el tag. Ante una
diferencia, npm permanece en 0.1.6 hasta que una reejecución desde el mismo tag vuelva a demostrar igualdad.

## Open Questions

Ninguna. La mejora general de `pack-release.mjs` para validar antes de crear cualquier output puede
evaluarse en un change posterior; no es necesaria para recuperar los bytes ya etiquetados.
