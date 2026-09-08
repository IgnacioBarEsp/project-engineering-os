# Evidencia de #78

Fecha: 2026-09-08. Spec aprobada por la delegación expresa del mantenedor para #66 y sus issues.
DoR: 13 PASS, 0 FAIL, 0 excepciones después del cierre de #77 mediante PR protegido #83.

## Validación automática

- `node --test apps/companion/qa/context.mjs`: 14 PASS, 0 FAIL. PDF/páginas, DOCX/párrafos, texto/líneas,
  cinco perfiles, seis selecciones de IA, receta, preservación, idempotencia, rutas, archivos modificados,
  recuperación en los nueve pasos, cambios posteriores, exclusiones, secretos reconocibles, timeout,
  XML malformado, párrafos vacíos, UTF-8, Unicode suplementario, exportación y herramientas optativas.
- Composición real base/constructor/contexto/sync: PASS. Los espejos generados se conservan, se cambia
  su fuente canónica, el constructor sincroniza y se actualiza el contexto; ambas verificaciones pasan.
- `npm run check`: PASS; 286 pruebas del núcleo. Contrato de paquete, neutralidad, docs, workflows y deuda.
- `npm run fixture`: PASS, repositorio vacío construido desde el tarball del núcleo.
- `npm run check:audit`: PASS, 0 hallazgos altos/críticos, 0 excepciones.
- App `npm run audit`: PASS, 0 vulnerabilidades informadas por npm en dependencias de producción.
- OpenSpec local 1.6.0: `validate route-companion-context --strict` PASS.
- CI incorpora tres jobs de Companion con Node 24.18.0 y conserva seis jobs del núcleo con Node 20/22.
  Todos alimentan el gate protegido `CI / required`; su resultado remoto debe comprobarse antes de merge.

El primer control local de workflows rechazó el cambio porque buscaba la lista antigua exacta de jobs.
Se actualizó para exigir también Companion y su resultado exitoso, manteniendo la auditoría del núcleo.
No se omitieron ni debilitaron protecciones para solucionar ese fallo.

## Inspección manual de salida

Se creó una carpeta temporal sintética de investigación con dos fuentes UTF-8, se aplicó el motor base,
se revisó el plan de contexto y se aplicó. La búsqueda `tokens medidos` devolvió las líneas 4 y 3 de
`fuentes/criterios.txt`, que se cotejaron con el contenido original. La exportación observada conserva
esas líneas, hashes, consulta y límites en 1099 bytes, `sent:false` y `tokenCount:null`. Los originales
se conservaron; la carpeta temporal se eliminó tras comprobar su ruta absoluta y prefijo.

Artefactos: `manual.json`, `manual-export.md`. Esto es inspección de la API y salida textual, no prueba
de interacción visual, instalación nativa, lectura por una IA externa ni benchmark de modelos.

## Revisión, seguridad, licencias y compatibilidad

La revisión independiente encontró tres Majors y un Minor. Todos tienen corrección y regresión. La
revalidación final fue local porque el revisor agotó cuota; el origen y límite de evidencia están en
`adversarial-review.md`. La autorización del mantenedor permite continuar sin fabricar revisión humana.

Las dependencias de extracción están fijadas en el paquete privado de Companion; las del núcleo no
cambian. Licencias, alternativas y límites se documentan en `docs/companion/CONTEXT.md`. La evaluación
de grafos usa identidades exactas y no declara activación: `docs/companion/GRAPH_TOOLS.md`.
No se añaden proveedores, telemetría, cuentas, OCR ni modelos al núcleo. Ningún archivo privado del
mantenedor se leyó, publicó o utilizó como fixture en este cambio.

Las pruebas base comprueban vínculos, colisiones y bloqueo compartido. Los nuevos tests ejercitan estados
manipulados y rutas fijas; rollback rechaza cambios posteriores. Corpus e índices pueden contener datos
privados y deben permanecer locales hasta una exportación revisada. Las limitaciones de alcance son
explícitas y no se registran como funcionalidades supuestamente terminadas.

## Deuda y rollback

Assessment `clean`, cero candidatos abiertos en este alcance. #79–#81 conservan UI, instalador, activación
de herramientas, landing y comparación real pendientes. No se cierra #66 con esta evidencia parcial.
Rollback comprobado restaura bytes originales de instrucciones y elimina únicamente los archivos propios
con hashes coincidentes; rechaza ediciones posteriores. Para upstream, revertir este PR conserva datos
del consumidor y su evidencia.
