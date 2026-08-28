# Recomendar una herramienta sin instalarla

La decisión sobre qué herramientas entran a un proyecto ya está tomada y escrita en
`docs/ADAPTIVE_ONBOARDING.md`. El problema es que vive como prosa: tres tablas, ocho pasos de investigación
y una tabla de amenazas que ninguna prueba puede comprobar.

## Un registro en lugar de una tabla

Cada herramienta pasa a ser una entrada versionada con necesidad, procedencia fijada, licencia, costo, auth,
datos, permisos, mantenimiento y rollback. La entrada resuelve uno de cuatro estados: `universal`,
`condicional`, `rechazado` o `pospuesto`. Un dato desconocido nunca resuelve en un estado aprobado.

## Investigar no es instalar

Un comando read-only evalúa una candidata y emite veredicto. No escribe configuración, no descarga
ejecutables y no activa proveedores. `servers` permanece vacío y las skills permanecen en `enabled: false`.
El contenido investigado se trata como datos, nunca como instrucciones.

## Lo que este cambio no hace

No instala, no crea un marketplace, no elige proveedor y no implementa autenticación. La instalación
autorizada y la mutación remota de trackers quedan en un cambio separado.
