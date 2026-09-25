## 1. Entrada

- [x] 1.1 Registrar DoR de #145, baseline de cinco/once perfiles, pruebas actuales y dependencia del commit #144.
- [x] 1.2 Validar propuesta, diseño y delta specs con el OpenSpec local 1.6.0 antes de aplicar código.

## 2. Fuente y compatibilidad

- [x] 2.1 Implementar seis perfiles y todos sus enfoques en `engine/profiles.mjs` con reglas/recetas/tecnologías y validación cerrada.
- [x] 2.2 Añadir mapeo de lectura 0.3.x y pruebas de recibos/journals sin mutación de bytes o hashes.
- [x] 2.3 Derivar etapas, preparación y nombres humanos de la fuente única; conservar Unity y medios.

## 3. Consumidores

- [x] 3.1 Migrar prompts, recetas, catálogo, grafo, servicio y rutas de agentes sin comprobaciones de ids dispersas.
- [x] 3.2 Recomendar perfil/enfoque desde inventario medido y probar las señales declaradas.
- [x] 3.3 Conectar UI de perfil/enfoque a la misma fuente y retirar rol/guía del asistente sin perder información antigua.

## 4. Evidencia y cierre

- [x] 4.1 Ejecutar matriz perfil × enfoque, fixtures viejas/Unity, pruebas Companion/UI/lenguaje, `npm run check` y mutaciones pertinentes.
- [x] 4.2 Revisar adversarialmente contaminación entre perfiles, ids en pantalla y persistencia, registrar deuda y rollback.
- [x] 4.3 Completar TLDR, baseline, readiness y OpenSpec strict sin Blockers/Majors.

Después de esas tareas: gate de archive, archivo por CLI oficial, DCO y PR protegido. La revisión propia de 4.2 no es independiente: `readiness.json` mantiene pendientes la revisión ajena y lectura visual del mantenedor, y #144 sigue como dependencia. No se archiva ni fusiona hasta que esos gates se resuelvan.
