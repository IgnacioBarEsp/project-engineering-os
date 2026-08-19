---
name: Project Engineering OS
description: La verdadera ingeniería empieza antes del código.
colors:
  control-mint: "#9CC7AB"
  deep-circuit: "#315540"
  graphite-console: "#0B0F0C"
  terminal-black: "#080B09"
  circuit-surface: "#102219"
  draft-cream: "#F2E8D5"
  measured-secondary: "#73927E"
  structural-divider: "#234330"
typography:
  display:
    fontFamily: "Georgia, Cambria, Times New Roman, serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "normal"
  headline:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Segoe UI, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.12em"
  mono:
    fontFamily: "Consolas, Courier New, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0px"
  compact: "4px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
components:
  control-plane:
    backgroundColor: "{colors.graphite-console}"
    textColor: "{colors.draft-cream}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "64px"
  terminal-evidence:
    backgroundColor: "{colors.terminal-black}"
    textColor: "{colors.draft-cream}"
    typography: "{typography.mono}"
    rounded: "{rounded.none}"
    padding: "24px"
  sequence-step:
    backgroundColor: "{colors.graphite-console}"
    textColor: "{colors.control-mint}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 0"
---

# Design System: Project Engineering OS

## Overview

**Creative North Star: "El Plano de Control"**

La escena es una mesa de ingeniería al final del día: un desarrollador compara un plano de proceso con la
salida real de su terminal antes de autorizar el siguiente cambio. El fondo casi negro no dice “herramienta
dev”; crea el campo de medición donde el verde señala continuidad y el crema reserva la lectura principal.

El sistema es mecánico, sereno y verificable. La cursiva aparece una sola vez como voz humana; el resto se
comporta como señalización de control. Rechaza “Verbose AI slop”, “SaaS landing-page clichés”, la terminal
como identidad completa y la estética editorial sin relación con el flujo.

**Key Characteristics:**

- Una línea SDD ordena la composición.
- Evidencia real ocupa un lugar visible, no decorativo.
- Superficies planas, bordes estructurales y cero efectos ambientales.
- El texto Markdown conserva toda la información esencial.

## Colors

La paleta es oscura y comprometida: la señal verde aparece con moderación y el crema sostiene lectura de
alto contraste.

### Primary

- **Control Mint:** indica avance, evidencia aprobada y puntos activos del flujo.
- **Deep Circuit:** conecta superficies, divisores y estados secundarios sin competir con el contenido.

### Neutral

- **Graphite Console:** lienzo principal autosuficiente para temas claro y oscuro.
- **Terminal Black:** separa evidencia ejecutada del resto del plano.
- **Circuit Surface:** cabeceras y zonas operativas, nunca una cuadrícula de tarjetas.
- **Draft Cream:** texto principal y frase humana.
- **Measured Secondary:** contexto y metadatos; su contraste mínimo es 5.53:1 sobre el lienzo.
- **Structural Divider:** líneas de secuencia y separación, no texto.

**The Signal Rule.** Control Mint señala como máximo un paso dominante por zona. Si todo es verde, nada
está verificado.

**The Dark Field Rule.** El crema solo se usa como texto o detalle; nunca como fondo dominante. Esto evita
el patrón “forest-green-on-cream” y mantiene el plano como identidad propia.

## Typography

**Display Font:** Georgia, con Cambria y Times New Roman como fallback.
**Body Font:** Segoe UI, con Arial como fallback.
**Label/Mono Font:** Segoe UI para señalización; Consolas para comandos ejecutados.

**Character:** la cursiva aporta una nota humana dentro de un sistema industrial. Sans y mono cumplen
funciones distintas: explicación y evidencia. No se distribuyen archivos de fuente ni se introduce una
dependencia externa.

### Hierarchy

- **Display** (400, hasta 72px, 1.05): solo la frase “La verdadera ingeniería empieza antes del código”.
- **Headline** (700, 24px, 1.25): nombre del proyecto y títulos de bloques principales.
- **Title** (700, 18px, 1.35): pasos SDD y destinos documentales.
- **Body** (400, 16px, 1.6): explicación con un máximo recomendado de 72 caracteres por línea.
- **Label** (700, 12px, 0.12em): metadatos breves; no se repite sobre cada sección.
- **Mono** (400, 14px, 1.55): comandos y salidas verificadas, nunca copy promocional.

**The Human Note Rule.** La cursiva solo expresa la frase central o una anotación humana equivalente. Si
aparece en subtítulos, métricas y llamadas, la pieza cayó en estética editorial genérica.

## Elevation

El sistema no usa sombras. La profundidad se construye mediante cambio tonal, divisores de un píxel y
espacio negativo. Los recursos estáticos no necesitan blur, glow, glass ni gradientes.

**The Flat Evidence Rule.** La evidencia se separa por estructura, no por elevación decorativa. Un bloque
con borde y sombra blanda a la vez está prohibido.

## Components

### Control Plane

- **Shape:** lienzo rectangular sin radio.
- **Background:** Graphite Console con retícula funcional de medición muy tenue.
- **Content:** título, frase, línea SDD, terminal real y motor de deuda en una jerarquía única.
- **Responsive treatment:** retirar etiquetas menores antes de reducir la frase o el flujo principal.

### SDD Control Line

- **Shape:** secuencia horizontal de cinco pasos con números porque el orden es información funcional.
- **State:** el primer paso usa Control Mint sólido; los demás conservan contorno hasta que el texto los
  explica. El color nunca es la única señal: cada nodo tiene número y nombre.

### Terminal Evidence

- **Shape:** rectángulo de Terminal Black, borde estructural y cabecera tonal.
- **Content:** comando real, resultado resumido, plataforma, versión y exit code.
- **Rule:** nunca inventa output ni imprime rutas personales, tokens o secretos.

### Documentation Links

- **Shape:** listas y divisiones semánticas, no tarjetas repetidas.
- **Text:** cada enlace dice qué resuelve y para quién es útil.
- **Focus:** el subrayado o foco visible se conserva cuando la superficie se implemente como HTML.

### Status Labels

- **Shape:** texto corto con señal y explicación; no pills decorativas.
- **States:** PASS, FAIL, WARN y SKIP mantienen palabra visible y nunca dependen solo del color.

## Do's and Don'ts

### Do:

- **Do** usar la línea SDD como firma visual única y funcional.
- **Do** repetir en Markdown cualquier hecho que aparezca dentro de una imagen.
- **Do** verificar comandos, contraste, peso y render antes de publicar.
- **Do** mantener superficies rectas, divisores finos y espacio negativo.
- **Do** usar mono únicamente para terminal y datos reproducibles.

### Don't:

- **Don't** convertir el README en un mensaje para reclutadores.
- **Don't** escribir “Verbose AI slop”: introducciones infladas, adjetivos vacíos o conclusiones obvias.
- **Don't** usar “SaaS landing-page clichés”: grids de tarjetas iguales, métricas de relleno, gradientes,
  halos o glass.
- **Don't** usar la terminal oscura como identidad completa del proyecto.
- **Don't** repetir cursivas y etiquetas pequeñas hasta producir una estética editorial sin relación con el
  flujo.
- **Don't** usar crema como fondo dominante ni combinar texto de bajo contraste con verde.
