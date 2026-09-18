# Baseline brownfield

- `apps/companion` en versión 0.2.3 cuenta con 5 perfiles rígidos (`research`, `software`, `unity`, `media`, `general`) definidos en `engine/inventory.mjs`.
- La recomendación de dependencias se dispara de forma temprana en el asistente antes de capturar el propósito o la descripción del usuario.
- La descripción del proyecto ingresada por el usuario no se persiste en un archivo dedicado de intención ni alimenta adecuadamente a los agentes externos.
- La interfaz visual emplea un esquema de navegación genérico y carece de las micro-interacciones, animaciones fluidas y contraste refinado de Obsidian Precision Studio.
- Todos los 139 tests unitarios de Companion y los 326 tests de raíz pasan al 100% en la línea base de partida.
