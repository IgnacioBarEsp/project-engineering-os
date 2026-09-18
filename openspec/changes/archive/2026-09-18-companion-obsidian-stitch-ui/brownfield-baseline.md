# Brownfield Baseline

- La versión 0.3.0 conservaba los estilos retro claros (#F8F8F3) en `app.css` e `index.html`, por lo que el instalador real mostraba la apariencia anterior.
- El icono de Windows (`build/icon.ico`) mantenía la paleta clara retro beige/verde.
- La ventana de Electron carecía de `backgroundColor` oscuro explícito, provocando un breve parpadeo en blanco al arrancar.
- Los scripts de verificación visual y contratos requerían calibración para auditar fondos oscuros y ratios de contraste WCAG AAA/AA.
