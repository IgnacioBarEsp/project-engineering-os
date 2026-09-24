# Revisión adversarial

Fecha: 2026-09-24. Revisión estructurada de seguridad, corrección, rendimiento y mantenimiento conforme a
`engineering:code-review`. Ejecución y revisión delegadas por el mantenedor a Codex; esto no afirma una
revisión humana independiente.

## Alcance

`package.json`, allowlist npm, inspección/extracción de tarball y enlaces, generación y validación de las
métricas del manifest, links de documentación y regresiones.

## Hallazgos y resultado

1. El primer empaquetado mostró que `docs/README.md` también aparecía en el artefacto pese a no estar en la
   lista inicial. Se añadió explícitamente a la allowlist y se convirtió en un índice de guías del núcleo.
2. La primera inspección de enlaces identificó destinos relativos hacia documentación del Companion o
   archivos de upstream excluidos. Se sustituyeron por URLs canónicas de GitHub o por guías del núcleo que
   sí viajan; se adaptó el contrato público existente para aceptar esos enlaces externos exactos.
3. El checker ahora limita cantidad/tamaño/salida/tiempo del subproceso y no extrae el tarball si el listado
   contiene una ruta insegura. La extracción es temporal; los enlaces se comprueban contra el árbol extraído.
4. Los manifests nuevos exigen conteo y bytes sin comprimir acotados; el verificador publicado conserva
   soporte legacy solo cuando ambos campos faltan, para no invalidar releases inmutables anteriores.

No quedan hallazgos abiertos. No se añadieron dependencias ni cambios a Companion, `bin/`, `src/`, `schema/`
o `blueprint/`. Los casos adversariales de rutas no declaradas, carpetas prohibidas, enlaces Markdown y
HTML rotos, métricas parciales/fuera de rango y manifests legacy tienen regresiones. Veredicto: **Approve**,
como revisión delegada del agente, no como aprobación humana independiente.
