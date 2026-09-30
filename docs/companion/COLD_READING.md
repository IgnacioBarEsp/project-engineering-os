# Lectura en frío: el protocolo que necesita una persona

Dos criterios de [#97](https://github.com/IgnacioBarEsp/project-engineering-os/issues/97) no los puede
cumplir ninguna comprobación automática, y tampoco un agente: piden que **alguien que no conozca la
aplicación** lea una pantalla y diga qué entendió. Ningún modelo puede ocupar ese lugar, porque lo que se
está midiendo es justamente si el lenguaje funciona con una persona que no leyó este repositorio.

Aquí se conserva el procedimiento y el formato de registro. La primera ronda de #149 dio un resultado
negativo; una comprobación automática no puede convertirlo en positivo.

**Úsalo si:** vas a cerrar uno de esos dos criterios, o quieres repetir la medición tras cambiar el lenguaje.

## Qué se mide

| Criterio | Pregunta exacta | Se cumple si |
| --- | --- | --- |
| El nombre del control de exportación se entiende sin abrirlo | Señalar el botón **«Preparar un texto para pegar en tu chat»** sin pulsarlo y preguntar: «¿qué crees que hace este botón?» | La respuesta menciona obtener o copiar texto para llevarlo a otra parte, sin que haya que explicárselo. |
| Inicio explica qué hace la aplicación | Abrir **Inicio**, dar hasta un minuto de lectura y preguntar: «¿qué hace esta aplicación?» | La respuesta describe preparar u ordenar una carpeta para usarla con una IA, en sus propias palabras. |

## Cómo se hace

1. Elige a alguien que **no** haya usado la aplicación ni leído este repositorio. Una persona basta; dos o
   tres dan más información, y ninguna cantidad convierte esto en un estudio de usabilidad.
2. Abre la aplicación en **Inicio**. No expliques nada antes. No digas el nombre del producto.
3. Haz la pregunta de la tabla, literal, una sola vez.
4. **Escribe la respuesta tal como la dijo**, sin corregirla ni resumirla. Si dudó, anota que dudó. Si
   preguntó algo antes de responder, anota su pregunta.
5. No preguntes «¿está claro?» ni «¿se entiende?». Esas preguntas se responden que sí por cortesía.

## Dónde se registra

En el change abierto que corresponda, como `evidence/cold-reading.json`, con esta forma:

```json
{
  "date": "2026-09-DD",
  "application": "0.1.0",
  "readers": [
    {
      "knewTheApplication": false,
      "screen": "inicio",
      "question": "¿qué hace esta aplicación?",
      "answerVerbatim": "...",
      "hesitated": false,
      "askedFirst": null
    }
  ],
  "conclusion": "cumple | no cumple | parcial, con la razón"
}
```

Una respuesta que no cumple **no se arregla reescribiendo la conclusión**: se cambia el texto de la pantalla
y se vuelve a preguntar a otra persona. Preguntar dos veces a la misma persona ya no mide una lectura en
frío.

## Estado

### Ampliación de la ola 3 (#149)

Para #149 se necesitan **dos personas diferentes**, ajenas a la aplicación. La regla anterior de una
persona corresponde al protocolo original de #97, no basta para cerrar #149. Con cada persona, sin
explicación previa, mostrar Inicio y después el paso 1 «¿Qué vas a preparar?»:

- Inicio: «¿qué hace esta aplicación?».
- Paso 1: «¿qué te pide esta pantalla y qué harías ahora?».

Registrar un identificador anónimo de lector, pantalla, pregunta literal, respuesta literal, dudas y
preguntas previas. El paso 1 se entiende si la respuesta identifica elegir carpeta, nombrar el proyecto
y escoger su tipo, sin asistencia del evaluador. Conservar también la prueba del control de exportación.
No registrar nombres, grabaciones ni datos personales sin consentimiento.

El archivo del change de #149 conserva la primera ronda válida con `status: "failed"`: dos personas
nuevas vieron Inicio y después el paso 1, pero confundieron el propósito o no reconocieron la carpeta
como elección necesaria. No es evidencia positiva. El mantenedor confirmó el orden y que las respuestas
son literales; la fecha exacta de entrevista no consta.

Tras corregir el texto y destacar la carpeta, una **segunda ronda** con otras dos personas figura en
`followUpRound` con `status: "passed"`. El mantenedor confirmó que no conocían la aplicación ni las capturas
y que vieron Inicio y después el paso 1 sin explicación. Ambas respuestas de Inicio identifican preparar
proyectos o carpetas para trabajar con IA; ambas del primer paso identifican nombre, carpeta y tipo. Las
cuatro respuestas literales y el comentario de una persona sobre la distribución visual se conservaron.
Se conoce la fecha de recepción y el commit de las capturas, no la fecha exacta de entrevista. El mantenedor
pidió después revisar la composición, primero con un ejemplo y luego con beneficios concretos y fondos
degradados. Después pidió revisar los beneficios y extender el fondo animado a toda la app. Las personas
de esta ronda no vieron esas propuestas posteriores, todavía en revisión visual.
La aprobación del mantenedor y la lectura
de una versión cuyo lenguaje cambie se registrarán por separado.

El criterio de comprensión de Inicio y paso 1 de #149 **cumple en esa segunda ronda**. El control de
exportación todavía requiere su propia observación humana. Ninguno se sustituye por una heurística, por
un agente ni por el juicio de quien escribió el texto.

## Relacionado

- [Experiencia de Companion](EXPERIENCE.md): los cuatro destinos y la regla de lenguaje.
- [Glosario](GLOSSARY.md): las definiciones que la interfaz abre desde donde aparece cada término.
- [Evidencia](EVIDENCE.md): qué se midió y qué no.
- [Documentación](../README.md): índice general.
