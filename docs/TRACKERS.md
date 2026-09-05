# Preparar y verificar un tracker remoto

`tracker` separa el plan local de su ejecución y conserva el tracker existente. `github-plan` mantiene su
contrato anterior: sus propuestas no son una entrada ejecutable de este flujo.

## Alcance de la versión 1

| Proveedor condicional | Operaciones implementadas | Smoke de lectura |
| --- | --- | --- |
| GitHub Projects | Crear proyecto privado; verificar o configurar descripción de uno existente | Proyecto y colección de items |
| Azure Boards | Verificar o configurar descripción de un proyecto existente, por UUID | Equipos del proyecto |
| Jira Cloud | Verificar o configurar descripción de un proyecto existente, por ID o clave | Estados del proyecto |

No se crean proyectos organizacionales Azure/Jira, cuentas, esquemas, campos, vistas, issues ni migraciones.
No se instalan SDKs ni compran planes; aplican los términos y límites de la cuenta elegida. Un smoke prueba
acceso de lectura a esa superficie, no permisos de escritura ni una configuración completa del equipo.

Contratos consultados el 2026-09-05: [GitHub Projects](https://docs.github.com/en/graphql/reference/projects),
[actualización de proyectos Azure](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects/update?view=azure-devops-rest-7.1),
[equipos Azure](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/teams/get-teams?view=azure-devops-rest-7.1)
y [proyectos Jira Cloud](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/).
La integración real de este cambio cubrió GitHub. Azure/Jira tienen pruebas de contrato con respuestas
simuladas; cada organización debe verificarlos con su cuenta antes de considerarlos operativos.

## Confirmar contexto y solicitar una operación

Confirma las respuestas de `.project-os/onboarding-state.json` mediante
[onboarding](ADAPTIVE_ONBOARDING.md); no reemplaces ese estado por una respuesta aislada. El plan respeta
`local-only`, proveedores existentes y decisiones desconocidas o pospuestas. Solo sugiere GitHub cuando
el origen es GitHub, se confirmó que no existe tracker y se eligió revisar opciones remotas.

Crea `.project-os/tracker-request.json` como documento propio. Esta es la forma de verificar un proyecto
GitHub existente; reemplaza las identidades ilustrativas por las reales:

```json
{
  "schemaVersion": 1,
  "provider": "github-projects",
  "action": "verify",
  "connection": { "owner": "example", "ownerType": "user" },
  "project": "PVT_project_id"
}
```

`ownerType` acepta `user` u `organization`. Para Azure usa `provider: "azure-boards"`,
`connection: { "organization": "example" }` y el UUID del proyecto. Para Jira usa `provider: "jira"`
y `connection: { "site": "https://example.atlassian.net" }`. No se admiten hosts personalizados, rutas,
puertos ni credenciales en la conexión.

Para configurar una descripción, cambia `action` a `configure` y agrega estos campos al documento completo:

```json
{
  "description": "Descripción acordada",
  "before": { "name": "Nombre actual", "description": "Descripción actual" }
}
```

Usa los valores reales de la última verificación. `apply` relee ambos y falla si cambiaron; no cambia
el nombre ni otros ajustes del tracker existente. Para crear un proyecto GitHub privado, usa
`action: "create"`, `name` y `description`, sin `project` ni `before`. Requiere ausencia confirmada de tracker.
Un nombre existente exige seleccionar el recurso por ID; no se adopta ni recrea silenciosamente.
La descripción breve GitHub admite hasta 256 caracteres; Azure/Jira se limitan a 1.000 en este contrato.

## Revisar y guardar el plan

```sh
project-os tracker plan --target . --json
```

Guarda la salida JSON completa como `tracker-plan.json` dentro del target. `--request` acepta otra ruta
local. El comando no escribe, autentica, consulta la red ni cambia Git. Si devuelve `needs-input`, resuelve
las preguntas y genera otro plan. Su digest vincula solicitud, estado, origen, directorio y operaciones.
Caduca a las 24 horas; un cambio de las fuentes lo invalida para apply.

## Autorizar y ejecutar

Prepara un documento separado, `tracker-approval.json`. Este ejemplo de configuración GitHub es explicativo:
completa digest, responsable y fecha reales, y copia exactamente los IDs y scopes de `plan.operations`,
en el mismo orden y sin el campo `effect`:

```json
{
  "schemaVersion": 1,
  "planDigest": "digest SHA-256 completo del plan revisado",
  "actor": "Responsable que autoriza",
  "expiresAt": "fecha UTC futura dentro de las próximas 24 horas",
  "operations": [
    { "id": "project.configure", "scopes": ["project"] },
    { "id": "project.verify", "scopes": ["read:project"] }
  ]
}
```

Una creación incluye además `project.create` con scope `project`, antes de configure y verify. No se
admiten comodines, operaciones adicionales ni permisos ampliados. La aprobación registra una decisión del
operador; no es firma digital ni autentica la identidad de `actor`.

| Proveedor | Variables de sesión | Scopes de aplicación declarados |
| --- | --- | --- |
| GitHub | `PROJECT_OS_GITHUB_TOKEN` | Lectura `read:project`; escritura `project` |
| Azure | `PROJECT_OS_AZURE_TOKEN`, token Bearer autorizado por la organización | Lectura `vso.project`; escritura `vso.project_manage` |
| Jira | `PROJECT_OS_JIRA_TOKEN` y `PROJECT_OS_JIRA_EMAIL` | Lectura `read:jira-work`; escritura `manage:jira-configuration` |

Proporciona credenciales mediante el mecanismo de sesión autorizado por tu organización. No las pegues
en documentos ni comandos guardados. No hay login automático ni ampliación de permisos. Los scopes
describen operaciones de la aplicación: el CLI **no introspecciona todos los permisos efectivos del token**;
los informa como `unverified`. La cuenta debe tener los permisos correspondientes del proveedor.

```sh
project-os tracker apply --target . --plan tracker-plan.json --approval tracker-approval.json --json
project-os tracker verify --target . --plan tracker-plan.json --json
```

Apply comprueba plan, contexto y aprobación antes de leer credenciales. Las solicitudes tienen destino
HTTPS fijo, timeout, límite de respuesta y redirects deshabilitados. Azure puede procesar una actualización
asíncrona; si no la confirma dentro del límite, queda incierta, nunca PASS.

## Evidencia y recuperación

El resultado separa `configuration`, `existence` y `smoke`. En verify sin valor esperado, configuration
confirma el contrato de configuración e identidad leído; no certifica un ajuste deseado que no se solicitó.
`drift` compara el recurso con el snapshot del receipt cuando existe.

El journal `.project-os/tracker-transactions/<digest>.json` conserva intención antes de mutar, identidad,
snapshots y resultado. Los errores omiten cuerpos remotos y credenciales. El detector rechaza patrones de
credenciales conocidos; no reconoce todo secreto arbitrario. Nombres y descripciones siguen siendo datos
del proyecto: protege estos archivos según su sensibilidad y exclúyelos de publicaciones inapropiadas.

Repetir un apply completado solo relee. Un intento incompleto exige reconciliación y nunca repite una
creación cuyo resultado pudo llegar al servidor. Verify puede inspeccionar el plan original para
recuperación aunque haya vencido; no cambia el journal ni convierte una operación incierta en completada.

Si un proceso terminó dejando `active.lock`, verifica su PID y que no siga ejecutándose. Conserva el
journal y retira únicamente ese lock abandonado. Si hay identidad remota, consulta ese recurso; si la
creación no devolvió ID, inspecciona el catálogo por nombre antes de decidir. Un resultado sin identidad o
sin snapshot verificado requiere reconciliación explícita del operador: es la recuperación manual tras
un fallo que el runtime no puede resolver con seguridad. No generes otro plan para ocultar ese resultado.

## Rollback atribuible al receipt

Prepara aprobación nueva con el digest original, expiración vigente y una única operación
`project.rollback` con los scopes de escritura del proveedor. La aprobación de apply no la sustituye.

```sh
project-os tracker rollback --target . --plan tracker-plan.json --approval tracker-rollback-approval.json --json
```

En un tracker existente restaura solo la descripción anterior si el snapshot todavía coincide. Nunca
elimina ese tracker. Un proyecto GitHub creado por el receipt solo se elimina si sigue privado, vacío y
sin cambios en el snapshot observado. El snapshot incluye contenido del README, metadatos y opciones de
campos, filtros/layout de vistas, revisión y cantidad de items; no es una copia completa del servicio. Un rollback
interrumpido conserva su intención y exige inspección; no repite a ciegas una eliminación.

Coordina una ventana sin ediciones concurrentes: estas APIs no ofrecen una transacción común entre
relectura y escritura. El flujo detecta drift antes/después y conserva resultados inciertos; no promete
ejecución exactamente una vez ante toda carrera remota. No borres receipts para recuperar: perderías
la evidencia de atribución.
