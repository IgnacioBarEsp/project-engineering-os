# El zapatero descalzo, medido

Project Engineering OS distribuye diagnóstico, control de deuda, readiness y gates. Ejecutados contra su
propio repositorio: `doctor` FAIL, `opsx-check` código 2, deuda sin configurar, readiness no ejecutable.

## La prueba de que importa

Se ejecutó el motor de deuda del proyecto sobre los assessments que el proyecto ya había escrito a mano.
Produjo un item abierto: "Cuatro specs históricas carecen de Purpose", fechado el 18 de agosto de 2026. Esa
misma deuda se redescubrió por lectura humana en el Issue #42 y se extendió a los consumidores en el #45.

El motor insignia del producto la tenía clasificada todo el tiempo. Nadie lo encendió.

## El criterio que faltaba

No todo `FAIL` sobre el upstream es deuda. Un check mide **forma de consumidor** cuando pregunta si este
repositorio se parece a lo que el bootstrap escribe; mide **deuda real** cuando pregunta si cumple una
promesa que él mismo hace. De los seis FAIL del doctor, dos son deuda y cuatro son la pregunta equivocada.

## La recursión, resuelta sin inventar nada

¿Y si bootstrapearse a sí mismo sobrescribe la fuente de sus propios archivos gestionados? Medido: no ocurre.
`sync --check` reporta 9 conflictos y 0 escrituras. Y las 26 creaciones que caen fuera de la allowlist rompen
`npm run check` antes de poder mergearse. El mecanismo ya existía; había que ejecutarlo para verlo.

## Lo que se adopta

Tres archivos dentro de `.project-os/` hacen que el Definition of Ready corra in situ, sin target desechable:
medido en `PASS 13 | FAIL 0`. El motor de deuda entra con la misma economía. Nada más: ni adaptadores de
agente, ni MCP, ni indexadores, ni onboarding.

## Lo que este spike no hace

No ejecuta ninguna adopción, no elige proveedor de inteligencia de código, no abre la allowlist de
neutralidad y no convierte ningún check nuevo en bloqueante. Entrega decisión y desglose.
