# Entrada a implementación

- Issue #146 aprobado en alcance por la entrevista del mantenedor del 2026-09-18: cuatro pasos, plan plegado, retirada de rol/guía y un solo camino desde Inicio.
- DoR 13/13 y ausencia de PR duplicado comprobados antes de crear el change.
- OpenSpec local fijado en 1.6.0: proposal, design, tres delta specs y tasks validados estrictamente antes de editar código.
- Dependencias de código #144/#145 explícitas; no se afirma que estén integradas en main.
- Sin dependencias, modelos, servicios, cuentas, costos ni instalaciones de producto en Windows principal. Las pruebas de Electron usan userData, LOCALAPPDATA y proyectos temporales aislados.
