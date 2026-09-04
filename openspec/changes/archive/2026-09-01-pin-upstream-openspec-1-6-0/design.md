# Design - fijar OpenSpec en el upstream

## 1. Decisión

Declarar `@fission-ai/openspec` 1.6.0 en `devDependencies` con versión exacta y en `allowScripts` con el mismo
par. `package-lock.json` es la única resolución y `npm ci` la ruta de instalación reproducible.

## 2. Alternativas

| Opción | Veredicto | Razón |
| --- | --- | --- |
| Dependencia exacta de desarrollo | Elegida | Satisface el contrato local, auditable y reproducible sin alterar runtime. |
| Instalación global o `@latest` | Descartada | No viaja con el clon y puede divergir entre agentes/workstations. |
| Ruta absoluta a otro checkout | Descartada | Reproduce el defecto observado y depende de una máquina concreta. |
| Dependencia de runtime | Descartada | Los consumidores ya fijan su propia CLI; el runtime no la importa. |

## 3. Instalación y scripts

npm 11 puede bloquear scripts no autorizados. La allowlist nombra exactamente
`@fission-ai/openspec@1.6.0`; una versión distinta no hereda permiso. La instalación usa `npm ci`, no un
fallback flotante.

## 4. Supply chain

OpenSpec 1.6.0 declara MIT. La nueva superficie transitoria se somete a `check:audit`; cualquier advisory
alto o crítico sin excepción válida impide el cierre. `npm pack` debe mantener `dependencies` vacío.

## 5. Compatibilidad

La versión no cambia respecto de los consumidores ni de los artefactos existentes. Node 20.20/22.22+
satisface sus requisitos. Windows, Linux y macOS usan la misma entrada de lockfile.

## 6. Readiness del upstream

El gate in situ falla antes de leer el issue porque #49 todavía no ha sembrado
`.project-os/readiness-policy.json`. El spike #46 ya ejecutó el gate real sobre un target desechable y
registró PASS 13/13 para #48. Esta limitación se conserva como evidencia explícita; no se convierte en PASS.

## 7. Recuperación

Revertir `package.json`, `package-lock.json` y los artefactos del change. `npm ci` vuelve al grafo anterior.
No hay datos, secretos, servicios, configuración global ni estado remoto que restaurar.
