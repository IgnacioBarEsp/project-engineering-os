# Design: companion-contextual-installer

## Arquitectura de Detección NSIS

En el ciclo de vida de inicialización de electron-builder (`node_modules/app-builder-lib/templates/nsis/installer.nsi`), la función `.onInit` ejecuta el hook:
```nsis
!ifmacrodef customInit
  !insertmacro customInit
!endif
```

Definiremos el macro `customInit` dentro de `apps/companion/build/installer.nsh`, encapsulado bajo `!ifndef BUILD_UNINSTALLER`:

1. **Lectura de Registro de Windows**:
   - `ReadRegStr $0 HKCU "${UNINSTALL_REGISTRY_KEY}" "DisplayVersion"`
   - `ReadRegStr $1 HKCU "${UNINSTALL_REGISTRY_KEY}" "UninstallString"`
   - `ReadRegStr $2 HKCU "${UNINSTALL_REGISTRY_KEY}" "InstallLocation"`

2. **Bifurcación Contextual**:
   - **Caso 1: Misma versión (`$0 == "${VERSION}"`)**:
     - `MessageBox MB_YESNOCANCEL|MB_ICONQUESTION ...`
     - **Sí (IDYES)**: Continúa la ejecución normal para reinstalar/reparar los binarios sobre el directorio de instalación.
     - **No (IDNO)**: Invoca `$1 /S _?=$2` (desinstalación silenciosa del programa) y sale inmediatamente (`Quit`).
     - **Cancelar (IDCANCEL)**: Aborta de inmediato con `Quit`.
   - **Caso 2: Versión previa diferente (`$0 != ""`)**:
     - `MessageBox MB_OKCANCEL|MB_ICONQUESTION ...`
     - **Aceptar (IDOK)**: Continúa con la actualización oficial sobreescribiendo los binarios.
     - **Cancelar (IDCANCEL)**: Aborta de inmediato con `Quit`.
   - **Caso 3: Primera instalación (`$0 == ""`)**:
     - Continúa con el asistente estándar de instalación por usuario.

3. **Verificación Automatizada en QA**:
   - Extender `apps/companion/qa/packaging.mjs` para verificar la existencia del macro `customInit`, la lectura de `UNINSTALL_REGISTRY_KEY`, los diálogos `MB_YESNOCANCEL` y `MB_OKCANCEL`, y las salidas limpias `Quit`/`Abort`.
