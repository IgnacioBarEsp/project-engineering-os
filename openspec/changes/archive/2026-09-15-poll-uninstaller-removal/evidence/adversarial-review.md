# Revisión adversarial — poll-uninstaller-removal

Origen: revisión por un agente independiente del diff en dos rondas, no es revisión humana. Ronda 1 sobre
la implementación de `waitForRemoval` en `disposable-cleanup.mjs` y su invocación en `verify-release-installation.mjs`;
ronda 2 sobre las aserciones de QA en `packaging.mjs`, notas de versión 0.2.3 y controles de raíz. Ambas solo lectura.

## Dictamen

**PASS CON HUECOS**. Cero Blockers y cero Majors.
La solución implementada satisface rigurosamente los requerimientos:
1. `waitForRemoval` sondea la presencia del target de forma no bloqueante con presupuesto definido (60 s en release, 500 ms de intervalo) antes de dar por fallida la desinstalación.
2. Si el worker de NSIS termina la eliminación dentro del presupuesto, el retorno es `true` y la aserción pasa limpiamente.
3. Si el directorio persiste tras vencer el presupuesto, retorna `false` y la aserción falla de forma determinista con mensaje explicativo.
4. La nueva identidad `0.2.3` está sincronizada coherentemente en `package.json`, `package-lock.json`, `THIRD-PARTY-NOTICES.md`, `RELEASE_NOTES_0.2.3.md`, `packaging.mjs`, `verify-release-installation.mjs` y el ejemplo en el workflow de release.
5. Los tags `companion-v0.2.0`, `companion-v0.2.1` y `companion-v0.2.2` permanecen intactos como intentos inmutables en GitHub sin releases asociadas.

## Hallazgos y destino

| # | Severidad | Hallazgo | Destino |
| --- | --- | --- | --- |
| 1 | Minor | El presupuesto de sondeo en el arnés es de 60 segundos con intervalos de 500 ms; si la desinstalación demora más por carga de I/O en GitHub Actions, fallaría por timeout. | Aceptado: 60 s es tiempo suficiente para remover la carpeta del programa (~250 MB) en un runner desechable; si demora más, es indicio de anomalía en el runner. |
| 2 | Info | El proceso padre de NSIS termina inmediatamente con exit code 0 al delegar en `Au_.exe`, por lo que el exit code no garantiza la finalización del borrado. | Saneado: `waitForRemoval` monitorea el estado del sistema de archivos directamente sobre el directorio de instalación. |
| 3 | Info | El tag `companion-v0.2.2` permanece como intento fallido inmutable sin release en GitHub; `companion-v0.2.3` sólo se cortará tras integración en `main` protegido. | Conforme con `AGENTS.md` y la política de tags inmutables. |

## Comprobaciones realizadas

- `apps/companion/qa/packaging.mjs`: 139/139 tests pasando (incluyendo 3 nuevas pruebas unitarias para `waitForRemoval`).
- `npm run check`: 326/326 tests pasando, sin violaciones de neutralidad ni derivas de documentación.
