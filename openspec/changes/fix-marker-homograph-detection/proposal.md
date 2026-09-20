## Why

El [issue #162](https://github.com/IgnacioBarEsp/project-engineering-os/issues/162) demuestra que el detector
de marcadores de readiness confunde instrucciones de plantilla con castellano corriente. Rechaza frases como
«el rollback conserva el historial» y también impide que un change nombre el defecto que corrige; a la vez,
la comparación medida en #166 probó que un arreglo anterior que eliminaba los falsos positivos todavía dejó
pasar una instrucción real de la plantilla.

El detector protege todas las fases `pre-propose` y `pre-archive`, por lo que el cambio debe cerrar los falsos
positivos sin convertir el gate en un filtro más permisivo. La aceptación se medirá sobre un único corpus
externo al detector: prosa real, las plantillas sembradas, los marcadores exigidos por el issue y la metadata
histórica.

## What Changes

- Clasificar las instrucciones de plantilla por su contexto observable y no por una pareja genérica de verbo
  y artículo. La prosa homógrafa en español deberá pasar; las instrucciones sembradas en inglés y los
  marcadores explícitos deberán seguir fallando.
- Acotar la excepción para nombres de change al campo `change` y a un identificador kebab-case válido. Un
  nombre podrá contener la palabra del defecto que corrige sin permitir formas como `TBD-owner` en otros
  campos.
- Añadir un corpus de regresión que cubra las 34 frases legítimas y los 19 marcadores medidos en #166,
  incluida `Complete the review or document why it is objectively not applicable before propose.`, que el
  flujo completo anterior dejó pasar.
- Comprobar las dos plantillas sembradas campo por campo, conservar las etiquetas canónicas del diagnóstico y
  verificar que ningún change archivado históricamente pasa a fallar.
- Documentar el contrato del detector y guardar mediciones repetibles antes y después de la implementación.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `runtime`: el requisito de fases de readiness distinguirá la prosa homógrafa de las instrucciones de
  plantilla, mantendrá cerrados los marcadores reales y permitirá que el identificador de un change nombre el
  concepto que corrige sin relajar otros campos.

## Impact

Superficies declaradas por el issue: `library-cli` y `harness-tooling`.

Rutas previstas para `apply`:

- `src/readiness.mjs`: clasificación de marcadores y comentarios de contrato.
- `test/readiness.test.mjs`: corpus positivo, negativo e histórico.
- `blueprint/core/docs/engineering/READINESS_GATES.md` y documentación upstream: explicación del contrato,
  únicamente si el comportamiento público necesita aclaración.
- `openspec/specs/runtime/spec.md`: delta normativo de este change.

No se añaden dependencias, servicios, costos ni cambios de licencia. No se modifica el esquema de metadata.
El rollback será un `git revert`: el detector no conserva estado ni necesita migración.

## Non-goals

- Retirar la comprobación de marcadores o rebajar el criterio hasta que una plantilla sembrada pase.
- Aceptar marcadores unidos por guiones fuera del identificador `change`.
- Reescribir prosa válida para acomodarla al detector.
- Corregir `sync --check`, `upgrade --check` o `doctor` como efecto colateral; sus fallos conocidos pertenecen
  a #122 y #115.
