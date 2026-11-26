# Observación0999922:1FAIL de preparación;STOP

La [aprobación literal](remaining-repair-observation-approval-0999922.md) y
DoR posterior13PASS/0FAIL/0excepciones precedieron a la única preparación.
No falta esa aprobación. Una copia y una invocación consumidas;0 restantes.

## Resultado real

- Preparación3963ms,223archivos comparados;solo el QA copiado cambió.
- QA observado SHA256ccaa13a46dc50bae657064e928f245b3563670fa33b334b0def69f59bcb9f546.
- Única invocación26nov19:26:40.670–19:26:40.859UTC:189ms,exit1,
  un target,0PASS/1FAIL/0CANCELLED/0SKIP. TAP52.9614ms para el caso.
- Traza10eventos/1350bytes;stdout2601bytes,stderr0;sin watchdog o caps.
- Fuente de los223archivos original y copia observada intactas tras freeze.
- Root del fixture limpiado por el helper legítimo;HOME contiene solo diag-trace.
  No se alcanzó spawn del hijo de interrupción. No procesos externos terminados.

## Causa de ESTE fallo y límites

El supervisor preparó node_modules mediante una junction hacia las dependencias
existentes. Eso introdujo un ancestro vinculado en el origen npm de la copia.
La guarda original canonicalFolder lo rechazó con LINK_REJECTED dentro de
prepareNpmDevelopmentSource al empezar la instalación inicial.

Es un error de preparación del agente,confirmado por fuente/stack y la traza:
parent.install entró19:26:40.790 y falló19:26:40.825UTC. No se llegó a corrupción,
SIGKILL,restart o reparación final. El intento fallido se cuenta;no se descuenta
como si nunca hubiese ocurrido. No se modificó la guarda ni se reintentó.

Este dato NO explica el timeout de fa15 ni acredita un defecto del runtime.
El resultado sigue DIAGNOSTIC_ONLY. No hay nuevo PASS de cualificación,review,
build,VM,archivo o integración. Los9PASS/1CANCELLED históricos quedan intactos.

## Artefactos y siguiente decisión

StandaloneMCP,targetPath del worktree actual,storagepersistent,prefijo
artifacts/wave3-current/remaining-repair-observation/.

| Archivo | SHA256 |
| --- | --- |
| frozen.json | d0b9ebee8d8083099feb7ffc1e91b7a5c921a6e70948840ef600a0c162b13a1d |
| driver.mjs | 397822f2545867647dda3776da72af9369e9b26731ac3d2769a34caeb0d4946a |
| result.json | 131007ddec983f78099632c0c008f1c2a2d9358d80e273d656748ec46f6f728a |
| stdout.tap | fb1d45c34730316c56e0b7d35be325279ce7d7fc7ce6e5481f8e8ed604b53e98 |
| trace-22892.jsonl | 6d8b7a9efafc66a1200e86b8d33f7e3f1b2eb9f87f96a9e12892849c18ec93d9 |

No otra ejecución autorizada bajo0999922. La decisión siguiente debe concretar
el transporte físico del mismo origen npm y un intento adicional,sin cambiar
producto,guardas,assertions o los límites. Conservar primero este fallo y su
receta. No es una reparación futura aprobada automáticamente.
