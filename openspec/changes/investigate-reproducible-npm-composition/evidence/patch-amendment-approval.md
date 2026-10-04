# Aprobación del alcance ampliado

El mantenedor recibió la revisión inmutable `6b399724e41fb3633bb0900ecbdd49cf6622fee9` de proposal/design/spec, TLDR y patch-amendment.md. El asistente preguntó: «¿Apruebas esta ampliación para implementar y probar el parche experimental, sin modificar todavía el runtime de Companion?».

Respuesta humana literal:

> apruebo

Esta respuesta aprueba el único parche data-only de index.js de http-cache-semantics4.3.0 en copias desechables, sus controles, política conservadora declarada y responsabilidad de mantenimiento. Permite Apply experimental de esta ampliación; no adopción, publicación, cambios de runtime/catalog/locks, otros parches upstream, excepciones o cierre de #204/#208. Se preservan reversibilidad, presupuesto acumulado de tres recetas y parada antes de ola4.

Las selecciones anteriores para preparar propuestas no se reinterpretan como aprobaciones. Las pruebas y revisiones se registrarán por separado cuando ocurran; esta aprobación no certifica resultados.
