# Revisión adversarial - research-upstream-self-application

Fecha operativa: 30 de agosto de 2026. Resultado: **PASS con cero Blockers y cero Majors abiertos.**

Un spike se refuta distinto que una implementación: no hay código que romper, así que el ataque va contra
las afirmaciones. Se atacaron cinco: que la clasificación sea honesta y no una excusa, que las mediciones
digan lo que se afirma que dicen, que la recursión esté realmente resuelta, que los veredictos negativos no
sean pereza, y que el desglose sea implementable y no una lista de deseos.

## Hallazgos

### 1 · Major (corregido) — el criterio se estaba aplicando en la dirección cómoda

**Cómo apareció.** La primera clasificación mandaba los seis `FAIL` del doctor al lado de "forma de
consumidor". Es la conclusión que menos trabajo genera, y por eso mismo la más sospechosa.

**Por qué era un defecto.** Aplicando la pregunta del criterio —¿qué prometió el upstream?— dos de los seis
cambian de lado:

- `sdd.openspec-local`: `AGENTS.md` **ordena** usar el CLI local fijo. Verificado que no está en el
  lockfile y que un worktree tras `npm ci` no lo tiene. Hay promesa publicada y hay incumplimiento.
- `github.project`: el Definition of Ready **lee** ese manifiesto para comprobar pertenencia al proyecto.
  Sin él, el gate que el repositorio se exige a sí mismo no es ejecutable in situ.

Un criterio que solo produce absoluciones no es un criterio.

**Corrección.** La clasificación quedó 2 de deuda real y 4 de forma, cada una con la promesa concreta citada
o con la razón por la que no existe promesa. Los dos casos de deuda tienen issue propio: #48 y #49.

### 2 · Minor (corregido) — el recuento del resumen no cuadraba con la matriz

**Cómo apareció.** La tabla de resumen se escribió antes de cerrar los últimos grupos.

**Por qué era un defecto.** Un documento que afirma "sin celdas vacías" y luego publica un recuento que no
coincide con sus propias filas se refuta a sí mismo. El total coincidía por casualidad; cuatro de las seis
cifras no.

**Corrección.** Recuento derivado de la matriz, fila por fila: 10 adoptar, 3 adoptar adaptado, 4 corregir el
runtime, 14 no aplicar por forma, 6 no aplicar por falta de valor, 10 ya aplicado. Total 47, que coincide con
la suma de los nueve grupos.

## Superficies atacadas sin hallazgo

### Las mediciones dicen lo que se afirma

Cada cifra del decision record se comprobó contra su comando. Las dos afirmaciones más cargadas se volvieron
a ejecutar específicamente para esta revisión:

```text
tres archivos en .project-os/  ->  readiness-check in situ: PASS 13 | FAIL 0 | EXCEPTION 0
debt capture x10               ->  8 aceptados, 2 rechazados, 1 item de registro creado
```

El item creado se leyó entero antes de citarlo: es la deuda de Purpose de cuatro specs históricas, fechada el
18 de agosto de 2026, con `planOwner`, remediación y verificación. No es una coincidencia de título.

### La recursión está resuelta, no descrita

Se comprobó que `sync --check` sobre el upstream reporta `conflicts: 9` con `creates: 67` y ninguna
escritura, y que la allowlist rechaza 26 de esas creaciones. Ambas mitades del mecanismo son verificables
por separado, y la segunda ya hizo fallar `npm run check` en este mismo repositorio cuando el tooling de
agentes dejó `.claude/worktrees/`.

También se comprobó que las cuatro rutas en conflicto marcadas `owner constructor` divergen de su semilla
entre 9 y 121 líneas, que es lo que descarta "sincronizarlas" como salida.

### Los veredictos negativos no son pereza

Los dos grupos donde decir que no era más cómodo —adaptadores de agente y onboarding— se atacaron
específicamente:

- Adaptadores y MCP: el costo está medido, no supuesto. Son cinco raíces que la allowlist rechaza, y el
  beneficio sería configuración que no activa nada, porque las skills están `enabled: false` y `servers`
  está vacío por decisión previa.
- Onboarding: la promesa del mecanismo —de una carpeta vacía al primer cambio de producto— es literal y el
  upstream no puede estar en ese estado. La negativa se apoya en la promesa, no en el esfuerzo.

### El desglose es implementable

Los nueve issues se crearon y los nueve pasaron el Definition of Ready con el gate real:

```text
#48 .. #56   Veredicto: PASS | PASS 13 | FAIL 0 | EXCEPTION 0
```

Ninguno se apoya en otro para existir. El único orden es de riesgo, y está escrito.

### El spike no ejecuta ninguna adopción

Todas las sondas se hicieron sobre copias del árbol o revirtiendo los archivos al terminar. `git status` del
worktree tras las mediciones no mostraba residuo, y `.project-os/` volvió a contener un solo archivo.
`npm run check` pasa con el mismo recuento de pruebas que antes del spike, porque ninguna cambió.

## Hallazgo lateral, incorporado

Escribiendo la metadata del noveno issue —el del detector de marcadores— la propia metadata reprobó el gate.
La causa medida: la palabra española que significa la totalidad es homógrafa de un marcador inglés de la
lista prohibida.

```text
entrada:   "...su aplicacion a todo valor de texto"
resultado: patron 2 coincide con: "todo"
```

Es más grave que el problema que el issue ya describía: no es que un change sobre marcadores no pueda
nombrarlos, es que un repositorio que escribe su metadata en español colisiona con la lista en el uso
corriente del idioma. El hallazgo se incorporó al issue #56 y a la evidencia.

## Degradación declarada

El decision record clasifica 47 mecanismos con el criterio de la promesa publicada. Ese criterio depende de
que las promesas estén escritas: si el upstream promete algo solo por costumbre y no por documento, un check
que lo mida quedaría clasificado como forma de consumidor por omisión. La revisión no encontró ningún caso,
pero el modo de fallo existe y queda declarado. No es deuda: es el límite del criterio, y hacerlo explícito
es preferible a fingir que no lo tiene.
