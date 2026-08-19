# Project OS remoto

Project OS es la vista compartida del trabajo: issues, estados, evidencia y gates. El bootstrap genera un
plan declarativo, pero no crea ni modifica recursos remotos sin autorización.

**Úsalo si:** quieres configurar GitHub Projects, protección de ramas o entender por qué un issue está
bloqueado.

El upstream y los repositorios consumidores tienen fuentes distintas porque gobiernan momentos distintos:

- este repositorio usa [`.project-os/repository-governance.json`](../.project-os/repository-governance.json);
- el bootstrap instala `.project-os/github/product-os.json` en cada repositorio consumidor;
- antes de que ese archivo exista, `github-plan` puede previsualizar el seed versionado en
  `blueprint/core/project-os/github/product-os.json` y lo identifica como `blueprint-seed`.

La salida siempre muestra `Fuente` y `Procedencia`. `target` significa que leyó el repositorio recibido;
`blueprint-seed`, que usó la plantilla. Nunca presenta un seed como si fuera un archivo local.

Para el upstream, la única taxonomía normativa es la del manifest enlazado: Backlog, Ready, In progress,
In review, Blocked y Done; labels `bug`, `change`, `documentation`, `debt-remediation`, `security`,
`incident` y `rollback`. El seed consumidor posee su propia taxonomía de discovery y no gobierna este repo.

La rama por defecto exige PR, checks de CI y conversaciones resueltas; prohíbe force-push y borrado. En
la etapa de mantenedor único no exige un review que el autor no puede darse a sí mismo: la aprobación
humana se registra en el issue. Los PR externos sí requieren revisión del mantenedor. El environment
`npm-publish` protege la identidad OIDC. Un plan remoto se previsualiza con
`project-os github-plan`; autenticación, creación de recursos y cambios de protección son gates humanos.

La ausencia, cancelación o skip inesperado de un check no equivale a éxito.

## Límite actual

`project-os github-plan` solo previsualiza. La preparación adaptativa de tableros se investiga en el
[issue #23](https://github.com/IgnacioBarEsp/project-engineering-os/issues/23).

Para saber qué decisiones siguen siendo humanas, consulta la [guía manual](GUIA_MANUAL_USUARIO.md).
