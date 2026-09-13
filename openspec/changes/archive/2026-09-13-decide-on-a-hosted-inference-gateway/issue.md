## User Story

Como mantenedor, quiero poder ofrecer inferencia a quien no tenga modelo local ni clave propia, sin exponer mi clave ni mi máquina, para que la personalización llegue a todos sin que me cueste la seguridad.

## Context / Problem

El mantenedor ofreció prestar su clave de pago. **No se puede repartir dentro de la aplicación**: el companion se empaqueta con `asar: false` —decisión deliberada de #80 para que el Node administrado lea los módulos copiados— así que su código va en texto plano en `resources/app` y una clave ahí se extrae en segundos.

También propuso que la aplicación llame a un modelo en su computadora. Eso tiene consecuencias que hay que decidir a conciencia: su máquina apagada deja a todos sin el nivel, exponer LM Studio requiere túnel y autenticación, y **el contenido que se envíe pasaría por su equipo**.

Ese último punto está acotado por el diseño ya decidido: el modelo recibe solo respuestas del asistente e inventario de tipos, **nunca contenido de archivos**. Aun así, un servicio de terceros procesando datos de otras personas cambia lo que la aplicación puede prometer.

## Desired Outcome

Un diseño evaluado —no implementado— de qué haría falta: dónde vive, cómo autentica, cómo limita el uso, qué registra, qué promete y qué cuesta. Con una recomendación clara de hacerlo o no hacerlo.

## Scope

- **En alcance:** opciones de alojamiento; autenticación por instalación; límites y protección contra abuso; qué se registra y qué no; implicaciones legales y de privacidad; coste estimado; y la recomendación.
- **Fuera de alcance:** construirlo. Este issue decide si vale la pena.

## Acceptance Criteria

- [ ] Al menos dos opciones de alojamiento comparadas con criterios escritos, incluida la de **no ofrecerlo**.
- [ ] Coste estimado con supuestos explícitos de volumen.
- [ ] Diseño de límites que sobreviva a alguien que intente usarlo como API gratuita.
- [ ] Se define qué se registra, cuánto se conserva y qué ve el mantenedor; y se comprueba que no permite reconstruir el proyecto de nadie.
- [ ] Queda escrito qué tendría que cambiar en lo que la aplicación promete si este nivel existe.
- [ ] Recomendación explícita, con su razón.

## Decision Criteria

**No ofrecerlo es una respuesta perfectamente buena.** Los niveles 0, 1 y 3 —plantillas, modelo local y clave propia— ya cubren a todos sin que el mantenedor cargue con infraestructura, coste y responsabilidad sobre datos ajenos. Este nivel solo se justifica si aporta algo que ninguno de los tres da.

## SDD / Documentation Impact

Registro de decisión. Si sale adelante, `docs/companion/SECURITY.md` y la pantalla de privacidad cambian.

## Validation / Evidence

Documento comparativo con criterios, costes y riesgos, y la recomendación firmada.

## Risks / Open Questions

- Ofrecer inferencia a terceros convierte un proyecto personal en un servicio con obligaciones. Hay que decidirlo despierto, no por inercia.
- Abierto: si conviene esperar a ver si alguien lo pide de verdad antes de construirlo.



---

## Historia Original

Todo lo anterior a esta línea es la historia original tal como la escribió el mantenedor el 12 de septiembre
de 2026. No se reinterpreta ni se resume: los criterios de aceptación y de decisión de arriba son los que
rigen. En particular el criterio de decisión: **no ofrecerlo es una respuesta perfectamente buena**, y este
nivel solo se justifica si aporta algo que los tres niveles existentes no den.

## Enriquecida

La base es `main` con #97, #98, #99, #106, #100 y #105 integrados. Lo que existe hoy, leído del código:

**Los cuatro niveles ya están construidos y son de primera clase.** `apps/companion/runtime/inference.mjs`
declara `LEVELS = ['off','local','provider','own-key']`, con sus etiquetas visibles: solo plantillas en este
equipo; un modelo en tu equipo; un proveedor gratuito con tu clave; tu proveedor con tu clave. `off` no es una
degradación: es un estado que la aplicación entera respeta —la recomendación de tecnología de #100, por
ejemplo, se decide sin modelo a propósito— y quien lo tenga apagado recibe el mismo producto explicado.

**La frontera de datos ya está construida y medida.** `shareableFacts` reconstruye campo por campo lo que sale
—perfil, experiencia, rol, objetivo, agentes, pendientes, conteo de archivos— y `projectDataIn` rechaza un
cuerpo que lleve datos del proyecto, comparando en NFC y minúsculas después de que una revisión independiente
metiera un nombre de archivo cambiando solo la caja. El borrador y las notas pegadas por la persona **no
viajan**. Eso acota lo que un gateway procesaría, pero no lo elimina: sigue siendo el objetivo de alguien, su
rol y su experiencia, que son datos personales aunque no sean archivos.

**La clave nunca está en la aplicación.** #99 lo dejó cerrado: el companion se empaqueta con `asar: false`
—decisión de #80 para que el Node administrado lea los módulos copiados— así que su código viaja en texto
plano y una clave ahí se extrae en segundos. El nivel `provider` funciona con la clave **de la persona**, que
la aplicación no almacena.

**Lo que no existe.** No hay ningún componente hosteado, ningún servidor, ningún dominio, ninguna cuenta de
proveedor a nombre del proyecto, ninguna autenticación por instalación y ningún registro de uso. Este issue no
va a crear ninguno: pide un diseño evaluado y una recomendación, y dice explícitamente que construirlo está
fuera de alcance.

### Criterios de comparación, escritos antes de mirar ninguna opción

Se fijan aquí, antes de haber evaluado ningún proveedor ni ninguna arquitectura, por el mismo motivo que en
#105: una comparación cuyos criterios se escriben después de mirar los candidatos no compara, justifica.

1. **Qué aporta que los tres niveles existentes no den.** Si la respuesta es «nada», el criterio de decisión
   del issue ya la resolvió.
2. **Qué promete la aplicación y qué tendría que dejar de prometer.** Hoy dice que tus documentos se leen en
   este equipo, que no hay cuenta ni suscripción y que compartir es una acción tuya y aparte.
3. **Qué datos de otras personas pasarían por dónde**, y bajo qué jurisdicción y qué obligaciones.
4. **Qué cuesta**, con supuestos de volumen explícitos y el caso de abuso incluido, no solo el caso feliz.
5. **Qué pasa cuando falla o se apaga**, y a quién deja sin nivel.
6. **Cuánto trabajo continuo exige**: claves que rotar, abuso que atender, facturas que vigilar, incidentes que
   responder.

### Lo que este issue no va a hacer

No va a construir el gateway, ni a registrar un dominio, ni a abrir una cuenta, ni a escribir código de
servidor. No va a añadir un quinto nivel a `LEVELS`. Y no va a recomendar hacerlo solo porque sea posible: la
pregunta es si aporta algo que los tres niveles no den, y la respuesta puede ser que no.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "decide-on-a-hosted-inference-gateway",
  "execution": "versioned",
  "dependencies": [105],
  "currentState": {
    "summary": "Los cuatro niveles off, local, provider y own-key estan construidos y son de primera clase, con off respetado por toda la aplicacion. La frontera de datos ya esta construida y medida: shareableFacts reconstruye campo por campo lo que sale y projectDataIn rechaza un cuerpo con datos del proyecto comparando en NFC y minusculas. La clave nunca esta en la aplicacion porque se empaqueta con asar false y se extraeria en segundos, asi que el nivel provider usa la clave de la persona. No existe ningun componente hosteado, servidor, dominio, cuenta a nombre del proyecto, autenticacion por instalacion ni registro de uso.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/107", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/113"]
  },
  "scope": ["Criterios de comparacion escritos antes de mirar opciones", "Al menos dos opciones de alojamiento comparadas, incluida la de no ofrecerlo", "Coste estimado con supuestos de volumen explicitos, incluido el caso de abuso", "Diseno de limites, de autenticacion por instalacion y de que se registra y cuanto se conserva", "Que tendria que cambiar en lo que la aplicacion promete", "Recomendacion explicita con su razon"],
  "observableCriteria": ["El documento compara al menos dos opciones de alojamiento mas la de no ofrecerlo, contra criterios escritos antes", "El coste declara sus supuestos de volumen y cubre el caso de abuso, no solo el feliz", "Los limites se disenan contra alguien que intente usarlo como API gratuita, no contra un usuario educado", "Queda escrito que se registra, cuanto se conserva y que ve el mantenedor, y que eso no permite reconstruir el proyecto de nadie", "Queda escrito que promesas de la aplicacion cambiarian", "Hay una recomendacion explicita con su razon, y no ofrecerlo es un resultado valido"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Que se recomiende construirlo por inercia o por que sea posible, en vez de por lo que aporte", "Que el coste se estime solo en el caso feliz", "Que se subestime la obligacion continua de operar un servicio con datos de terceros", "Que el documento describa un diseno tan concreto que se lea como una decision ya tomada"],
  "surfaces": ["documentation"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorizacion expresa del mantenedor para llevar los once issues abiertos de inicio a fin con el flujo SDD del repositorio, 12 de septiembre de 2026.","justification":"Este issue no construye nada, no abre ninguna cuenta, no registra ningun dominio y no contrata ningun servicio. Produce un documento de decision. Los costes que se estimen son hipoteticos y se declaran como tales."},
  "evidence": {"automatic":["openspec-strict","secret-scan","relative-link-check"],"manual":["Documento comparativo con criterios escritos antes, costes con supuestos explicitos, y revision adversarial independiente de si la comparacion esta construida para llegar a una conclusion"]},
  "rollback": {"strategy":"Revertir el PR: el registro de decision desaparece y no queda nada construido que retirar, porque este issue no construye nada. Ninguna promesa de la aplicacion cambia y ningun nivel se anade.","trigger":"Una recomendacion que no se sostenga en los criterios escritos antes, o un coste sin supuestos declarados.","recovery":"Restaurar el documento anterior y volver a evaluar con los criterios congelados."},
  "nonGoals": ["Construir el gateway", "Registrar un dominio o abrir una cuenta a nombre del proyecto", "Anadir un quinto nivel a LEVELS", "Recomendar hacerlo por ser posible en vez de por lo que aporte"],
  "exceptions": []
}
project-os-readiness:pre-propose -->
