# Gestión de preparaciones integrada — 2026-09-30

La dirección de gestión primero y su captura principal cuentan con dos decisiones humanas
separadas: [dirección](../../companion-project-screen-redesign/evidence/management-direction.md)
y [aceptación visual](../../companion-project-screen-redesign/evidence/management-visual-acceptance.md).
El renderer abre en elecciones guardadas/gestión; tareas locales siguen visibles y guías IA,
detalles técnicos y destinos de herramientas son opcionales. No añade capacidades de copiar,
mover, renombrar o eliminar completamente una preparación.

## Evidencia observada

- Companion: 224/224 PASS, exit 0.
- UI completa v3: exit 0, incluido el final de compatibilidad/aislamiento. 28 recorridos del
  wizard, 168 pantallas, 1876/1876 controles y 56/56 copias; 57 pantallas de las siete variantes,
  1550 definiciones sin desajustes y cero hallazgos. El JSON del recorrido no se dio por final
  hasta terminar las comprobaciones posteriores.
- Rutas: 20/120 celdas y los mismos 16 negativos PASS. Contrato en copia del renderer:
  46/46 mutaciones, construcción 1/1, 11 pantallas y 402/402 controles del wizard, cero hallazgos.
- Proyecto: 32 celdas responsivas/movimiento, todas las guías completas, 8 copias de fragmentos
  revisadas/canceladas/copias explícitas y cero aperturas externas. Desde el detalle se probaron
  revisión con personal/organization, cancelación del picker, reutilización de respuestas sin
  preparación escrita, y quitar/cancelar historial con recibo y originales byte-idénticos.
- Electron de fuente a39a95e: 18 capturas, 12 copias reales, cero errores. Datos aislados y
  picker inyectado; no instalador ni recorrido nativo del detalle. Cambios posteriores son
  scripts de prueba y documentación, sin cambiar ui/desktop/engine/context/runtime.
- Raíz npm run check: 391/391 PASS en df517b3, no ejecución del commit final. El árbol de core
  permanece sin cambios en este delta; CI final aún no se acredita verde.

Registros locales: peos-management-ui-v3 (incluye subdirectorios declared-routes,
profile-compatibility y wizard-isolation), peos-management-contract-v2,
peos-project-management-final-v5 y peos-management-electron-v1. Las capturas de Electron
conservan provenance/digest/commit propios; no se vuelven a etiquetar como un commit posterior.

## Revisión propia y límites

Se corrigió pasar perfil/enfoque normalizados al duplicar desde el detalle; el caso real
personal/organization lo comprueba. El foco se devuelve al summary visible de navegación,
el cierre en una herramienta regresa a preparación y no navega con busy o eventos de nodos
desprendidos. Guía completa y operaciones únicas mantienen sus probes y todos los negativos.
El menú que dice Recetas ahora ofrece su definición donde se usa la palabra.

Los intentos fallidos y migraciones del harness están en
[management-validation.md](../../companion-project-screen-redesign/evidence/management-validation.md):
no se acreditó timeout como detección ni se quitó la revisión de tecnología. El negativo de
OpenSpec en Inicio convierte el control real en prosa sin definición; conserva término y
criterio, en vez de insertar una segunda mención donde ya hay una definición válida.
El script instalado abre disclosures y usa Preparación; solo se comprobó su sintaxis,
no una instalación nueva con él. No se actuó sobre proyectos o instalación del mantenedor.

Este es un pase del implementador, no una nueva revisión independiente. Assessment técnico
acotado sin defecto nuevo diferido, no una ola limpia ni aceptación de cada variante.
El gate archive de #148 continúa FAIL read-only por tarea de integración/revisión y revisión
independiente pendiente. PR #202 sigue borrador apilado; #204 y CI protegida no se evaden.
Los dist-tags oficiales siguen npm 11.21.0/12.2.0: no se reinstalan candidatos que no cambiaron.
No se archiva, fusiona o cierra la ola 3; no se inicia ola 4.
