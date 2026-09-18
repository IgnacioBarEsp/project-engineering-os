# Design: Companion 0.3.0 Release

## 1. Identidad y Versionado
Companion avanza a 0.3.0 debido a la incorporación de nuevas capacidades de usuario (wizard de 4 pasos,
instalador NSIS contextual, soporte de 7 perfiles y bifurcación). El núcleo universal create-project-engineering-os
permanece inmutable en 0.5.0.

## 2. Galería de Capturas
Se exportan las 6 pantallas canónicas a docs/assets/companion/:
- home-companion.png
- paso-1-perfil.png
- paso-2-delimitacion.png
- paso-3-vision.png
- paso-4-instalacion.png
- proyecto-listo-activacion.png

## 3. Verificación de Artefacto
El pipeline de release compila con NSIS, valida la lista blanca de archivos, ejecuta la comprobación
Authenticode (NotSigned aceptado), instala en runner desechable, actualiza desde 0.1.0 a 0.3.0, ejecuta los
recorridos nativos y verifica la desinstalación con sondeo acotado.
