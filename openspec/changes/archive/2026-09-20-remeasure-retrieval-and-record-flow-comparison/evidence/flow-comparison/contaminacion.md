# Lo que las dos vías sabían antes de empezar

Escrito el 20 de septiembre de 2026, al terminar la vía A y antes de leer nada de la vía B. El
[protocolo](protocol.md) queda intacto: esto es un hallazgo de la ejecución, no un cambio de las reglas.

## El hallazgo

La vía A entregó su informe diciendo, con esas palabras, que el defecto era «trap #1 from the readiness-gate
notes (tracked as issue #162)». El prompt congelado **no menciona** ni la lista de trampas ni el issue: solo
describe el síntoma en un párrafo.

La explicación es el archivo de memoria del proyecto, que ambas vías heredan y que dice literalmente que el
gate «rechaza español correcto» por `conserva`, `completa` y `sustituye`, y que está «rastreado en el issue
#162». Es decir: **ninguna de las dos vías parte de cero.** Las dos empiezan sabiendo que esto ya está
diagnosticado y dónde.

## Qué invalida y qué no

- **No invalida la comparación entre las dos vías.** Las dos corrieron con exactamente el mismo acceso a esa
  memoria, el mismo árbol, el mismo párrafo y la misma máquina. Lo que las separa sigue siendo solo el proceso.
- **Sí invalida cualquier lectura del tipo «un agente sin saber nada resolvió esto».** No es lo que se midió.
  Lo que se midió es qué hacen dos procesos distintos con el mismo punto de partida y el mismo contexto previo.

## Por qué no se rehízo

Quitar la memoria habría exigido cambiar el entorno después de que la primera vía ya había corrido, y el
protocolo dice que cambiar las condiciones a mitad anula la comparación. La alternativa honesta es declararlo,
que es lo que hace esta página.

Para una comparación futura que quiera medir «desde cero», el entorno tiene que declararse y congelarse junto
con la tarea: qué memoria, qué notas y qué issues ve cada vía.
