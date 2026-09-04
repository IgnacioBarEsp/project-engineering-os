# Brownfield baseline - gestor de paquetes y cadena de suministro

## 1. Superficie acotada

La documentación de decisiones de arquitectura. Ningún archivo de runtime, workflow, lockfile ni manifiesto
del blueprint cambia dentro de este spike.

## 2. Fuentes vigentes

- `package.json` y `package-lock.json` de la raíz: `engines` declarado y cero dependencias de runtime.
- `blueprint/core/package.json`: `allowScripts` fijado a versión exacta y los scripts que el consumidor
  ejecuta.
- `.github/workflows/ci.yml` y `.github/workflows/release.yml`: `npm ci --ignore-scripts`, matriz de Node y
  sistema operativo, Trusted Publishing por OIDC y la versión de npm fijada para publicar.
- `scripts/check-package.mjs` y `test/supply-chain.test.mjs`: verificación del contrato de `allowScripts`.
- `config/dependency-audit-policy.json`: umbral de riesgo que bloquea CI.
- `docs/security/SUPPLY_CHAIN_TRIAGE_2026-08-18.md`: nueve señales ya triadas con veredicto.
- `docs/adr/0001-public-distribution.md` como precedente de formato y como decisión que este ADR no reabre.
- Documentación oficial de npm, pnpm y Yarn, consultada el 30 de agosto de 2026.

## 3. Comportamiento actual

El repositorio usa npm en las tres superficies. Los install scripts no se ejecutan en CI por
`--ignore-scripts`, el de OpenSpec está fijado por `allowScripts` a versión exacta, la publicación usa OIDC
con provenance y la auditoría bloquea riesgo alto. No existe configuración de cuarentena por antigüedad de
versión, y no existe decisión registrada sobre el gestor.

## 4. Comportamiento objetivo

Existe una decisión publicada, fechada y reproducible que compara al menos tres gestores por eje, da una
recomendación por superficie, enumera lo que ningún gestor mitiga y fija una condición de revisión. El
repositorio deja de poder cambiar de toolchain por percepción.

## 5. Compatibilidad heredada

Nada cambia de comportamiento. `package-lock.json`, los workflows, el manifiesto del blueprint y la forma de
invocación del CLI quedan intactos. La decisión de ADR 0001 sobre distribución y Trusted Publishing se cita y
no se reabre. El triage de agosto se cita señal por señal y no se reescribe.

## 6. Owner de spec y contexto

Project Engineering OS upstream posee la decisión. npm, pnpm, Yarn y Bun conservan sus propias licencias y
términos, que el ADR cita con fecha sin apropiárselos. El issue #19 gobierna el cambio.

## 7. Evidencia prevista

Documentación oficial con fecha de consulta por dato, sondas locales reproducibles con comando y salida,
contraste señal por señal contra el triage ya registrado, y `npm run check` para confirmar que el spike no
altera nada ejecutable.

## 8. Exclusiones

Migrar cualquier superficie; modificar lockfile, workflows o manifiesto del blueprint; reemplazar el registro
público por otro o por un proxy privado; reabrir Trusted Publishing y provenance; adoptar un gestor por
percepción sin la matriz que lo sustente.
