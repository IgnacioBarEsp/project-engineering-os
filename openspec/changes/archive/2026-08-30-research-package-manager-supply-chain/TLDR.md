# El gestor no era el problema

"npm es atacado con frecuencia, migremos a pnpm." La primera mitad es cierta. La segunda no se sigue: esos
ataques van al registro, y pnpm, Yarn y Bun instalan desde el mismo registro.

## Lo que sí difiere

Los defaults. pnpm 11 trae la cuarentena por antigüedad de versión encendida a un día; npm la trae apagada.

## Lo que la medición encontró

**npm también la tiene.** `min-release-age` existe desde npm 11.10.0, febrero de 2026. La diferencia es de
default, no de capacidad, y se cierra con una línea de configuración.

Y npm 12 pone los install scripts en off por defecto y bloquea dependencias desde git y desde URL, que es el
otro control que motivaba la migración.

## Lo que la descarta

pnpm 11 requiere Node ≥ 22. Este paquete declara `^20.20.0 || >=22.22.0` y su CI ejecuta Node 20.20.0 sobre
tres sistemas operativos. Migrar rompería tres de las seis combinaciones antes de discutir seguridad.

## La prueba contra datos reales

El triage de agosto registra nueve señales concretas. Ninguna la habría evitado otro gestor, y en la única
donde el control aplicaba ya estaba puesto por otra vía.

## Qué se decide

Conservar npm en las tres superficies, con revisión fechada el 1 de marzo de 2027. Y tres refuerzos que sí
hacen falta: el npm de publicación es de 2025, la cuarentena no está configurada, y falta una guía de
endurecimiento para quien elija otro gestor.
