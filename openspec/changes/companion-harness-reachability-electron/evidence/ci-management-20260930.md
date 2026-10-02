# CI final de gestión y decisiones humanas — 2026-09-30 (UTC−6)

## Ejecución terminada, no un estado intermedio

[Run 36809073279](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/36809073279)
terminó con **failure**. Head del PR #202:
`e456df8c3ca80da1c3b5245f67b4576651e3eb16`. Checkout medido por Electron:
`5709a08ffee23ba23f37a2c1306fcdbd9d940235` (merge sintético de GitHub, no merge a
main), árbol `78ed856c3fff815799c659dfa9cecccafe5575af`. El árbol coincide exactamente
con el del head e456df8, comprobado contra Git local y los metadatos remotos. No se
reescribe el commit propio de las capturas. El CI se ejecutó el 1 de octubre UTC,
todavía 30 de septiembre en la zona del mantenedor.

Resultados de jobs y steps leídos después de su finalización:

- Matriz raíz: los seis jobs de Ubuntu/macOS/Windows × Node 22.22.0/24.x, success.
- Auditoría raíz: success; distinta de la auditoría de Companion.
- Electron Windows: success. Artefacto completed=true, dirty=false, 18 pantallas,
  12 registros de portapapeles y failures=[], no instalador ni descarga de toolchain.
  Source SHA-256: `50923ce03792b6f96223566f9de351148067811428f9728a51238fd3e67b84ba`.
- Companion Ubuntu: comportamiento, perfiles/rutas/movimiento, contrato/mutaciones
  y landing, todos success. Auditoría de producción, failure.
- Companion macOS y Windows: failure por la auditoría; no atribuirles las pruebas
  de navegador exclusivas de Ubuntu.
- CI / required: failure cerrado, sin excepción ni modificación de protecciones.

Artefactos descargados una vez y leídos:

- `companion-browser-evidence`, id 11139193706.
- `companion-electron-evidence`, id 11138941113.
- Copia local: `C:/Users/RitualDesktop/AppData/Local/Temp/peos-wave3-ci-36809073279/`.

## Denominadores de los artefactos actuales

| Ámbito | Resultado observado |
| --- | --- |
| Matriz de perfiles | 72 recorridos + 8 suplementos, 534 pantallas, 0 errores |
| Wizard y controles | 28 recorridos, 168/168 pantallas, 1876/1876 controles, 56/56 copias, 0 problemas |
| Rutas declaradas | 20 rutas, 120 celdas, 16 negativos |
| Contrato | 46/46 mutaciones, construcción 1/1, 11 pantallas, 0 hallazgos |
| Wizard del contrato | 6 recorridos, 36 pantallas, 402/402 controles |
| Compatibilidad | completed=true, 22 casos; no inventar un campo failures ausente |
| Aislamiento | completed=true, 10 casos, failures=[] |

Son datos de CI, no nueva ejecución local ni revisión independiente del implementador.
La matriz usa renderer/servicio reales con límites nativos inyectados; rutas y contrato
usan respuestas fijas. Electron conserva su frontera de selector inyectado y datos
aislados. No se atribuye ejecución instalada, lectura humana o calidad de IA a estos
resultados.

## Bloqueo #204, sin reinstalar candidatas iguales

El log Ubuntu job 110199846871 termina `npm audit --omit=dev --audit-level=high` con
exit 1, 2 high y 1 moderate: las rutas son `node_modules/npm/node_modules/` de
brace-expansion, ip-address y undici. Los dist-tags oficiales consultados en este pase
siguen siendo next-11=11.21.0 y latest/next-12=12.2.0, ya probados en carpetas desechables.
No se repitieron instalaciones, se alteró npm, se cambió gestor o se redujo audit/protecciones.
[La decisión y pruebas anteriores de #204](https://github.com/IgnacioBarEsp/project-engineering-os/issues/204#issuecomment-5920758358)
permanecen vigentes. Esperar una distribución oficial realmente corregida.

## Evidencia humana recibida después de este CI

Integrada desde #149, sin tocar archivos de Companion:

- [Ronda final](../../companion-motion-loading-microcopy/evidence/final-reading-round.json):
  el mantenedor confirmó dos personas nuevas, sin exposición previa, orden Inicio/paso 1
  sin explicación y respuestas literales. No duplicar las seis respuestas ni simular
  unanimidad detallada. El texto/catálogo se mantiene idéntico a 7717195.
- [Decisión visual](../../companion-motion-loading-microcopy/evidence/maintainer-visual-closeout.md):
  Inicio aceptado explícitamente; Archivos condicionado a gestión primero ya implementada
  y probada. La aceptación principal de #148 conserva su propio registro y alcance.
- [Nombre nuevo de exportación](../../companion-motion-loading-microcopy/evidence/renamed-export-reading.json):
  una respuesta humana propia reconoce recopilar información de archivos para IA.
  No acreditar comprensión de todos los detalles de revisión/copia, transmisión automática
  o acceso de una IA a la carpeta. No exigir otra ronda de dos personas.

## Estado de cierre

Los checks de archivo se ejecutaron sin mutaciones, antes de integrar estas decisiones:
#144 14 PASS/2 FAIL; #145 y #146 12/4; #147 y #148 13/3; #149 y #150 12/4.
Eran snapshots de metadata, no permiso de archivo. Los checks se repiten tras actualizar
la evidencia. La revisión histórica independiente conserva exclusivamente su alcance;
la reorganización posterior requiere su propio pase. No marcarla aprobada por este informe.

Todos los issues #144–#150 y #204 siguen abiertos; PRs #196–#202 son borradores apilados.
Los primeros cuatro tienen CI / required success en sus heads, no aprobación automática
de sus gates manuales. Los últimos tres fallan por #204. Para integrar, preservar el orden
de la pila, los gates de cada change, el archivo oficial y la revalidación protegida en
su base final. No se archivó, fusionó, publicó o cerró ola 3; no se inició ola 4.
