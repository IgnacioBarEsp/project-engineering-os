## 1. Entrada a implementación

- [x] 1.1 Revalidar la DoR de #162 sobre `main` después de cerrar la ola 0: 13 PASS, 0 FAIL
  ([registro](evidence/readiness-propose.md)).
- [x] 1.2 Confirmar que el detector y su prueba base son byte-idénticos a los medidos por #166 y fijar como
  aceptación 34/34 frases legítimas y 19/19 marcadores ([baseline](brownfield-baseline.md)).

## 2. Detector

- [x] 2.1 Sustituir la heurística castellana `verbo + artículo` por las formas observadas que nombran una
  ranura, conservar `replace with` y detectar la instrucción inglesa sembrada `complete the review`.
- [x] 2.2 Hacer Unicode-safe las fronteras de las formas `aquí` sin ampliar coincidencias dentro de palabras.
- [x] 2.3 Acotar la excepción de términos reservados al campo exacto `change` y a identificadores kebab-case de
  varios segmentos; conservar el rechazo en cualquier otro campo y para un marcador aislado.
- [x] 2.4 Mantener las etiquetas canónicas y la redacción del diagnóstico sin repetir valores potencialmente
  sensibles.

## 3. Corpus y compatibilidad

- [x] 3.1 Añadir el corpus independiente de 34 frases legítimas y 19 marcadores con su fuente, incluida la
  instrucción que la vía completa de #166 dejó pasar.
- [x] 3.2 Leer las dos plantillas sembradas y comprobar que cada instrucción pendiente se detecta en su campo.
- [x] 3.3 Añadir casos de nombres: el change puede nombrar `placeholder`, pero `TBD-owner` fuera de `change` y
  `change: placeholder` siguen fallando.
- [x] 3.4 Re-evaluar toda metadata archivada con schema 1.0.0 y exigir cero regresiones.
- [x] 3.5 Revisar el quinto patrón contra el corpus; modificarlo solo si aparece un falso positivo reproducible.

## 4. Evidencia y documentación

- [x] 4.1 Ejecutar la medición posterior y registrar 34/34 frases aceptadas, 19/19 marcadores rechazados y cero
  changes históricos nuevos en fallo.
- [x] 4.2 Actualizar la guía sembrada y la documentación upstream solo donde cambie el contrato público.
- [x] 4.3 Ejecutar unit/contract, package artifact, compatibilidad, harness, doctor/sync aplicables y la suite
  completa; registrar por separado cualquier fallo preexistente.
- [x] 4.4 Ejecutar el smoke multiplataforma en CI protegida y conservar el resultado real
  ([CI run 35575048504](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35575048504)).

## 5. Cierre

- [x] 5.1 Ejecutar revisión adversarial desde contexto limpio y resolver todos los Blockers y Majors.
- [x] 5.2 Capturar el assessment de deuda después de la última corrección.
- [x] 5.3 Ensayar rollback e instalación, completar `readiness.json` solo con evidencia ejecutada y pasar el gate
  de archive con `--run-local` sobre el consumidor desechable.
- [x] 5.4 Archivar con el CLI local y entregar por PR protegido (este commit).
