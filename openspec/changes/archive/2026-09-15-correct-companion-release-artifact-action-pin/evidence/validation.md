# Validación — pin de artefacto Companion

Fecha: 15 de septiembre de 2026. Issue #117. El run `34948905121` falló en setup porque GitHub no resolvió el SHA terminado en `d`; no hubo checkout, build, draft, asset ni release.

- `git ls-remote` del repositorio oficial de Actions confirmó que `upload-artifact@v7.0.1` es `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`.
- `npm test --prefix apps/companion`: PASS, 131/131; la nueva prueba exige el SHA completo.
- `npm run check:workflows`: PASS, seis workflows.
- `openspec validate correct-companion-release-artifact-action-pin --strict`: PASS.
- `git diff --check`: PASS.

Rollback: revertir este micro-PR restaura el pin previo pero no modifica tag, release ni datos de usuario. El reintento se hace solamente tras CI verde; 0.1.0 sigue siendo la descarga pública mientras tanto.
