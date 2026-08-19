# El plan debe decir qué repositorio está describiendo

`github-plan` era read-only, pero su resultado no era confiable: podía imprimir como fuente un archivo que
no existía y aplicar al upstream los issues, estados y campos pensados para un proyecto consumidor.

## Dos dominios, dos fuentes explícitas

El upstream conserva `.project-os/repository-governance.json`, que ya coincide con su Project real. Un
repositorio bootstrapeado conserva `.project-os/github/product-os.json` y, antes del primer bootstrap, puede
usar su seed. No se fusionan ambas taxonomías ni se fuerza una migración de consumidores existentes.

## Procedencia observable

El JSON indicará si la fuente salió del target, del blueprint o de un bloque inline. `source` apuntará a la
ruta realmente leída. La salida humana mostrará ambas piezas y nunca presentará un fallback como archivo
local. Una fuente personalizada ausente seguirá fallando con recuperación.

## Trabajo y cierre

Se normalizan recursos upstream, se añaden pruebas target/seed/missing, se actualiza la guía y se compara el
resultado con GitHub Project 3. OpenSpec, suite, pack, revisión adversarial, deuda y readiness cierran el
change antes del PR.

## Resumen integral

El comando seguirá sin autenticar ni mutar GitHub. Su mejora es epistemológica y operativa: cada plan podrá
explicar qué datos conoce, de dónde salieron y qué sigue sin verificarse. El consumidor conserva su inicio
guiado; el upstream obtiene sus seis estados, siete labels y cero discovery issues.
