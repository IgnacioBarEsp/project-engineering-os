# Baseline — remeasure-retrieval-and-record-flow-comparison

Estado medido el 20 de septiembre de 2026, antes de tocar nada. Todo lo de esta página es observación, no plan.

## Lo que publica hoy la evidencia

| Dónde | Qué dice | Cuándo se midió |
| --- | --- | --- |
| `docs/companion/EVIDENCE.md:83-128` | Contexto preparado **0 de 20**; barrido literal **20 de 20**, sobre `kubernetes/website` y `python/cpython` | 13 de septiembre de 2026 |
| `docs/companion/EVIDENCE.md:124` | «Demuestra una falla de recuperación de la versión instalada **0.1.0**» | La misma corrida |
| `docs/companion/EVIDENCE.md:67` | Sección «Qué no se midió»: tokens, calidad de respuesta de un modelo, alucinaciones, comparación con terceros | — |
| `openspec/changes/archive/2026-09-13-measure-prepared-context-on-real-repositories/evidence/run-01/` | Los cuatro JSON crudos: preflight, un reporte por corpus y el agregado | 13 de septiembre de 2026 |

La causa observada está en la corrida anterior, no en una hipótesis: en Kubernetes la preparación indexó
**45 de 2654** fuentes, dejó 2608 no disponibles y reportó `entry-limit`; en CPython indexó 42 de 2753 y además
agotó el presupuesto de bytes durante la colección.

Entre esa medición y hoy se publicaron 0.2.x y 0.3.x. La versión publicada vigente es **0.3.2**
([release](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.3.2)).

## Insumos del benchmark, ya verificados

| Insumo | Identidad comprobada | Tamaño |
| --- | --- | --- |
| Protocolo congelado | `apps/companion/benchmarks/real-repositories/protocol.json`, SHA-256 `9c43e965…82e93`, precomprometido en `c808967c` | 20 preguntas, 2 corpora |
| `kubernetes/website` | Checkout en `d6e659c193bba313791e6ace4475a475093153f1`, subtree `content/en` | 795 MB |
| `python/cpython` | Checkout en `9bd9c7461dabddcd2688b0f14ce00722edbdfee3` | 190 MB |
| Instalador publicado 0.3.2 | SHA-256 `cab544dddd31a83fb86f744646cffcb2b1da346f950428c5c6a17b5931ac632e`, igual al `SHA256SUMS` de la release | 133 309 497 bytes |

Los dos checkouts viven fuera del repositorio, a propósito: el protocolo prohíbe versionar copias de los
repositorios externos. La aplicación **todavía no está instalada**; el arnés exige la instalada, no el árbol.

## El arnés, hoy

`verify-ui.mjs` y `verify-interface-contract.mjs` cambiaron con #142: recorren las pantallas nuevas, miden
cinco viewports reales —incluidos 582 × 377 y 464 × 475—, exigen que la barra final sea `sticky` fuera de
ventanas pequeñas y tienen 45 mutaciones, entre ellas una que quita esa adherencia. Existe además una prueba
sobre Electron real, `verify-native-clipboard.mjs`.

Lo que #166 llama «el arnés corregido» se escribió antes de #142, cuando esa corrección solo existía en
[#150](https://github.com/IgnacioBarEsp/project-engineering-os/issues/150), que sigue abierto. Parte de lo que
#150 propone ya está en `main`; el resto —recorrido de los seis perfiles, dos modos de movimiento,
`EVALUATION.md`— no. **Si el arnés de hoy detecta sobre `a3b1efd` lo que el anterior no veía es una pregunta
que se responde ejecutándolo**, y así está planteada en las tareas.

## Runners que fallan hoy, y por qué no se arreglan aquí

Medido el 20 de septiembre de 2026 sobre este repositorio:

| Comando | Salida | Causa |
| --- | --- | --- |
| `project-os sync --check` | código 2 | [#122](https://github.com/IgnacioBarEsp/project-engineering-os/issues/122) |
| `project-os doctor` | código 1, 4 FAIL: `profile.ui`, `profile.auth-security`, `profile.library-cli`, `github.project` | tres por [#115](https://github.com/IgnacioBarEsp/project-engineering-os/issues/115) |

`docs/SELF_APPLICATION.md` explica por qué algunos FAIL del doctor sobre este repositorio son esperados. El
handoff prohíbe arreglarlos de pasada, y de ahí la superficie que propone la [propuesta](proposal.md).

## El arranque documentado

`README.md` publica seis pasos: `npx create-project-engineering-os@0.5.0 bootstrap --target .`, `npm ci`,
`npm run openspec:init`, `npm run project-os:opsx:adapt`, `npm run project-os:check` y
`npm run project-os:doctor`. Se ejecutaron el 18 de septiembre con el paquete publicado y salieron los seis con
código 0 y cero FAIL en el doctor. **No existe hoy ninguna comprobación que lo repita**: si uno de los seis
dejara de funcionar, el repositorio no se enteraría.
