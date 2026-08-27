## 1. Contrato y recuperación

- [x] 1.1 Cambiar las rutas del job npm para reconstruir en `release/` y descargar en `canonical-release/`.
- [x] 1.2 Fijar comparación y publicación exclusivamente desde la descarga canónica.

## 2. Protección contra regresiones

- [x] 2.1 Actualizar el checker de workflow con el contrato completo de directorios y fuente publicable.
- [x] 2.2 Añadir casos negativos para pack incompatible, descarga invertida, comparación omitida y publish desde la copia reconstruida.

## 3. Documentación y evidencia

- [x] 3.1 Actualizar la spec `distribution` y la guía de releases con el incidente y la recuperación.
- [x] 3.2 Ejecutar OpenSpec estricto, suite completa, audit y verificación de empaquetado.
- [x] 3.3 Completar revisión adversarial, Debt Control y preparar readiness de archive.
- [x] 3.4 Preparar el PR protegido y el plan verificable para reejecutar `v0.2.0` después del merge.
