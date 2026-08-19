## Context

Project Engineering OS se distribuye como paquete MIT y su documentación es parte del artefacto público.
La entrada actual es correcta, pero concentra conceptos, comandos y límites en bloques textuales sin una
ruta de lectura por intención. El cambio cruza README, quince documentos, recursos visuales y el perfil del
autor, por lo que necesita una jerarquía y un contrato de veracidad comunes.

El runtime, el blueprint y el motor de deuda no cambian. El onboarding adaptativo, los tableros remotos y
el catálogo futuro de herramientas pertenecen a #23. El bug #20 obliga a no describir la automatización
remota actual como más completa de lo que es.

## Goals / Non-Goals

**Goals:**

- Explicar qué resuelve el proyecto antes de introducir sus contratos técnicos.
- Hacer visible la relación SDD -> evidencia -> deuda -> cierre mediante texto y recursos complementarios.
- Ofrecer un primer recorrido reproducible con comandos y agentes soportados hoy.
- Mantener el detalle técnico accesible en dos saltos o menos desde el README.
- Registrar una identidad visual reutilizable en README, documentación y perfil.

**Non-Goals:**

- Cambiar CLI, runtime, blueprint, schemas, OpenSpec, Debt Control o releases.
- Implementar el prompt adaptativo, crear tableros o instalar skills/MCP.
- Convertir todos los documentos en contenido promocional ni ocultar limitaciones operativas.
- Declarar soporte para Antigravity u otros agentes no verificados.

## Decisions

### 1. La entrada usa divulgación progresiva, no una portada comercial

El README seguirá este orden: nombre y frase breve, qué es, visuales, flujo principal, funciones, cómo
probarlo, documentación, tecnologías/compatibilidad, estado y autor. Los detalles operativos se enlazan a
un índice de documentación orientado a tareas. La versión inglesa vive en un `<details>` para mantener el
español como ruta principal sin duplicar toda la altura visual.

Alternativa descartada: hablarle explícitamente a reclutadores o convertir el README en una landing de
venta. Rompe la voz personal y dificulta el uso real del repositorio.

### 2. Los visuales son híbridos, deterministas y complementarios

Se crearán dos composiciones con el mismo contenido y tokens. Ambas usarán una pieza editorial local para
explicar el sistema y evidencia obtenida de una ejecución real del CLI. El texto esencial también aparecerá
como Markdown y bloques de terminal, por lo que una imagen ausente no bloquea la comprensión.

Las fuentes editables se conservan como SVG/HTML local y la versión publicada se rasteriza a PNG o WebP
para una representación estable en GitHub. No se usan servicios de render, imágenes de terceros ni texto
generado dentro de una ilustración no verificable.

Alternativa descartada: una imagen generativa como pieza principal. Es menos precisa para comandos,
tipografía, accesibilidad y mantenimiento.

### 3. Una sola identidad, dos direcciones para aprobación

La identidad compartida usa negro cálido, verde profundo y crema. La frase “La verdadera ingeniería
empieza antes del código” funciona como acento editorial, no como sustituto del título. El flujo SDD recibe
la máxima jerarquía; el motor de deuda, la segunda; compatibilidad, evidencia, rollback y costos aparecen
como señales menores.

- Variante A — **Plano de control**: recorrido horizontal estructurado que relaciona decisiones, evidencia
  y cierre. Refuta el patrón genérico de terminal flotante como único protagonista.
- Variante B — **Cuaderno de ingeniería**: composición editorial asimétrica con una columna de terminal
  real y anotaciones de proceso. Refuta el patrón genérico de tarjetas SaaS repetidas.

La selección humana es un gate de implementación. El owner aprobó la Variante A — Plano de control el
2026-08-18 en #22; la Variante B permanece como evidencia comparativa y no se publica como identidad.

### 4. El README solo afirma capacidades comprobables

Los comandos se derivan de `bin/project-os.mjs`, `package.json` y un fixture limpio. La compatibilidad se
limita a Claude Code, Codex, Cursor, GitHub Copilot y OpenCode, aclarando degradaciones cuando corresponda.
Prompt 00 prepara el ecosistema y Prompt 01 descubre el producto; el nuevo router se describe únicamente
como trabajo futuro enlazado a #23.

Alternativa descartada: escribir ahora el prompt ideal solicitado por el usuario. Eso convertiría una
decisión de producto pendiente en documentación falsa.

### 5. La simplificación documental conserva propiedad y contratos

`docs/README.md` se reorganiza por preguntas: empezar, entender el sistema, operar cambios, distribuir y
recuperar. Cada documento recibe un resumen, audiencia, prerrequisitos o enlaces siguientes cuando aporte
claridad. No se reescriben requirements, comandos ni ownership sin evidencia del código o specs.

### 6. Compatibilidad, propiedad, costo y recuperación

- **Compatibilidad:** Markdown de GitHub, temas claro/oscuro y anchuras de móvil/escritorio. El arte se
  prueba con fondos externos claros y oscuros y conserva margen seguro.
- **Propiedad:** README, `PRODUCT.md`, `DESIGN.md`, `docs/` y recursos son propiedad upstream. La tarjeta del
  perfil es una copia adaptada en el repositorio de perfil y se actualiza solo tras aprobación.
- **Costo:** cero; sin dependencias de runtime ni servicios de pago.
- **Licencia:** contenido propio bajo MIT. Una fuente externa solo se incorpora si su licencia permite
  redistribución y queda registrada; la opción preferida es usar fuentes de sistema o convertir solo formas
  propias sin incrustar tipografías.
- **Recuperación:** cada superficie es revertible por commit; el cambio no migra datos ni modifica estado
  remoto salvo la PR documental autorizada.

## Risks / Trade-offs

- **Una portada visual puede parecer más importante que el producto** -> La pieza ocupa una sola zona y el
  texto operativo continúa inmediatamente después.
- **El raster pierde nitidez o aumenta el repositorio** -> Se exportan tamaños acotados, se conserva fuente
  editable y se verifica peso/legibilidad antes de commit.
- **GitHub no reproduce exactamente un navegador de diseño** -> Se usan formatos soportados, fondos
  autosuficientes y previews en temas y anchuras representativas.
- **Simplificar introduce afirmaciones obsoletas** -> Los datos variables se obtienen del código o se
  enlazan, y el check documental valida comandos/enlaces relevantes.
- **La versión inglesa puede quedar atrás** -> Se limita a un resumen equivalente y se incluye en la
  revisión de consistencia.
- **La actualización del perfil cruza repositorios** -> Se mantiene como tarea separada, con diff y commit
  propios, después de aprobar el recurso final.

## Migration Plan

1. Crear y presentar dos variantes locales usando el mismo contenido verificado.
2. Registrar la selección humana de la Variante A en #22.
3. Crear `PRODUCT.md`, `DESIGN.md`, recursos finales y el nuevo README.
4. Reorganizar el índice y simplificar los documentos por lotes pequeños, comparando contratos.
5. Ejecutar checks, fixture de inicio rápido, enlaces, previews y revisión adversarial.
6. Actualizar el perfil en un commit separado y verificar su render.
7. Archivar el change y abrir PR protegido. Ante fallo, revertir la superficie afectada y repetir evidencia.

## Open Questions

- Confirmar, en la implementación, si PNG o WebP ofrece la mejor combinación de nitidez y peso para GitHub.
