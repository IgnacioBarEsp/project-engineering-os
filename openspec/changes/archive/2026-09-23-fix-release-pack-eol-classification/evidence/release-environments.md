# GitHub release environment policy

Fecha: 2026-09-24. Repositorio: `IgnacioBarEsp/project-engineering-os`.

Configuración verificada de nuevo mediante la API de GitHub el 2026-09-24 UTC:

| Environment | Deployment branch policy | Admin bypass | Reviewer |
| --- | --- | --- | --- |
| `github-release` | Solo `main` | Deshabilitado | No requiere aprobación adicional |
| `npm-publish` | Solo `main` | Deshabilitado | Se conserva `IgnacioBarEsp` como reviewer requerido; `prevent_self_review: false` |

El flujo también condiciona los tres jobs (`build`, `github-release`, `npm`) a
`github.ref == 'refs/heads/main'`. Los ambientes externos siguen siendo la barrera de autorización
para las operaciones privilegiadas; el condicional del workflow es defensa adicional. La policy de
`npm-publish` se actualizó sin reemplazar su regla de reviewer existente.

La protección existente se conserva en `protected-release-tags` (ID `19627973`), activa sobre
`refs/tags/v*` y `refs/tags/companion-v*`, con reglas `creation`, `deletion` y `non_fast_forward` y el
mismo actor de bypass de rol de repositorio. Se complementa con `immutable-release-tag-targets` (ID
`23918131`), que cubre esos mismos refs con reglas `update` y `deletion`, `bypass_actors: []` y
`current_user_can_bypass: never`. Así se conserva el flujo existente de creación y ninguna identidad de
tag publicada puede moverse o borrarse, tampoco por el bypass del primer ruleset.

En el job GitHub Release, el validador compara `HEAD` con el destino del tag remoto y verifica que el
`commit` del manifest candidato coincida con `HEAD` antes de adjuntar assets. Esto detecta divergencia
entre el candidato ya construido y el ref protegido en el momento del release.
