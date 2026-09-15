## 1. Cleanup que no miente ni muere

- [x] 1.1 Extraer `removeDisposableRoot` a `scripts/disposable-cleanup.mjs` con reintentos acotados
      contra `EBUSY`/`EPERM`, resultado explícito `removed|locked` y comprobación previa de que el
      root sigue dentro del temporal del runner.
- [x] 1.2 Hacer que `verify-release-installation.mjs` conserve el error del cuerpo, ejecute el cleanup
      y relance el error de medición sin alterar; un lock persistente se declara en consola y en
      `cleanup.json`, nunca como éxito.
- [x] 1.3 Cubrir el módulo con pruebas de comportamiento (lock transitorio, lock persistente, causa
      distinta) y una prueba de que el error de medición sobrevive al cleanup.

## 2. Identidad 0.2.2 y controles

- [x] 2.1 Subir la app privada a 0.2.2 con lockfile, notices, notas y aserciones de QA alineados; el
      núcleo sigue en 0.5.0 y ningún tag o release existente se mueve.
- [x] 2.2 Ejecutar QA de Companion, checks de raíz, validación OpenSpec y controles de formato.
- [x] 2.3 Registrar revisión adversarial, assessment de deuda y archive readiness; archivar con el CLI
      oficial y entregar por PR protegido antes de cortar `companion-v0.2.2`.
