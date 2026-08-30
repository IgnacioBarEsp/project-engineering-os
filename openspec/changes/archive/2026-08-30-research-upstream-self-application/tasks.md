## 1. Medición sobre el propio repositorio

- [x] 1.1 Ejecutar `doctor --json`, `opsx-check`, `debt check` y `readiness-check` sobre el upstream y
  registrar su salida literal.
- [x] 1.2 Ejecutar `sync --check` y registrar los conflictos, las creaciones y su relación con la allowlist.
- [x] 1.3 Comparar cada ruta en conflicto con su semilla del blueprint y medir la divergencia.
- [x] 1.4 Comprobar que OpenSpec no está en el manifiesto ni en el lockfile y dónde sí está instalado.

## 2. Sondas de adopción

- [x] 2.1 Probar `readiness-check` in situ con la configuración mínima y registrar el veredicto.
- [x] 2.2 Probar `debt check` in situ con la política y el registro sembrados.
- [x] 2.3 Capturar los assessments existentes contra el schema del motor y registrar aceptados y rechazados.
- [x] 2.4 Probar la activación de un tercer perfil y registrar el efecto sobre el gate.
- [x] 2.5 Devolver el árbol a su estado original tras cada sonda.

## 3. Decisión

- [x] 3.1 Definir el criterio que separa forma de consumidor de deuda real y aplicarlo a los seis FAIL.
- [x] 3.2 Resolver la recursión de ownership con el mecanismo medido, no con una advertencia.
- [x] 3.3 Dar veredicto a cada mecanismo de los nueve grupos, sin celdas vacías.
- [x] 3.4 Declarar costo, licencia, autenticación, datos, permisos, evidencia y rollback de cada adopción.
- [x] 3.5 Registrar explícitamente lo que la decisión no decide.

## 4. Salida implementable

- [x] 4.1 Añadir el decision record al índice documental sin presentar ninguna adopción como hecha.
- [x] 4.2 Crear los issues del desglose, enlazados a #46 y con criterios observables propios.
- [x] 4.3 Registrar el falso positivo de marcadores en la metadata pre-propose como issue propio.

## 5. Evidencia y cierre

- [x] 5.1 Ejecutar OpenSpec estricto y `npm run check`.
- [x] 5.2 Completar revisión adversarial y assessment de deuda.
- [x] 5.3 Pasar readiness de archive y abrir el PR protegido con evidencia.
