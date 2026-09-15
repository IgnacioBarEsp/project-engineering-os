# TL;DR

El run 34967616274 de `companion-v0.2.2` completó con éxito el probe Authenticode, build, instalación 0.1.0, actualización a 0.2.2 y los cinco recorridos nativos, pero falló en la aserción inmediata tras el desinstalador: NSIS delega la eliminación a un proceso hijo (`Au_.exe`) en segundo plano y sale de inmediato. La verificación ahora espera con sondeo y presupuesto de tiempo (hasta 60 s) la remoción efectiva del directorio, y la identidad corregida se avanza a Companion 0.2.3; los tags 0.2.0, 0.2.1 y 0.2.2 permanecen inmutables sin release.
