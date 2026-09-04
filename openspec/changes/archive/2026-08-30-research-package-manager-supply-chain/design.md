# Design - gestor de paquetes frente al riesgo de cadena de suministro

## 1. El error que había que evitar

La pregunta llegaba con una respuesta implícita: "npm es atacado, pnpm es más seguro, migremos". Ese es
exactamente el tipo de decisión que el propio repositorio prohíbe tomar sin evidencia, y la manera de
equivocarse era aceptar la premisa entera en vez de partirla.

La premisa se parte en dos:

- **Cierta:** el ecosistema npm ha sido blanco de campañas reales y repetidas.
- **Falsa:** que eso sea un problema del CLI. Typosquatting, cuentas comprometidas, paquetes maliciosos,
  `postinstall` hostiles y dependency confusion son ataques al **registro**. Los cuatro gestores resuelven
  contra `registry.npmjs.org`.

Lo que sí difiere son los defaults y los controles. La investigación mide eso y nada más.

## 2. Por qué siete ejes y no seis

El issue proponía seis ejes. La evidencia obligó a añadir un séptimo: **compatibilidad con el rango
`engines` declarado**.

Resultó ser el eje decisivo. pnpm 11 requiere Node ≥ 22; este paquete declara `^20.20.0 || >=22.22.0` y su
matriz de CI ejecuta Node 20.20.0 sobre tres sistemas operativos. Adoptar pnpm 11 rompería tres de las seis
combinaciones antes de llegar a discutir seguridad.

Un eje de compatibilidad descalifica más rápido y más barato que cualquier comparación de defaults, así que
va primero en el orden de lectura de la matriz.

## 3. El hallazgo que invierte la conclusión

La razón principal para migrar era la cuarentena por antigüedad de versión, que pnpm 11 trae activa a un
día. Medido: **npm también la tiene**, desde 11.10.0 el 11 de febrero de 2026.

```text
npm config get min-release-age          -> null
npm config get min-release-age-exclude  -> (vacío)
```

La diferencia no es de capacidad sino de default. Y una diferencia de default se cierra con una línea de
configuración, no con una migración.

Para no confundir "ajuste reconocido" con "clave ignorada" se contrastó contra una inventada en el mismo
`.npmrc`: npm avisa por la inventada y acepta la real en silencio. Sin esa sonda, la afirmación se apoyaría
en documentación en vez de en comportamiento.

Lo mismo ocurre con los otros dos controles: npm 12 pone los install scripts en off por defecto y `allow-git`
y `allow-remote` en `none`, que es el equivalente de `blockExoticSubdeps`.

## 4. Cómo se evitó el sesgo de confirmación

Una investigación que empieza sospechando de una premisa tiende a encontrar razones para rechazarla. Dos
salvaguardas:

**Contraste contra datos reales, no contra teoría.** El triage del 18 de agosto de 2026 registra nueve
señales concretas. Se pasó cada una por la pregunta "¿la habría evitado otro gestor?". Resultado: cero
evitadas y una donde el control ya estaba puesto por otra vía. Si el resultado hubiera sido tres o cuatro, la
conclusión habría cambiado, y el método lo habría mostrado.

**Sección explícita de vectores no mitigados.** Seis vectores que ningún gestor retira. Esa sección existe
para impedir que la decisión —cualquiera que fuese— se apoyara en una ganancia inexistente. Habría sido igual
de necesaria si la conclusión fuera migrar.

## 5. Por qué tres superficies y no una

El issue ya las separaba, y la separación resultó ser correcta pero por razones distintas en cada caso:

| Superficie | Razón dominante del rechazo |
| --- | --- |
| Desarrollo y release | Compatibilidad de Node, más una regresión de OIDC en pnpm durante 2026. La cadena de publicación es la que menos tolera un cliente en evolución. |
| Repositorios generados | Imponer un gestor sería un **default de producto**, prohibido en el núcleo universal. Además el acoplamiento real es mínimo. |
| Invocación del consumidor | No hay nada que migrar: `pnpm create`, `yarn create` y `bunx` ya resuelven `create-*` contra el mismo tarball. |

Tres rechazos por tres razones distintas es más informativo que un rechazo global, y deja claro qué tendría
que cambiar para revisar cada uno por separado.

## 6. Una premisa del issue que no se sostenía

El planteamiento afirmaba que `blueprint/core/package.json` acopla los repositorios generados a npm mediante
`npm exec --yes=false -- openspec ...` en cuatro scripts. Verificado contra `main`: los cuatro scripts
`openspec:*` invocan `node ./.project-constructor/openspec.mjs`, un wrapper propio. El único script que
menciona npm es `project-os:check`, que encadena `npm run`, y esa forma funciona igual bajo cualquier gestor.

La superficie de acoplamiento era menor de lo que el issue suponía. Corregirlo importa: si el acoplamiento
fuera real, la superficie 2 tendría un costo de migración que no tiene, y la deuda que sí existe —la falta de
guía de endurecimiento— habría quedado tapada por un problema imaginario.

## 7. Rechazar no es no hacer nada

Un rechazo que deja el estado intacto es indistinguible de la inercia. La matriz identificó tres refuerzos
concretos, cada uno con issue propio:

- el npm fijado para publicar es de julio de 2025, anterior a los dos controles que la decisión considera
  materiales;
- la cuarentena existe y no está configurada, así que rechazar la migración apoyándose en ella exige
  adoptarla;
- no hay guía de endurecimiento agnóstica para quien elija otro gestor.

Los tres declaran dependencia de este issue, así que su Definition of Ready pasa cuando el ADR se cierra.

## 8. Condición de revisión y no permanencia

La decisión lleva fecha de revisión —1 de marzo de 2027— y tres disparadores anticipados. Sin eso,
"conservar npm" se convertiría en una postura por costumbre, que es justo lo que la matriz demuestra que el
repositorio debe evitar.

## 9. No objetivos

Migrar cualquier superficie; modificar el lockfile, los workflows o el manifiesto del blueprint; reemplazar
el registro público por otro o por un proxy privado; reabrir Trusted Publishing y provenance.
