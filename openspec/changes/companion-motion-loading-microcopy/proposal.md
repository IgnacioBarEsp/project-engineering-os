## Why

Issue #149: https://github.com/IgnacioBarEsp/project-engineering-os/issues/149. Tras reconstruir el flujo y el proyecto, el movimiento conserva reglas antiguas y el progreso no vive junto a las acciones. Hay que medir movimiento, espera y feedback sin afirmar trabajo no comprobado.

## What Changes

- Tokens 120/200/280 ms, curva de salida, transiciones same-document con fallback y reduced-motion instantáneo.
- Progreso real en barra de acciones, cancelación y etapa larga; skeleton/estado vacío compartidos.
- Avisos accesibles 4 s, máximo dos; copia confirmada 2 s solo tras IPC exitoso. Errores siguen en panel.
- Gradiente limitado a títulos Inicio/final; quitar pulsos decorativos y halos en reposo.
- Documentación y evidencia automática/nativa, protocolo ampliado de lectura en frío para dos personas (no simuladas).

## Capabilities

### New Capabilities
- `companion-motion-feedback`: movimiento acotado, carga, progreso y confirmación auténtica.

### Modified Capabilities

Ninguna; se conservan contratos de preparación y experiencia.

## Impact

Renderer y harnesses, DESIGN.md y protocolo de lectura. Sin dependencias, red ni servicios nuevos. Riesgo: callback de transición diferido contra foco/estado; pruebas con fallback y fallos. Rollback: revertir PR, datos sin migración. La delegación de ola 3 autoriza implementar; no acredita respuestas humanas ni revisión independiente.
