# Adversarial Review — 2026-09-18

Scope: Issue #127 (`companion-contextual-installer`).

## Vectores de Ataque y Comprobaciones

1. **Riesgo de Invocación Recursiva o Inclusión en Desinstalador (`BUILD_UNINSTALLER`)**:
   - *Ataque*: Si el macro `customInit` se compilara dentro del desinstalador generado (`Uninstall Project Engineering OS Companion.exe`), podría provocar bucles infinitos o diálogos anómalos durante la desinstalación.
   - *Mitigación*: `customInit` está estrictamente encapsulado bajo `!ifndef BUILD_UNINSTALLER`. El desinstalador no lo incluye en sus secciones.

2. **Riesgo de Modificación Silenciosa ante Cancelación**:
   - *Ataque*: El usuario elige "Cancelar" y el instalador procede o escribe claves de registro residuales.
   - *Mitigación*: Ante `IDCANCEL` o cierre de diálogo, se invoca `Quit` inmediatamente. Ninguna sección de escritura de archivos (`Section "install"`) es alcanzada.

3. **Riesgo de Destrucción de Datos de Usuario (`AppData/Roaming`)**:
   - *Ataque*: La desinstalación o reparación contextual podría borrar carpetas de datos de usuario.
   - *Mitigación*: Se preserva la configuración `deleteAppDataOnUninstall: false` en `electron-builder.yml`. El desinstalador retira exclusivamente el directorio de programa y atajos, preservando proyectos, notas y runtimes locales.

4. **Riesgo de Registro Corrupto o Clave Inexistente**:
   - *Ataque*: Un equipo sin la clave de desinstalación o con valores vacíos podría fallar con error inesperado.
   - *Mitigación*: `ReadRegStr` devuelve cadena vacía si no existe la clave. La condición `${if} $0 != ""` asegura que el diálogo sólo se active si efectivamente hay una versión registrada con `DisplayVersion`.

## Veredicto

- **Blockers**: 0
- **Majors**: 0
- **Minors**: 0
- **Resultado**: PASSED
