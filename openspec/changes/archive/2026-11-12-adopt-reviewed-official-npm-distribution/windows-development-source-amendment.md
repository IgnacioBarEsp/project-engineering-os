# #204 — origen de desarrollo de Windows: enmienda para revisión

**Revisión f3b4ff2 aprobada; Apply acotado en curso.**
[Registro literal de aprobación](evidence/windows-source-approval.md). El estado histórico de propuesta
se conserva en la revisión aprobada; los resultados e integración siguen pendientes de evidencia real.
La aprobación8d335a2 sigue resuelta y su implementación está en f4db025/PR216. Esta decisión adicional
corresponde únicamente al inventario de origen de desarrollo que la CI mostró después.

## Hallazgo real

CI43250487942, head f4db025, pasó los seis jobs de núcleo, dependency-audit y Companion macOS/Linux.
Companion Windows falló en RUNTIME_INTEGRITY y el requerido quedó rojo: no hay permiso para integrar.
El cliente CI11.19.1 hace `npm ci --ignore-scripts` con bin-links predeterminado. Una reproducción propia
de esa instalación produjo1971archivos/12310469bytes, árbol
`0f120c619c47eefed87e1c6cbd433a31e472893862272b41d6a74977dc889dc5`.

La comparación completa encontró **cero archivos oficiales cambiados o ausentes**, más27lanzadores
locales en `node_modules/.bin/`. El npm oficial sigue siendo11.21.2, mismo SRI/gitHead,144paquetes.
El origen sin esos auxiliares sigue siendo exactamente1944archivos/12296462bytes, árbol
`5f3ed5146082cfcb794ebb8fe6c1d8cc58b336aec26e3df0f871823c1758ec82`.

La spec original detenía diferencias de inventario; no contemplaba aceptar este origen con auxiliares.
No se reinterpretó ese fallo como PASS ni se cambió CI, política o pin para ocultarlo.

## Ajuste exacto propuesto

1. Añadir una operación interna en `runtime/distribution-identity.mjs` para inventariar por completo el
   origen de desarrollo y preparar una **copia canónica nueva**, sin editar el original. Su única
   excepción de forma será el conjunto vacío o el conjunto completo de27rutas de la tabla siguiente.
2. Las27entradas serán archivos regulares sin links/hardlinks, <=16384bytes cada uno, sin carpetas
   anidadas. Se inventarían y conservarían ruta/tamaño/hash; nunca se copiarían, ejecutarían o usarían
   como autoridad. Un nombre ajeno, conjunto parcial, tipo inseguro o exceso de límite se rechazará.
3. Fuera de ese conjunto, conservar **todos** los bytes. La copia canónica debe confirmar el mismo
   árbol oficial5f3ed514,1944archivos y12296462bytes. Cualquier cambio/omisión/extra en sus archivos
   se rechaza. Revalidar el origen antes/después; no se exige confiar en el contenido de un auxiliar
   excluido para ejecutar npm, porque solo se ejecuta la copia completa verificada.
4. Usar la operación exclusivamente en la ruta de copia **de desarrollo** de `manager.mjs` y antes
   de sellar en `scripts/pack-app.mjs`. La ruta empaquetada sigue extrayendo y verificando el ZIP
   completo como antes. `verify-app-artifact.mjs` contrastará identidad, inventarios declarados,
   archivo sellado y árbol oficial sin reducir ninguna comprobación existente.
5. Mantener catálogo, SRI/gitHead, versión0.3.7, todos los demás pins, CI/.npmrc/política/guardas y los
   scripts/bin-links/workspaces desactivados de las operaciones de proyectos. No cambiar npm source,
   extractor, sellador, renderer/IPC, NSIS o gestores. No normalizar una versión futura automáticamente.

| Nombre base | Únicas formas permitidas bajo `node_modules/.bin/` |
| --- | --- |
| arborist | arborist, arborist.cmd, arborist.ps1 |
| cssesc | cssesc, cssesc.cmd, cssesc.ps1 |
| installed-package-contents | installed-package-contents, installed-package-contents.cmd, installed-package-contents.ps1 |
| node-gyp | node-gyp, node-gyp.cmd, node-gyp.ps1 |
| node-which | node-which, node-which.cmd, node-which.ps1 |
| nopt | nopt, nopt.cmd, nopt.ps1 |
| pacote | pacote, pacote.cmd, pacote.ps1 |
| qrcode-terminal | qrcode-terminal, qrcode-terminal.cmd, qrcode-terminal.ps1 |
| semver | semver, semver.cmd, semver.ps1 |

No ruta mutable, nombre libre, exclusión genérica `.bin` o filtro de archivos distintos de estas27
rutas podrá conceder aceptación. El árbol de destino oficial continúa siendo la autoridad final.

## Evidencia preparada y lo que falta

Un prototipo desechable, **sin Apply ni ejecución del npm resultante**, copió el origen CI excluyendo
los auxiliares inventariados y produjo el árbol oficial exacto. Rechazó un lanzador desconocido y una
alteración JS oficial; el origen original conservó su hash. El prototipo no implementa todavía en el
producto el esquema completo vacío/27 ni todos los negativos de tipos, set parcial o concurrencia;
son obligaciones de Apply, no PASS anticipados.

Managed target: `C:/Users/RitualDesktop/.codex/worktrees/204-official-npm-adoption/project-engineering-os`,
`artifacts/adoption204/ci-equivalent-install-result.json`, SHA256
`a7605e9bf311e7e11eb8876b1b4e332a7749867c44e21886a6910ffd9adb43cf`;
`development-shims-prototype-result.json`, SHA256
`3bc768761ed3b3091084f4e7ff97b884bfa4ccb92f0847064e2675ef04cde0ad`.

Tras aprobación: implementar solo en esos archivos y QA; probar origen canónico y origen CI real,
auxiliares conocidos/desconocidos/parciales, fuente alterada, links/hardlinks, límites/cancelación y
concurrencia; comparar dos sellados idénticos y el artefacto real. Registrar costo de copia temporal
(~12.3MB) e inventarios adicionales en desarrollo/empaquetado; no alterar límites para obtener verde.
El usuario instalado usa el ZIP canónico, no los auxiliares locales.

Esta nueva frontera de entrada requiere **una investigación y revisión independientes acotadas nuevas**
de la normalización; la revisión previa de selección/recuperación se conserva y no se reaprovecha como
aprobación del código todavía inexistente. La aprobación de esta enmienda autorizaría expresamente ese
ciclo adicional. No reinicia el presupuesto histórico4/4 ni añade un quinto parche de npm: los bytes
upstream y el árbol oficial se conservan intactos.

Conservar los fallos originales y continuar todos los gates pendientes: artefacto/instalador,
recuperación/recursos, deuda, archivo oficial y PR protegido con CI requerido verde. #215 no se cierra
antes de integración sustituta real. No release/merge/cierre de ola3 por este documento; no ola4.
