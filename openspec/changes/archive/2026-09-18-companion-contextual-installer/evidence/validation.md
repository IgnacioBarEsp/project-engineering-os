# Validation — 2026-09-18

Scope: Issue #127 (`companion-contextual-installer`), Detección contextual de versiones previas en el instalador NSIS para Windows (Opción B: Reparar, Desinstalar, Actualizar o Cancelar).

## Automatic Evidence

- PASS DoR pre-propose: 13/13 comprobaciones validadas en `readiness-check --phase propose --issue 127`.
- PASS OpenSpec: `npx openspec validate companion-contextual-installer --strict --no-interactive` ejecutado con éxito.
- PASS Companion tests: 141/141 pruebas unitarias y de integración pasando en `apps/companion` (`npm test`).
  - Verificación estricta de macros `customInit` en `build/installer.nsh`.
  - Verificación de ramas `MB_YESNOCANCEL` (misma versión: Reparar/Desinstalar/Cancelar) y `MB_OKCANCEL` (versión anterior: Actualizar/Cancelar).
  - Invocación de `$1 /S _?=$2` para desinstalación limpia y salida inmediata sin tocar datos de usuario.
- PASS Monorepo workspace check: 326/326 pruebas en `npm run check` a nivel raíz.

## Observed Review

- El instalador consulta `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}` al iniciar en `.onInit`.
- Si detecta la misma versión instalada:
  - Presenta diálogo interactivo: [Sí] para reparar, [No] para desinstalar, [Cancelar] para salir.
  - Al presionar Cancelar, el instalador ejecuta `Quit` inmediatamente sin escribir archivos, registrar atajos ni alterar el registro.
  - Al presionar Desinstalar, invoca de forma segura el desinstalador existente de la aplicación y sale.
- Si detecta una versión anterior:
  - Ofrece actualizar o cancelar.
- Si el usuario no tiene ninguna versión previa instalada, el asistente normal por usuario procede sin interrupción.
- Se respetan todas las garantías de aislamiento: `AppData/Roaming`, proyectos e historiales permanecen intactos.

## Recovery & Rollback

- Reversión atómica mediante `git revert` del commit correspondiente.
- Los instaladores generados previamente o desinstalaciones en máquina continúan funcionando bajo la convención estándar.
