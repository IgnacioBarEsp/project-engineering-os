# Por qué hace falta el clasificador

El onboarding adaptativo ya tiene tres rutas decididas, pero hoy depende de que una conversación interprete
la carpeta y recuerde el resultado. Este cambio crea una base local y reproducible que distingue proyectos
nuevos de repositorios que deben preservarse antes de que otros prompts o integraciones actúen.

# Cómo se construirá

Un comando read-only inspeccionará señales acotadas y combinará esa evidencia con cinco respuestas JSON.
No seguirá symlinks, no leerá contenido arbitrario ni usará red. La evidencia brownfield tendrá prioridad.
El resultado será un estado ordenado, versionado y sin datos de máquina, con migración v0 a v1 en memoria.

# Qué comportamiento entregará

`onboarding-plan` elegirá `beginner`, `experienced-new` o `brownfield`, mostrará por qué, mantendrá preguntas
pendientes y decisiones pospuestas, y prohibirá rebootstrap en brownfield. Texto y JSON describirán la misma
decisión y confirmarán que no hubo escritura ni mutación remota.

# Qué trabajo se realizará

Se añadirán módulo, schemas, exports, flags, documentación y pruebas. Las fixtures cubrirán las tres rutas,
ambigüedad, entradas inválidas, inspección incompleta, privacidad, estado previo, migración y determinismo.
Después se ejecutarán checks, package smoke, revisión adversarial, deuda y readiness antes de archivar.

# Resumen integral del change

El Issue #30 convertirá una decisión documental en un clasificador seguro y portable. Entregará el contrato
que #31 podrá orquestar, sin adelantar persistencia, prompts o trackers. Una carpeta con trabajo siempre se
preserva; una carpeta nueva recibe una ruta proporcional; cualquier incertidumbre queda visible y reversible.
