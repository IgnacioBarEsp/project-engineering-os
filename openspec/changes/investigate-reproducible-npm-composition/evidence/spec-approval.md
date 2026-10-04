# Aprobación real de faseA y condición de reversibilidad

El asistente presentó proposal/design/spec de la revisión fa279d952784cd0138fb78ec91226f5cefe00ba2 y preguntó: «¿Apruebas esta spec para empezar la prueba de viabilidad?».

Respuesta humana literal:

> Apruebo, tambien tiene que tener una forma reversible o de cambio horizontal en caso de que npm desbloquee o ya corrija sus errores sin problemas poder estarnos moviendos entre version y version, osea la oficial y la que haremos nosotros.

Se registra aprobación de la fase de viabilidad presentada y la condición nueva dictada directamente por el mantenedor. Esta enmienda añade identidad por canal/versión/hash, slots separados, destino verificado, preservación ante fallo/interrupción/cancelación y vuelta al oficial únicamente si pasa los mismos gates. No atribuye aprobación a una spec futura ni a parches propios.

Apply puede comenzar para este alcance acotado y el modelo experimental de reversibilidad. No se aprobó adopción de runtime, modificación de catálogo/locks de producción, redistribución, cambios de gestor/Node/OpenSpec, excepciones o protecciones. Un ensayo sintético no cuenta como transición real de npm. Ningún issue se cierra por registrar aprobación.
