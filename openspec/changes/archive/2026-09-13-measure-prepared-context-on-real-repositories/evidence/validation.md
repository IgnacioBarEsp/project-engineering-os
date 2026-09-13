# Validación — contexto preparado en repositorios reales

Todas las comprobaciones de esta página se ejecutaron en la rama del issue 105 después de publicar el
resultado desfavorable. Los JSON de `run-01/` son la salida sin reemplazo del primer intento posterior al
precompromiso `c808967cd46abc4b340d148834a24e3005cc0247`.

## Resultado del experimento

| Corpus | Elegibilidad | Abrir todo | Barrido literal | Contexto preparado |
| --- | --- | ---: | ---: | ---: |
| `kubernetes/website` | 3096 archivos UTF-8, 41 608 178 bytes | 10 / 10 | 10 / 10 | 0 / 10 |
| `python/cpython` | 6118 archivos UTF-8, 118 834 078 bytes | 10 / 10 | 10 / 10 | 0 / 10 |

Cada celda de respuesta exige el resultado correcto en las tres repeticiones. `run-01/preflight.json`
verifica primero remotos, commits, licencias, tamaños, fuentes y líneas de respuesta. Los dos reportes por
corpus conservan 30 observaciones crudas por método y el agregado las resume sin fragmentos de los
repositorios externos.

SHA-256 de los artefactos inmutables del intento:

| Archivo | SHA-256 |
| --- | --- |
| `preflight.json` | `e203be3d2b7e6a3e868459f97411dc2e2ca0a4c745f15c70c946f1dc591b7be9` |
| `kubernetes-website.json` | `709507015cbbf2a2ed91ef75d5621474f9ae4c33a52f11de6331e419d1a23318` |
| `cpython.json` | `080040d45e6d918b5f5e069c5135fe97c97f3d382086b1e9dcaf4f93ad423ed3` |
| `measurement.json` | `8287f5529501255a1b3223e3febaac488a0b110feacf5d524eb61ac8e6638305` |

## Puertas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Suite de Companion | PASS — 129 pruebas, 0 fallos |
| Suite y checks del upstream | PASS — 317 pruebas, 0 fallos; paquete, neutralidad, documentación, workflows y deuda en verde |
| OpenSpec local 1.6.0, validación estricta de todos los specs y changes | PASS — 21 de 21 |
| Reconciliación desde observaciones crudas | PASS — 7 pruebas, incluido el rechazo por protocolo, checkout, remoto, tamaño y drift público |
| Landing en navegador real | PASS — 14 527 bytes, 80 nodos de contraste, seis anchos, cero peticiones externas y reflujo a 200 % |
| Barrido de rutas locales y formas comunes de secretos en la evidencia | PASS — solo anclas portables como `<localappdata>` |
| Verificador adversarial separado | PASS — 5 de 5 manipulaciones detectadas, 0 blockers y 0 majors |
| Debt Control Loop | PASS — assessment capturado como `debt-bd1d39bb57fe`; plan activo en 4/5 unidades |
| Reversa del cambio en un worktree desechable | PASS — el diff de los dos commits se aplica en reversa sobre `e0a2980` |

La prueba `published real-repository numbers reconcile with every raw observation before and after archive`
recalcula los seis resúmenes desde las observaciones, los compara con `measurement.json` y luego exige las
filas exactas de `docs/companion/EVIDENCE.md` y los resultados principales de `site/index.html`. Resuelve la
ruta tanto mientras el change está activo como después de archivarlo.

## Límites conservados

- La app instalada es la versión 0.1.0 en una sola máquina Windows.
- Los tiempos usan caché caliente no controlada y son descriptivos.
- Se cuentan bytes de contenido abiertos por el algoritmo; no metadatos, I/O físico ni tokens.
- Las consultas son literales y estaban congeladas; no se evaluó selección de consulta por un modelo.
- La cobertura parcial es el resultado del producto instalado y no se corrigió dentro del experimento.
