# Preflight visual — entrada pública de Project Engineering OS

## Contexto compartido

- **Estado:** candidato a aprobación; ninguna variante está publicada.
- **Tarea y resultado:** una persona entiende que el proyecto ordena cambios asistidos por IA mediante SDD,
  evidencia, deuda y recuperación, y reconoce que puede probarlo desde terminal.
- **Zona:** entrada pública / marca, intensidad máxima con legibilidad operativa.
- **Ground truth / evidencia:** entrevista de #22; comportamiento de `origin/main`; ejecución externa real de
  `npx --yes create-project-engineering-os@0.1.6 bootstrap --target .` en Windows con exit 0, 74 archivos
  creados y cero conflictos.
- **Jerarquía:** frase y propósito; flujo SDD; evidencia de terminal; motor de deuda; capacidades menores.
- **Tokens provisionales:** tinta cálida, verde bosque, señal menta y crema. Tipografía de sistema para no
  añadir una licencia antes de la elección.
- **Estados:** loading, empty, error y offline no aplican a una imagen estática. La ausencia de la imagen se
  cubre con texto Markdown y alt text; el comando fallido se documentará como texto, no mediante estado visual.
- **Accesibilidad:** ninguna información esencial vive solo en la imagen; las combinaciones de texto más
  débiles miden 4.75:1 o más; las versiones se comprobaron a 1600x1000 y 800x500.
- **Efectos:** ninguno. No hay gradientes, glow, blur, glass, sombras ni motion.
- **Evidencia siguiente:** elección humana A/B; después, adaptación de contenido y tamaño a README/perfil.

## Variante A — Plano de control

- **Estructura:** línea temporal horizontal porque el orden SDD es el mensaje principal; terminal y motor de
  deuda ocupan zonas distintas, conectadas por la misma retícula de medición.
- **Firma visual única:** la línea de control que convierte `issue` en `close` y aterriza en evidencia real.
- **Riesgo genérico refutado:** evita usar una terminal negra como imagen completa del proyecto; la terminal
  es prueba, no identidad.
- **Trade-off:** funciona mejor como banner y thumbnail, pero los detalles menores exigen abrir la imagen o
  leer el contenido equivalente bajo ella.
- **Contraste mínimo de texto:** 5.53:1 sobre el fondo principal; 5.91:1 dentro de terminal.
- **Awwwards provisional:** diseño 8.7, usabilidad 8.3, creatividad 8.5, contenido 9.0. No está lista para
  publicación hasta recibir elección y una última adaptación de tamaño.

## Variante B — Cuaderno de ingeniería

- **Estructura:** hoja de proceso y columna de evidencia porque la documentación es el producto visible; el
  orden vertical favorece una lectura tranquila.
- **Firma visual única:** el corte entre el recorrido humano y la prueba de campo muestra que método y
  terminal son dos partes del mismo sistema.
- **Riesgo genérico refutado:** evita la cuadrícula de tarjetas SaaS y usa un documento de trabajo con una
  secuencia que realmente necesita números.
- **Trade-off:** explica mejor el sistema a primera lectura, pero su crema dominante se integra menos con el
  fondo oscuro del perfil y se acerca más a una estética editorial.
- **Contraste mínimo de texto:** 4.75:1 sobre crema; 4.80:1 sobre verde.
- **Awwwards provisional:** diseño 8.8, usabilidad 8.5, creatividad 8.2, contenido 9.1. No está lista para
  publicación hasta recibir elección y una última adaptación de tamaño.

## Recomendación

Elegir **Variante A — Plano de control** como identidad base. Se reconoce mejor a tamaño de tarjeta, conecta
directamente con SDD y conserva la estética oscura del perfil sin caer en una portada de terminal genérica.
La versión final deberá aumentar o retirar las etiquetas diminutas para su uso exacto en GitHub; los detalles
completos seguirán en Markdown.
