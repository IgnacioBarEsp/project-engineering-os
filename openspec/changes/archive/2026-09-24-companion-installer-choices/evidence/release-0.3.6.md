# Publicación y ciclo protegido — Companion 0.3.6 (#168)

El workflow protegido [Publish Companion release, corrida 35937040623](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35937040623)
terminó en `success` el 24 de septiembre de 2026 desde `main` (`dc10e33b1acba943a130ad450b544a194b296a52`).
El tag anotado protegido `companion-v0.3.6` apunta al commit integrado y probado
`cb0995e83edbbcba3efd810fffa295def2fc6393`; su árbol `apps/companion` es
`57c0d841ea34e5c6fb9272321f7a7a471316c5c1`, igual al registrado en la evidencia asistida de Sandbox.

La versión del workflow desde `main` exigió la confirmación explícita del mantenedor y las cinco capturas
committed. Pasaron
el build y la inspección del artefacto, las pruebas del núcleo y Companion, la auditoría de dependencias y el
ensayo en el runner Windows desechable. La corrida creó el draft, comparó sus tres assets contra el único
build verificado y solo entonces publicó la release. No se afirma reproducibilidad entre builds.

El manifiesto y `SHA256SUMS` publicados identifican `ProjectEngineeringOS-Setup-0.3.6-x64.exe`: 133.228.433
bytes, SHA-256 `33a3eeb40293722da614e5b578c1e184fb72c05847437b3c1caaee93035b8d14`, commit del artefacto
`cb0995e83edbbcba3efd810fffa295def2fc6393`. La [release 0.3.6](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/companion-v0.3.6)
está publicada con ese mismo digest; el archivo no está firmado con certificado de editor.

`installer-cycle.json` de la evidencia de Actions registra `status: PASS`: instalación silenciosa de 0.1.0,
actualización a 0.3.6 y desinstalación. Se creó y luego retiró el acceso directo con nombre del producto,
se retiró la instalación y se conservaron los sentinelas del proyecto, historial y runtime. La evidencia
asistida de Windows Sandbox, separada, cubre las casillas marcadas/desmarcadas y el idioma visible del asistente.

Límite de los recorridos nativos: `native-journeys.json` reporta cinco perfiles abiertos, cero hallazgos y
diez etapas no verificadas porque algunos controles requieren responder selectores del sistema. No se presenta
como una ejecución completa de esas etapas ni como evidencia del asistente de instalación. Los JSON completos
de ciclo, comparación canónica y recorridos nativos quedan en el artefacto
`companion-release-evidence-companion-v0.3.6` de la corrida (retención de Actions: 35 días); esta nota
conserva permanentemente sus resultados relevantes.
