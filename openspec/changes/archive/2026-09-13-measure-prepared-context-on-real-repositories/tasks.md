## 1. Congelar un protocolo que pueda perder

- [x] 1.1 Mover el banco de veinte preguntas a un protocolo durable con los dos repositorios, commits,
      subtrees, licencias, criterios de elegibilidad y regla de asignación.
- [x] 1.2 Verificar cada fuente y respuesta contra el commit fijado, contar archivos/bytes antes de medir y
      rechazar cualquier candidato que no cumpla los criterios sin sustituirlo en silencio.
- [x] 1.3 Declarar el SHA-256 del protocolo y añadir casos negativos que prueben rechazo por digesto, checkout,
      remoto y umbral incorrectos.
- [x] 1.4 Versionar protocolo, manifiesto, runner y pruebas antes de ejecutar la primera vía; conservar ese
      commit como identidad de precompromiso.

## 2. Construir el arnés simétrico

- [x] 2.1 Exportar cada subtree fijado a una carpeta temporal sin `.git`, caches ni artefactos de control y
      hacer que las tres vías usen exactamente ese inventario.
- [x] 2.2 Medir por pregunta fuente esperada, respuesta devuelta, localizador, bytes devueltos, bytes de
      contenido leídos y archivos abiertos, sin afirmar tokens.
- [x] 2.3 Ejecutar la vía preparada mediante la aplicación instalada, conservar cobertura y costo de
      preparación, e incluir la relectura de fuentes y el índice en categorías separadas.
- [x] 2.4 Escribir cada intento de forma exclusiva, anclar rutas locales y conservar errores y límites sin
      sobrescribir evidencia previa.

## 3. Ejecutar y publicar lo que salga

- [x] 3.1 Ejecutar las tres vías para los dos corpora desde el precompromiso limpio y guardar los datos crudos.
- [x] 3.2 Reconciliar el resumen contra los datos por pregunta y actualizar `docs/companion/EVIDENCE.md` con
      resultado, costo, cobertura y límites.
- [x] 3.3 Revisar la landing y corregirla solo si el resultado contradice o permite una afirmación respaldada;
      añadir una comprobación que impida que los números públicos se separen de los datos crudos.

## 4. Intentar refutar y cerrar

- [x] 4.1 Ejecutar pruebas del app y del upstream, validación OpenSpec estricta y los checks de documentación,
      neutralidad, secretos, paquete e idempotencia aplicables.
- [x] 4.2 Revisión adversarial independiente: intentar cambiar preguntas después del precompromiso, favorecer
      una vía, omitir relecturas, adulterar un commit y publicar un resultado distinto de los datos.
- [x] 4.3 Resolver blockers/majors, repetir evidencia afectada y capturar el assessment de deuda sin borrar
      resultados desfavorables.
- [x] 4.4 Completar readiness de archivo, archivar con OpenSpec local y cerrar mediante PR protegido y CI.
