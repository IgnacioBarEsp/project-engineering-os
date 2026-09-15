# Product

## Register

brand

## Users

Companion está dirigido a personas que trabajan con IA en investigación, software, videojuegos, contenido
y trabajo general. El núcleo de ingeniería atiende a quienes desarrollan software, desde quien empieza
con ayuda de IA hasta equipos que necesitan contratos, evidencia y recuperación.

La entrada pública debe permitir que cualquiera entienda el propósito en pocos minutos. La documentación
profunda sigue disponible para quien necesita operar, mantener o extender el sistema.

## Product Purpose

La entrada pública principal es Companion: descargar, elegir carpeta, revisar y preparar, continuar con
la IA habitual. La CLI y npm permanecen como ruta secundaria de automatización y contribución. Decisión
explícita del mantenedor el 14 de septiembre de 2026, issue #116.

El origen es hacer portable la forma de trabajar de un proyecto de referencia: comprender el proyecto, adaptar
instrucciones y herramientas, acordar cambios y verificarlos. No significa replicar su producto, stack,
cuentas o dependencias en todas las carpetas. Las skills y MCP se evalúan por necesidad y compatibilidad.

Project Engineering OS prepara un repositorio con una base neutral de ingeniería: gobernanza, SDD,
instrucciones para agentes, documentación encontrable, validaciones reproducibles, recuperación y control
de deuda. Ayuda a convertir una idea o un cambio en trabajo trazable antes de escribir código.

El sistema no decide el producto, el framework, la arquitectura ni el proveedor. Esas decisiones ocurren
después del descubrimiento y quedan versionadas. El éxito significa que una persona puede empezar de forma
guiada, distinguir hechos de supuestos y cerrar cambios con evidencia y rollback.

## Brand Personality

**Facilidad, profesionalidad y versatilidad.**

La voz es directa, serena y precisa. Explica conceptos de ingeniería sin presumir que la persona ya conoce
la terminología, pero tampoco diluye los contratos técnicos. Habla como un desarrollador que documenta su
propio proyecto: cercano, concreto y responsable.

La comunicación probada en un producto de referencia aporta tres reglas: empezar por lo que la persona podrá hacer,
describir el siguiente paso en palabras cotidianas y reservar una acción principal para empezar.
Usar el proyecto y los archivos que ya existen sin pedir que la persona los reorganice para entender la
herramienta. Conservar límites donde ayudan a decidir, sin convertir la entrada en un contrato defensivo.
No trasladar documentos, datos de clientes ni identidad de marca de otros proyectos.

Las capturas muestran el producto real y dicen qué versión o commit se ejecutó. El código integrado,
el instalador publicado y una simulación son estados distintos. Una revisión del agente no sustituye
la lectura en frío con una persona.

## Anti-references

- Un README que le habla a reclutadores o intenta vender al autor de manera explícita.
- Verbose AI slop: introducciones infladas, adjetivos vacíos, repeticiones y conclusiones obvias.
- Una pared técnica que obliga a leer todo antes de entender para qué sirve el proyecto.
- La terminal oscura como identidad completa de una herramienta para desarrolladores.
- SaaS landing-page clichés: grids de tarjetas iguales, métricas de relleno, gradientes, halos y glass.
- Una estética editorial que usa cursivas y etiquetas pequeñas como decoración sin relación con el flujo.

## Design Principles

1. **El método se demuestra.** Toda afirmación importante debe apuntar a comportamiento, código, spec o
   evidencia real.
2. **Primero orientación, después profundidad.** La entrada explica qué, para quién y cómo empezar; la
   documentación contiene el contrato completo.
3. **La complejidad se ordena, no se oculta.** Los términos necesarios se explican y enlazan en lugar de
   sustituirse por marketing.
4. **La automatización conserva autoridad humana.** Autenticación, costos, licencias y mutaciones remotas
   requieren decisiones explícitas.
5. **Una base, muchos proyectos.** La guía permanece neutral hasta conocer producto, equipo y restricciones.

## Accessibility & Inclusion

Las superficies públicas deben cumplir WCAG AA. El texto esencial nunca depende de una imagen, un color o
un idioma secundario. Las piezas visuales requieren alt text útil, contraste mínimo de 4.5:1 para texto
normal y legibilidad en GitHub claro y oscuro. El español es la ruta principal; la versión inglesa se
mantiene como resumen desplegable. Lenguaje, navegación y ejemplos deben ser comprensibles tanto para un
perfil junior como para uno senior.
