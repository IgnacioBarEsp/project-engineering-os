# Resultado de la comparación de dos flujos

Ejecutada el 20 de septiembre de 2026 según el [protocolo congelado](protocol.md), cuyo digest se fijó antes de
lanzar ninguna de las dos vías. Cada vía corrió en **contexto limpio**, en su propio árbol de trabajo creado
desde `a02c991`, sin acceso al issue #162, a su diagnóstico, a los criterios ni a esta página.

**Las dos entregas las evaluó quien escribe, no ellas mismas.** Ningún número de aquí sale de los informes de
las vías: el detector de cada árbol se importó y se sometió al mismo corpus, construido desde los documentos
reales del repositorio base. Los scripts y los registros están en [evaluation.json](evaluation.json) y
[evaluation-regression.json](evaluation-regression.json).

Antes de leer nada: [qué sabían las dos vías al empezar](contaminacion.md).

## Los nueve criterios

| # | Criterio | Vía A, prompt suelto | Vía B, flujo completo |
| --- | --- | --- | --- |
| 1 | Las frases legítimas del repositorio pasan | **33 de 34** | **34 de 34** |
| 2 | «Conserva la carpeta y revisa la recuperación» pasa | Sí | Sí |
| 3 | Los marcadores de verdad siguen rechazados | **9 de 9** | **8 de 9** |
| 4 | Corpus de las dos clases y una regresión hace fallar la suite | Sí, 3 pruebas caen | Sí, 1 prueba cae |
| 5 | Ningún change archivado cambia de veredicto | Sí, 0 de 50 | Sí, 0 de 50 |
| 6 | El mensaje nombra el token rechazado | Sí | Sí |
| 7 | `npm run check` pasa en el árbol entregado | Sí, 344 de 344 | Sí, 344 de 344 |
| 8 | El cambio se puede revertir sin residuo | Sí | Sí |
| 9 | Los defectos quedan registrados con quién y cuándo | Solo en su informe final | En evidencia versionada |

La línea base, para leer las dos columnas: el detector original **rechaza 32 de esas 34 frases legítimas** y
**deja colar 3 de los 9 marcadores**.

## Dónde falla cada una, exactamente

Ninguna de las dos entregó el arreglo completo, y no fallan en lo mismo.

**La vía A deja fuera el segundo síntoma.** La única frase legítima que sigue rechazando es una fila de
`docs/SPEC_PURPOSE.md` que contiene el token `purpose-placeholder`. No la rechaza por el homógrafo: quitando
ese token, la vía A la acepta. La rechaza porque «placeholder» se busca como subcadena dentro de un
identificador con guiones, que es el **segundo síntoma que documenta #162** —un change no puede llamarse como
el concepto que arregla— y que la vía A no tocó.

**La vía B deja abierto un agujero real.** El marcador que se le cuela es la cadena literal de una plantilla
sembrada, `blueprint/core/docs/engineering/templates/pre-propose-readiness.example.json:30`: «Complete the
review or document why it is objectively not applicable before propose.» Ya se colaba antes del cambio; la
vía A lo cerró y la vía B no.

**Las dos encontraron el mismo escape, sin que nadie se lo pidiera:** `\b` en JavaScript solo conoce ASCII, así
que no hay frontera de palabra después de `í` y la forma acentuada `sustituye aquí el valor` —un marcador
escrito en castellano correcto— nunca se detectaba. Las dos lo cerraron.

## Lo observable del proceso

| Medida | Vía A | Vía B |
| --- | --- | --- |
| Reloj de pared | **8 min 44 s** | **31 min 3 s** |
| Llamadas a herramientas | 45 | 146 |
| Archivos tocados | 2 | 28 |
| Líneas añadidas | 162 en total | 1822 |
| Entrega | Árbol de trabajo sin commit | Rama y un commit firmado |
| Artefactos de proceso | Ninguno | Issue verificado con DoR 13 PASS, change OpenSpec válido en estricto, spec, plan y validación, medición versionada y repetible, assessment de deuda `clean` |
| Dónde se detuvo | Al entregar el arreglo | Antes de archivar: el gate de archive quedó en 14 PASS y 3 FAIL porque dos comprobaciones exigen la matriz de CI protegida, que solo corre con un push |

Dos cosas que el proceso produjo y el prompt suelto no:

- **La vía B dejó pendiente lo que no pudo ejecutar** en vez de rellenarlo, y lo escribió en un registro de
  desviaciones junto con las dudas que no le tocaba resolver: qué superficies declarar y si una comprobación de
  multiplataforma aplica a una expresión regular.
- **La vía B encontró un defecto ajeno mientras medía**: `npm run pack:verify` falla en cualquier checkout de
  `main` porque el empaquetador trata `w/none` —un archivo sin ningún salto de línea— como fin de línea no
  canónico. No lo arregló de pasada; lo registró como deuda fuera de alcance.

Y una que el prompt suelto produjo sin que se la pidieran: **la vía A escribió pruebas y verificó su arreglo**
aunque su condición era no tener proceso. El protocolo lo anticipaba: si el agente decide hacerlo por su
cuenta, eso es parte del resultado. Su corpus resultó además más sensible —tres pruebas caen al restaurar el
detector viejo, frente a una de la vía B—.

## Lo que esta comparación no demuestra

**Una tarea demuestra qué pasó en esa tarea, y nada más.** No demuestra una ventaja general de ninguna de las
dos vías, no predice otra tarea, no mide a las personas que usarían cada vía y no dice nada sobre costos.

- **No se midieron tokens.** Ningún proveedor los reportó en un registro conservable, así que no aparecen.
- **Nadie juzgó la calidad de las respuestas.** Los nueve criterios son comprobables sobre el código, y se
  comprobaron ejecutándolo.
- **Las dos vías las ejecutó el mismo modelo**, en contextos separados pero no independientes entre sí en
  capacidad. Otro modelo daría otro resultado.
- **Los seis primeros criterios los escribió el propio flujo** cuando produjo #162, y eso favorece a la vía B
  en la forma de enunciarlos aunque no en su contenido. Estaba declarado antes de medir.
- **Ninguna persona revisó ninguna de las dos entregas.**

## Qué pasa con las dos entregas

Ninguna se integra desde aquí. Son artefactos de una medición, no el arreglo de #162: ese issue sigue abierto
y merece una entrega que cierre **los dos** síntomas y no deje ningún marcador real sin detectar, que es
justamente lo que esta comparación deja demostrado que falta.
