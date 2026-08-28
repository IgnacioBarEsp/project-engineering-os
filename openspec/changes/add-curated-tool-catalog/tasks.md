## 1. Contrato del catálogo

- [x] 1.1 Añadir `schema/tool-catalog.schema.json` con entrada, estados y `additionalProperties` cerrado.
- [x] 1.2 Condicionar el estado: licencia, costo o auth en `unknown` no pueden resolver `universal` ni `condicional`.
- [x] 1.3 Exigir procedencia con owner y referencia exacta, y rechazar una referencia flotante.
- [x] 1.4 Exigir `verifiedOn` con formato de fecha y la URL de la fuente oficial consultada.

## 2. Registro sembrado

- [x] 2.1 Añadir `blueprint/core/project-os/tool-catalog.json` con las cuatro entradas iniciales.
- [x] 2.2 Registrar el manifest del blueprint y confirmar que el bootstrap siembra el archivo una sola vez.
- [x] 2.3 Confirmar que `servers` permanece vacío y las skills permanecen en `enabled: false`.

## 3. Evaluación read-only

- [x] 3.1 Añadir `src/tool-catalog.mjs` con `list` y `evaluate` sin superficie de escritura.
- [x] 3.2 Conectar el subcomando en `src/cli.mjs` y `src/commands.mjs` con `--json` y ayuda.
- [x] 3.3 Rechazar una URL como entrada de `evaluate` y documentar por qué el material se trae a mano.

## 4. Pruebas negativas

- [x] 4.1 Fallar si el comando escribe fuera de su salida.
- [x] 4.2 Fallar si una entrada con dato desconocido alcanza un estado aprobado.
- [x] 4.3 Fallar si `allowed-tools` se trata como frontera de permisos portable.
- [x] 4.4 Fallar si una señal MCP satisface a otra, o si una entrada MCP deja de estar `disabled`.
- [x] 4.5 Fallar si un literal de secreto sobrevive a la validación.
- [x] 4.6 Comprobar que retirar una entrada deja el catálogo, el bootstrap y `sync --check` válidos.

## 5. Documentación y evidencia

- [x] 5.1 Añadir `docs/TOOL_CATALOG.md` y enlazarlo desde `docs/README.md` y la decisión de onboarding.
- [x] 5.2 Registrar la entrada en `CHANGELOG.md` bajo `Unreleased`.
- [x] 5.3 Ejecutar OpenSpec estricto, `npm run check`, `npm run check:audit` y la segunda ejecución sin drift.
- [ ] 5.4 Completar revisión adversarial, Debt Control y readiness de archive.
- [ ] 5.5 Preparar el PR protegido con evidencia, licencias afectadas y assessment de deuda.
