# Proposal: companion-contextual-installer

Enlace al issue: https://github.com/IgnacioBarEsp/project-engineering-os/issues/127

## Intención y Justificación

Al ejecutar el instalador NSIS de Windows (`ProjectEngineeringOS-Setup-*.exe`), el sistema debe inspeccionar si Companion ya se encuentra instalado. Si se detecta la misma versión, debe otorgar opciones explícitas al usuario: reparar la instalación actual (sobreescribiendo archivos de programa dañados), desinstalar la aplicación mediante su desinstalador nativo, o cancelar la operación sin tocar nada. Si se detecta una versión anterior, debe ofrecer actualizar de forma limpia o cancelar.

Este comportamiento (Opción B acordada) garantiza control total para el usuario y evita instalaciones duplicadas o estados corruptos sin alterar datos de usuario en `AppData/Roaming` ni runtimes de proyectos.
