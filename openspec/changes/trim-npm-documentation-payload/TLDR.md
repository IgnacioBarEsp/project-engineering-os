# Recortar la documentación del paquete npm — #156

El paquete npm del núcleo deja de incluir la documentación, el estado, los diseños y las imágenes de
Companion que pertenecen al repositorio upstream. Una allowlist explícita y una verificación del `.tgz`
real mantienen el paquete enfocado en la CLI y sus guías; el mismo artefacto valida sus enlaces internos
y reporta el inventario en manifests de releases nuevas.

La documentación permanece en GitHub. No cambian los archivos de runtime, Companion, lockfiles, tags ni
releases publicadas. El tarball candidato contiene 167 archivos y 1.019.023 bytes sin comprimir, frente
a 193 archivos y 1.404.376 bytes en la base medida.

- Propuesta: [proposal.md](proposal.md)
- Diseño: [design.md](design.md)
- Especificación: [distribution](specs/distribution/spec.md)
- Tareas: [tasks.md](tasks.md)
- Baseline previo: [brownfield-baseline.md](brownfield-baseline.md)
- Inventario y validaciones: [evidence/validation.md](evidence/validation.md)
- Revisión adversarial: [evidence/adversarial-review.md](evidence/adversarial-review.md)
- Assessment de deuda: [evidence/debt-input.json](evidence/debt-input.json)
