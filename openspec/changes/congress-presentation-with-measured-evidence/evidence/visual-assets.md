# Material visual del mazo

Todo sale de la galería publicada. **Ninguna imagen se retoca**, y cada una lleva su procedencia comprobable
por `check:docs`.

## Capturas elegidas

Las tres son de la ventana real de Companion 0.3.2, ejecutada desde el commit `d744c47`, a 1164 × 755 px.

| Diapositiva | Imagen | SHA-256 | Por qué esta |
| --- | --- | --- | --- |
| 19 | `docs/assets/companion-current-home.png` | `60e93f5a…` | La pantalla de inicio: es lo primero que ve quien abre la aplicación |
| 19 | `docs/assets/companion/proyecto-listo-activacion.png` | `6fa75cc1…` | El final del recorrido: la carpeta preparada y el prompt para pegar en la IA |
| 5 o 19 | `docs/assets/companion/paso-3-vision.png` | `d4e5c5aa…` | El paso donde se escribe qué se quiere lograr. Ilustra «las reglas escritas» sin explicar el producto |

**Las que no entran, y por qué:** `paso-2-delimitacion.png` muestra un defecto abierto —con el perfil
«Investigación» ofrece los subtipos de software, [#145](https://github.com/IgnacioBarEsp/project-engineering-os/issues/145)—.
La galería lo documenta a propósito, pero una diapositiva no puede enseñarlo sin explicarlo, y la charla ya
dedica tiempo a lo que falla. `home-companion.png` es la misma pantalla que la del README, duplicada.

Al pie de cada captura, en la diapositiva: **«Companion 0.3.2, commit `d744c47`»**. Es lo que exige la spec de
capturas y lo que distingue una captura de una maqueta.

## Tabla comparativa de la diapositiva 15

Los datos salen de la prueba 2 del change archivado
`2026-09-20-remeasure-retrieval-and-record-flow-comparison`, en `evidence/flow-comparison/`. No hay que
recalcular nada: `verify-deck-figures.mjs` ya comprueba que estas cifras coinciden con su registro.

| | Prompt suelto | Flujo completo | Sin arreglar |
| --- | --- | --- | --- |
| Frases correctas que pasan | 33 de 34 | 34 de 34 | 2 de 34 |
| Marcadores de verdad rechazados | 19 de 19 | 18 de 19 | 16 de 19 |
| Tiempo | 8 min 44 s | 31 min 3 s | — |
| Archivos tocados | 2 | 28 | — |

**Cómo leerla en pantalla:** la tercera columna es la clave. Sin ella parece que las dos vías son buenas; con
ella se ve de dónde partían. Y el pie de la diapositiva tiene que decir que **ninguna de las dos resolvió el
defecto del todo**, porque esa es la conclusión, no una nota al margen.

## Lo que no hay, y no se inventa

- **No hay vídeo de las demos.** Decisión del mantenedor: las demos son estas dos ejecuciones reales con sus
  artefactos, no una grabación reconstruida.
- **No hay gráficos de barras de eficiencia, tokens ni ahorro.** No se midieron, y la diapositiva de límites
  lo dice.
- **No hay capturas de la landing** en esta versión del mazo: la nueva está sin terminar y la actual no aporta
  al argumento.
