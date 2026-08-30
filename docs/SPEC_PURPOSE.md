# Purpose de las capabilities publicadas

Cuando archivas un change, OpenSpec publica la capability con un texto sembrado bajo `## Purpose` que te
invita a redactarlo después. `openspec validate --all --strict` lo acepta, porque solo comprueba que la
sección exista. Si nadie lo mira, ese texto sobrevive a la revisión y queda en la spec publicada.

**Úsala si:** `opsx-check` o el gate de documentación te reportan un fallo `opsx.spec-purpose`.

## Qué revisa el gate

`opsx-check` inspecciona cada capability publicada en `openspec/specs/*/spec.md`. No mira los deltas de
`openspec/changes/**`, que legítimamente no declaran Purpose.

| Veredicto | Cuándo |
| --- | --- |
| `PASS` | La capability declara un Purpose propio y redactado. |
| `FAIL` `purpose-placeholder` | El Purpose conserva el texto que sembró el archive, o abre con un marcador de pendiente. |
| `FAIL` `purpose-empty` | La sección existe y su cuerpo está vacío. |
| `FAIL` `purpose-missing` | La spec no declara la sección. |
| `FAIL` `spec-unreadable` | El directorio de la capability existe y su `spec.md` no se puede leer. |
| `FAIL` `specs-root-unreadable` | `openspec/specs` existe y no se puede recorrer. |
| `SKIP` | El repositorio todavía no publica capabilities. |

Es `FAIL` y no aviso: el diagnóstico read-only no infiere PASS de nada, y una spec publicada que conserva el
texto sembrado es deuda real. El `SKIP` tampoco es un PASS; declara que no hay nada que afirmar.

## Cómo se corrige

El comando nombra el archivo. Abre esa `spec.md` y escribe bajo `## Purpose` una o dos frases que declaren
qué contrato observable posee la capability: qué garantiza, para quién y en qué límite. No repitas el título
ni enumeres requisitos; para eso está `## Requirements`.

```sh
npm run project-os:opsx:check
```

## Si actualizas desde una versión que no traía el gate

Antes de la entrada "Spec Purpose gate reaches every repository" del [CHANGELOG](../CHANGELOG.md), esta
comprobación vivía solo en el repositorio upstream. Un repositorio creado con el blueprint pudo archivar
capabilities con el texto sembrado sin que ningún check lo observara.

Después del upgrade esas specs fallan. No es un falso positivo: es deuda preexistente que se vuelve
observable. Redacta el Purpose de cada capability que el comando nombre; no hay migración de estado que
ejecutar ni configuración que cambiar, y el comando sigue siendo read-only.

Vuelve a [documentación](README.md) para el índice completo, o revisa
[ownership](architecture/OWNERSHIP.md) para saber qué superficie pertenece a OpenSpec y cuál al upstream.
