## Historia Original

El mantenedor pidió continuar el programa #66 hasta demostrar sus criterios y publicar los artefactos previstos. Claude integró #87, #80 y #81 en los PR #91–#93. La continuación del 11 de septiembre de 2026 exige partir del código real y conservar esa evidencia.

## Enriquecida

La base es `ae0e631`: existen app instalada, motor por perfil, EXE, landing y medición de recuperación. Faltan las páginas nativas del instalador, aceptación de los cinco perfiles en la app instalada, aperturas locales controladas, inferencia pareada con el mismo modelo y entrega pública verificable. Las pruebas automatizadas y la navegación por un agente no se declararán estudios con personas.

### Criterios observables

- Recorrer licencia, destino, instalación, apertura y preparación desde la interfaz real; comprobar reapertura y preservación de fuentes.
- Completar los cinco perfiles, ingeniería/OpenSpec/CodeGraph cuando aplique y aperturas locales verificadas con carpeta solicitada.
- Congelar corpus sintético, preguntas y rúbrica; ejecutar las mismas tareas con el mismo modelo en lectura completa y recuperación preparada, tres repeticiones en orden alternado, registrando respuestas, uso real disponible, fallos y límites.
- Verificar referencias visuales actuales sin copiar recursos; publicar landing navegable y enlace real a un EXE derivado de un commit limpio, con manifiesto y SHA-256.
- Resolver Blocker/Major, registrar Minor reales, pasar revisión independiente, deuda, readiness, archivo oficial y PR protegido. Cerrar #66 solo con evidencia.

### Alcance y límites

Correcciones demostradas por aceptación, harness de medición, documentación y distribución de Companion. Sin republicar core 0.5.0, sin nuevo cliente de chat, sin servicios pagados obligatorios ni firma de editor inventada. La autorización del mantenedor cubre instalación, aperturas controladas, commits DCO, PR, integración y publicación. Cualquier bloqueo externo se registra sin simular éxito.

<!-- project-os-readiness:pre-propose
{
  "schemaVersion": "1.0.0",
  "change": "complete-companion-program",
  "execution": "versioned",
  "dependencies": [87, 80, 81],
  "currentState": {
    "summary": "Los PR 91–93 están integrados; faltan aceptación nativa completa, inferencia pareada y descarga pública de Companion.",
    "sources": ["https://github.com/IgnacioBarEsp/project-engineering-os/issues/66", "https://github.com/IgnacioBarEsp/project-engineering-os/pull/93"]
  },
  "scope": ["Aceptación nativa del instalador y cinco perfiles", "Benchmark pareado de respuestas con modelo", "Entrega pública verificable y correcciones demostradas"],
  "observableCriteria": ["Instalador e interfaz recorridos con fuentes preservadas", "Mismo modelo y corpus con tres repeticiones alternadas y datos crudos", "EXE y landing públicos con identidad comprobada", "Cero Blocker o Major abiertos y revisión independiente registrada"],
  "owner": "Ignacio Bar Esp",
  "risks": ["Pérdida de archivos durante instalación", "Atribuir al modelo resultados solo de recuperación", "Publicar un artefacto sin identidad de código o evidencia privada"],
  "surfaces": ["documentation", "harness-tooling", "ui", "auth-security"],
  "manualInterventions": [],
  "costLicenseReview": {"status":"approved","owner":"Ignacio Bar Esp","evidence":"Autorización expresa del mantenedor en la continuación del programa del 11 de septiembre de 2026.","justification":"Se reutilizan herramientas instaladas y la cuenta existente; no se compran créditos, licencias ni servicios. Dependencias fijadas existentes y licencia MIT."},
  "evidence": {"automatic":["repository-checks","profile-fixtures","openspec-strict","paired-model-results","artifact-verification"],"manual":["Recorrido nativo observado por agente, aperturas locales y revisión adversarial independiente"]},
  "rollback": {"strategy":"Revertir el PR y retirar una entrega defectuosa sin tocar los proyectos.","trigger":"Regresión reproducida o identidad de artefacto inválida.","recovery":"Restaurar el artefacto anterior verificado y comprobar hashes de fuentes e historial."},
  "nonGoals": ["Estudio con personas o Windows limpio simulado", "Publicación nueva del núcleo", "Firma de editor o ahorro universal sin evidencia"],
  "exceptions": []
}
project-os-readiness:pre-propose -->
