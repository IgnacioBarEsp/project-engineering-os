# Diagnóstico e978 — resultado y causa próxima observada

**DIAGNOSTIC_ONLY / cualificación bloqueada.** Aprobación e978 registrada en
[el recibo](recovery-diagnostic-approval-e978.md). Se preparó una sola copia
observada y se ejecutó una vez; no se aplicó un arreglo de producto o de QA original.

## Resultado real

- Preparación:2145ms.221archivos de app versionados; solo el QA de la copia cambia.
- Invocación:178799ms,1PASS/1CANCELLED,0SKIP,exit1 del runner.
- El driver terminó0 por colección completa; NO significa testPASS.
-98eventos/72752bytes de traza, sin errores de parsing; límites90s/caso,
  240sproceso,180spreparación y1MiB conservados. Sin watchdog o kill externo global.
- Código y QA de la copia iguales a su freeze al terminar. QA original del worktree
  sigue6382307b3a4acb0e57a931c0afe95ad35a0478ef1829c262c5a58039ba54d1cf.
- Postcheck:sin procesos Node/Electron propios restantes; HOME solo contiene AppData.
  No se tocó q218s/npm-identity-53PS3B ni el checkout del mantenedor.

| Caso | Resultado observado |
| --- | --- |
| Reparación interrumpida,restauración de cuarentena y proyecto/history | PASS87232.1756ms |
| Tres interrupciones de publicación/selector/confirmación agrupadas | CANCELLED91384.4647ms por límite90000ms |

## Hechos y causa próxima

La primera instalación tomó33.539s y la reparación final33.041s. El hijo alcanzó
la cuarentena,salió y el restart continuó; ese caso no quedó bloqueado esperando
exit. Pasó todas sus aserciones en esta copia, con solo2.768s de margen.

En el segundo caso,las dos primeras iteraciones consumieron64.535s. La tercera
arrancó con25.465s restantes de su plazo global90s. Su publicación se observó
a las10:07:32.682UTC, después del timeout10:07:31.896UTC. La prueba agrupa tres
operaciones completas bajo el mismo90s; esto explica la cancelación observada.
No demuestra por qué el host es más lento ni que todos los fallos previos tengan
idéntica causa.

Además,el cleanup del último root empezó10:07:32.831UTC mientras su hijo seguía
activo; el hijo salió10:07:33.031UTC. El cuerpo cancelado todavía ejecutó el
restart después de esa salida. El fixture original registra rm(root) pero no
posee/cierra los hijos antes de borrar,ni impide continuar tras cancelación.
Hay una carrera de ciclo de vida del harness respaldada por fuente y traza.

No hay evento npm-confirmed para el tercer hijo. Su exit1 solo no prueba que
alcanzara el punto de inyección solicitado. No se atribuye un mensaje de error
específico:el stderr del hijo quedó en la variable local de la prueba original.

## Interpretación y límites

El marcador de traza test:abort representa TestContext.signal,que también se
observó al finalizar el primer caso PASS. No clasificarlo por sí solo como fallo;
manda el TAP real. Los spans que terminan por SIGKILL no demuestran deadlock.

El cleanup original se conservó y borró los roots propios al finalizar.
Se retuvieron snapshots acotados de journal/selector y nombres/fases en la traza,
NO todos los árboles físicos de payload. No se afirma conservación física completa
de raíces ni cumplimiento de ese extremo del protocolo. No se reejecutó para
obtenerlo. Los datos retenidos bastan para los hechos de tiempo/orden anteriores;
no cualifican recuperación instalada,power-loss,datos del usuario o seguridad global.

D812 y los dos full-suite FAIL siguen intactos. No más diagnósticos o variantes
bajo e978. Builds0/2 y mismaVM0/1 no iniciados. Siguiente propuesta:
[corrección acotada del ciclo de vida de QA](../recovery-qa-lifecycle-amendment.md),
todavía sin aprobación o Apply.

## Artefactos originales

Standalone targetPath del worktree de ola3,storage persistent,
prefijo artifacts/wave3-current/recovery-diagnostic-e978/:

| Archivo | SHA256 |
| --- | --- |
| approval.json | db739f4ee4ecac7ee3cfc2f5b6518c0f97d57cc1cea5fcbad9892ad006d03e00 |
| frozen.json | 5a0258c1d29d5e47cf0eebf6aa90b7a526bf665aebf0a661241d76f4db2a6b8c |
| instrumentation.patch | 28e14aaefb95be18f6d3195341950df1f08cfb34fe2fa57a2e38c2113f2276d6 |
| result.json | 31a1431ea86937f8102bf79d6f555ce79e3227f9fe919690ad24d57120cfaca5 |
| stdout.tap | bf9a2551a95e3ff4768ccc5535439c981a03f9892592f942c43ebdec06798046 |
| trace.jsonl | fa976d86459e0ac886b0500e621b3f2565fcf10f7a0618800a06f442f3346975 |
| analysis.json | e37e388c71c4e93a5fca5bb7aeba82edeaf43b23f063fa322aad75b0c08b8e5d |
| postchecks-processes-home.json | d228625b6c784cba302655804b4617226fcde38986fbf5ad913af9eebba01ca5 |
