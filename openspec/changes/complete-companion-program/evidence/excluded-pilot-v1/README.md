# Piloto v1 excluido

Estos ocho JSON ya existían en el directorio temporal de la máquina al iniciar la tarea 3.1. Se copiaron
sin cambiar sus bytes, tras comprobar que no contenían rutas absolutas personales, credenciales ni IDs de
sesión. Su fecha declarada es 2026-09-11; no se presentan como una ejecución nueva.

El protocolo expone IDs `known`/`unknown` y compara texto plano con JSON por pregunta. Esos sesgos impiden
usarlo para la aceptación de 3.1. Sus tres repeticiones por condición registran un empate agregado de
30/30, pero **ninguna se mezcla con la corrida v2**, que corrige el instrumento antes de inferir.

Se conserva [el protocolo](protocol.json), [el resumen original](model-benchmark.json) y las ejecuciones
[1](run-1-full.json), [2](run-2-prepared.json), [3](run-3-prepared.json), [4](run-4-full.json),
[5](run-5-full.json) y [6](run-6-prepared.json). La inclusión conserva un antecedente real; no amplía el
tamaño de muestra ni certifica retrospectivamente el transporte que el instrumento original no guardó.
