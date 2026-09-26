import assert from 'node:assert/strict';
import test from 'node:test';
import {emptyAnswers,selectionForPreparation,visionFromAnswers,wordCount,WIZARD_PAGES} from '../ui/lib/wizard-model.mjs';

test('four wizard pages have a stable order and new answers contain no role or guide question',()=>{
  assert.deepEqual(WIZARD_PAGES,['setup','delimitation','vision','install']);
  const s=emptyAnswers();assert.equal(s.profile,'software');assert.equal(s.focus,'website');
  assert.ok(!Object.hasOwn(s,'role'));assert.ok(!Object.hasOwn(s,'guide'));
});
test('vision contains only the person answers and supplied headings, with no suggested assertions',()=>{
  const s={...emptyAnswers(),name:'Libro',goal:'Comparar mis notas',vision:'',visionMode:'structured',
    audience:'Mis estudiantes',existing:'Tres borradores',outside:'No usar fuentes externas'};
  assert.equal(visionFromAnswers(s),'### Para quién\nMis estudiantes\n\n### Qué existe ya\nTres borradores\n\n### Qué no entra\nNo usar fuentes externas');
  assert.equal(selectionForPreparation(s).vision,visionFromAnswers(s));
  assert.equal(visionFromAnswers({...s,visionMode:'free',vision:''}),s.goal);
  assert.equal(visionFromAnswers({...s,visionMode:'free',vision:'###'}),s.goal);
  assert.equal(visionFromAnswers({...s,visionMode:'free',vision:'Mi texto libre'}),'Mi texto libre');
  assert.equal(wordCount('  uno\n dos tres  '),3);assert.equal(wordCount('  '),0);
});
