# Revisión adversarial — harden-release-install-cleanup

Origen: revisión por un agente independiente del diff en dos rondas, no es revisión humana. Ronda 1 sobre
la implementación del módulo `disposable-cleanup.mjs` y actualización de `verify-release-installation.mjs`;
ronda 2 sobre las aserciones de QA en `packaging.mjs`, notas de versión 0.2.2 y controles de raíz. Ambas solo lectura.

## Dictamen

**PASS CON HUECOS**. Cero Blockers y cero Majors.
La solución implementada satisface rigurosamente los requerimientos:
1. El cleanup del root desechable tolera locks transitorios de NSIS reintentando hasta 10 veces contra `EBUSY`/`EPERM`.
2. Un lock persistente se reporta explícitamente (`status: 'locked'`) en consola y en `cleanup.json`, sin fallar la medición ni enmascarar su veredicto.
3. El error de medición del cuerpo se preserva en `measurementError` y se relanza sin modificaciones después del cleanup.
4. Si `root` no está dentro de `temporaryBase`, el módulo rechaza la operación inmediatamente.
5. La nueva identidad `0.2.2` está sincronizada coherentemente en `package.json`, `package-lock.json`, `THIRD-PARTY-NOTICES.md`, `RELEASE_NOTES_0.2.2.md`, `packaging.mjs`, `verify-release-installation.mjs` y el ejemplo en el workflow de release.

## Hallazgos y destino

| # | Severidad | Hallazgo | Destino |
| --- | --- | --- | --- |
| 1 | Minor | El retardo entre reintentos por defecto en `disposable-cleanup.mjs` es de 3000 ms; si un lock transitorio persiste 10 intentos, añade hasta 30 s al cleanup final del runner en el peor de los casos. | Aceptado: el runner tiene un timeout de 45 minutos y la prioridad es evitar falsos negativos por carreras de desinstalación de NSIS. |
| 2 | Minor | En caso de que el desinstalador de NSIS termine antes de la desinstalación silenciosa completa (`/S`), NSIS podría retornar 0 antes de soltar handles temporales. | Saneado: `removeDisposableRoot` reintenta y captura explícitamente `EBUSY`/`EPERM`. |
| 3 | Info | El tag `companion-v0.2.1` permanece como intento fallido inmutable sin release en GitHub; `companion-v0.2.2` sólo se cortará tras integración en `main` protegido. | Conforme con `AGENTS.md` y la política de tags inmutables. |
| 4 | Info | La eliminación de archivos temporales efímeros en un runner que se destruye al terminar es una cortesía del arnés, no un requisito funcional del producto instalado. | Documentado: `status: 'locked'` declara el lock en evidencia y concluye el paso con éxito. |

## Comprobaciones realizadas

- `apps/companion/qa/packaging.mjs`: 136/136 tests pasando (incluyendo 5 nuevas pruebas unitarias y de comportamiento para `removeDisposableRoot` y preservación de errores).
- `npm run check`: 326/326 tests pasando, sin violaciones de neutralidad ni derivas de documentación.
