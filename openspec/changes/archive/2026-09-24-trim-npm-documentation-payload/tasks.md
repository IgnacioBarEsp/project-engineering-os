## 1. Curar la superficie de documentación npm

- [x] 1.1 Reemplazar los globs amplios por las rutas aprobadas del núcleo y dejar `docs/README.md` como índice core-only.
- [x] 1.2 Actualizar enlaces y guía para que el contenido excluido siga accesible en el repositorio sin enlaces relativos rotos en el paquete. Evidencia: checker y pruebas sobre el tarball extraído.
- [x] 1.3 Documentar el límite del payload npm y las métricas de release en `docs/REPOSITORY_MAP.md` y `docs/RELEASES.md`.

## 2. Aplicar el límite de contenido y validar enlaces

- [x] 2.1 Crear el tarball en una carpeta temporal acotada y rechazar rutas reales fuera de la allowlist o inseguras.
- [x] 2.2 Extraer el artefacto y validar enlaces Markdown/HTML relativos contra los archivos extraídos.
- [x] 2.3 Añadir pruebas positivas y adversariales para rutas no declaradas y enlaces relativos rotos.

## 3. Registrar el inventario de releases

- [x] 3.1 Añadir `fileCount` y `unpackedBytes` desde los metadatos npm del artefacto probado.
- [x] 3.2 Validar manifests candidatos y mantener compatibilidad de lectura solo cuando ambas métricas históricas falten.
- [x] 3.3 Probar límites, pares parciales o inválidos y manifests históricos.

## 4. Verificar el cambio

- [x] 4.1 Ejecutar OpenSpec strict, las comprobaciones del tarball, la suite completa y `npm run check`; resultado en `evidence/validation.md`.
- [x] 4.2 Registrar conteos y exclusiones observados, revisar enlaces, completar revisión adversarial y capturar assessment de deuda; refs en `evidence/`.
- [x] 4.3 Pasar CI requerida en la matriz multiplataforma del PR y registrar sus resultados en `evidence/validation.md`.

Tras 4.3, completar readiness de archive, archivar con el CLI oficial fijado y conservar la salida del
gate como evidencia. Después, integrar el change archivado exclusivamente mediante un PR protegido con
DCO y checks requeridos; no publicar ni reescribir artefactos. El issue se cierra tras verificar el merge.
