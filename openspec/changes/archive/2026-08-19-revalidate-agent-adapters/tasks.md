## 1. Revalidación contra fuentes oficiales

- [x] 1.1 Revalidar las cinco superficies contra su documentación oficial y registrar la fecha de consulta.
- [x] 1.2 Comprobar que cada URL registrada responde 200 sin redirección antes de fecharla.

## 2. Contrato de evidencia por capacidad

- [x] 2.1 Añadir el bloque de verificación al schema con señales de runtime, superficies y fallback.
- [x] 2.2 Normalizar y validar el bloque en el runtime, rechazando fuente sin fecha, fixture ausente y fallback perdido.
- [x] 2.3 Impedir que una señal de runtime acepte una referencia de configuración o un valor verificado sin receipt.
- [x] 2.4 Limitar a `generated` toda celda que excluya superficies oficiales de su propio harness.
- [x] 2.5 Mantener el bloque opcional en el normalizador para no romper una copia seed-once anterior.

## 3. Adapters por agente

- [x] 3.1 Reapuntar el adapter de skills de Codex a la ruta oficial documentada.
- [x] 3.2 Unificar la skill compartida en dos archivos y retirar las copias por proveedor del manifest.
- [x] 3.3 Promover skills de Cursor, Copilot y OpenCode al destino compartido con su fuente fechada.
- [x] 3.4 Modelar MCP de Copilot por superficie y corregir sus permisos a documented con la razón escrita.
- [x] 3.5 Registrar el gate de proyecto confiado de Codex y el límite de vocabulario de permisos.

## 4. Compatibilidad de consumidores existentes

- [x] 4.1 Resolver destinos retirados contra su reemplazo instalado sin reescribir el archivo seed-once.
- [x] 4.2 Publicar el destino retirado y su reemplazo como degradación visible en el espejo generado.
- [x] 4.3 Ensayar la actualización real de un consumidor bootstrapeado con el runtime anterior.

## 5. Antigravity

- [x] 5.1 Evaluar Antigravity en una fixture de candidato separada, fuera de la matriz y del paquete.
- [x] 5.2 Comprobar que el contrato de promoción lo rechaza y que un candidato completo sí lo pasaría.

## 6. Evidencia automatizada

- [x] 6.1 Añadir el contrato de adapters reutilizable con una fixture por formato oficial.
- [x] 6.2 Comprobar el contrato sobre el repositorio realmente bootstrapeado dentro de la fixture.
- [x] 6.3 Cubrir casos negativos de fuente, fecha, fixture, fallback, señal de runtime y superficies divergentes.
- [x] 6.4 Ejecutar npm run check, pack:verify, la fixture de bootstrap y git diff --check.

## 7. Documentación

- [x] 7.1 Actualizar la matriz pública, la del blueprint y la matriz por agente con fuentes fechadas.
- [x] 7.2 Escribir las degradaciones declaradas y el criterio de promoción de instrucciones por ruta.

## 8. Cierre SDD

- [x] 8.1 Registrar evidencia de validación, evidencia manual y revisión adversarial.
- [x] 8.2 Completar metadata de readiness, assessment de deuda y preparar el archive OpenSpec.
