# Baseline — congress-presentation-with-measured-evidence

Estado medido el 20 de septiembre de 2026, con la ola 0 casi cerrada. El congreso es el **24**.

## Qué desbloqueó la ruta crítica del issue

El issue #165 declaró una ruta crítica de cinco pasos. Los cuatro primeros están hechos:

| Orden | Qué | Estado |
| --- | --- | --- |
| 1 | #142, el hotfix | **Publicado.** Companion 0.3.2 en la calle; el asistente se puede terminar |
| 2 | #143, capturas reales con procedencia | **Integrado** con la PR #171 |
| 3 | Las dos demos | **Ejecutadas y medidas** como prueba 2 de #166, no grabadas en vídeo |
| 4 | Re-medir, salida A | **Ejecutada** en #166, PR #172. El número no cambió |
| 5 | Montar el mazo | Este change |

## El material que ya existe y es citable

| Dato | Valor | Dónde |
| --- | --- | --- |
| Microcorpus | Contexto preparado 10 de 10; abrir todo y barrido literal, 8 de 10 | `docs/companion/EVIDENCE.md` |
| Repositorios reales, 0.1.0 | Contexto preparado **0 de 20**; barrido literal 20 de 20 | La misma página |
| Repositorios reales, 0.3.2 | **0 de 20 otra vez**; 45 de 2654 fuentes indexadas, `entry-limit` | La misma página |
| Contraste del arnés | 0 hallazgos frente a **360** sobre la misma aplicación; siete controles tapados | `archive/2026-09-20-remeasure…/evidence/after/harness-contrast*.json` |
| Arranque documentado | Seis pasos con código 0; doctor con 29 comprobaciones y 0 FAIL | El mismo change |
| Comparación de dos vías | 33/34 y 19/19 en 8 min contra 34/34 y 18/19 en 31 min; base 2/34 y 16/19 | El mismo change, `evidence/flow-comparison/` |
| Capturas del producto | Ventana real de 0.3.2 con procedencia por imagen | `docs/companion/SCREENSHOTS.md` |

## Las afirmaciones que **no** se pueden hacer

`docs/companion/EVIDENCE.md` declara explícitamente que no se midieron: consumo de tokens de un modelo,
calidad de respuesta de un modelo, alucinaciones ni comparación con otros productos. `README.md` añade que no
hay ahorro general de tiempo o dinero demostrado.

Y la medición de repositorios reales no es neutra: **está en contra**. Cualquier diapositiva sobre ventaja de
recuperación o eficiencia sería una afirmación refutada por el propio repositorio.

## Lo que no existía y este change crea

No hay ningún guion, ni tabla de procedencia de cifras, ni decisión escrita sobre qué se enseña y qué no. El
conector de Canva, que el issue daba por no autorizado, **sí lo está**: hay un brand kit disponible. El mazo
visual y su PDF siguen sin existir, y quedan sujetos a que el mantenedor apruebe primero el contenido.
