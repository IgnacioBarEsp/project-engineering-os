## Context

El run `34949788943` verificó el checkout anotado de `companion-v0.2.0`, construyó
`ProjectEngineeringOS-Setup-0.2.0-x64.exe` y se detuvo en `pack:verify`. El proceso invocaba
`WindowsPowerShell\\v1.0\\powershell.exe`; en `windows-latest`, su autoload de
`Microsoft.PowerShell.Security` falló. No hubo descarga de 0.1.0, ciclo de instalación, draft, assets ni
publicación.

## Decision

1. **Host observable.** `verify-app-artifact.mjs` invoca `pwsh`, que es el host usado explícitamente por
   los pasos del runner, y hace `Import-Module ... -ErrorAction Stop`. Un módulo ausente, un comando ausente
   o un estado que no sea `NotSigned` impide continuar; no hay fallback que convierta falta de inspección en
   éxito.
2. **Identidad nueva.** Se incrementa sólo la aplicación privada a 0.2.1. Un tag anotado
   `companion-v0.2.1` se creará únicamente después de fusionar esta corrección. `companion-v0.2.0` no se
   mueve ni recibe una release retroactiva.
3. **Una fuente de versión.** El workflow lee `apps/companion/package.json` para nombrar el instalador,
   título y notas. La comprobación previa ya exige que ese valor coincida con el tag.

## Recovery

Si la nueva ejecución falla antes de publicar, Companion 0.1.0 sigue siendo la única descarga pública. Se
conservan los logs y se corrige con otro change; ningún tag ni asset se sustituye. Un revert de este PR deja
las versiones públicas y los datos de la persona sin cambios.
