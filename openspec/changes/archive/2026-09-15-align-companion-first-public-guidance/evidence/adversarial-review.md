# Revisión adversarial — entrada pública Companion-first

Fecha: 15 de septiembre de 2026. Alcance: issue #116 y change
`align-companion-first-public-guidance`.

Esta es una autorrevisión adversarial separada de la escritura inicial; no se presenta como lectura en
frío con personas ni como revisión independiente. Contrasta propuesta, design, delta spec, diff, release
publicada, fuente de la app y pruebas negativas.

| Riesgo puesto a prueba | Resultado |
| --- | --- |
| Una pantalla de main se podría hacer pasar por la descarga 0.1.0. | Refutado: README, estado y registro de capturas dicen junto a la imagen que es renderer de `0c632a3`, no instalador; prueba negativa elimina ese límite y falla. |
| Companion-first podría ocultar la ruta reproducible de CLI. | Refutado: README conserva los comandos versionados y enlaza `CLI_GUIDE.md`; el test falla si falta esa ruta. |
| La publicación podría insinuar que Companion elimina npm, bootstrap o el núcleo. | Refutado por `REPOSITORY_MAP.md` y llamadas verificadas a `runBootstrapOrSync`; la guía distingue usuario de app y contribuidor. |
| El tono podría filtrar un producto, marca, datos o stack ajeno al núcleo universal. | Corregido durante la revisión: las referencias se generalizaron a «proyecto/producto de referencia». `check:neutrality` vuelve a pasar. |
| La captura podría incluir datos privados o ser una maqueta sin alcance. | Refutado: se inspeccionó la captura de fixture sintético, se publicó su SHA-256 y se declaró el entorno con capacidades nativas sustituidas. La segunda imagen del ensayo se excluyó porque contenía un nombre de fixture de seguridad poco apropiado para la portada. |
| Los enlaces locales podrían escapar del checkout o aceptar codificación inválida. | Refutado: `inspectPublicGuidance` rechaza traversal, URI malformada y rutas faltantes; pruebas negativas los ejercitan. |
| Una limpieza editorial podría borrar landing o evidencia aún viva. | Refutado: no hay borrados. El mapa deja `site/` y la landing anterior como activos hasta que #118 compruebe reemplazo y retiro. |
| El PNG podría no viajar en el paquete. | Refutado: `package.json` permite `docs/assets/*.png` y `npm run pack:verify` pasó como prueba de inclusión, no como release. |

## Veredicto

**PASS: 0 Blockers y 0 Majors abiertos.** La falta de lectura en frío y de comprobación de un instalador
nuevo no se cierra artificialmente: están declaradas como límites y quedan en la evidencia/UI de Companion
y en #117, no como deuda introducida por este cambio documental.
