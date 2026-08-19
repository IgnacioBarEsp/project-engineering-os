# Por qué existe este spike

Project Engineering OS prepara el entorno y descubre el producto en dos etapas fijas. Falta decidir cómo
cambiar el orden para una persona principiante, una experimentada o un repositorio existente, y cómo
explicar tableros, skills y MCP sin imponer herramientas ni ejecutar acciones remotas sin permiso.

# Cómo se tomará la decisión

Se comparará el comportamiento real del CLI con fuentes oficiales actuales. La ruta se elegirá por evidencia
del repositorio y hasta cinco preguntas breves. El CLI conservará el estado determinista; una skill guiará la
conversación; MCP e integraciones remotas serán opcionales, con permisos mínimos y autorización granular.

# Qué comportamiento quedará documentado

El decision record separará capacidad oficial del agente, soporte actual del constructor y objetivo futuro.
Definirá tres rutas, política de tracker, catálogo de herramientas, seguridad, rollback y la regla de decidir
CI/CD o arquitectura solo después del discovery. El spike no cambia el runtime.

# Qué trabajo se realizará

Verificar fuentes y manifests, escribir el decision record, recorrer tres casos en papel, añadir navegación,
crear issues implementables, ejecutar checks y registrar una revisión adversarial. Ninguna skill, MCP,
cuenta o dependencia investigada se instalará o activará.

# Resumen integral del change

El resultado será una política práctica y reversible para implementar onboarding adaptativo sin confundir
propuesta con producto disponible. Mantendrá Project Engineering OS neutral, respetará herramientas
existentes en brownfield y dejará cada mutación remota detrás de preview, permiso explícito, receipt y
recuperación.
