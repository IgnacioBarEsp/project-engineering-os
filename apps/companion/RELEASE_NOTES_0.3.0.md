# Companion 0.3.0

Esta versión representa una evolución integral en la experiencia de usuario, diseño visual y orquestación con IA:

- **Asistente de preparación en 4 pasos**: flujo intuitivo compuesto por (1) Identidad y Selección de Perfil, (2) Delimitación y Tipo de Proyecto, (3) Visión y Descripción del Objetivo, y (4) Recomendaciones inteligentes con bifurcación.
- **7 perfiles canónicos**: Desarrollador, Investigador, Estudiante, Creador de Contenido, Freelancer / Consultor, Gestor de Producto / Negocio, y General; cada uno con iconografía de precisión y opciones de delimitación adaptadas.
- **Persistencia de visión y preservación no destructiva**: generación semántica de `PROJECT_VISION.md` en la raíz del proyecto para anclar el propósito operativo; directriz estricta para que cualquier conversión o extracto a Markdown conviva junto a los archivos binarios originales (PDFs, documentos, hojas de cálculo) sin borrarlos ni modificarlos.
- **Bifurcación en el paso 4**: opción clara entre *Instalación rápida* (preparación y descarga en segundo plano) y *Que mi IA se encargue* (delegación inteligente a la IA de confianza del usuario).
- **Master Activation Prompt**: generador de prompts estructurados de alta fidelidad para que cualquier IA (Claude, ChatGPT, Cursor, Antigravity) lea la visión del proyecto, entreviste brevemente sobre requerimientos finos y ejecute verificaciones antes de confirmar operatividad.
- **Instalador contextual NSIS para Windows**: detección automática de versiones instaladas con diálogo interactivo que ofrece opciones claras: *Instalar*, *Reparar/Actualizar*, *Desinstalar* de forma limpia o *Cancelar*.
- **Excelencia visual y micro-interacciones (Impeccable)**: integración de la skill Impeccable, transiciones fluidas con curvas de desaceleración cúbica `cubic-bezier(0.16, 1, 0.3, 1)` de 220ms, indicadores no bloqueantes `.skeleton-shimmer`, elevaciones táctiles en hover y respeto riguroso a `prefers-reduced-motion: reduce`.
- **Microcopia humana y accesible**: eliminación total de tecnicismos intimidantes, optimización de márgenes y espaciados para evitar desplazamientos artificiales en pantallas compactas, y 0 afirmaciones no verificadas.
- **Armonización de la Landing Page**: actualización estética con tonos oscuros Obsidian Precision Studio manteniendo estrictamente **0 scripts JavaScript, 0 peticiones externas de red y contraste accesible WCAG AAA >= 5.35**.

El instalador es para Windows x64, se instala por usuario y no tiene certificado de editor. Windows puede
advertir al abrirlo; el manifiesto y `SHA256SUMS` permiten comprobar el archivo descargado, pero no
sustituyen una firma. No hay actualización automática, cuenta propia ni servicio de inferencia operado por
el proyecto.

Esta release conserva el núcleo `create-project-engineering-os` 0.5.0. No publica una nueva versión npm del
núcleo y no reemplaza los assets ni los tags anteriores (`0.1.0`, `0.2.0`, `0.2.1`, `0.2.2`, `0.2.3`).
