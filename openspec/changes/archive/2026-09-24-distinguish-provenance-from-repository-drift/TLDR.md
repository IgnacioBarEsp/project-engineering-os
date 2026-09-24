# Distinguir procedencia del CLI de deriva — #154

`sync --check` ahora identifica un cambio aislado de `packageHash` como `PROVENANCE_MISMATCH` (código 0), informa el campo y ambos valores, y no propone operaciones ni escribe. La deriva de archivos o estado sigue siendo `DRIFT` (código 1); las guías CLI y de recuperación explican estados y códigos.

- Issue: [#154](https://github.com/IgnacioBarEsp/project-engineering-os/issues/154)
- Propuesta y decisión: [proposal.md](proposal.md), [design.md](design.md)
- Contrato: [runtime](specs/runtime/spec.md), [documentación pública](specs/public-documentation-experience/spec.md)
- Baseline: [brownfield-baseline.md](brownfield-baseline.md)
- Pruebas y recorrido de dos orígenes: [evidence/validation.md](evidence/validation.md), [evidence/manual-provenance-fixture.md](evidence/manual-provenance-fixture.md)
- Revisión adversarial: [evidence/adversarial-review.md](evidence/adversarial-review.md)
- Assessment de deuda: [evidence/debt-input.json](evidence/debt-input.json)
- Tareas: [tasks.md](tasks.md)
