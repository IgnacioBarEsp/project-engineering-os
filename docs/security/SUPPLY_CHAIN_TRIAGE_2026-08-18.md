# Triage de cadena de suministro — 18 de agosto de 2026

Este registro convierte el reporte recibido de Socket y la revisión de npm en decisiones verificables. No
trata una alerta como vulnerabilidad hasta identificar el paquete, el grafo afectado y una ruta de abuso.

## Superficies revisadas

Project Engineering OS contiene dos manifiestos con propósitos distintos:

- `package.json` en la raíz describe el paquete público. No declara dependencias de runtime; `ajv` es una
  dependencia de desarrollo para pruebas y schemas.
- `blueprint/core/package.json` es una **plantilla para el repositorio consumidor**. Viaja como archivo del
  tarball y, después del bootstrap, fija OpenSpec y Project Engineering OS como dependencias de desarrollo.
  No forma parte del grafo de runtime del paquete publicado.

Comandos usados para contrastar la atribución:

```bash
npm view create-project-engineering-os@0.1.6 dependencies
npm audit
npm audit --omit=dev
npm --prefix blueprint/core audit
```

Los tres scopes quedaron sin vulnerabilidades después de actualizar `fast-uri` a 3.1.5 en el lockfile. CI
repite estas auditorías y bloquea riesgo `high` o `critical` mediante
`config/dependency-audit-policy.json`.

## Decisiones por señal

| Señal | Superficie real | Veredicto | Evidencia y seguimiento |
| --- | --- | --- | --- |
| OpenSpec aparece como dependencia del paquete | Plantilla consumidora, desarrollo | Atribución incorrecta | `npm view ... dependencies` queda vacío; conservar la aclaración en notices y costos. |
| `fast-uri` 3.0.0–3.1.4, GHSA-7p8r-x3mc-p8w7 | Desarrollo transitivo de AJV | Vulnerabilidad real, remediada | Lockfile en 3.1.5; las auditorías actuales pasan y CI impedirá regresión alta. |
| Telemetría de `posthog-node` | OpenSpec en el consumidor | Comportamiento legítimo con decisión de privacidad | Los scripts `openspec:*` del proyecto usan `OPENSPEC_TELEMETRY=0` si el usuario no eligió otro valor. |
| Cadenas con URL | Documentación y metadata pública | Informativa | URLs de repositorio, licencia y documentación; no contienen credenciales. |
| “Socket optimized override” para `is-interactive` | Dependencia transitiva de desarrollo | No es remediación de seguridad | Promoción del registro de Socket clasificada como mantenimiento; no se sustituye el paquete. |
| Acceso a shell en `@inquirer/external-editor` | Interacción de OpenSpec | Esperado | Abre el editor elegido por el usuario; no se ejecuta en CI y los installs usan scripts controlados. |
| Install script de OpenSpec | Instalación de desarrollo | Esperado y controlado | `allowScripts` fija nombre y versión; `test/supply-chain.test.mjs` detecta desalineación. |
| Posible ReDoS en `picomatch@2.3.2` | Globs internos de desarrollo | No confirmado | La alerta no aporta advisory reproducible ni entrada atacante demostrada; reabrir solo con evidencia. |
| Acceso de red en `@posthog/core` | Telemetría de OpenSpec | Riesgo de privacidad acotado | Ver decisión de telemetría y límites abajo. |

## Default de telemetría y límite

OpenSpec 1.6.0 admite preferencia global y variables de entorno, pero no configuración local por proyecto.
Modificar la preferencia global durante bootstrap afectaría repositorios que Project Engineering OS no
posee. Por eso el wrapper administrado aplica este contrato:

- sin `OPENSPEC_TELEMETRY`, los scripts `npm run openspec:*` usan `0`;
- un valor explícito, incluido `1`, se conserva;
- `DO_NOT_TRACK=1` continúa siendo respetado por OpenSpec;
- una invocación directa como `npm exec openspec` usa el comportamiento upstream y queda fuera del wrapper.

Fuentes upstream: [CLI y configuración](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md),
[implementación del comando config](https://github.com/Fission-AI/OpenSpec/blob/main/src/commands/config.ts) y
[FAQ de telemetría](https://github.com/Fission-AI/OpenSpec/blob/main/docs/faq.md).

## Excepciones y recuperación

La política comienza sin excepciones. Si una vulnerabilidad alta no tiene corrección inmediata, la entrada
debe coincidir exactamente con scope, paquete y advisory, identificar motivo, owner, aprobador, creación,
caducidad de hasta 30 días y recuperación. Un campo ausente, una excepción vencida o un fallo del registro
hace fallar el gate; nunca se transforma en PASS.

Owner: mantenedor de Project Engineering OS. Revisión de origen: Issue
[#18](https://github.com/IgnacioBarEsp/project-engineering-os/issues/18).
