# Diseño de Companion: orientación antes que configuración

Estado: **draft reversible**. Se conserva el carácter de Project Engineering OS — claridad, señal verde,
evidencia y secuencia — y se amplía para personas que no trabajan en terminal. El DESIGN.md de la raíz
sigue describiendo la identidad pública actual; este documento explora su evolución en la app.

## Decisión de alcance UI

Se activa el perfil `ui` del repositorio upstream para este prototipo y futuras superficies visuales,
sin cambiar los perfiles de la semilla universal. La aprobación de alcance proviene de la delegación
explícita del mantenedor del 7 de septiembre de 2026. Fuente visual: el preflight y las tres alternativas
de este documento, sin diseño Figma previo. Plataforma de descubrimiento: navegador Chromium en Windows;
objetivo de implementación: Windows y WCAG 2.2 AA, cuya conformidad todavía no está certificada.
La evidencia incluye interacción, capturas, teclado, semántica accesible, contraste, reflow y movimiento
reducido. El lector de pantalla nativo y el instalador real se verifican sobre la app en #79–#81.
Los estados de carga/escritura se especifican aquí y se ensayan allí; este prototipo no hace esas operaciones.

## Preflight del asistente

- Tarea: preparar una carpeta, entender qué ocurrirá y llegar a un siguiente paso verificable.
- Zona: onboarding expresivo pero calmado; estado de proyectos sobrio; landing de máxima expresión.
- Referencia: intención del mantenedor, identidad actual y principios adaptados de las skills del proyecto consumidor de referencia.
  No hay frame Figma aprobado ni estudio de usuarios de este producto. El prototipo es evidencia de diseño inicial.
- Jerarquía: una pregunta y acción principal; orientación lateral, explicación breve, atrás/cancelar visibles.
- Estructura: secuencia y lista de opciones; el plan usa filas comprobables. Evitar una cuadrícula de
  funcionalidades sin prioridad y un dashboard de métricas que todavía no existen.
- Firma útil: la línea de preparación avanza y se convierte en evidencia del proyecto; cada paso conserva
  su nombre y resultado. Una transición corta comunica continuidad; no retrasa el trabajo.
- Patrón refutado: estética de terminal para usuarios no técnicos, bento SaaS, brillo/glass y porcentajes de ahorro sin datos.
- Tipografía: Segoe UI para trabajo, serif de sistema solo en la voz de bienvenida, mono únicamente en
  rutas/datos. Fuentes de sistema para arranque sin red y sin descargas de tipografías.
- Estados: bienvenida sin proyectos, selección incompleta, análisis indeterminado, preparación interrumpida,
  contexto listo y herramienta externa pendiente. El prototipo permite mostrar un error recuperable.
- Accesibilidad: controles de 44 px como objetivo de comodidad, labels visibles, foco contrastado, orden
  lógico, estados con texto, escala hasta 200%, reflow y reducción de movimiento. La conformidad requiere pruebas reales.
- Efectos: transición de opacidad/desplazamiento de hasta 180 ms; equivalente estático. Sin video, blur,
  parallax ni animaciones permanentes en la app. La landing se evalúa por separado.
- Próxima evidencia: inspección en tres anchos, navegación por teclado, contraste y elección del mantenedor;
  después repetir sobre la implementación real con todos sus estados.

## Tres direcciones para evaluar

| Dirección | Intención | Límite |
| --- | --- | --- |
| Estudio | Superficie clara, tinta sobria y señal verde; familiar a herramientas de documentos. | Evoluciona la regla oscura del material público solo para trabajo prolongado en la app. |
| Plano | Mantiene el campo oscuro, crema como texto y verde de la marca actual. | Evitar apariencia de terminal; mismos controles y lenguaje accesible. |
| Papel | Tono neutro cálido, jerarquía editorial y señal discreta. | Evitar que la calidez pierda contraste o parezca una plantilla genérica. |

Son alternativas concretas del prototipo, no tres temas de producto prometidos. La implementación elegirá
una dirección y soporte claro/oscuro cuando esté verificado. El modo del sistema y la preferencia de
accesibilidad tienen prioridad sobre un efecto de marca.

## Principios de interacción

Los títulos dicen qué necesita decidir la persona. Los botones usan verbos y objetos: Elegir carpeta,
Revisar preparación, Preparar proyecto, Comprobar otra vez. Los detalles técnicos se pueden consultar
sin bloquear a quien no los necesita. Nunca esconder un error en una notificación efímera.

El progreso distingue actividad de resultado: “Leyendo documentos” no es “Documentos comprobados”.
La pantalla final ofrece una acción principal pertinente a la IA elegida y una salida segura. Una ayuda
explica el requisito que falta sin culpar a la persona ni obligarla a buscar un comando en documentación.

La landing puede usar una composición y momento visual más expresivos que la app, mostrando el producto
real. Respeta teclado, scroll normal, movimiento reducido y carga rápida; no presenta una imagen generada
como captura de una funcionalidad existente ni usa premios/clientes ficticios.

Fuentes de apoyo: [Material Design, fundamentos](https://m3.material.io/foundations/),
[WCAG 2.2, tamaño de objetivos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
[WCAG 2.2](https://www.w3.org/TR/WCAG22/). Los 44 px son un objetivo de comodidad; WCAG 2.2 AA define
su propio mínimo y excepciones. Una puntuación interna de diseño no equivale a certificación o premio.
