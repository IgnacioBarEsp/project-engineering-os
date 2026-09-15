# Baseline brownfield

- `main` 8fdc718 (tag `companion-v0.2.1`) contiene `verify-release-installation.mjs` con un `finally`
  que ejecuta `rm(root, { recursive: true, force: true })` una sola vez y sin capturar el error del
  cuerpo: cualquier lock transitorio rompe el run y cualquier fallo de medición queda ocultado.
- Run 34959088623 (2026-09-15): pasos de tag, checks de raíz, QA, audit, runtime, build y probe
  Authenticode en PASS; el paso de instalación/recorridos/uninstall terminó con
  `EBUSY rmdir ...\Temp\~nsuA.tmp` a los ~6 minutos. El artefacto de evidencia subió 6 archivos
  (recorridos nativos y sus capturas) sin `installer-cycle.json`, así que el cuerpo no llegó a escribir
  su recibo y el error original fue reemplazado por el del cleanup.
- `companion-v0.2.0` y `companion-v0.2.1` quedan como tags anotados inmutables sin release; la única
  descarga pública sigue siendo 0.1.0.
- La regla vigente del spec `companion-distribution` exige que una verificación fallida horneada en un
  tag inmutable se remedie con una nueva identidad versionada, nunca moviendo el tag.
