# Brownfield Baseline — companion-contextual-installer

- **Estado previo**: `apps/companion/build/installer.nsh` define únicamente `customUnInstall` (remoción de caché de actualización de electron-builder) y `.onVerifyInstDir` (prevención de colisiones en directorios no vacíos). No implementa `customInit`.
- **Riesgo**: Si un usuario ejecuta el instalador teniendo ya la misma versión o una versión anterior, electron-builder inicia directamente el asistente estándar sin avisar ni permitir reparar o desinstalar de forma limpia.
- **Solución**: Incorporar el macro `customInit` que lee `DisplayVersion`, `UninstallString` e `InstallLocation` desde `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}` y bifurca el flujo con diálogos contextuales claros.
