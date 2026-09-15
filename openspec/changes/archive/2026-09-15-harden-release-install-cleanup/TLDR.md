# TL;DR

El run 34959088623 de `companion-v0.2.1` pasó el probe Authenticode pero murió en el cleanup del runner
desechable: un `EBUSY` sobre un temporal de NSIS aún bloqueado, dentro del `finally`, que además ocultó
el error real de la medición. El cleanup se endurece (reintentos, lock persistente declarado, error de
medición siempre visible) y la identidad corregida será 0.2.2; el tag 0.2.1 queda como intento inmutable
sin release, igual que 0.2.0.
