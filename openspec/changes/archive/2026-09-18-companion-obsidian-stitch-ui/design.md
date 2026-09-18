# Design: Obsidian Precision Studio / Stitch UI Implementation

## 1. Tokens y Sistema Visual
- Paleta Obsidian: Fondo de papel `#0B0F19`, superficies elevadas `#121826`, bordes translúcidos `rgba(255, 255, 255, 0.08)`.
- Acentos funcionales: Índigo luminoso `#6366F1` para foco y selección, esmeralda vivo `#10B981` para éxito y estado activo, cian `#06B6D4` para telemetría local.
- Tipografía y legibilidad: Pila tipográfica local y nativa del sistema, garantizando cumplimiento de contraste WCAG AA/AAA (mínimo 4.5:1 en texto regular y 3.0:1 en texto grande).

## 2. Shell de Aplicación y Topbar
- Se sustituye el elemento `<aside class="sidebar">` por una cabecera fija `<header class="app-header sidebar">`.
- Incluye controles de ventana decorativos estilo macOS, marca con icono SVG, badge Companion, y pastillas de navegación horizontales responsivas (`#nav`).

## 3. Experiencia de Inicio (Stitch Home)
- Titular enfocado en la promesa de valor: `Dale a tu IA un buen punto de partida.`.
- Doble tarjeta de acción: "Crear nuevo proyecto" (con badge 'Recomendado' y acento índigo) y "Abrir carpeta existente".
- Barra inferior de tres pilares de valor: "Totalmente local", "Compatible con tu IA", "Estructura limpia".

## 4. Icono y Experiencia de Escritorio en Windows
- Script `build-icon.mjs` actualizado para generar el archivo `build/icon.ico` con capas multicapa (16x16, 32x32, 48x48, 64x64, 128x128, 256x256) en la paleta oscura de Obsidian.
- Ventana de Electron inicializada con `backgroundColor: '#0b0f19'` eliminando el parpadeo blanco/beige antes del primer render.
