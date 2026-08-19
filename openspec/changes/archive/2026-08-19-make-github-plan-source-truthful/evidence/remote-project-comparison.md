# Comparación con GitHub Project 3

Consulta read-only realizada el 18 de agosto de 2026 sobre
`https://github.com/users/IgnacioBarEsp/projects/3`.

| Contrato | Manifest upstream | Project remoto | Resultado |
| --- | --- | --- | --- |
| Título | Project Engineering OS | Project Engineering OS | PASS |
| Estados | Backlog, Ready, In progress, In review, Blocked, Done | Los mismos seis, en el mismo orden | PASS |
| Labels normativos | bug, change, documentation, debt-remediation, security, incident, rollback | Los siete existen en el repositorio | PASS |
| Fuente declarada | `.project-os/repository-governance.json` | El README del Project nombra esa ruta | PASS |

GitHub conserva labels predeterminados y de automatización que no forman parte del workflow normativo; no
se eliminaron ni renombraron. Los 13 fields visibles son fields integrados de GitHub, no seis campos custom
de discovery. No hubo mutación remota.

Salida local contrastada:

```text
Fuente: .project-os/repository-governance.json
Procedencia: target
discoveryIssues: 0
labels: 7
statuses: 6
```
