# Contribuir

Gracias por mejorar Project Engineering OS. El proyecto acepta documentación, correcciones, perfiles y
cambios al runtime mediante pull request.

## Flujo

1. Busca un issue equivalente.
2. Para cambios no triviales, acuerda alcance, criterios observables, riesgos y rollback.
3. Crea una rama desde `main`.
4. Ejecuta `npm ci` y `npm run check`.
5. Si cambia comportamiento, actualiza specs OpenSpec y añade casos negativos.
6. Abre un PR con evidencia, licencias afectadas y assessment de deuda.

No edites artefactos OPSX como si pertenecieran al renderer general. No añadas secretos, telemetría,
servicios pagados obligatorios ni defaults de producto. Dependencias nuevas requieren licencia, costo,
mantenimiento, alternativa y motivo.

Los commits deben declarar autoría mediante el certificado DCO: al contribuir confirmas que tienes
derecho a enviar el trabajo bajo MIT. Puedes firmar con `git commit -s`.

Todo PR requiere revisión adversarial, evidencia y una decisión del mantenedor. En el flujo habitual, una
persona revisa la contribución antes de integrarla. El mantenedor puede delegar explícitamente ejecución,
revisión, integración o publicación para un alcance concreto; el PR debe registrar esa autorización y el
origen real de la evidencia. La revisión de un agente sobre su propio trabajo no es revisión humana ni
independiente. Un contribuidor no puede atribuirse esa delegación ni fabricar aprobaciones.

La delegación conserva DoR, OpenSpec local fijado, spec aprobada, evidencia automática/manual proporcional,
assessment de deuda y archivo oficial. Tampoco omite `CI / required`, integración protegida, protección de
tags, comparación del artifact canónico ni la identidad OIDC de publicación. No se eliminan protecciones
para resolver una revisión o un fallo de CI.
