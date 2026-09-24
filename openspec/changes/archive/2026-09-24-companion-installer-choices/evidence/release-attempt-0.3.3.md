# Intento protegido 0.3.3 — #168

El workflow protegido [35606058162](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35606058162)
construyó y verificó el candidato `ProjectEngineeringOS-Setup-0.3.3-x64.exe` del commit `4dcf5be`:

- SHA-256: `5c48342dc24153f06b29cc993d19db2f005d56add59ecb432f67347dc6dd6fb8`.
- `pack:verify`: PASS; árbol limpio, 2.547 archivos empaquetados, 2.619 instalados y núcleo 0.5.0.

El ciclo de instalación no comenzó: `GetFolderPath(Desktop)` devolvió vacío al heredarse el `USERPROFILE`
temporal del arnés. No se creó draft ni release y no se publicó ningún asset. El tag `companion-v0.3.3`
permanece como registro inmutable de ese intento; 0.3.4 resuelve la consulta del Escritorio y vuelve a medir
desde una identidad nueva.
