# Project OS remoto

Project OS es la vista compartida del trabajo: issues, estados, evidencia y gates. El bootstrap genera un
plan declarativo, pero no crea ni modifica recursos remotos sin autorización.

**Úsalo si:** quieres configurar GitHub Projects, protección de ramas o entender por qué un issue está
bloqueado.

La configuración declarativa vive en `.project-os/product-os.json`.

Estados recomendados: Backlog, Ready, In progress, In review, Blocked y Done. Labels mínimos:
`discovery`, `architecture`, `quality`, `infrastructure`, `change`, `debt-remediation`, `security`,
`incident` y `rollback`.

La rama por defecto exige PR, checks de CI y conversaciones resueltas; prohíbe force-push y borrado. En
la etapa de mantenedor único no exige un review que el autor no puede darse a sí mismo: la aprobación
humana se registra en el issue. Los PR externos sí requieren revisión del mantenedor. El environment
`npm-publish` protege la identidad OIDC. Un plan remoto se previsualiza con
`project-os github-plan`; autenticación, creación de recursos y cambios de protección son gates humanos.

La ausencia, cancelación o skip inesperado de un check no equivale a éxito.

## Límite actual

`project-os github-plan` solo previsualiza. La preparación adaptativa de tableros se investiga en el
[issue #23](https://github.com/IgnacioBarEsp/project-engineering-os/issues/23), y el contrato remoto actual
tiene una corrección pendiente en el
[issue #20](https://github.com/IgnacioBarEsp/project-engineering-os/issues/20).

Para saber qué decisiones siguen siendo humanas, consulta la [guía manual](GUIA_MANUAL_USUARIO.md).
