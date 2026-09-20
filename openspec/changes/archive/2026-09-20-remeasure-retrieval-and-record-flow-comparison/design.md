# Diseño — remeasure-retrieval-and-record-flow-comparison

## Contexto

Cuatro mediciones distintas, una sola regla: **el resultado se publica como salga**. Tres de ellas reutilizan
arneses que ya existen; la cuarta añade una comprobación que hoy falta. Ninguna toca el producto.

## 1. La re-medición no cambia nada de lo que se mide

`verify-real-repository-benchmark.mjs` verifica el digest del protocolo y de sus archivos guardados antes de
ejecutar, y se detiene si alguno no coincide. Eso es lo que hace comparable la corrida nueva con la del 13 de
septiembre, y por eso **no se toca** el protocolo, ni las veinte preguntas, ni los dos commits, ni el arnés
mismo. Si el arnés necesitara un arreglo para correr, ese arreglo sería otro change y la comparación se
discutiría aparte.

El directorio de evidencia tiene que estar vacío: los intentos anteriores son inmutables. La corrida nueva vive
junto a la anterior, no la sustituye.

## 2. Se mide la aplicación instalada, no el árbol de trabajo

El arnés recibe la carpeta `resources/app` de una instalación real. Medir el árbol de trabajo mediría código
que nadie ha descargado. El procedimiento es el que ya se probó en #142:

1. Instalar el instalador publicado, con SHA-256 comprobado contra el `SHA256SUMS` de la release, en una ruta
   **corta**: NSIS omite en silencio los archivos cuya ruta supere 260 caracteres y la aplicación queda rota.
2. Ejecutar el benchmark contra esa instalación.
3. Desinstalar y comprobar que la desinstalación terminó, que es asíncrona.

El registro nombra la versión y la identidad de la instalación, como ya hace el arnés. El equipo es la estación
del mantenedor, con su autorización explícita del 20 de septiembre de 2026.

## 3. Las dos corridas se publican juntas, con la misma regla

`EVIDENCE.md` no sustituye el 0 de 20: lo conserva y añade el nuevo al lado, con la versión de cada uno. Si el
número mejora, la mejora se atribuye a los cambios ya publicados, no a este change. Si empeora o sigue igual,
se publica igual. Esa simetría es la que hace creíble cualquiera de los dos resultados, y la spec la exige.

## 4. La tarea comparada se declara antes de ejecutar

Elegir la tarea después de ver los resultados invalidaría la comparación. Por eso la tarea y sus criterios de
aceptación se escriben, se revisan y se congelan **antes** de la primera ejecución, en
`evidence/flow-comparison/protocol.md`, y el registro conserva el digest de ese archivo.

Qué se registra de cada vía: archivos tocados, pruebas que pasan y fallan, defectos encontrados por quién y en
qué momento, pasos trazables y si el resultado se puede revertir. Qué **no** se registra: tokens, salvo que un
proveedor los reporte y quede el reporte; y calidad juzgada por el mismo agente que produjo la respuesta, que
sería juez y parte.

La tarea concreta la elige el mantenedor ([decisiones](evidence/maintainer-decisions.md)): es una decisión de
producto, no del ejecutor, porque determina qué enseña la charla.

## 5. El contraste del arnés se mide, no se supone

#166 dice que «el arnés corregido vive en #150». Eso se escribió antes de #142, que ya llevó a `main` los
viewports reales, la exigencia de barra `sticky` y la prueba sobre Electron. Si el arnés de hoy basta para
enseñar el contraste es una pregunta empírica, y se responde con una matriz de cuatro celdas:

| | Commit `a3b1efd` (0.3.1, roto) | Commit corregido |
| --- | --- | --- |
| **Arnés anterior** | Lo que certificó entonces: «38 pantallas, 0 hallazgos» | — |
| **Arnés de hoy** | Lo que detecta ahora | Verde |

La celda que importa es la inferior izquierda. Si el arnés de hoy no detecta sobre `a3b1efd` los defectos que
el anterior no vio, el contraste no existe todavía y este change lo dice en esos términos en vez de inventarlo:
la conclusión sería que #150 sigue haciendo falta, que es una conclusión publicable.

Ejecutar el arnés de hoy sobre un commit viejo exige cuidado: se copia el arnés al árbol de ese commit en un
worktree aparte, sin tocar el renderer de `a3b1efd`, porque lo que se contrasta es la comprobación, no la
aplicación.

## 6. La comprobación del arranque usa el paquete publicado

Repite los seis pasos del README contra `create-project-engineering-os@0.5.0` **desde npm**, en una carpeta
temporal, y falla si alguno no sale con código 0 o si el doctor reporta un FAIL no justificado. No publica
nada, no escribe en el repositorio y no instala herramientas fuera de esa carpeta. Necesita red hacia npm, y lo
declara: es una comprobación de integración, no una prueba unitaria, y por eso no entra en `npm run check`.

## 7. Superficie: `documentation`

Razonada en la [propuesta](proposal.md) con la salida de los dos runners medida hoy. Queda como desviación
propuesta, no aplicada por cuenta propia.

## 8. Orden, porque hay fecha

El congreso es el 24 de septiembre. La re-medición va primero porque es la que bloquea la afirmación central
del mazo y la más larga: la preparación de Kubernetes tardó 101 s en la corrida anterior y cada pregunta se
ejecuta tres veces por cada uno de los tres métodos. Si algo no cabe, lo que se recorta se dice en el registro
y en el handoff, no se entrega a medias en silencio.

## Open Questions

Ninguna queda abierta. Las dos que lo estaban se resolvieron antes de ejecutar:

- **La tarea de la comparación de flujos**: el mantenedor eligió #162 el 20 de septiembre de 2026, y la tarea
  se congeló con su digest antes de lanzar ninguna vía.
- **Si el contraste del arnés aparecería con el arnés de hoy**: apareció. El arnés actual encuentra 360
  hallazgos sobre `a3b1efd`, donde el anterior no vio ninguno. #150 sigue abierto por lo que falta —el
  recorrido de los seis perfiles, los dos modos de movimiento y las pruebas sobre Electron—, y este change no
  lo arrastra.
