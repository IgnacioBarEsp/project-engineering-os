La aplicación instalada ya prepara un índice local y devuelve pasajes con fuente. El arnés
`apps/companion/scripts/verify-benchmark.mjs` compara tres vías sobre diez preguntas, conserva resultados
por pregunta y separa bytes devueltos de bytes leídos. La evidencia pública actual procede de un corpus
sintético de 6812 bytes: el barrido literal y abrir todo responden 8/10, Companion 10/10, y el índice cuesta
más bytes de lectura que el corpus. El benchmark con modelo también es sintético y no demuestra velocidad
en repositorios grandes.

No existe hoy un protocolo durable para repositorios externos, una comprobación de commit y tamaño, un
digesto que impida cambiar las preguntas después de observar el resultado, ni evidencia sobre un corpus
grande. `docs/companion/EVIDENCE.md` declara correctamente ese límite y la landing no promete velocidad.

El runtime de Companion limita su inventario y su contexto. Esos límites forman parte del comportamiento
medido: el arnés no los amplía, no cambia las extensiones soportadas y no toca el producto para mejorar el
resultado. GitNexus y CodeGraph están instalados en la máquina, pero este upstream no los tiene activados y
`docs/SELF_APPLICATION.md` conserva su adopción como «no aplicar (sin valor)» hasta una decisión separada.
