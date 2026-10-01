# Validación de #146

Fecha: 2026-09-26. Código en worktree aislado; no se usaron proyectos reales del usuario. Repetición final sobre el árbol inmóvil de `c43c5ab`.

| Comprobación | Resultado |
| --- | --- |
| OpenSpec 1.6.0 strict | PASS antes de implementar y al revisar la spec actualizada. |
| Companion | PASS 161/161; incluye borrador, corrupción, carpeta movida, validación cerrada y preview exacto. |
| Flujo por categorías | PASS 12 recorridos (seis perfiles × dos vías), ida/vuelta con tecnología y dos IA, modos libre/estructurado, carpeta preparada y reapertura. |
| UI general | PASS final: 20 recorridos, 100 pantallas, 1000/1000 controles y 40/40 copias exactas; siete variantes de proyecto con lectura, citas, exclusiones, recuperación y duplicado. |
| Mutaciones | PASS final: 46/46, construcción 1/1, 306/306 controles en 30 pantallas; éxito, rechazo, transporte roto y éxito seguido de rechazo para ambas copias. |
| Electron 44 real | PASS cierre inmediatamente tras escribir, reapertura con texto exacto, rechazo de cierre si falla el guardado, originales intactos y cero errores. |
| Repositorio | PASS final `npm run check`: 391/391, paquete, neutralidad, documentación, workflows, deuda y doctor upstream. Las ejecuciones anteriores durante edición detectaron el import retirado (corregido) y divergencia de exportación por cambios concurrentes; no se contaron como PASS. |
| Revisión visual propia | Capturas reales de Tu proyecto a 1180×820 y Preparar a 1040×700 inspeccionadas por el implementador. No sustituye la aprobación del mantenedor. |

Reproducir desde la raíz:

```sh
npm --prefix apps/companion test
npm --prefix apps/companion run test:ui
npm --prefix apps/companion run evidence:contract
npm --prefix apps/companion run runtime:install
npm --prefix apps/companion run evidence:draft-close
npm run check
node node_modules/@fission-ai/openspec/bin/openspec.js validate companion-single-preparation-flow --strict --no-interactive
```

Los recorridos de navegador usan renderer/motores reales y sustituyen picker, IPC, clipboard y apertura externa. La prueba Electron usa IPC real, cierre real y datos temporales; solo sustituye el selector nativo por la carpeta de prueba. No acredita el instalador ni distribución multiplataforma (#150).

No se archiva ni fusiona mientras falten los gates humanos/independientes y las dependencias #144/#145. Rollback: revertir el PR; los recibos previos se leen sin migrar y el borrador app-owned puede conservarse sin afectar proyectos.
