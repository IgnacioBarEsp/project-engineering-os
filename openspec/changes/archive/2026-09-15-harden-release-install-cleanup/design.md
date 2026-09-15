## Context

`verify-release-installation.mjs` mide en un runner Windows desechable: instala 0.1.0, actualiza al
candidato, recorre la app instalada con cinco perfiles, desinstala y escribe `installer-cycle.json`.
Todo ocurre bajo un root de `mkdtemp` dentro del temporal del runner, y un `finally` lo borra con un
único `rm` recursivo. El desinstalador NSIS copia su propio ejecutable a `%TEMP%\~nsu*.tmp` y el lock
de esos bytes sobrevive unos instantes al proceso: el `rm` inmediato chocó con eso (run 34959088623) y
el `finally` convirtió ese choque en el error visible, ocultando el estado real de la medición.

## Decision

1. **Módulo de cleanup con reintentos.** `scripts/disposable-cleanup.mjs` exporta
   `removeDisposableRoot({ root, temporaryBase, attempts, delayMs, rm, now })`: verifica que `root`
   siga dentro de `temporaryBase` antes de tocar nada, reintenta mientras el error sea `EBUSY` o
   `EPERM` hasta un presupuesto acotado (diez intentos, tres segundos entre intentos) y devuelve un
   resultado explícito `{ status: 'removed' | 'locked', path, attempts }`. Un lock persistente no es un
   fallo de medición: el root vive en el temporal efímero del runner y el job termina igual; se declara
   en consola y en `cleanup.json` dentro del directorio de evidencia.
2. **El error de medición manda.** El script captura el error del cuerpo, ejecuta el cleanup y
   relanza el error original sin alterar. Si el cleanup falla por una causa distinta de lock
   transitorio, ese detalle se añade como causa secundaria en la evidencia, pero el error relanzado
   sigue siendo el de la medición.
3. **Identidad nueva.** La app privada pasa a 0.2.2 con lockfile, notices y notas alineados; el núcleo
   sigue fijado en 0.5.0. El tag anotado `companion-v0.2.2` se cortará sólo tras fusionar esta
   corrección en `main` protegido. `companion-v0.2.1` no se mueve ni recibe release.
4. **Pruebas de comportamiento, no de texto.** `qa/packaging.mjs` ejercita el módulo con un `rm`
   inyectado que falla `EBUSY` dos veces y luego elimina, con uno que falla siempre, y con uno que
   falla por otra causa: el primero termina `removed` tras tres intentos, el segundo `locked` sin
   lanzar, el tercero relanza la causa original. Una prueba adicional afirma que el script de
   medición relanza el error del cuerpo aunque el cleanup falle, usando el módulo con inyección.

## Recovery

Si el run 0.2.2 vuelve a fallar, esta vez el log dirá qué assert o paso falló realmente, y el cleanup
declarará su propio estado por separado. Si falla antes de publicar, 0.1.0 sigue siendo la única
descarga y ningún tag ni asset se sustituye; un revert deja las versiones públicas intactas.
