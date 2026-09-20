## Context

`placeholderPaths` recorre todos los strings de la metadata y aplica cinco expresiones regulares sin usar la
ruta del campo. Ese diseño causa dos errores distintos:

- el patrón de `replacement-instruction` interpreta `verbo + artículo` como una orden, aunque en castellano
  el imperativo y el presente de indicativo sean homógrafos;
- el patrón `reserved-marker` interpreta una palabra dentro de un identificador kebab-case como una ranura
  pendiente.

La comparación de #166 ofrece una baseline independiente sobre el mismo problema. En `main`, pasan 2 de 34
frases legítimas y se rechazan 16 de 19 marcadores reales. La vía de flujo completo consiguió 34 de 34 frases,
pero solo rechazó 18 de 19 marcadores: dejó pasar la instrucción sembrada `Complete the review or document why
it is objectively not applicable before propose.`. Esa entrega no se integra ni se toma como solución; sirve
como caso negativo para este diseño.

El detector se usa en `pre-propose` y `pre-archive`. Debe continuar siendo puro, read-only, sin datos externos
y sin repetir en el diagnóstico el contenido que analiza.

## Goals / Non-Goals

**Goals:**

- Separar prosa legítima e instrucciones de plantilla con un corpus que haga fallar ambas clases de regresión.
- Detectar las 19 instrucciones reales del corpus de #166, incluidas todas las cadenas sembradas.
- Permitir que el campo `change` nombre el concepto corregido sin relajar el resto de la metadata.
- Conservar las cinco etiquetas canónicas del diagnóstico y la redacción de secretos.
- Demostrar compatibilidad contra la metadata archivada con `schemaVersion: 1.0.0`.

**Non-Goals:**

- Crear un parser lingüístico general.
- Cambiar el contrato JSON de readiness o las plantillas para que el detector pase.
- Resolver fallos conocidos de `sync`, `doctor` u otros perfiles.
- Reutilizar como implementación la rama experimental producida para #166.

## Decisions

### 1. El corpus manda sobre la expresión regular

La implementación no se aprobará por inspección de una regex. Un único corpus de aceptación incluirá:

- las 34 frases legítimas extraídas por el evaluador independiente de #166;
- los 19 marcadores reales extraídos de las plantillas y de los criterios del issue;
- nombres de change que contienen términos reservados;
- la metadata de todos los changes archivados con schema 1.0.0.

Las pruebas importarán el detector real y exigirán 34/34 frases aceptadas, 19/19 marcadores rechazados y cero
regresiones históricas. El corpus conservará la fuente de cada caso para que un cambio documental no altere la
medición en silencio.

**Alternativa descartada:** dar por suficiente la suite creada en la rama experimental. #166 demostró que esa
suite podía estar verde mientras una instrucción sembrada seguía pasando.

### 2. La instrucción de reemplazo se reconoce por formas observadas

El patrón dejará de considerar `conserva`, porque significa mantener y no rellenar una ranura. En español se
reconocerán las formas observadas que nombran el hueco (`reemplaza|sustituye|completa` seguidas de
`con|aqui|aquí`), no las combinaciones con artículos (`el`, `la`, `este`, `esta`).

En inglés se conservará `replace with` y se añadirá la forma sembrada `complete the review`. Ambas deberán
estar cubiertas por tests literales derivados de las plantillas. Las fronteras usarán clases Unicode para que
`aquí` no escape por la semántica ASCII de `\b`.

**Alternativas descartadas:** anclar el verbo al principio del campo, porque los marcadores pueden aparecer
después de una etiqueta; exigir `<...>` o `[...]`, porque las plantillas reales usan texto llano.

### 3. La excepción del nombre es semántica y acotada al campo `change`

`placeholderPaths` conservará la ruta mientras recorre la metadata. El detector de `reserved-marker` seguirá
rechazando `TBD`, `FIXME`, `CHANGEME` y `PLACEHOLDER` en cualquier campo. Solo en la ruta exacta `change`, y
solo cuando el valor cumpla `CHANGE_NAME` y contenga más de un segmento, una palabra reservada podrá formar
parte del identificador.

Así, `fix-placeholder-homograph-detection` será válido, mientras `owner: TBD-owner`, `change: placeholder` y
un marcador entre signos seguirán fallando.

**Alternativa descartada:** cambiar globalmente las fronteras para ignorar guiones. Esa solución aceptaría
marcadores pendientes en campos que no son identificadores.

### 4. Los demás patrones cambian solo con evidencia

Los patrones de ángulo, `TODO` y corchetes se conservan salvo que el corpus pruebe una regresión concreta. El
quinto patrón se revisará contra `[completar]` y contra las coincidencias reales del repositorio; revisarlo no
autoriza relajarlo sin un falso positivo reproducible.

### 5. La evidencia pre-apply y la evidencia de cierre son distintas

Antes de `apply` se guardan la DoR, la baseline y el plan de evidencia. Durante `apply` se crearán los tests y
la medición posterior. Solo después se ejecutarán revisión adversarial, deuda, rollback, gate de archive y CI
multiplataforma. Ningún estado pendiente se marcará como pasado por anticipado.

## Risks / Trade-offs

- **[Riesgo] Una forma imperativa no incluida puede escapar.** → El corpus se deriva de las plantillas
  sembradas y contiene explícitamente el caso que la vía completa perdió.
- **[Riesgo] Una excepción de nombres se extiende a otros campos.** → La excepción recibe la ruta exacta y
  tiene casos negativos para `owner`, `scope` y un change formado solo por el marcador.
- **[Riesgo] El corpus queda obsoleto cuando cambian las plantillas.** → Una prueba leerá las plantillas reales
  y comprobará campo por campo, además de conservar los casos congelados.
- **[Riesgo] Los perfiles `library-cli` y `harness-tooling` exigen gates que hoy tienen fallos conocidos.** →
  Se registrarán sin corregirlos lateralmente; si bloquean archive, la desviación quedará explícita para una
  decisión del mantenedor.

## Migration Plan

No hay migración. El cambio afecta una función pura de validación. Se despliega con el paquete normal y se
revierte con `git revert`; al revertir, el corpus nuevo deberá hacer visible el regreso de los falsos positivos.

## Open Questions

Ninguna antes de `apply`. El corpus independiente de #166 resuelve la principal ambigüedad: cualquier diseño
que no alcance simultáneamente 34/34 y 19/19 queda descartado.
