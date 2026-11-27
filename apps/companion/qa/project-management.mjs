import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('project management preserves real operations without folder capabilities',async()=>{
  const source=await readFile(new URL('../ui/screens/project-overview.mjs',import.meta.url),'utf8');
  assert.match(source,/Preparación de Companion/);assert.match(source,/const saved=s\.base\.selection\?\?s\.project\.selection/);
  assert.match(source,/rowBtn\('duplicate-project',managedProject/);assert.match(source,/rowBtn\('forget-project',s\.project/);
  assert.match(source,/selection:saved,mappedProfile:normalized\?\.profile,mappedFocus:normalized\?\.focus/);
  assert.match(source,/Quitar el proyecto de la lista no cambia sus archivos/);
  assert.match(source,/última operación registrada de esta etapa/);assert.match(source,/Si hay cambios posteriores/);
  assert.match(source,/local\.map\(draw\)/);assert.match(source,/ai\.map\(draw\)/);assert.match(source,/class:'guide-optional-list'/);
  assert.doesNotMatch(source,/call\('(rename|copyFolder|removePreparation|deleteProject)'/);
});
test('optional navigation preserves route identity, busy and focus boundaries',async()=>{
  const source=await readFile(new URL('../ui/screens/workspace.mjs',import.meta.url),'utf8');
  assert.match(source,/open:state\.tab!=='overview'/);assert.match(source,/if\(!event\.target\.isConnected/);
  assert.match(source,/if\(state\.busy\)\{event\.target\.open=true;return;\}/);
  assert.match(source,/run\(\(\)=>change\('overview'\)\)/);assert.match(source,/await render\(/);
  assert.match(source,/route\?\.id!==state\.project\?\.id/);assert.match(source,/#project-tools > summary/);
  assert.match(source,/term\('receta','recetas'\)/,'The optional navigation defines the vocabulary it introduces');
});
