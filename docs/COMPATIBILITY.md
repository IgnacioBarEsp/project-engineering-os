# Compatibilidad

Aquí puedes comprobar dónde se prueba el paquete y qué representa realmente cada agente. “Documented” o
“unsupported” describe una degradación visible; nunca se cuenta como soporte nativo.

**Úsala si:** eliges agente, sistema operativo, versión de Node o investigas una diferencia entre entornos.

## Sistemas y runtime

| Sistema | Node probado en CI | Contrato |
|---|---|---|
| Ubuntu | 20.20.0, 22.22.0 | suite, fixture y tarball |
| Windows | 20.20.0, 22.22.0 | misma CLI sin dependencia Bash |
| macOS | 20.20.0, 22.22.0 | misma CLI y rutas portables |

Rango soportado: `^20.20.0 || >=22.22.0`. npm es el único package manager garantizado en v1.

## Harnesses

| Harness | Instrucciones | Path rules | Skills | Permisos | MCP |
|---|---|---|---|---|---|
| Claude Code | native | documented | native | documented | native |
| Codex | native | documented | native | documented | native |
| Cursor | native | documented | unsupported | documented | native |
| GitHub Copilot | native | documented | unsupported | unsupported | unsupported |
| OpenCode | generated | documented | generated | documented | native |

`documented` y `unsupported` no se cuentan como paridad nativa. Config presente, proceso iniciado, tool
listing y smoke autenticado son señales diferentes.

## Qué elegir

- Claude Code y Codex reciben instrucciones, skills y MCP nativos.
- Cursor recibe instrucciones y MCP nativos; las skills quedan visibles como fallback documental.
- GitHub Copilot conserva instrucciones, pero no representa skills, permisos ni MCP de forma equivalente.
- OpenCode usa adaptadores generados para instrucciones y skills, y configuración MCP nativa.

Vuelve a la [guía del usuario](USER_GUIDE.md) para continuar con el setup.
