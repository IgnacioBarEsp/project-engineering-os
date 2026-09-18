# TL;DR — companion-contextual-installer

- **Qué cambia**: El instalador NSIS para Windows detecta si existe una versión previa instalada consultando el registro (`UNINSTALL_REGISTRY_KEY`).
- **Misma versión**: Si detecta la misma versión, ofrece diálogo interactivo para «Reparar» (reinstalando binarios), «Desinstalar» (invocando el desinstalador limpio y saliendo) o «Cancelar».
- **Versión anterior**: Si detecta una versión inferior, ofrece «Actualizar» o «Cancelar».
- **Cancelación**: Sale inmediatamente (`Abort`/`Quit`) sin alterar archivos ni registros.
- **Aislamiento**: Preserva intactos los datos de usuario en `AppData/Roaming`, proyectos e historiales.
- **Evidencia**: Pruebas unitarias en `apps/companion/qa/packaging.mjs`.
