# Lectura en frío: el protocolo que necesita una persona

Dos criterios de [#97](https://github.com/IgnacioBarEsp/project-engineering-os/issues/97) no los puede
cumplir ninguna comprobación automática, y tampoco un agente: piden que **alguien que no conozca la
aplicación** lea una pantalla y diga qué entendió. Ningún modelo puede ocupar ese lugar, porque lo que se
está midiendo es justamente si el lenguaje funciona con una persona que no leyó este repositorio.

Así que aquí no hay resultado. Hay el procedimiento para obtenerlo en unos minutos, y el formato exacto en
el que se registra.

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

Ambos criterios están **sin verificar** desde el 12 de septiembre de 2026, y su causa es esta: requieren una
persona y nadie la ha hecho todavía. No se sustituyeron por una heurística, por un agente ni por el juicio
de quien escribió el texto.

## Relacionado

- [Experiencia de Companion](EXPERIENCE.md): los cuatro destinos y la regla de lenguaje.
- [Glosario](GLOSSARY.md): las definiciones que la interfaz abre desde donde aparece cada término.
- [Evidencia](EVIDENCE.md): qué se midió y qué no.
- [Documentación](../README.md): índice general.
