# Por qué hace falta revalidar los adapters

Una sola palabra por celda tenía que decir a la vez qué escribe el constructor y qué se ha demostrado sobre
el consumo. Como no separaba las dos cosas, la matriz no podía fechar sus fuentes ni distinguir
configuración de smoke, y envejeció sin avisar. Codex ya no escanea la ruta donde escribíamos su skill, y
Cursor y Copilot documentan superficies que la matriz declaraba no soportadas.

# Cómo se construirá

`support` pasa a describir solo el rendering: el constructor escribe la ruta oficial documentada, en el
formato documentado, y una fixture offline lo prueba. Un bloque nuevo registra versión mínima, fuente
oficial fechada, y startup, tool listing y smoke como campos separados que solo aceptan no verificado o un
receipt opt-in. Ninguna de esas tres señales puede producirla la CI, y el diseño deja de fingir que puede.

# Qué comportamiento entregará

Una celda que afirme soporte sin fuente fechada, sin fixture o sin fallback ya no se renderiza: falla. Una
celda no puede declararse nativa mientras excluye superficies oficiales de su propio harness, así que
Copilot deja de ser una fila genérica y nombra las superficies que solo se configuran fuera del repositorio.
Antigravity sigue no soportado y su fixture demuestra por qué.

# Qué trabajo se realizará

Se revalidan las cinco superficies contra su documentación oficial, se reapunta la skill de Codex a la ruta
que sí escanea, y la skill compartida pasa de una copia por proveedor a dos archivos. Se añade un contrato
de adapters con casos negativos y se ensaya la actualización real de un repositorio bootstrapeado con el
runtime anterior.

# Resumen integral del change

El Issue #32 convierte una matriz que envejecía en silencio en un contrato que falla cuando envejece. La
configuración y el smoke ocupan campos distintos, así que uno no puede leerse como el otro. Las fuentes
llevan fecha. Las superficies que no tienen archivo versionado se nombran en vez de esconderse detrás de una
fila genérica. Y el archivo que pertenece al consumidor sigue siendo suyo: cuando nombra una ruta retirada,
la capacidad se entrega por su reemplazo y la desactualización queda declarada, no reescrita.
