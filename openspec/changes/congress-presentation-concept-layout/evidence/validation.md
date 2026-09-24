# Validación — congress-presentation-concept-layout

Fecha: 24 de septiembre de 2026. Change sobre `origin/main` `4849001`.

| Control | Resultado | Evidencia |
| --- | --- | --- |
| Reproducción negativa en el PPTX encontrado en el dossier | **FAIL esperado en 3 páginas**: 7, 9 y 11, cada una con separación `-0.10 in` | `reproduction.md` |
| Rebuild desde el generador corregido | **PASS**, 22 diapositivas, salida de 664 900 bytes | SHA-256 `77cf4d20ecc372bef4fa6cacfc7372b6671ed4b36dbdf4c577c051a2ab87bea3` |
| `check-deck-figures.py` | **PASS**, 22 diapositivas; 90 cifras comprobadas; 0 problemas | El informe generado registró el mismo SHA-256 del PPTX final |
| `check-geometry.py` | **PASS**, 22 diapositivas; 0 problemas | El mismo verificador falla con el PPTX original en las 3 páginas defectuosas |
| LibreOffice → PDF | **PASS**, 22 páginas, 960.009 × 540 pt, 748 107 bytes | PDF SHA-256 `afdf0df7a5dcf75aa03fc1d9de875e0bf8f6646c3cadf0f866642ee840349881` |
| Integridad de PDF | **PASS**, sin contraseña ni JavaScript; título y autor presentes | `pdfinfo`; título “Dale a tu IA un buen punto de partida” |
| Revisión visual | **PASS**, render de las 22 páginas a 85 dpi; sin texto oculto, recortado o solapado | `visual-review.md` |
| Dependencias de producto | **PASS**, `pptxgenjs@4.0.1` usado solo para build local temporal; no figura en package.json ni package-lock | `package-lock.json` conservó su SHA-256 durante la instalación de la herramienta |

El PPTX y el PDF finales se conservaron en `C:/Users/RitualDesktop/Documents/Projects/peos-congreso-evidencia/`
y se incluyen como artefactos descargables en `docs/presentations/2026-09-24-congreso.pptx` y
`docs/presentations/2026-09-24-congreso.pdf`; la página del guion enlaza ambos y registra sus hashes. El
manifiesto `files` de `package.json` no incluye `docs/presentations/`, por lo que estos materiales no entran
en el paquete npm. El comentario [de #165](https://github.com/IgnacioBarEsp/project-engineering-os/issues/165#issuecomment-5812766305)
enlaza ambos artefactos públicos de la rama y sus hashes; tras integrar el PR, los enlaces se actualizarán a `main`.
