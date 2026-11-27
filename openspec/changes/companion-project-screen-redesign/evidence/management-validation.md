# Verificación de gestión primero — 2026-09-30

Spec/ADR documentados tras la aprobación literal, antes de modificar renderer o probes.
DoR read-only de #148: 13 PASS/0 FAIL, exit 0. OpenSpec local fijo 1.6.0: strict exit 0.

Pase observado en el árbol de #148:

- QA de gestión/navegación/lenguaje: 15/15, exit 0.
- Companion completo: 210/210, exit 0 (este padre aún no contiene las pruebas de #149/#150).
- Matriz real navegador/servicio: 32 pantallas, cuatro anchos y ambos movimientos,
  nombres/motivos de todos los pasos iguales a los del servicio, operaciones sin duplicar
  al expandir, guía IA plegada inicialmente, foco visible al volver a preparación, cinco
  originales intactos, cero errores, exit 0. Conserva las fronteras de skeleton/timeout.

## Integración posterior en #150

- Renderer #149 integrado conservando fondo y movimiento; callback de foco diferido.
- Companion completo: 224/224, exit 0, en a39a95e (antes de ampliar el ensayo de gestión;
  ese suplemento cambia únicamente scripts de pruebas, no el renderer).
- Contrato en copia del renderer: 46/46 mutaciones detectadas por su propiedad, construcción
  1/1, 11 pantallas, 402/402 controles del wizard y cero hallazgos, exit 0.
- Rutas: 20 rutas, 120 celdas, 16 negativos, exit 0. Conserva los denominadores originales.
- Matriz real final: 32 pantallas, 8 celdas de Archivos/copia, 5 originales intactos y cero
  errores, exit 0. También recorre los controles de gestión desde el detalle: revisar conserva
  personal/organization y objetivo; cancelar selector no sale de preparación; reutilizar
  conserva respuestas y no aplica ni copia archivos; quitar/cancelar historial conserva el
  recibo y el original. Ensayo adicional en 202189c, con picker/clipboard inyectados.
- Electron real de fuente a39a95e: 18 capturas, 12 copias y cero errores, exit 0, datos locales
  aislados. Cubre Inicio/wizard/final; no se atribuye a él la prueba del detalle hecha en
  navegador. Digest de ese árbol registrado en electron-evidence.json:
  d762fd2f8e2758cff33a940fe625094940328b89f4060d43dea0b17e3222005b.
- Raíz npm run check: 391/391, exit 0, en df517b3; no se renombra ese resultado como ejecución
  del commit final. Bin/src/blueprint/schema/README/docs de core no cambiaron en este delta;
  la CI protegida repetirá la validación final.
- Recorrido completo de UI reorganizada v3: proceso terminado con exit 0, incluidos los
  suplementos de rutas, compatibilidad de perfiles y aislamiento del wizard. 28 recorridos,
  168 pantallas del wizard, 1876/1876 controles alcanzables y 56/56 copias exactas; 57 pantallas
  de las siete variantes, 1550 definiciones sin desajustes y cero hallazgos. Renderer/servicio
  reales en navegador con superficies nativas/proveedor inyectados; no es instalación.
  Producto y scripts del recorrido/contrato permanecen idénticos a a39a95e; los commits
  posteriores solo añaden el ensayo de gestión y documentación.

Artefactos locales: peos-management-contract-v2, peos-project-management-final-v5,
peos-management-electron-v1 y peos-management-ui-v3. Captura mostrada y respuesta humana
registradas por separado en management-visual-acceptance.md. No es instalación publicada.

Revisión propia: mismo catálogo y API cerrados, texto local sin HTML, sin dependencia o
capacidad nueva de archivos. La duplicación desde el detalle debe pasar perfil/enfoque
normalizados como lo hace la fila; se añadieron esos metadatos para no caer en el perfil
predeterminado. No añade copia de carpeta. Una navegación plegada no puede dejar foco en
un botón oculto; al cerrar estando en una herramienta vuelve a preparación, y un evento
de un nodo desprendido no puede cambiar el proyecto vigente. Mientras hay trabajo activo
no se permite ese cierre. La reentrada directa abre el selector. Recuperación y eliminación
del historial mantienen sus confirmaciones y protección de cambios posteriores.

Los pasos locales y los opcionales conservan la lista .guide y todos sus controles para que
GUIDE siga observándolos, incluidos los descendientes del desplegable. El harness abre los
summary con clics reales para comprobar controles plegados; no fuerza detalles.open ni
acredita un control invisible como alcanzable. Se conservan los negativos originales.

Intentos fallidos conservados: UI v1 intentaba pulsar review-stack sin abrir details. UI v2
registró la ausencia de definición de Recetas en algunas pantallas antes del suplemento.
Contrato v1 detectó esa misma ausencia, revisión de tecnología no alcanzada por el harness y
un negativo obsoleto: insertar OpenSpec en Inicio ya no provoca falta de definición porque
Inicio tiene su control de definición. Ahora ese mismo negativo convierte el control real
del beneficio en prosa sin definición, conservando el término y su criterio. Ningún timeout
cuenta como detección. Matriz final-v4 falló al buscar un heading exacto que incluye el nombre
de la acción de fila; final-v5 identifica el nombre propio .card-name y mide la misma operación.
La definición de recetas se añadió al menú opcional y las pruebas abren sus summary reales;
no se eliminaron propiedades, mutaciones ni pantallas para obtener verde. El script de
recorridos instalados se migró de Estado a Preparación y abre disclosures; solo se verificó
sintaxis, no una nueva instalación o recorrido de release con ese script.

No se detecta defecto técnico nuevo diferido en este ajuste; no es una revisión independiente.
La dirección y aceptación visual son cosas distintas, así como el assessment técnico y el
cierre de ola 3. #204, revisión independiente, CI protegida y gates humanos continúan abiertos.
