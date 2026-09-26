## 1. Entrada

- [x] 1.1 Verificar issue #147, DoR y ausencia de PR duplicado; reutilizar dependencias de #144/#145/#146 sin repetir implementación.
- [x] 1.2 Validar specs con OpenSpec local 1.6.0 y registrar alcance autorizado antes de aplicar.

## 2. Motores y composición

- [x] 2.1 Añadir activationPrompt determinista con reporte comprobado, diferencias por perfil/enfoque y pruebas.
- [x] 2.2 Ampliar rutas con versiones compatibles, importación Claude y transición de propiedad tras bootstrap; probar recuperación v1 y v2.
- [x] 2.3 Añadir resultado de preparación y handoff de activación al servicio sin nueva inferencia.

## 3. Asistente

- [x] 3.1 Encadenar planes reales en paso 4, incluyendo alcance de archivos, licencias, bytes y destino.
- [x] 3.2 Probar estados, progreso, cancelación, reintento y continuación con pendientes; preservar borrador/cierre seguro.
- [x] 3.3 Mostrar resultado desde stageReport con copia IPC y handoff verificado.

## 4. Evidencia

- [ ] 4.1 Ejecutar suites Companion, UI, contrato, Electron y raíz; OpenSpec strict.
- [ ] 4.2 Registrar revisión propia, evaluación de deuda, recuperación y límites humanos; preparar PR borrador apilado.
