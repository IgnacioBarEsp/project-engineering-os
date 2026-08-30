# El gate que solo protegía al upstream

`openspec archive` publica cada capability nueva con un texto sembrado bajo `## Purpose`. El validador
estricto lo acepta, porque solo comprueba que la sección exista. El Issue #42 cerró eso en el upstream.

## Por qué no llegó a nadie más

El gate vivía en `scripts/`, y `scripts/` no se publica. Un repositorio creado con el blueprint ejecuta el
mismo archive, recibe el mismo texto y ninguno de sus gates lo mira.

## Qué cambia

El módulo se mueve a `src/`, que sí se publica, y lo importan dos llamadores: el gate de documentación del
upstream y `opsx-check`, el comando read-only que el consumidor ya ejecuta en cada comprobación. Un módulo,
dos consumidores, cero divergencia.

## Qué se siente al fallar

`FAIL`, con el archivo nombrado y qué escribir en él. No `WARN`: una spec publicada que conserva el texto
sembrado es deuda real, y el contrato del diagnóstico read-only es no inferir PASS de nada.

## Lo que no hace

No cambia OpenSpec ni su archive, no reescribe specs ajenas y no mira los deltas de `openspec/changes`, que
legítimamente no declaran Purpose.
