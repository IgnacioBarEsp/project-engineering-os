# Publicación y ciclo silencioso — Companion 0.3.5 (#168)

El workflow protegido [Publish Companion release, corrida 35628750372](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35628750372)
terminó en `success` el 21 de septiembre de 2026 desde el commit
`ad9ebf01745856fa0b9329e188a4e310dd1f0070`. El artefacto de evidencia de esa corrida,
`companion-release-evidence-companion-v0.3.5`, contiene `canonical-release.json` e
`installer-cycle.json`, ambos con `status: PASS`.

El instalador publicado es `ProjectEngineeringOS-Setup-0.3.5-x64.exe`, de 133.309.978 bytes y SHA-256
`9860c3fe476469a5e07b8f8cdf0936d305b7851638eab37a354cf739a604ab1d`. El workflow comparó los
tres assets del draft (`.exe`, `artifact-manifest.json` y `SHA256SUMS`) contra su único build verificado.
La [release 0.3.5](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.3.5)
está publicada con ese mismo digest; no se afirma reproducibilidad entre builds.

En un runner `windows-latest` de GitHub Actions, el arnés instaló silenciosamente 0.1.0, actualizó a 0.3.5
y desinstaló. Registró la creación y retirada de `Project Engineering OS.lnk` en el Escritorio del usuario
del runner, la retirada de la instalación y la preservación de los sentinelas de proyecto, historial y
runtime. Los recorridos nativos de la app también pasaron en esa corrida.

**Límite:** estas pruebas usaron `/S`. No observaron las páginas del asistente, el idioma visible, las ramas
marcada/desmarcada de las casillas ni la experiencia de una persona. Esa evidencia asistida se registra por
separado antes de archivar el change.
