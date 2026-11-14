# fa15 aprobada/aplicada:9PASS/1CANCELLED;STOP

[Aprobación literal](recovery-qa-spawn-approval-fa15.md) de
fa15e432d1d69571a9f527692a75fb320ecf06ac antes de cambiar fuentes.
Una variante adicional y una invocación consumidas,cero restantes. Sin reset
de5013/d812/e978/218. Preparación3876ms,DoR13/13,sintaxis2/2.

Solo helper/unit QA cambiaron. Principal a97ac1e8 y los otros221archivos de app
permanecieron exactos;223archivos comparados entre copia y fuente.
Helper990166fcc3ad1b6237edc8a2710007be8125f0ac9aaa5a06074317318afb2306;
unit c7942e9e8efbaa03ef28a1296e880abec818b9b4b3319182fd3f5266de38f125.
La copia conserva su gitHEAD5013+overlay aprobada;su inventario completo de app
coincide con el worktreefa15+este delta. No se atribuye ese gitHEAD a otro árbol.

## Resultado real,14nov2026UTC

Única invocación16:22:57.151Z–16:26:17.269Z,200117ms,exit1:
**10tests,9PASS,0FAIL,1CANCELLED,0SKIP**,todos los nombres exactos.
Las fuentes no cambiaron tras freeze. Watchdog no intervino;sin error del runner.
El supervisor terminóexit0 porque completó la colección;el proceso de tests
terminóexit1. Ese exit0 no significa PASS.

La reparación «interrupted repair restores only the journal-owned unchanged
quarantine, and retains project/history bytes» agotó90000ms y TAP registra
95016.0324ms incluyendo finalización. La diferencia cercana a5s coincide con
el límite de cleanup,pero TAP no identifica la operación interna pendiente o
prueba su causa. No se atribuye a latencia del host,deadlock,P2 o fallo de
producción por inferencia. No se eliminaron aserciones ni elevaron límites.

Los tres puntos separados pasaron en32.013s/34.795s/37.396s. Pasaron las cinco
regresiones anteriores de hijos reales. El décimo test pasó sus dos controles
de eventos:no-stderr+EMFILE+close ystderr.error+close,preservando primera causa
y espera de close. Es lógica sintética,no EMFILE nativo ni una prueba instalada.
La corrección de fuente/P2 mantiene una revisión independiente separada.

## Retención y límites

Se conserva físicamente el root propio npm-identity-0aG2kt bajo el home
qfa15-lFWgJs de la colección temporal MCP. La lectura posterior observó
project.txt,owner/testigo,journals/selección y stages retenidos;no procesos
Node/Electron propios restantes. No se ejecutó limpieza,recuperación o retry.
Se copiaron a storagepersistent siete registros acotados,con hashes en
[el índice](recovery-qa-spawn-result-fa15.json). No se afirma inventario físico
completo de los payloads retenidos o PASS de aserciones no alcanzadas.

Los dos PASS de copia oficial/pack de d812 siguen históricos. Se contrastaron
byte a byte sus dosQA,fixture npm,distribution-identity/tree/catalog/seal/pack
y lock con d812:9/9fuentes idénticas. No se reejecutaron esos controles.

## Revisión,deuda y gates

El mismo reviewer /root/qa5013_candidate_review terminó su ciclo mediante la
única continuación aprobada:leyó los tresQA completos y el delta de dos,P2
resuelto por fuente,sin otros hallazgos concretos accionables. No ejecutó tests
o reproducciones. [Informe real](independent-recovery-qa-review-fa15.md),
SHA73ba87f3970036d2ed33378343e80382180cb583b61a6d7b690a790e4474bd8b.
No aprobación humana/producto ni otro reviewer/ciclo.9/10local sigue fallo.

No nueva captura clean de deuda,excepción o recaptura206. El timeout sigue
siendo un gate incumplido,independientemente de un posible review de fuente
sin hallazgos. No se acepta como deuda para cerrar. Una nueva variante,ejecución,
diagnóstico instrumentado o cambio de costo necesita decisión concreta nueva.

CI43608192092 terminóSUCCESS para el headfa15 anterior;no acredita este delta.
Se requiere CI completa del nuevo head,pero su verde tampoco borraría9/10local.
Builds0/2,mismaVM0/1,humanos146/147,deuda/archivos218y144→150 yprotectedmerge
permanecen detenidos. No hostinstall,release,cierre de ola3 u ola4.
