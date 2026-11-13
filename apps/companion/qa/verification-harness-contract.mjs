import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {NATIVE_PROJECT_FIXTURES,LEGACY_NATIVE_SELECTIONS,nativeSelection,validateNativeFixtures}
  from '../scripts/native-project-fixtures.mjs';
import {PROFILE_IDS} from '../engine/profiles.mjs';
import {normalizeSelection} from '../engine/preparation.mjs';
import {MUTATIONS,TARGET_PATHS,validateMutationTargets,inspectTestResult,detectedByBehavior}
  from '../scripts/service-mutation-cases.mjs';

test('installed fixtures cover six canonical profiles plus the retained software/game scenario',()=>{
  const result=validateNativeFixtures(NATIVE_PROJECT_FIXTURES,PROFILE_IDS,normalizeSelection);
  assert.deepEqual([...result.profiles].sort(),[...PROFILE_IDS].sort());
  assert.equal(result.scenarios,7);
  for(const definition of Object.values(NATIVE_PROJECT_FIXTURES)) {
    const selected=normalizeSelection(nativeSelection(definition));
    assert.equal(selected.profile,definition.profile);assert.equal(selected.focus,definition.focus);
    assert.ok(Object.values(definition.files).some(text=>text.toLowerCase().includes(definition.query.toLowerCase())));
  }
  const game=NATIVE_PROJECT_FIXTURES['software-game'];
  assert.equal(game.profile,'software');assert.equal(game.focus,'game');
  assert.ok(game.files['ProjectSettings/ProjectVersion.txt']);
  assert.ok(game.files['Assets/Score.cs'].includes(game.symbol));
  assert.ok(NATIVE_PROJECT_FIXTURES.research.binaryFiles['articulo.pdf']().subarray(0,4).equals(Buffer.from('%PDF')));
  assert.equal(NATIVE_PROJECT_FIXTURES.content.binaryFiles['ficha.docx']()[0],0x50);
});

test('omitted or retired native fixture profiles cannot silently narrow installed evidence',()=>{
  const {studies,...omitted}=NATIVE_PROJECT_FIXTURES;
  assert.throws(()=>validateNativeFixtures(omitted,PROFILE_IDS,normalizeSelection),/Faltan perfiles/);
  const retired={...NATIVE_PROJECT_FIXTURES,personal:{...NATIVE_PROJECT_FIXTURES.personal,profile:'general'}};
  assert.throws(()=>validateNativeFixtures(retired,PROFILE_IDS,normalizeSelection),/no canónico/);
});

test('legacy native identities remain readable but cannot create new projects',()=>{
  for(const [profile,expected]of Object.entries(LEGACY_NATIVE_SELECTIONS)) {
    const input={name:'Historical receipt',profile,agents:['web']};
    assert.throws(()=>normalizeSelection(input),error=>error.code==='PROFILE_INVALID');
    const read=normalizeSelection(input,{legacyRead:true});
    assert.equal(read.profile,expected.profile);assert.equal(read.focus,expected.focus);
  }
});

test('every declared service mutation has one insertion target in the actual current sources',async()=>{
  const originals={};
  for(const [id,relative]of Object.entries(TARGET_PATHS))
    originals[id]=await readFile(fileURLToPath(new URL('../'+relative,import.meta.url)),'utf8');
  const result=validateMutationTargets(MUTATIONS,originals);
  assert.equal(result.length,MUTATIONS.length);assert.ok(result.length>0);
  assert.ok(result.every(x=>x.occurrences===1));
});

test('absent and duplicate insertion targets fail before applying a mutation',()=>{
  const mutation={id:'control',from:'guard()',to:'false'};
  const originals={service:'guard()'};
  assert.equal(validateMutationTargets([mutation],originals)[0].occurrences,1);
  assert.throws(()=>validateMutationTargets([mutation],{service:'different()'}),/encontrados 0/);
  assert.throws(()=>validateMutationTargets([mutation],{service:'guard();guard()'}),/encontrados 2/);
  assert.throws(()=>validateMutationTargets([mutation,mutation],originals),/duplicada/);
  assert.deepEqual(originals,{service:'guard()'});
});

const raw=(stdout,status=0,extra={})=>({stdout,stderr:'',status,signal:null,error:null,...extra});
const baseline=inspectTestResult(raw('✔ legitimate behavior (1.3ms)\nℹ tests 1\nℹ cancelled 0\n'));
test('only known behavioral test failures count as mutation detections',()=>{
  const failure=raw('ℹ tests 1\nℹ cancelled 0\n✖ failing tests:\n✖ legitimate behavior (1.2ms)\n',1);
  assert.equal(detectedByBehavior({...failure,...inspectTestResult(failure)},baseline),true);
  const survived=raw('✔ legitimate behavior (1.2ms)\nℹ tests 1\nℹ cancelled 0\n');
  assert.equal(detectedByBehavior({...survived,...inspectTestResult(survived)},baseline),false);
});

test('parse, load, timeout, cancelled and setup failures never credit a detection',()=>{
  const suffix='ℹ tests 1\nℹ cancelled 0\n✖ failing tests:\n✖ legitimate behavior (1ms)\n';
  for(const failure of [raw('SyntaxError: unexpected token\n'+suffix,1),
    raw('ERR_MODULE_NOT_FOUND\n'+suffix,1),raw('test timed out\n'+suffix,1),
    raw(suffix.replace('cancelled 0','cancelled 1'),1),
    raw(suffix,null,{signal:'SIGTERM'}),raw(suffix,1,{error:'spawn failed'}),
    raw('✖ failing tests:\n✖ qa/stack.mjs (1ms)\nℹ tests 1\nℹ cancelled 0\n',1)]) {
    assert.equal(detectedByBehavior({...failure,...inspectTestResult(failure)},baseline),false);
  }
});
