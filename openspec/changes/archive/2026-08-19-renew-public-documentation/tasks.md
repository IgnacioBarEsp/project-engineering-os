## 1. Verdad documental y contexto de diseño

- [x] 1.1 Verificar comandos, versión publicada, cinco agentes soportados, prompts y límites contra código,
  ayuda del CLI, specs y un fixture limpio.
- [x] 1.2 Crear `PRODUCT.md` con propósito, audiencias, personalidad, voz, anti-referencias y estado actual.
- [x] 1.3 Crear `DESIGN.md` y su sidecar con tokens, componentes, accesibilidad y reglas reutilizables.

## 2. Dirección visual aprobada

- [x] 2.1 Capturar evidencia real de terminal sin secretos ni rutas personales.
- [x] 2.2 Crear Variante A “Plano de control” y Variante B “Cuaderno de ingeniería” con el mismo contenido.
- [x] 2.3 Verificar legibilidad, contraste, peso y comportamiento en fondos claros/oscuros y anchuras pequeñas.
- [x] 2.4 Presentar ambas variantes y registrar la elección humana en #22 antes de publicar recursos finales.

## 3. README e inicio rápido

- [x] 3.1 Implementar el README español con propósito, visual aprobado, SDD, deuda, capacidades y navegación.
- [x] 3.2 Añadir el resumen inglés dentro de un `<details>` y comprobar equivalencia de afirmaciones.
- [x] 3.3 Implementar y ejecutar el inicio rápido desde carpeta vacía con la versión publicada vigente.
- [x] 3.4 Declarar compatibilidad y degradaciones sin presentar #23 como funcionalidad actual.

## 4. Documentación progresiva

- [x] 4.1 Reorganizar `docs/README.md` por intención y mantener todos los documentos a dos saltos o menos.
- [x] 4.2 Añadir a cada documento público el contexto, audiencia, prerrequisitos o siguiente paso que necesite,
  conservando contratos, ownership, comandos y recuperación.
- [x] 4.3 Verificar enlaces, términos, rutas, duplicación, traducción y contenido incluido en el paquete.

## 5. Perfil y coherencia entre repositorios

- [x] 5.1 Adaptar el recurso aprobado a la tarjeta de Project Engineering OS en el repositorio de perfil.
- [x] 5.2 Verificar el render del perfil y mantener su cambio en un commit separado.

## 6. Evidencia y cierre

- [x] 6.1 Ejecutar `npm run check`, validación OpenSpec estricta y pruebas del paquete/fixture proporcionales.
- [x] 6.2 Registrar previews de escritorio/móvil, temas claro/oscuro, texto alternativo y revisión WCAG AA.
- [x] 6.3 Ejecutar revisión adversarial y capturar el assessment de deuda, incluido resultado limpio.
- [x] 6.4 Completar los metadatos de readiness y dejar el change listo para el gate de archive.
