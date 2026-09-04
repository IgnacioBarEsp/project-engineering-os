# Revisión adversarial - pin-upstream-openspec-1-6-0

Fecha: 1 de septiembre de 2026. Resultado: **PASS con cero Blockers y cero Majors abiertos**.

## Ataques ejecutados

### Dependencia de runtime accidental

Se inspeccionaron `package.json`, el manifiesto instalado y `npm pack --dry-run --json`. OpenSpec aparece
solo en `devDependencies`; el tarball no incluye `node_modules`, paquetes bundled ni source duplicado.

### Versión o permiso flotante

La declaración, el lockfile, el manifiesto instalado y el binario coinciden en 1.6.0. `allowScripts` nombra
`@fission-ai/openspec@1.6.0`; otra versión no hereda permiso.

### Clon limpio que depende del estado heredado

Se ejecutó `npm ci` dos veces. Ambas instalaciones reconstruyeron 85 paquetes, dejaron el binario local y
la segunda conservó el hash del lockfile. La prueba no usó el `node_modules` heredado que motivó #48.

### Superficie de supply chain

`check:audit` reportó cero findings high/critical y cero excepciones. npm audit reportó cero
vulnerabilidades en los 86 paquetes del grafo de desarrollo. La licencia instalada es MIT.

### Regresión del constructor o del artefacto publicado

Las 235 pruebas, fixture acotado, fixture completo y `pack:verify` pasaron. El paquete conserva su identidad,
neutralidad, exports y grafo de runtime.

## Límites declarados

- El readiness/doctor in situ depende de #49; el FAIL de configuración queda registrado y no se convierte
  en PASS.
- Una invocación directa de OpenSpec conserva el comportamiento de telemetría upstream. El wrapper de los
  consumidores sigue aplicando su default privado; cambiar ese contrato es no objetivo de #48.
- Push, PR, CI remoto y merge requieren autenticación y revisión atribuible; no forman parte de esta sesión.

Ningún límite introduce deuda nueva en el cambio.
