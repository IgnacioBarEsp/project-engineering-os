# Revisión adversarial de contexto

Alcance: #78, `route-companion-context`. Revisor inicial: agente independiente
`review_companion_context`, guiado por la skill adversarial-review del consumidor de referencia.
Leyó la spec y la implementación y ejecutó los nueve tests iniciales y reproducciones propias.
No es revisión humana ni un estudio de usuarios.

## Hallazgos iniciales y resolución

| Severidad inicial | Hallazgo reproducido | Corrección y evidencia |
| --- | --- | --- |
| Major | DOCX con párrafo vacío desplazaba la cita o rechazaba XML válido | Parser saxes con namespaces y numeración que incluye párrafos vacíos; regresión y repro independiente repetido devuelven párrafo 2 |
| Major | XML estructuralmente inválido se aceptaba sin advertencias | Validación de todo el XML antes de emitir extractos; el repro devuelve `invalid-xml` y cero secciones |
| Major | Omisión silenciosa de `.github` ocultaba workflows y cambios | Lista precisa de rutas de control, corpus incluye workflows; repro modificado devuelve `stale` |
| Minor | Corte UTF-16 dividía caracteres suplementarios | Corte conserva pares surrogate; regresión reconstruye el texto exacto y comprueba `isWellFormed()` |

El veredicto inicial fue FAIL. La sesión del revisor agotó su cuota antes de la segunda revisión; **no hay
un segundo PASS independiente**. El agente implementador reejecutó el script original del revisor,
inspeccionó sus salidas y ejecutó las 14 pruebas de la app después de las correcciones. Se conservan las
salidas en `revalidation.jsonl`; los casos nuevos forman parte de QA versionado.

La prueba adicional de composición detectó un Major local: editar espejos del constructor provocaba
deriva de sync. Se corrigió con rutas a la fuente canónica del consumidor y `planSync` delegado al
constructor real. La regresión cubre la secuencia completa y comprueba ambas verificaciones finales.
Este hallazgo y su resolución son del implementador, no del revisor independiente.

Decisión final bajo delegación expresa del mantenedor: PASS de verificación local tras corregir los
hallazgos; cero blockers/majors/minors conocidos abiertos en este alcance. No se atribuye esta decisión
al revisor independiente. La revisión integrada de UI/instalador y el benchmark siguen en #79–#81.

Límites documentados: los workers no son un sandbox del sistema operativo; el diario es integridad de
recuperación, no autenticación contra procesos del mismo usuario; documentos, grafo, OCR y agentes no
se declaran completos o activos por existir un archivo. La exportación no demuestra resistencia universal
a prompt injection, ni ahorro de tokens, ni disminución de alucinaciones.
