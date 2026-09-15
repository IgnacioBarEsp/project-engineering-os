# Baseline brownfield

- `main` dde882e (tag `companion-v0.2.2`) contiene `verify-release-installation.mjs` con un chequeo inmediato `assert.equal(await present(installation), false)` justo tras `await execute(uninstaller, ['/S'])`.
- Run 34967616274 (2026-09-15): Authenticode, packaging, instalación 0.1.0, actualización a 0.2.2 y los 5 recorridos nativos (`native-journeys.json` y screenshots) pasaron al 100%. Falló en `verify-release-installation.mjs:92:10` con `AssertionError: El desinstalador dejó el directorio del programa` porque el worker hijo de NSIS (`Au_.exe`) continuaba ejecutándose y borrando archivos de forma asíncrona tras la terminación inmediata del proceso padre.
- `companion-v0.2.0`, `companion-v0.2.1` y `companion-v0.2.2` quedan como tags anotados inmutables sin release; la única descarga pública sigue siendo 0.1.0.
- La regla vigente del spec `companion-distribution` exige que una verificación fallida horneada en un tag inmutable se remedie con una nueva identidad versionada, nunca moviendo el tag.
