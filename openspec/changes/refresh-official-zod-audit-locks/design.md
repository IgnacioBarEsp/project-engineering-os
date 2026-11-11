## Contexto y autoridad

Issue #214 enriquecido, Project3 Backlog, DoR pre-propose 13/13 sin excepciones. El change fue creado por CLI local OpenSpec1.6.0. La aprobación de esta revisión sigue pendiente. La autorización para preparar la spec no se registra como autorización de Apply.

La base integrada es `9751c301976fe27e9bbad33e69f39372b69f901e`. Root/blueprint fijan zod4.5.4/4.4.3; ambos fijan OpenSpec1.6.0 con rango zod `^4.0.17`. Auditorías nuevas: root exit1 (1high/1moderate), root-runtime exit0 (0), blueprint exit1 (1high). El high observado es GHSA-mrhx-c7xc-m3w5. No se ha demostrado explotación del producto.

## Artefacto y edición exactos

Candidata única: zod **4.6.6**, oficial npm, MIT, publicado2026-10-11T16:18:23.878Z; supera siete días. No declara engines propios. Declaración semver compatible; ejecución funcional pendiente.

- gitHead: `284243fb0d6532665afdc9239188773bb624f73c`.
- resolved: `https://registry.npmjs.org/zod/-/zod-4.6.6.tgz`.
- integrity: `sha512-4UmzQUF5fxvfcYHlbjBmejU+w+hbDnWFx4aS8kBx7nPBHcO2SqPbpAG8snbdg+Xse4pRefR98hgjFgIMCI/UhA==`.
- Registro consultado el2026-11-11T14:19:30Z. Latest4.6.7 no cambia la candidata fijada por esta propuesta.

Después de aprobar, editar esos tres atributos y sólo esos atributos en la entrada existente `packages["node_modules/zod"]` de los dos locks. No añadir dependencia directa, override o script. Un comparador estructural debe demostrar que, al retirar esas tres diferencias permitidas, cada lock equivale a su baseline; las demás propiedades de zod también son idénticas. Se conservan todos los nodos y el pin/integridad de OpenSpec. Si el artefacto exige otro grafo o no concuerda con la entrada propuesta, detener y revisar la spec.

La descarga/instalación oficial valida los bytes mediante la integridad fijada y el manifiesto/LICENSE reales. No se reconstruye ni parchea el paquete. Si cambian metadata, fuente o licencia, no sustituir silenciosamente la candidata. Es el cambio de una dependencia existente, sin nuevo servicio o licencia elegida; la verificación de licencia precede la adopción.

## Instalación y límites

Ensayo sólo en copias y temporales propios con HOME/cache/config/PATH controlados, shell desactivado y procesos acotados. Scripts/bin-links/workspaces desactivados en el preflight. Registry npm oficial, edad7 y exclusión existente de create-project-engineering-os intactos; no exclusión de zod. Cliente CI exacto11.19.1 y Node soportado se conservan. Un cliente local fijado distinto puede ser auditor auxiliar identificado, nunca se presenta como CI del cliente acordado.

`npm ci` debe aceptar los locks sin cambiarlos. Instalar/verificar root y una plantilla consumidor generada: el segundo caso comprueba el lock realmente distribuido, no una copia de node_modules del upstream. No usar módulos de otro checkout como prueba de compatibilidad nueva. El OpenSpec1.6.0 ya instalado en otro worktree sólo se reutilizó para crear/validar esta propuesta, con SHA registrado; después del Apply debe verificarse la instalación nueva local del candidato.

La comprobación de .bin del flujo normal mantiene las condiciones existentes de instalación/CI; el preflight con bin-links desactivado no se atribuye ese resultado. No cambiar CI para hacer coincidir el ensayo ni ejecutar instalación global en el host.

Presupuesto de esta alternativa: una versión oficial4.6.6. La matriz con runtimes distintos es verificación de compatibilidad, no autorización para encadenar otras versiones. Ante un fallo real, conservar raw y detener la adopción; sólo corregir instrumentación de un fallo demostrado de setup sin reinterpretar fallos del producto. La receta propia npm sigue4/4 agotada y no se toca.

## Pruebas y evidencia de salida

1. Diff estructural y hashes: exactamente seis atributos, dos entradas; resto de grafo, manifests, política y producción Companion intactos. Casos negativos de identidad/integridad inesperadas o drift adicional deben ser rechazados.
2. Instalación limpia y repetición de lock sin drift; auditoría raw root, root-runtime y consumer-blueprint con el evaluador original. Cero high/critical o excepciones nuevas. Moderates y fallos de red/parser se conservan, no se ocultan.
3. Regresiones acotadas basadas en la [corrección upstream a0ebf970](https://github.com/colinhacks/zod/commit/a0ebf970f2d752e5f58527cd2942ff48be4f46bd): array/map/set con límite superior inicial deben rechazar un contenedor sobredimensionado antes de visitar cada elemento; comprobar rechazo, contador de visitas y número de issues. Incluir máximo, longitud/tamaño exactos, anidamiento y tipos incorrectos. Controles válidos dentro del límite deben aceptarse. Una transformación que precede al límite conserva su semántica. Cubrir la ruta compilada si está expuesta por la versión instalada. Sin límite superior no se promete protección global contra agotamiento de recursos.
4. Contraste funcional con los baseline existentes en un proceso separado, sin hacer OOM: máximo10000 elementos por contenedor, heap128MiB, timeout10s, salida limitada. El criterio es la propiedad observada, no provocar un crash ni medir una mejora de producción no demostrada. Si la versión no expone una API planeada, registrar el límite y revisar la cobertura antes de aprobar salida.
5. OpenSpec1.6.0 de la instalación nueva: versión, strict, init/update en consumidor desechable; cinco harnesses/OPSX/sync/idempotencia/doctor y tarball fixtures existentes. Mantener FAIL/SKIP justificados del upstream; no modificar sus baselines por este cambio.
6. `npm run check`, fixture normal y aislada, auditorías y política de instalación existentes. CI actual: Windows/Linux/macOS con Node22.22.0 y24.x; comprobación local adicional24.18.0 y24.20.0 cuando esté disponible como runtime propio. No fingir resultados de otra versión o plataforma.
7. Revisión adversarial independiente sobre diff final y evaluación de deuda; recuperación demostrada. Archive readiness real, archivo oficial y protected PR con `CI / required` verde sobre SHA/base actuales.

No se incluyen código o tests de Apply en esta propuesta. La lista se convertirá en evidencia sólo tras ejecutar. Si #204 mantiene rojo el agregado, #214 conserva su progreso propio sin merge prematuro.

## Recuperación, ownership y coordinación

Los locks/versiones y hashes anteriores se retienen en brownfield y artefactos. Antes de integración, descartar adopción y verificar baseline en copia limpia; no deshacer cambios de terceros o borrar node_modules del usuario. Después, un revert por PR protegido restaura ambos locks como unidad y repite controles, conservando deuda y logs. Restaurar un baseline afectado no lo vuelve una versión segura.

Owner IgnacioBarEsp mantiene la actualización de dependencia bajo MIT; no fork nuevo. #208 cerrado por retiro de aviso permanece histórico; #204 y #206 son independientes. La pila196→197→198→199→200→201→202 conserva orden; el fix de auditoría se revisa en PR propio, no se introduce dentro de207. No repetir lecturas o aceptación visual humanas ya recibidas. No ola4.
