import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

test('Files names two tasks without claiming automatic AI transfer',async()=>{
  const source=await readFile(new URL('../ui/screens/project-files.mjs',import.meta.url),'utf8');
  assert.match(source,/text:'Buscar en tus archivos'/);
  assert.match(source,/text:'Preparar texto para tu IA'/);
  assert.match(source,/Preparar un texto para pegar en tu chat/);
  assert.match(source,/aria-labelledby':'file-search-title'/);
  assert.match(source,/aria-labelledby':'file-export-title'/);
  assert.match(source,/term\('cita'\)/);assert.match(source,/term\('fuente'\)/);
  assert.match(source,/Todavía no se ha enviado a ninguna IA/);
  assert.match(source,/copyExport',\{export:e.id\}/);
  assert.match(source,/exportPreview',\{id:state.project.id,query:state.query,maxBytes:12000\}/);
});

test('Text preparation has a query-dependent action and a responsive task row',async()=>{
  const [source,css,core]=await Promise.all([
    readFile(new URL('../ui/screens/project-files.mjs',import.meta.url),'utf8'),
    readFile(new URL('../ui/pages.css',import.meta.url),'utf8'),
    readFile(new URL('../ui/lib/core.mjs',import.meta.url),'utf8'),
  ]);
  assert.match(source,/const empty=!query.trim\(\);exportAction.dataset.disabledIdle=String\(empty\);exportAction.disabled=state.busy\|\|empty/);
  assert.match(source,/availability\(state.query\)/);
  assert.match(source,/state.query=v;availability\(v\)/);
  assert.match(core,/n.disabled=value\|\|n.dataset.disabledIdle==='true'/);
  assert.match(source,/aria-describedby','file-export-description'/);
  assert.match(css,/\.files-tasks \{[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(css,/@media\(max-width:900px\)\{\.files-tasks \{grid-template-columns:minmax\(0,1fr\)/);
});
