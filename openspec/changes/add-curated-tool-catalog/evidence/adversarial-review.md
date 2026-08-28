# Revisión adversarial - add-curated-tool-catalog

Fecha operativa: 28 de agosto de 2026. Resultado: **PASS con cero Blockers y cero Majors abiertos.**

El objetivo de esta revisión fue refutar el cambio, no confirmarlo. Se atacaron cinco superficies: la
frontera read-only, el detector de secretos, la resolución de estados, la procedencia y el contrato del CLI.

## Hallazgos

### 1 · Major (corregido) — un literal en mayúsculas pasaba como nombre de variable

**Cómo apareció.** La primera implementación falló al validar la propia semilla: `secretEnvRefs:
["GITHUB_TOKEN"]` se reportó como literal de secreto. La corrección inicial amplió `ENV_REFERENCE_FORM`
para aceptar cualquier identificador en mayúsculas.

**Por qué era un defecto.** Esa ampliación era global. Una sonda directa lo confirmó:

```text
token=ABCDEF0123456789    PASA
apiKey=DEADBEEFCAFE1234   PASA
password=hunter2          DETECTADO
```

Un secreto hexadecimal en mayúsculas, en un campo llamado `token` o `apiKey`, atravesaba el detector
exactamente por la vía que el requirement de secretos existe para cerrar. La corrección de un falso
positivo había abierto un falso negativo.

**Corrección.** La excepción se acotó al único campo donde un nombre de variable es el valor legítimo:
`secretEnvRefs`, cuyos elementos el schema ya restringe a `^[A-Z][A-Z0-9_]*$`. En el resto del registro
vuelve a exigirse la forma estricta `${VAR}` o `env:VAR`. Un elemento de `secretEnvRefs` que no sea un
nombre de variable ahora se rechaza.

Fijado por la prueba `un literal en mayúsculas no pasa como nombre de variable de entorno`.

### 2 · Minor (corregido) — `--candidate` se descartaba en silencio

`tool-catalog list --candidate archivo.json` devolvía `[PASS]` y listaba el catálogo, ignorando la opción
sin avisar. Quien lo ejecutara podía creer que había evaluado una candidata cuando solo obtuvo un listado.
Contradice la doctrina del repositorio de que un estado no se reinterpreta en silencio.

**Corrección.** La opción ahora falla con `CLI_TOOL_CATALOG_SCOPE` cuando el subcomando no es `evaluate`.
Fijado por la prueba `--candidate solo está disponible para tool-catalog evaluate`.

## Superficies atacadas sin hallazgo

### Frontera read-only

Se comparó una huella SHA-256 de todo el árbol objetivo antes y después de `list` y de `evaluate`. Las
huellas son idénticas. La afirmación de que el comando no escribe está demostrada, no declarada.

### Escape de ruta

Se probaron travesía relativa y ruta absoluta:

```text
../../../etc/passwd   -> PATH_TRAVERSAL
C:/Windows/win.ini    -> PATH_INVALID
```

Ambas fallan antes de leer el archivo. `resolveInside` y `assertNoSymlinkEscape` cubren también el escape
por symlink. Fijado por la prueba `una ruta fuera de la raíz es rechazada antes de leer`.

### Descarga de contenido

`evaluate` rechaza cualquier cadena con esquema URI (`https://`, `file://`) antes de tocar el disco. No
existe ruta de código que descargue. El material investigado se trae a mano y se trata como dato.

### Resolución de estados

Se probaron las tres vías de desconocimiento (`license`, `cost`, `auth`) contra los cuatro estados, tanto en
el schema publicado como en el validador del runtime. Ninguna combinación con `unknown` alcanza `universal`
ni `conditional`. Una entrada declarada `universal` con un desconocido se resuelve como `postponed`.

Se comprobó además que ausencia y `unknown` no se confunden: omitir `license` produce error de contrato y
`declaredUnknowns` devuelve lista vacía, porque no hay desconocimiento declarado que registrar.

### Procedencia flotante

Se probaron `latest`, `main`, `HEAD`, `stable`, `v1` y `next`. Ninguna encaja en las tres formas exactas
(commit de 40 hex, tag SemVer, versión SemVer). El rechazo es estructural, no una lista de denegación que
envejezca.

### Señales MCP

Se verificó que ninguna señal satisface a otra, que omitir una es error de contrato, que un receipt sin
fecha se rechaza y que `enabled: true` es imposible.

## Degradaciones declaradas

- **El catálogo no aparece en las instrucciones generadas de los cinco harnesses.** `blueprint/core/CLAUDE.md`
  y sus equivalentes renderizan skills, MCP, permisos y perfiles, pero no el catálogo. Un agente lo
  encuentra por la documentación, no por sus instrucciones. Es deliberado: el catálogo es un contrato de
  datos leído por un comando, no instrucciones de agente, y tocar el contrato de rendering ampliaría el
  cambio hacia la superficie que #32 acaba de revalidar. Queda registrado como candidato de un cambio
  posterior.
- **La ventana de frescura no caduca una entrada, la reporta.** Una entrada vencida sigue siendo válida y
  se marca como stale. Caducarla automáticamente convertiría el paso del tiempo en un cambio de decisión
  sin revisión humana.

## Recuperación

El cambio es aditivo y no activa nada. Revertir el commit restaura el estado previo sin migración: no hay
estado anterior del catálogo que reconciliar. Retirar una entrada individual deja el resto válido, lo cual
está probado.
