# Tareas — congress-presentation-with-measured-evidence

## 1. Preparación

- [x] 1.1 Verificar el gate de Definition of Ready del issue #165 con `readiness-check --phase propose`.
- [x] 1.2 Registrar la decisión de encuadre de la evidencia, que #166 ya ejecutó, en la metadata del issue.
- [x] 1.3 Comprobar que el conector de Canva está autorizado, que el issue daba por bloqueado.
- [x] 1.4 Registrar la baseline: qué material existe y qué afirmaciones no se pueden hacer.

## 2. El guion

- [x] 2.1 Escribir las veinte diapositivas con lo que se ve, lo que se dice y sus notas.
- [x] 2.2 Atar cada cifra a su registro en una tabla de procedencia dentro del propio guion.
- [x] 2.3 Escribir la diapositiva de límites con lo que no se midió.
- [x] 2.4 Comprobar una por una las cifras del guion contra sus registros, y dejar el resultado por escrito.

## 3. Lo visual

- [x] 3.1 Elegir de la galería publicada las capturas que entran, y anotar su commit.
- [x] 3.2 Preparar la tabla comparativa de las dos vías con los artefactos de #166.
- [x] 3.3 Decidir con el mantenedor si el guion pasa a Canva, y con qué brand kit.

## 4. Cierre

- [x] 4.1 Pasar la revisión adversarial desde contexto limpio y resolver sus Blockers y Majors.
- [x] 4.2 Capturar el assessment de deuda después de la última pasada de revisión.
- [x] 4.3 Sustituir los estados pendientes de readiness solo con evidencia ejecutada, y pasar strict y el gate
  de archive con `--run-local`.
- [x] 4.4 Archivar con el CLI local, corregir los enlaces del change archivado, firmar los commits con DCO y
  entregar por PR protegido.

La decisión del 20 de septiembre fue **contenido primero, Canva después**
([decisiones](evidence/maintainer-decisions.md)). El mantenedor aprobó el guion ese mismo día y la
generación de diseños de Canva resultó no estar habilitada en su equipo, así que el mazo se entregó como
archivo importable, fuera del control de versiones por ser un binario derivado
([el mazo](evidence/deck-build.md)).

La 4.3 y la 4.4 se cumplen con el commit que archiva el change: strict y el gate de archive se ejecutan justo
antes, con sus registros en `evidence/`, y la entrega es el PR de esta rama. La revisión de la 4.1 fue una
ronda desde contexto limpio; sus correcciones las verificó quien las hizo, no el revisor, y así consta en
[la revisión](evidence/adversarial-review.md).
