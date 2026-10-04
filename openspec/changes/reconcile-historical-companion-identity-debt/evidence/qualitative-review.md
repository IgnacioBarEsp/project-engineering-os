# Revisión cualitativa y decisiones de drift

Revisión documental realizada por el agente implementador. No es aceptación visual humana ni revisión independiente; ambas se identifican por separado cuando corresponden.

## Claridad y ownership

El documento de identidad abre con la diferencia entre corrección existente y trazabilidad pendiente; el inventario describe 37 registros iniciales, no defectos nuevos ni estado vivo. La tabla conserva fuentes fijadas a main, límites, seguimientos y prioridades estimadas. El registro operativo es el owner del estado actual; los assessments antiguos son inmutables; el CLI oficial captura y OpenSpec oficial archiva specs. No se crea motor paralelo, política consumidora o servicio de producto.

La aprobación humana se vincula al commit de la propuesta. Las validaciones de Inicio/paso 1/Archivos y los recorridos pendientes de ola 3 no se reaprueban ni simulan. El expediente nombra la pila no integrada. #206 permanece paraguas de los 36 restantes; #204 conserva su bloqueo de integración y no se inicia ola 4.

## Decisiones registradas

1. No matching difuso ni tercer candidato: el título anterior produjo otra identidad; resolver por ID exacto es una operación ya soportada. Categoría, severidad, excepción, issue y ocurrencias no cambian.
2. No reescritura del ensayo de 2026-09-12: números, commit, exclusiones y prueba de bypass son históricos. La nueva revisión es estática y no certifica instalación actual ni cada byte de paquetes presence-only.
3. La documentación upstream incluida en el paquete enlaza a los expedientes repo-only en GitHub. QA detectó enlaces relativos a archivos excluidos del paquete y se corrigieron sin ampliar `package.files` ni reducir su checker. La prueba de enlaces locales/alcanzabilidad valida el espejo del repo; no afirma que esos archivos nuevos ya estén en main antes del merge.
4. El primer ensayo negativo de reclasificación no alteraba la categoría porque ya tenía el valor elegido: el arnés falló, como debía. Se cambió a una mutación garantizada y las 12 detecciones finales están medidas en exercise.json, no deducidas de un timeout.
5. Recuperación preintegración selecciona una copia de baseline y conserva aparte el candidato rechazado. No se afirma reapertura posmerge oficial ni se deja un assessment de resolución activo con registro restaurado.

## Degradaciones declaradas

No se añade una degradación de runtime. El doctor upstream conserva los FAIL de perfiles auth-security, library-cli y ui ya registrados en el baseline de #115; no son PASS ni excepciones nuevas. El gate original verifica su conjunto exacto. El consumidor desechable se comprueba por separado con sus perfiles propios; no elimina los FAIL upstream.

No prueba nueva del instalador, proveedor, lector de pantalla, otra IA o reconstrucción npm. La auditoría de Companion sigue siendo un bloqueo externo de CI, no se trata como salud por tener checks documentales verdes.

El doctor del consumidor temporal devuelve 12 PASS, 0 FAIL, 4 WARN y 13 SKIP. Los WARN son `git.working-tree` (semillas/OPSX recién generados y aún no comprometidos), `debt.github`, `github.project` y `ci.execution` (el doctor no ejecuta esas operaciones externas). Se conservan en qa.json: no son nuevas fallas de producto ni prueba de acceso GitHub/CI/instalación real. El test fixture estático de cinco harnesses no autentica ni arranca los agentes de esos proveedores.

## Recuperación observada

Se revisó exercise.json: captura correcta, reintento byte-idéntico y convergencia desde assessment presente/registro anterior; candidato real con otro ID fue detectado y conservado. El baseline seleccionado tiene hash del registro original y `debt check` PASS (4/5 y tres flujos). Directorios temporales y assessments se retienen fuera del repo. Esto demuestra recuperación preintegración; no una reversión posmerge.
