## 1. Entrada y contrato

- [x] 1.1 Registrar la DoR de #144, la dirección de diseño aprobada y el baseline reproducible de Inicio, Ayuda, navegación, CSP y harness.
- [x] 1.2 Validar propuesta, diseño y specs estrictamente con OpenSpec local antes de aplicar el código.

## 2. Fundación de módulos

- [x] 2.1 Añadir `lib/dom.mjs`, `lib/state.mjs` y `lib/router.mjs` con estado por pantalla, suscripción y tabla cerrada de rutas.
- [x] 2.2 Dividir `app.mjs` en pantallas y componentes menores de 400 líneas, conservando las acciones, el glosario, las palabras de la persona y las pantallas actuales durante la transición.
- [x] 2.3 Derivar breadcrumb, pastilla activa y riel de la tabla de rutas en todas las pantallas alcanzables.

## 3. Diseño y recursos

- [x] 3.1 Crear `tokens.css` y `app.css` por capas sin colores hexadecimales fuera de tokens; implementar layout con un scroller y barra de acciones en flujo.
- [x] 3.2 Incorporar sprite SVG local de Lucide, retirar emoji/controles decorativos y registrar su licencia; mantener CSP sin red ni estilos inline.
- [x] 3.3 Reconstruir Inicio y Ayuda con una acción principal, glosario y estado del entorno solo cuando sea verificable.
- [x] 3.4 Ampliar la allowlist `peos://` y añadir prueba de igualdad exacta con el directorio de assets.

## 4. Evidencia y cierre

- [x] 4.1 Migrar los harnesses de navegador y mutaciones al árbol modular; medir rutas, acciones, contraste, cuatro anchos, movimiento y alcanzabilidad sin pases vacuos.
- [x] 4.2 Ejecutar pruebas Companion, UI, contrato, Electron proporcional y `npm run check`; revisar capturas y consola de Inicio/Ayuda con procedencia.
- [x] 4.3 Reescribir `DESIGN.md`, registrar revisión adversarial y assessment de deuda, y demostrar rollback por revert o fixture.
- [x] 4.4 Preparar el paquete de archive con OpenSpec strict, metadata de readiness, evidencia, rollback y revisión adversarial sin Blockers/Majors.

Después de estas tareas: ejecutar el gate de archive. Si pasa, archivar mediante el CLI oficial, firmar los commits DCO y entregar por PR protegido. La revisión independiente, aprobación visual del mantenedor y CI son gates de integración separados; no se declaran realizados antes de observarlos.
