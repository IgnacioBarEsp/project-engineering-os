# Revisión adversarial — companion-0-3-2-hotfix-actions-bar-clipboard

Dos rondas, las dos hechas por agentes. Según [CONTRIBUTING.md](../../../../CONTRIBUTING.md), la revisión de
un agente sobre su propio trabajo no es revisión humana ni independiente, y ninguna de estas lo es. La
integración sigue la delegación explícita del mantenedor ([decisiones](maintainer-decisions.md)).

| Ronda | Quién | Contexto | Alcance |
| --- | --- | --- | --- |
| 1 | El agente que implementó (Claude Opus 5, Claude Code), con la skill `code-review` en esfuerzo alto | La misma sesión del apply: **no es contexto limpio** | Diff de `a3b1efd..f0534e8`, leído hunk a hunk contra el código que rodea cada cambio |
| 2 | Un agente revisor sin la conversación del apply, lanzado a petición del mantenedor | Contexto limpio: solo el repositorio y las instrucciones de revisión | Pendiente |

## Ronda 1

Sin fallos funcionales en el código de producción. Los seis hallazgos son afirmaciones inexactas o puntos
frágiles de los harness.

| # | Severidad | Hallazgo | Resolución |
| --- | --- | --- | --- |
| 1 | Major | TLDR, propuesta, diseño y tareas seguían diciendo que el change se detuvo antes del apply y que no se implementó nada. Archivado así, el registro permanente sería falso. | Corregido: [TLDR](../TLDR.md), «Handoff boundary» y «Non-goals» de la [propuesta](../proposal.md), «Migration Plan» y «Open Questions» del [diseño](../design.md). La línea final de [tasks](../tasks.md) se sustituye al marcar las tareas con su evidencia. |
| 2 | Minor | Las [notas de 0.3.2](../../../../apps/companion/RELEASE_NOTES_0.3.2.md) decían que «se pulsó cada control». Cada control se comprobó con `elementFromPoint` en su centro y solo se pulsaron algunos. También atribuían a una sola causa que el harness anterior no viera el defecto, y fueron dos. | Corregido: dicen qué se comprobó en cada control, qué se pulsó y las dos causas (movimiento reducido y la ruta de revisión heredada después de los dos primeros pasos, comprobada en `verify-ui.mjs` de `a3b1efd`). |
| 3 | Minor | [PROJECT_STATUS](../../../../docs/PROJECT_STATUS.md) atribuía al issue #142 los cinco defectos, y el de Visión y el del prompt aparecieron durante el apply. | Corregido: los tres del issue van primero y los dos últimos constan como encontrados durante la corrección. |
| 4 | Minor | La [spec](../specs/companion-experience/spec.md) exigía sticky sin excepción y el CSS deja la barra estática en ventanas de hasta 500 px de alto o 380 px de ancho. | Corregido en la spec, con requisito y escenario de ventana pequeña, y en la decisión 1 del [diseño](../design.md). La medición es [narrow-windows.json](after/narrow-windows.json). |
| 5 | Minor | `verify-native-clipboard.mjs` solo guardaba y restauraba texto: una imagen del portapapeles se perdía y el registro decía `previousClipboardTextRestored: true`. | Corregido: guarda todos los formatos en memoria del proceso principal, los restaura con `clipboard.write` y solo registra `restored: true` si vuelven los mismos formatos y el mismo texto. Probado en Electron 44.1.1 con una imagen puesta desde Windows: volvieron los cuatro formatos con los mismos bytes y Windows leyó la misma imagen. |
| 6 | Minor | En `verify-interface-contract.mjs` la etiqueta del botón se leía después de otras tres lecturas y compite con el temporizador de 2 s que la revierte. En un runner lento sería un fallo falso. | Corregido: una sola lectura en la página justo después de que termine la copia. |

## Ronda 2

Pendiente.
