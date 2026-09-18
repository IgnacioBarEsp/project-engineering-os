## 1. Implementación de Macros NSIS en `installer.nsh`

- [x] 1.1 Definir macro `customInit` en `apps/companion/build/installer.nsh` bajo `!ifndef BUILD_UNINSTALLER`.
- [x] 1.2 Implementar lectura de registro para `DisplayVersion`, `UninstallString` e `InstallLocation`.
- [x] 1.3 Implementar bifurcación de misma versión (`MB_YESNOCANCEL`) con rutas para Reparar, Desinstalar y Cancelar.
- [x] 1.4 Implementar bifurcación de versión previa (`MB_OKCANCEL`) para Actualizar o Cancelar.

## 2. Cobertura de Pruebas Unitarias en `packaging.mjs`

- [x] 2.1 Añadir aserciones en `apps/companion/qa/packaging.mjs` validando presencia de `customInit` y ramas de decisión.
- [x] 2.2 Validar que `npm test` en `apps/companion` y `npm run check` en raíz pasen al 100%.

## 3. Evidencias, Evaluación de Deuda y Cierre OpenSpec

- [x] 3.1 Registrar evidencias de validación y revisión adversarial independiente.
- [x] 3.2 Generar evaluación de deuda limpia y comprobar `readiness-check --phase archive`.
- [x] 3.3 Archivar el change con `npx openspec archive companion-contextual-installer --yes`.
