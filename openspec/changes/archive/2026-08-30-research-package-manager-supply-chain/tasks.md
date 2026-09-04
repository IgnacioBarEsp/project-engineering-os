## 1. Verdad actual y línea base

- [x] 1.1 Registrar los controles que este repositorio ya aplica y contra los que hay que medir la ganancia.
- [x] 1.2 Verificar contra `main` si el manifiesto del blueprint sigue acoplado a npm como afirma el issue.
- [x] 1.3 Medir la matriz de CI y el rango `engines` que cualquier candidato debe soportar.

## 2. Matriz comparativa

- [x] 2.1 Verificar en fuente oficial, con fecha, los defaults de npm 11, npm 12, pnpm 11 y Yarn Berry.
- [x] 2.2 Ejecutar sondas locales sobre el gestor instalado y registrar comando y salida.
- [x] 2.3 Distinguir un ajuste reconocido de una clave ignorada, para no apoyar la matriz en documentación.
- [x] 2.4 Comprobar la compatibilidad de cada candidato con el rango `engines` declarado.
- [x] 2.5 Comprobar disponibilidad en la imagen del runner y soporte de provenance y OIDC al publicar.

## 3. Prueba contra datos reales

- [x] 3.1 Pasar cada una de las nueve señales del triage por la pregunta de si otro gestor la habría evitado.
- [x] 3.2 Enumerar los vectores que ningún gestor mitiga.

## 4. Decisión

- [x] 4.1 Emitir una recomendación separada y con rollback propio para cada una de las tres superficies.
- [x] 4.2 Registrar estado final y condición de revisión fechada.
- [x] 4.3 Declarar lo que la decisión no decide.

## 5. Salida implementable

- [x] 5.1 Añadir el ADR al índice documental y registrar la entrada de CHANGELOG.
- [x] 5.2 Crear los issues de refuerzo derivados, enlazados a #19.

## 6. Evidencia y cierre

- [x] 6.1 Ejecutar OpenSpec estricto y `npm run check`.
- [x] 6.2 Completar revisión adversarial y assessment de deuda.
- [x] 6.3 Pasar readiness de archive y abrir el PR protegido con evidencia.
