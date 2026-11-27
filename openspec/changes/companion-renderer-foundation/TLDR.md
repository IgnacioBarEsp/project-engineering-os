# Fundación del renderer de Companion 0.4 — #144

Se sustituye el shell visual heredado por una base Obsidian local y modular, sin framework ni build y sin cambiar el motor. Inicio y Ayuda usan la nueva navegación, tipografía, iconos y layout; el asistente y las pantallas de proyecto conservan temporalmente sus contratos funcionales mientras #145–#149 los reconstruyen.

El protocolo `peos://app` sirve una lista exacta de archivos. Las pruebas cubren rutas, estado por pantalla, CSP, contraste, teclado, movimiento, ventanas pequeñas, mutaciones del contrato y una sesión real de Electron con datos aislados. No se publica todavía una release.

- [Propuesta](proposal.md) y [diseño](design.md)
- [Baseline brownfield](brownfield-baseline.md) y [tareas](tasks.md)
- [Evidencia de validación](evidence/validation.md)
- [Capturas de Electron](evidence/electron/electron-shell.json)
- [Issue #144](https://github.com/IgnacioBarEsp/project-engineering-os/issues/144)
