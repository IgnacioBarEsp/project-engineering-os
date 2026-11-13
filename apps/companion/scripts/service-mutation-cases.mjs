const cases = [
  // The defect issue 100 exists for: a stated desktop choice being replaced by a web page. Each of these puts
  // the substitution back in a different way — the mode decided by what is installed instead of by what was
  // chosen, the branch that opens an address, and the address itself.
  { id: 'the-mode-is-decided-by-what-is-installed', file: 'handoff',
    reason: 'el modo vuelve a salir de si hay aplicación verificada, así que elegir escritorio sin poder abrirla manda a un navegador',
    from: "      const mode=web?'web':local?'local':'manual';",
    to: "      const mode=local?'local':'web';" },
  // Written as a behaviour change, not as a parse error. The first version of this mutation deleted the `else if`
  // and left two `else` clauses in a row, which made the suite fail to load — and a suite that cannot run credits
  // no test with anything. The harness said so by naming the file instead of a test, which is exactly what it is
  // there for.
  { id: 'a-desktop-choice-reaches-the-branch-that-opens-an-address', file: 'handoff',
    reason: 'la rama manual vuelve a abrir una dirección, así que elegir escritorio sin poder abrirla termina en un navegador',
    from: "        else opened={opened:'nothing',cause:preview.cause,projectAttached:false,agentActivated:false,agentReadProject:false};",
    to: "        else {await openExternal(DESTINATIONS.web);opened={opened:'web',projectAttached:false,agentActivated:false,agentReadProject:false};}" },
  { id: 'the-desktop-applications-get-their-web-addresses-back', file: 'handoff',
    reason: 'vuelven las URL por aplicación de escritorio, que es lo que hacía posible la sustitución',
    from: "export const DESTINATIONS = Object.freeze({ web: 'https://chatgpt.com/' });",
    to: "export const DESTINATIONS = Object.freeze({ web: 'https://chatgpt.com/', codex: 'https://chatgpt.com/codex', 'claude-code': 'https://claude.ai/', cursor: 'https://cursor.com/', 'github-copilot': 'https://github.com/copilot', opencode: 'https://opencode.ai/', antigravity: 'https://antigravity.google/' });" },
  { id: 'a-launcher-that-was-never-asked-is-reported-as-not-installed', file: 'handoff',
    reason: 'no haber podido comprobar se informa como no estar instalada, que es concluir de una ausencia que uno mismo creó',
    from: "      const cause=mode!=='manual'?null:routeOnly?'route-only':!localApps?'not-measured':!detected?'not-installed'",
    to: "      const cause=mode!=='manual'?null:routeOnly?'route-only':!detected?'not-installed'" },
  // The sentence a person reads when the application they chose will not open. An independent review drove the
  // real launcher through six distinguishable refusals and found three of the resulting sentences false, so each
  // of these puts back the thing that made them false.
  { id: 'the-cause-is-deduced-from-whether-a-publisher-came-attached', file: 'handoff',
    reason: 'la causa vuelve a deducirse de si el rechazo traia editor, y situaciones distintas se aplastan en dos frases',
    from: "        :Object.hasOwn(MANUAL_CAUSES,unverified.reason??'')?unverified.reason:'signature';",
    to: "        :unverified.publisherVerified?'no-contract':'signature';" },
  { id: 'a-refusal-stops-naming-the-check-that-failed', file: 'launcher',
    reason: 'el rechazo deja de llevar que comprobacion fallo, asi que quien escribe la frase tiene que adivinarla',
    from: "      catch (error) { error.publisher = verified[0] ?? null; error.reason = reason; throw error; }",
    to: "      catch (error) { error.publisher = verified[0] ?? null; throw error; }" },
  { id: 'the-codex-refusal-arrives-without-the-publisher-already-verified', file: 'launcher',
    reason: 'vuelve a usar fail en vez de refuse, asi que la pantalla dice que no se pudo comprobar una firma que si se comprobo',
    from: "    if (agent==='codex'&&!candidate.desktop) refuse('no-desktop-app','APP_UNTRUSTED'",
    to: "    if (agent==='codex'&&!candidate.desktop) fail('APP_UNTRUSTED'" },
  { id: 'an-enumeration-that-threw-is-reported-as-nothing-found', file: 'launcher',
    reason: 'una sonda caida vuelve a informarse como que la aplicacion no esta instalada, que es concluir de una ausencia propia',
    from: "      const found=await candidates(agent).catch(error=>{probeFailed=error;return [];});",
    to: "      const found=await candidates(agent).catch(()=>[]);" },
  // What protects the person's folder when something does get installed.
  { id: 'the-installed-tree-is-accepted-without-comparing-its-digest', file: 'stack',
    reason: 'lo instalado deja de compararse contra su pin, así que un árbol distinto del revisado se acepta y se puede borrar',
    from: "  if (tree.sha256 !== entry.treeHash || tree.bytes !== entry.installedBytes) {",
    to: "  if (false) {" },
  { id: 'a-technology-can-be-installed-outside-what-the-application-administers', file: 'catalog',
    reason: 'un destino deja de estar dentro de .project-os, así que una instalación escribe donde la persona guarda su trabajo',
    from: "    id: 'typed-code', name: 'TypeScript', relative: '.project-os/stack/typed-code',",
    to: "    id: 'typed-code', name: 'TypeScript', relative: 'node_modules-typed-code'," },
  { id: 'the-record-writer-takes-the-lock-it-is-already-holding', file: 'stack',
    reason: 'el escritor del registro vuelve a tomar el candado de la carpeta, y cualquier instalacion real muere con BUSY',
    from: "    await writeChecked(root, RECORD, content, beforeHash, MAX_RECORD);",
    to: "    await withLock(root, () => writeChecked(root, RECORD, content, beforeHash, MAX_RECORD));" },
  { id: 'npm-runs-with-lifecycle-scripts-enabled', file: 'stack',
    reason: 'se instala permitiendo que cada paquete ejecute codigo durante la instalacion',
    from: "export const INSTALL_ARGUMENTS = Object.freeze(['ci', '--ignore-scripts', '--bin-links=false',",
    to: "export const INSTALL_ARGUMENTS = Object.freeze(['ci', '--bin-links=false'," },
  { id: 'the-registry-stops-being-pinned', file: 'stack',
    reason: 'un mirror configurado puede sustituir los paquetes que el lockfile fijo',
    from: "  '--workspaces=false', '--registry=https://registry.npmjs.org', '--min-release-age=7', '--fund=false', '--audit=false']);",
    to: "  '--workspaces=false', '--fund=false', '--audit=false']);" },
  { id: 'what-came-from-the-network-is-moved-without-being-verified', file: 'stack',
    reason: 'lo que acaba de bajar de la red se renombra a la carpeta de la persona sin compararse contra su pin',
    from: "          const verified = await verifyStackTree(entry, await canonicalFolder(payload), controls);",
    to: "          const verified = { treeHash: entry.treeHash, bytes: entry.installedBytes, files: entry.files };" },
  { id: 'the-ignore-rules-overwrite-what-the-person-wrote', file: 'regenerable',
    reason: 'las reglas de ignore pisan un archivo que la persona escribio, que es decidir por ella en su propio repositorio',
    from: "  if (current.content !== null) return { written: false, reason: 'ya existe un archivo ahí y es de quien lo escribió' };",
    to: "  if (false) return { written: false, reason: 'ya existe un archivo ahí y es de quien lo escribió' };" },
  { id: 'the-record-accepts-a-name-the-catalogue-does-not-know', file: 'stack',
    reason: 'un registro forjado pinta texto arbitrario en la pantalla del proyecto',
    from: "  value.installed = value.installed.filter(item => Object.hasOwn(STACKS, item.id));",
    to: "  value.installed = value.installed.filter(() => true);" },
  { id: 'the-recommendation-stops-depending-on-the-folder', file: 'catalog',
    reason: 'la recomendación deja de leer el inventario y recomienda lo mismo a cualquiera',
    from: "  const interfaceFiles = countOf(inventory, '.tsx') + countOf(inventory, '.jsx');",
    to: "  const interfaceFiles = 1;" },
  { id: 'technologies-can-be-recorded-without-having-been-chosen', file: 'selection',
    reason: 'se pueden registrar tecnologías con una respuesta que no las pidió, así que una recomendación se vuelve una petición',
    from: "    if (value.decision !== 'chosen' && requested.length) fail('STACK_INVALID', 'Solo se pueden elegir tecnologías si dijiste que ya sabes cuál quieres.', 'Vuelve al asistente y responde la pregunta de tecnología.');",
    to: "" },
  // What decides whether a person's material can leave this machine. An independent review got a file name
  // into a request with nothing but a different capitalisation, so these are the ones that matter most.
  { id: 'the-models-route-is-built-here-instead-of-taken-from-the-catalogue', file: 'inference',
    reason: 'la ruta de modelos se construye a mano en vez de tomarse de la que el catalogo declara por proveedor',
    from: "        const result = await call(checkedUrl(declared.origin, declared.models), { key, timeout: PROVIDER_TIMEOUT_MS, signal });",
    to: "        const result = await call(checkedUrl(declared.origin, '/v1/models'), { key, timeout: PROVIDER_TIMEOUT_MS, signal });" },
  { id: 'asking-a-provider-for-models-throws-instead-of-giving-a-reason', file: 'inference',
    reason: 'un proveedor caido rompe la pantalla en vez de dejar el campo de texto como salida con su motivo',
    from: "      if (!declared) return { models: [], reason: 'ese proveedor no está en la lista revisada' };",
    to: "      if (!declared) throw new Error('ese proveedor no está en la lista revisada');" },
  { id: 'the-guard-stops-refusing-a-payload-with-project-data', file: 'inference',
    reason: 'el guardia deja de mirar el cuerpo, así que una ruta del proyecto puede viajar hacia un modelo',
    from: "      const leaking = projectDataIn(body, paths);",
    to: "      const leaking = [];" },
  { id: 'the-guard-compares-without-normalising', file: 'inference',
    reason: 'el guardia vuelve a comparar tal cual, así que un nombre con otra caja o con otra normalización pasa',
    from: "const comparable = value => String(value).normalize('NFC').toLowerCase();",
    to: "const comparable = value => String(value);" },
  { id: 'the-outbound-shape-passes-its-input-through', file: 'inference',
    reason: 'los datos que viajan dejan de construirse campo por campo y se reenvía lo que llegue',
    from: "export function shareableFacts(input = {}) {",
    to: "export function shareableFacts(input = {}) { if (input) return input;" },
  { id: 'a-model-answer-replaces-the-rules', file: 'inference',
    reason: 'lo que devuelve un modelo vuelve a quedarse solo, sin las reglas que esta aplicación impone',
    from: '    modelText.trim(), rules.trim()].join(',
    to: '    modelText.trim()].join(' },
  { id: 'the-floor-accepts-anything-long-enough', file: 'inference',
    reason: 'el piso vuelve a medir solo el largo, así que un texto sobre cualquier otra cosa lo supera',
    from: "    if (covered < 3) problems.push('no cubre qué preparar, cómo trabajar y qué reglas seguir');",
    to: "    if (covered < 0) problems.push('no cubre qué preparar, cómo trabajar y qué reglas seguir');" },
  { id: 'the-aggregate-carries-the-paths', file: 'prompts',
    reason: 'el agregado del inventario deja de ser un agregado y lleva la lista de archivos con sus rutas',
    from: "  return {\n    total: inventory?.files?.length ?? 0,",
    to: "  return {\n    files: inventory?.files ?? [],\n    total: inventory?.files?.length ?? 0," },
  { id: 'the-witness-never-reports-a-change',
    reason: 'la comparación de resúmenes deja de encontrar diferencias, así que un proyecto sigue listo después de cambiar un archivo del que dependía',
    from: '    for (const item of verdict.witness) if (await witnessHash(root, item.path) !== item.hash) changed.add(item.stage);',
    to: '    for (const item of verdict.witness) if (false && await witnessHash(root, item.path) !== item.hash) changed.add(item.stage);' },
  { id: 'a-verdict-is-accepted-without-checking-its-folder',
    reason: 'el veredicto se acepta sin comprobar que fue tomado en esta carpeta',
    from: "            const verdict=saved.find(v=>v.id===i.id&&v.rootHash===hash(i.root))??null;",
    to: "            const verdict=saved.find(v=>v.id===i.id)??null;" },
  { id: 'a-truncated-witness-can-still-be-shown-as-ready',
    reason: 'un veredicto que no pudo registrar todo lo que dependía de él puede mostrarse como listo',
    from: "                :!verdict||verdict.witnessTruncated?'unverified'",
    to: "                :!verdict?'unverified'" },
  { id: 'the-ready-mark-ignores-a-stale-inventory',
    reason: 'la palomita deja de exigir que el inventario de la carpeta siga vigente',
    from: "  const stages = [{ id: 'base', state: status.base?.vision==='missing'?'vision-missing':status.base?.base === 'prepared' && status.base?.inventory === 'current' ? 'ready'",
    to: "  const stages = [{ id: 'base', state: status.base?.vision==='missing'?'vision-missing':status.base?.base === 'prepared' ? 'ready'" },
  { id: 'the-guidance-stops-refusing-a-stale-copy',
    reason: 'copiar un paso deja de rechazarse cuando el proyecto cambió después de componer la guía',
    from: "        for(const item of value.witness)if(await witnessHash(p.root,item.path)!==item.hash)fail('GUIDE_STALE'",
    to: "        for(const item of value.witness)if(false&&await witnessHash(p.root,item.path)!==item.hash)fail('GUIDE_STALE'" },
  { id: 'a-verdict-missing-a-required-stage-is-accepted',
    reason: 'un veredicto cuyo `required` nombra una etapa que su `stages` no lleva se acepta, así que nada está pendiente porque nada está',
    from: "    && value.required.every(id => value.stages.some(stage => stage.id === id))",
    to: "    && value.required.every(id => true || value.stages.some(stage => stage.id === id))" },
  { id: 'a-verdict-with-no-witness-is-accepted',
    reason: 'un veredicto sin testigo se acepta, y como nada puede desmentirlo la marca sería permanente',
    from: "    && Array.isArray(value.witness) && value.witness.length > 0 && value.witness.length <= WITNESS_LIMIT",
    to: "    && Array.isArray(value.witness) && value.witness.length <= WITNESS_LIMIT" },
  { id: 'an-unreadable-verdict-store-takes-the-list-with-it',
    reason: 'un registro de comprobaciones que no se puede leer vuelve a romper la lista y a impedir abrir cualquier proyecto',
    from: "    catch { return { state: { content: null, hash: null }, items: [], readable: false }; }",
    to: "    catch (error) { throw error; }" },
  { id: 'a-verdict-that-cannot-be-written-fails-the-check',
    reason: 'no poder guardar el veredicto vuelve a tumbar la comprobación que la persona pidió',
    from: "      witness: [], witnessTruncated: true }), saved: false, error: publicError(error) }; }",
    to: "      witness: [], witnessTruncated: true }), saved: false, error: (() => { throw error; })() }; }" },
  { id: 'the-guidance-sends-a-prepared-project-to-a-blank-wizard',
    reason: 'el paso que resuelve una carpeta cambiada vuelve a mandar a la persona al asistente, que abandona el proyecto y borra sus respuestas',
    from: "    const action = id === 'base' && report.profile && stage.state !== 'not-prepared' ? 'resave-base'",
    to: "    const action = id === 'base' && false ? 'resave-base'" },
  { id: 'a-required-stage-that-reports-nothing-counts-as-ready',
    reason: 'una etapa que no reportó nada reconocible se cuenta como lista en vez de resolverse en contra de la marca',
    from: "const reason = (...values) => values.find(value => typeof value === 'string' && value) ?? 'unknown';",
    to: "const reason = (...values) => values.find(value => typeof value === 'string' && value) ?? 'ready';" },
];

export const MUTATIONS = Object.freeze(cases.map(item=>Object.freeze(item)));
export const TARGET_PATHS = Object.freeze({
  service:'desktop/service.mjs',inference:'runtime/inference.mjs',
  prompts:'context/prompts.mjs',handoff:'desktop/service.mjs',
  launcher:'desktop/local-apps.mjs',stack:'runtime/stack.mjs',
  regenerable:'runtime/regenerable.mjs',catalog:'runtime/stack-catalog.mjs',
  selection:'engine/preparation.mjs',
});
export const SUITE_PATHS = Object.freeze({
  service:'qa/project-list.mjs',inference:'qa/prompts.mjs',prompts:'qa/prompts.mjs',
  handoff:'qa/stack.mjs',launcher:'qa/stack.mjs',regenerable:'qa/stack.mjs',
  stack:'qa/stack.mjs',catalog:'qa/stack.mjs',selection:'qa/stack.mjs',
});

export function validateMutationTargets(mutations,originals) {
  const ids=new Set();
  return mutations.map(mutation=>{
    const target=mutation.file??'service',source=originals[target];
    if(ids.has(mutation.id))throw new Error(`Mutación duplicada: ${mutation.id}`);
    ids.add(mutation.id);
    if(typeof source!=='string'||!mutation.from||typeof mutation.to!=='string')
      throw new Error(`Mutación inválida: ${mutation.id}`);
    const occurrences=source.split(mutation.from).length-1;
    if(occurrences!==1)throw new Error(`La mutación ${mutation.id} requiere un punto de inserción; encontrados ${occurrences}.`);
    return {id:mutation.id,target,occurrences};
  });
}

// Same explicit spec-reporter format as the existing harness, with its raw output
// retained. Only a failed behavioral test known from the passing baseline counts.
export function inspectTestResult(result) {
  const text=`${result.stdout??''}${result.stderr??''}`.replace(/\x1b\[[0-9;]*m/g,'');
  const failed=[],passed=[];
  let listing=false;
  const name=value=>value.trim().replace(/\s+\([\d.]+(?:ms|s)\)$/,'');
  for(const line of text.split('\n')) {
    if(line.includes('failing tests:')){listing=true;continue;}
    const value=line.trim();
    if(value.startsWith('✔'))passed.push(name(value.slice(1)));
    if(listing&&value.startsWith('✖')&&!value.includes('failing tests'))failed.push(name(value.slice(1)));
  }
  const number=label=>{const match=text.match(new RegExp('(?:ℹ|#)\\s+'+label+'\\s+(\\d+)'));return match?Number(match[1]):null;};
  const tests=number('tests'),cancelled=number('cancelled');
  const setupFailure=!!result.error||result.status===null||!!result.signal||!tests
    ||cancelled===null||cancelled>0
    ||/SyntaxError:|ERR_MODULE_NOT_FOUND|test timed out|testTimeoutFailure|cancelledByParent|error:\s*['"]?TimeoutError/.test(text);
  return {failed:[...new Set(failed)],passed:[...new Set(passed)],tests,cancelled,setupFailure};
}
export function detectedByBehavior(result,baseline) {
  return !result.setupFailure&&result.status!==0&&result.failed.length>0
    &&result.failed.every(name=>baseline.passed.includes(name));
}
