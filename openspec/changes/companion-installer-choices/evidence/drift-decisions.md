# Decisiones de deriva

- El baseline histórico de #142 no se reutiliza como evidencia de las nuevas casillas: solo demuestra el
  comportamiento previo de instalación silenciosa y preservación de datos.
- La propiedad del acceso directo se mueve del valor global de electron-builder al include local para que la
  decisión asistida y el valor por defecto de `/S` compartan una única fuente.
- El Finish estándar vuelve a estar visible con `runAfterFinish: true`; no se añade un `Exec` propio y no se
  afirma lanzamiento alguno bajo `/S`.
- La ausencia de un Windows desechable disponible no se convierte en un PASS. Se conserva como trabajo del
  workflow protegido de release.
