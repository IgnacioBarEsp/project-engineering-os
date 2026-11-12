## Context and decision status

**Proposed, no Apply approval.** Main integrado9751c301976fe27e9bbad33e69f39372b69f901e.
Fuente #214 disponible3335cc70209b42dd7a6f41aced97b5c50a2f852d, aprobación013ac784 conservada.
Rama documental actual contiene el experimento rechazado; **no es la rama de producto a integrar**.
Después de aprobación se crea fuente de adopción desde la candidata214 identificada, se transporta
solo este expediente y se mantiene cada cambio/assessment con su owner. No copiar parches experimentales.

DoR13/13,0excepciones; OpenSpec local1.6.0. Ninguna aprobación histórica de viabilidad, cuatro recetas,
migración o zod aprueba este diseño. El owner debe aceptar esta revisión concreta antes de Apply.

## Frozen official input

| Campo | Valor |
| --- | --- |
| npm | 11.21.2 oficial, sin patch |
| gitHead | a97776b5453204b99d3b28ff676a5e00d5822770 |
| URL | https://registry.npmjs.org/npm/-/npm-11.21.2.tgz |
| SRI | sha512-7HPApk+AflMUavSseL1Pm6CnYqMIHk53x+KmuhqmTDqPkjPMgxIpTPcTqsE91EKNw4gFBJV9fnXiSdGm1DXq9A== |
| Publicado | 2026-11-04T22:39:06.269Z |
| Elegible7días | 2026-11-11T22:39:06.269Z |
| Tarball SHA256 | 8ad8563b81e71b90ef405b140bccf3ba9b5e7884ab210bd49ee4e2f4bc6f61f5 |
| Árbol completo | 5f3ed5146082cfcb794ebb8fe6c1d8cc58b336aec26e3df0f871823c1758ec82 |
| Archivos / bytes | 1944 / 12296462 |
| ZIP experimental | fef16d4e55a97a22965ab51dd6dc2b670274a4d303d48e6b1da1d0f7a29803ef / 4207812bytes |

El ZIP experimental proviene de dos sellados idénticos con el sellador actual y fflate0.8.3.
El build real vuelve a comparar sus bytes; no reutiliza ese resultado como instalador certificado.

Los144manifests con identidad coinciden con Arborist11.21.0 independiente. Otros40package.json contienen
solo `type` y, en dos casos, `sideEffects:false`: quedan en el inventario de1944archivos y atribuidos al
paquete padre, no ocultos. Configuración extra, manifest sin owner o discrepancia bloquean cobertura.
Los errores iniciales de ese clasificador se conservaron, sin modificar fuente para hacer verde el gate.

## Production allowlist and stop conditions

Producción propuesta:

1. `apps/companion/package.json`: dependencia npm11.21.2 e identidad app0.3.7, sin otros pins.
2. `apps/companion/package-lock.json`: identidad raíz de app y entrada/closure exclusivamente bajo
   `node_modules/npm`; conservar byte/valor de cada nodo ajeno. No un install libre que renueve todo.
3. `apps/companion/runtime/catalog.mjs`: solo identidad npm y allowlist compilada de distribuciones npm.
4. `apps/companion/runtime/distribution-identity.mjs`: nuevo contrato interno de identidad/selección,
   usando builtins y las guardas/operaciones propietarias existentes; sin dependencia nueva.
5. `apps/companion/runtime/manager.mjs`: rutas npm de planificación/verificación/instalación/selección/
   reparación. Node, Git y CodeGraph conservan contratos/pins y sus regresiones deben pasar.
6. `apps/companion/scripts/pack-app.mjs` y `verify-app-artifact.mjs`: únicamente evidencia/verificación
   de identidad/árbol npm en el artefacto; no relajar el extractor, el sellador o la allowlist.
7. `apps/companion/THIRD-PARTY-NOTICES.md` y documentación de la candidata, generadas/revisadas desde
   el closure real, sin presentar todavía una descarga nueva.

Se permiten pruebas QA, este expediente, evidencia y assessment propietario. La fuente214 se transporta
intacta: sus seis atributos zod, tests y assessment mantienen su trazabilidad. La separación de tareas
de cierre214 puede corregir el ciclo lógico de checklist archivo/merge, **sin marcar esas operaciones
como hechas antes de ejecutarlas**. Un cambio semántico de214 requiere su propia revisión.

Fuera de alcance: código npm/componentes, Node/Git/CodeGraph/OpenSpec/core, CI/política/excepciones,
generados OPSX, renderer/IPC, instalador NSIS o dependencias ajenas al closure npm.
Si hace falta modificar otra superficie de producción, detener y presentar la enmienda concreta.

## Identity, slots and trusted authority

Una identidad canónica incluye `channel` (official/derived), `version`, `source`, `treeHash` completo y
`recipeHash` null para oficial/no-null para derivado. Su digest incluye todos los campos, no solo versión.
Los datos de catálogo compilados son la autoridad; un recibo/selector editable no añade identidades,
fuentes, comandos o rutas autorizados. La única identidad habilitada en esta adopción es oficial11.21.2.

Slots inmutables por identidad, sin sobrescribir otro slot de igual versión nominal o prefijo.
Una colisión/reflexión de ruta falla cerrado. Recibo completo y árbol se comprueban antes de cada uso.
Slots/recibos históricos quedan conservados como historia, no se convierten a aptos por existencia.
Una futura identidad oficial/derivada debe fijarse y aprobarse tras los mismos gates; no rebase automático.
No hay descarga latest, canal dinámico ni elección de rutas desde renderer.

## Durable selection and migration

La selección interna conserva identidad activa, identidad previa y una generación segura. El esquema
es exacto/versionado y <=64KiB, con validación de tipos/claves, rutas canónicas, archivos normales sin
links/hardlinks y hashes completos. No es autenticación contra un escritor hostil del filesystem.

Bajo el lock propietario existente: comprobar generación de partida, preparar destino en staging,
verificar fuente/árbol/recibo, revalidar selección/identidad/destino y confirmar mediante escritura
comprobada con readback. No apuntar a staging o a un nombre flotante. Fallo/cancelación/stale conserva la
selección anterior y los slots; esa preservación nunca concede permiso para ejecutar un destino no apto.
Un fallo de confirmación deja estado explícito no verificado y retiene recuperación, no inventa éxito.

Sin selector previo, usar únicamente el default compilado verificado. La app nueva no ejecuta la vieja
instalación11.19.1 por conservarla. Recibos antiguos no autoritativos se conservan; el nuevo recibo de la
identidad nueva se crea después de verificarla, sin bendecir un árbol distinto.
Los demás runtimes y la configuración/historia de proyectos permanecen intactos.

El ensayo de crash actual retiene cuarentena y no activa bytes parciales, pero **no acredita recuperación
automática**. Apply debe fijar y comprobar el protocolo real de reinicio/recuperación antes de declarar
este gate pasado. No robar un lock por PID/edad solamente ni eliminar staging/cuarentena ajenos a una
operación demostrablemente propia. Si las guardas existentes no permiten demostrar recuperación dentro
de la allowlist, detener y presentar ese límite; no ampliar el código silenciosamente.

No existen dos distribuciones reales aptas, oficial y derivada. Las pruebas del estado soportan ambos
canales/igual-versión con fixtures etiquetados; las pruebas reales validan el oficial disponible y rechazo
del rollback vulnerable. No llamarlas switching real oficial→derivado→oficial. Un futuro segundo destino
debe superar su prueba real; no se distribuye un derivado de prueba para obtener un checkbox.

## Policy, advisories and preflight evidence

Auditor fijo independiente11.21.0/Node24.18.0:0high/critical,32moderate.
Undici6.29.1 supera58regresiones por runtime con seis fuentes idénticas al upstream8c57f6c y cubre cinco
avisos anteriores. Los32moderate restantes derivan de glob13.0.6 y minimatch10.2.5: sus avisos activos y
fuente quedan explícitos, sin declarar corrección ni explotación de Companion. La política actual no
bloquea moderate; no se añade excepción, override o cambio de severidad. Nuevos high/critical detienen.

Controles reales conservaron scripts/bin-links/workspaces off incluso ante config de proyecto hostil;
edad7/exclusión específica con la fixture original, registry y entorno aislados. El resultado inicial de
config tuvo una comparación incorrecta de slash final de URL; su reconciliación exacta se retiene sin
repetir comandos ni alterar raw. Timeout/cancelación/digest inválido fallaron con el runner original.
Las instalaciones de los cuatro locks reales dieron12/12 con hashes finales existentes bajo tres Node.

La copia experimental del runtime/su catálogo de prueba no sustituye el instalador, el catálogo final,
la selección durable o la revisión independiente nueva del diff de producto. No atribuir a esta candidata
la revisión de receta4 rechazada ni la revisión acotada de zod.

## Resource and operational cost

Workload idéntico de ingeniería en Windows/Node24.18.0, cliente publicado11.19.1 contra11.21.2:

| Operación | Baseline ms | Candidata ms | maxRSS raw baseline / candidata |
| --- | ---: | ---: | ---: |
| cold ci | 2684 | 2773 | 147672 / 152080 |
| warm ci | 2540 | 2748 | 157080 / 146832 |
| cache repair | 3057 | 3238 | 149440 / 150056 |

Muestra única, red no controlada estadísticamente, memoria como valor raw de Node.resourceUsage.
Los dos árboles conservan sus hashes; el baseline vulnerable no se habilita como rollback.
La candidata suma58564bytes de árbol. No se infiere un presupuesto universal de estos números.
Apply conserva límites actuales de proceso/output/archivo y mide el artefacto real; cualquier regresión
material o necesidad de relajar límites detiene el gate para decisión del owner.

Licencia raíz Artistic-2.0 y licencias/avisos de dependencias preservados, sin servicio/cuenta/costo externo.
La normalización de metadata no sustituye revisar los textos: qrcode-terminal usa la forma histórica
`licenses`, no se inventará una licencia a partir de un campo null. Actualizar notices desde lock/source.
Owner IgnacioBarEsp mantiene la pequeña capa de identidad/selección, no un fork indefinido de npm.

## Verification and protected integration

Antes de integrar: diff de closure y hashes, auditorías root/root-runtime/blueprint/Companion, grafo físico,
regresiones/controles negativos, tres Node y locks reales, instalación/reparación/restart/recursos del
artefacto final, QA/UI/mutaciones, core/fixtures/OpenSpec, revisión adversarial independiente y assessment.

La candidata de integración parte de214en3335cc7 y conserva sus bytes autorizados. No requiere cerrar214
para **preparar** esta spec: las dos correcciones son resultados del mismo head a integrar, no un
prerrequisito externo ficticiamente cerrado. Un PR conjunto contra main declara ambos alcances/specs,
pasa todo CI requerido y revisión final; solo entonces integra/cierra. #215 no se elimina: permanece draft
y solo se cierra como superseded después de la integración sustituta real. #207 y la pila UI se preservan.

Las tareas preparan entradas de archivo/PR, no marcan merge realizado. Archivo oficial solo cuando la
fase está completa de verdad, sin redefinir como PASS pruebas no ejecutadas. Investigación rechazada
permanece conservada y no se archiva incompleta. Ninguna automatización de este diseño publica por
existir un commit. Release/tag/artefacto canónico siguen el contrato protegido existente; guías mantienen
0.3.6 como descarga hasta validar la nueva release. No inician ola4.
