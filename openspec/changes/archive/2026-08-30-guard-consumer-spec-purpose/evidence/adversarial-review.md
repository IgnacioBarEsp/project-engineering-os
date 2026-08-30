# Revisión adversarial - guard-consumer-spec-purpose

Fecha operativa: 30 de agosto de 2026. Resultado: **PASS con cero Blockers y cero Majors abiertos.**

El objetivo fue refutar el cambio, no confirmarlo. Se atacaron cinco superficies: el alcance del recorrido
de archivos, la frontera read-only, la semántica del árbol ausente, la fuente única y la recuperación
impresa.

## Hallazgos

### 1 · Major (corregido) — un árbol de specs enlazado fuera del repositorio se recorría igual

**Cómo apareció.** El gate recorre `openspec/specs` con `readdir` y lee cada `spec.md`. `opsx-check` ya
protege los targets de bloques gestionados con `assertNoSymlinkEscape`, pero la primera implementación
delegaba directamente en el módulo sin esa comprobación.

**Por qué era un defecto.** Un `openspec/specs` enlazado a un directorio ajeno convierte un comando
read-only en una enumeración de directorios de terceros: cada subdirectorio del destino aparece como una
`capability` en la salida JSON, con su nombre. Se comprobó con una sonda directa sobre un repositorio
bootstrapeado y un junction hacia un directorio externo, retirando la corrección y volviéndola a poner:

```text
sin guard: opsx.spec-purpose.leaked-capability PASS
           evidence.path = openspec/specs/leaked-capability/spec.md
           nombre externo presente en el payload = true
con guard: code = SYMLINK_ESCAPE
           nombre externo presente en el payload = false
```

**Corrección.** `checkSpecPurposes` llama a `assertNoSymlinkEscape(targetRoot, 'openspec/specs')` antes de
comprobar existencia, igual que ya se hace con los bloques gestionados. Un enlace que resuelve dentro del
repositorio sigue siendo válido; uno que escapa aborta con `SYMLINK_ESCAPE` sin leer nada.

Fijado por la prueba `un árbol de specs enlazado fuera del repositorio se rechaza antes de leerlo`, que
además comprueba que el nombre del directorio externo no aparece en la salida.

### 2 · Minor (corregido) — fallar cerrado ante un árbol ausente castigaba un estado legítimo

**Cómo apareció.** El criterio del issue pide fallar cerrado ante un árbol de specs ilegible. La primera
implementación aplicó eso también al árbol ausente, porque el módulo colapsa ambos casos en
`specs-root-unreadable`.

**Por qué era un defecto.** Un repositorio que todavía no ha archivado ningún change no tiene
`openspec/specs`. Ese es el estado normal, no una anomalía. El fixture de integración de `opsx-check` clona
un baseline bootstrapeado sin ejecutar `openspec init` y exige `PASS` sin ningún `FAIL`. Se comprobó
volviendo a poner el fallo cerrado para el árbol ausente:

```text
árbol ausente como FAIL: la prueba `opsx-adapt estabiliza 25 archivos externos` falla
                        opsx.spec-purpose FAIL dentro de un payload por lo demás PASS
árbol ausente como SKIP: la misma prueba pasa
```

Con él se rompía la promesa de que un repositorio recién creado pasa sus propios gates.

**Corrección.** La política vive en el llamador, no en el módulo, que conserva sus cinco modos intactos.
`opsx-check` distingue "no existe" de "existe y no se puede leer" con la comprobación de existencia que ya
usa para el binario local: el primero es `SKIP`, el segundo `FAIL`. `check:docs` conserva el fallo en ambos
casos, porque el upstream siempre publica capabilities.

Fijado por las pruebas que cubren árbol ausente, árbol vacío y árbol que existe y no se puede recorrer.

## Superficies atacadas sin hallazgo

### Frontera read-only

Se comparó una huella exacta de todo el árbol objetivo antes y después de la ejecución que falla por
`purpose-placeholder`. Las huellas son idénticas y `mutationPerformed` sigue en `false`. La afirmación de
que el gate no escribe está demostrada, no declarada.

### Alcance del recorrido

Se sembró un delta en `openspec/changes/active/specs/seeded/spec.md` sin Purpose junto a la capability
publicada. El gate no lo alcanza y ningún check menciona `active`. Un delta legítimamente no declara
Purpose y no debe fallar.

### Fuente única

`scripts/check-docs.mjs` y `src/opsx-check.mjs` importan el mismo `src/spec-purpose.mjs`. No queda ninguna
copia bajo `scripts/`, y `files` del `package.json` publica `src/`, así que el consumidor recibe el módulo
que el upstream ejecuta. `npm run pack:verify` confirma el empaquetado.

### Recuperación accionable

Cada modo imprime la ruta concreta del archivo y qué escribir en él. Verificado sobre un repositorio real:
el mensaje nombra `openspec/specs/demo-capability/spec.md` y pide sustituir el texto sembrado bajo
`## Purpose`. Fijado por la prueba de recuperaciones, que exige la ruta en los cinco modos y la instrucción
de redacción en los tres que se corrigen escribiendo.

### Falsos negativos del clasificador

Se comprobó que el texto sembrado se detecta tanto por su forma completa como por su apertura, de modo que
una variación tipográfica del guion no lo deja pasar. El cuerpo se compara ya recortado, así que un Purpose
que solo contiene espacios se clasifica como vacío y no como redactado.

## Degradación declarada

El gate no distingue un Purpose redactado de uno redactado *bien*. Comprueba presencia, no calidad: una
frase vacía de contenido pero sintácticamente correcta pasa. Esa es la frontera deliberada de una
comprobación mecánica, y la revisión humana del PR sigue siendo el gate de calidad. No es deuda.
