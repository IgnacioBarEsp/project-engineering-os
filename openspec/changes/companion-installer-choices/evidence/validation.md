# Validación — companion-installer-choices (#168)

Esta evidencia la produjo el agente del apply. Ninguna persona ejecutó o marcó las casillas del instalador en
esta sesión. La instalación silenciosa y las comprobaciones de fuente no se presentan como observación humana.

## Resultado local

| Comprobación | Resultado | Registro |
| --- | --- | --- |
| `npx --no-install openspec validate companion-installer-choices --strict --no-interactive` | PASS | Validación estricta del change |
| `npm test --prefix apps/companion` | 145 tests, 145 PASS, 0 FAIL | Suite de Companion |
| `npm run audit --prefix apps/companion` | 0 vulnerabilidades de producción | Auditoría npm |
| `npm run check` | 350 tests, 350 PASS, 0 FAIL | Suite completa del repositorio |
| `npm run pack --prefix apps/companion` | PASS, instalador x64 generado | Candidato local limpio |
| `npm run pack:verify --prefix apps/companion -- directorio-de-candidato` | PASS | Árbol limpio, 2.547 archivos empaquetados, 2.619 instalados, núcleo 0.5.0 |
| `node --check` sobre los scripts modificados | PASS | Sintaxis de los harnesses |
| `git diff --check` | PASS | Sin errores de whitespace |

El candidato medido desde el árbol limpio `dc2509a1e13c4fcd908ea64ddb952489e8cd175b` es
`ProjectEngineeringOS-Setup-0.3.2-x64.exe`, 133.310.012 bytes, SHA-256
`3890ab25c794a92629fb65cecc78a436277e0aaf809c997e8382938eda5a2c65`. `pack:verify` observó árbol limpio,
2.547 archivos empaquetados, 2.619 instalados, núcleo 0.5.0 y firma `NotSigned`. El workflow de release debe
reconstruir el candidato desde el commit integrado antes de publicar.

## Qué queda para Windows desechable

El verificador conserva la guardia que solo permite ejecutarse en GitHub Actions o con
`PROJECT_OS_DISPOSABLE_WINDOWS=1`. En este equipo no hay Windows Sandbox, una VM Windows preparada ni una imagen
para crearla de forma legítima. El registro de release no se ejecutó y no se marca como PASS.

La ejecución protegida debe registrar, en una única corrida del candidato exacto:

1. Baseline de las páginas estándar y diálogos contextuales del instalador anterior.
2. Las ramas marcada/desmarcada de la página «Crear acceso directo en el escritorio».
3. Las ramas marcada/desmarcada de la casilla estándar de Finish.
4. Español en las páginas estándar y en los mensajes propios.
5. Instalación silenciosa, actualización desde 0.1.0, desinstalación y preservación de proyecto, historial y runtime.

## Deriva y límites

No se detecta deriva de versión, núcleo, rutas de datos o propiedad del menú Inicio. La observación real de UI,
la comparación contra el baseline y la ejecución de instalación/actualización/desinstalación son una deuda de
evidencia del runner protegido, no una afirmación satisfecha por este checkout.
