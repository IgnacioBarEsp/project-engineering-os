# Una aprobación tardía no debe destruir una release válida

GitHub permite que el environment espere hasta 30 días, pero Project Engineering OS conservaba el tarball
solo 7. Al aprobar `v0.1.6` doce días después, el job arrancó sin artifact y ya no podía publicar. El cambio
elimina esa dependencia temporal del paso protegido sin eliminar la revisión humana ni debilitar OIDC.

## El Release conserva la copia y el tag vuelve a demostrarla

El tarball se sigue creando y probando una vez antes del GitHub Release. Después de la aprobación, npm
descarga esos assets y reconstruye una copia desde el tag protegido. Tarball, manifest y checksum deben ser
idénticos byte por byte. Solo entonces se publica el asset del Release; la reconstrucción es evidencia, no
una segunda identidad.

## Fallar con causa y recuperación

Si falta el Release, un asset cambió o el empaquetado dejó de ser determinista, el job falla antes de pedir
provenance a npm. La recuperación es relanzar desde el mismo tag, investigar la divergencia y no publicar
hasta recuperar igualdad. La retención sube a 35 días como defensa adicional y ayuda de diagnóstico.

## Plan de trabajo

Se modifica el contrato distribution, el workflow y su checker. Pruebas estáticas y de comparación cubren
assets ausentes o diferentes. Después se ejecutan check, pack, revisión adversarial, Debt Control, readiness
y archive antes del PR protegido.

## Resumen integral del change

Una release aprobada tarde seguirá siendo publicable porque su identidad ya vive en el GitHub Release y se
demuestra otra vez desde el tag. No hay token persistente, bypass de aprobación, tag móvil ni publicación de
bytes distintos. El proceso usa más cómputo, pero convierte un límite temporal oculto en un contrato
verificable y recuperable.
