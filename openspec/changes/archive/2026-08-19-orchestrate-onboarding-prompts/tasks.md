## 1. Contrato verificable de prompts

- [x] 1.1 Añadir un contrato de prompts reutilizable que derive rutas y preguntas del clasificador.
- [x] 1.2 Exponer extracción e invariantes para que raíz y blueprint se comparen sin igualdad byte a byte.

## 2. Prompt router

- [x] 2.1 Escribir el router de la raíz con clasificación, gate humano, registro de estado y salida por ruta.
- [x] 2.2 Escribir el espejo condensado del blueprint con el mismo contrato compartido.
- [x] 2.3 Documentar relevo entre chats, recuperación y el límite de reclasificar después del bootstrap.

## 3. Prompt 00 y Prompt 01

- [x] 3.1 Actualizar Prompt 00 raíz y blueprint para leer ruta y estado sin pedir stack ni producto completo.
- [x] 3.2 Actualizar Prompt 01 raíz y blueprint para reutilizar hechos confirmados y decisiones abiertas.

## 4. Distribución y findability

- [x] 4.1 Registrar el router en el manifest del blueprint como archivo administrado.
- [x] 4.2 Enlazar el router desde README, índice de documentación, guía del usuario y entorno generado.
- [x] 4.3 Añadir el router a la comprobación de documentos críticos y a la fixture de findability.

## 5. Evidencia automatizada

- [x] 5.1 Cubrir paridad raíz/blueprint del router, de Prompt 00 y de Prompt 01.
- [x] 5.2 Cubrir invariantes por ruta, cinco preguntas, gates, relevo y recuperación.
- [x] 5.3 Cubrir casos negativos: ruta faltante, sexta pregunta, gate ausente y referencia perdida.
- [x] 5.4 Cubrir la entrada de manifest y la existencia del archivo fuente del blueprint.
- [x] 5.5 Ejecutar OpenSpec strict, npm run check, pack:verify y la fixture de bootstrap.

## 6. Cierre SDD

- [x] 6.1 Registrar evidencia manual, revisión adversarial y assessment de deuda.
- [x] 6.2 Completar metadata de readiness y preparar el archive OpenSpec.
