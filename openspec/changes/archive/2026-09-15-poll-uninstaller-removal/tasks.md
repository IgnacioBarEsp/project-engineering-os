## 1. Espera con presupuesto de remoción NSIS

- [x] 1.1 Exportar `waitForRemoval` desde `scripts/disposable-cleanup.mjs` con sondeo de presencia y presupuesto acotado.
- [x] 1.2 Usar `waitForRemoval` en `verify-release-installation.mjs` tras ejecutar el desinstalador silencioso de NSIS.
- [x] 1.3 Cubrir `waitForRemoval` con pruebas unitarias en `qa/packaging.mjs`.

## 2. Identidad 0.2.3 y controles

- [x] 2.1 Subir la app privada a 0.2.3 con lockfile, notices, notas y aserciones de QA alineados; el núcleo sigue en 0.5.0 y ningún tag o release existente se mueve.
- [x] 2.2 Ejecutar QA de Companion, checks de raíz, validación OpenSpec y controles de formato.
- [x] 2.3 Registrar revisión adversarial, assessment de deuda y archive readiness; archivar con el CLI oficial y entregar por PR protegido antes de cortar `companion-v0.2.3`.
