import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLines, renderPrompt, scoreResponse, parseTransport, summarize } from '../scripts/model-benchmark.mjs';

const questions=[{id:'q01',question:'¿Cuantas personas?',expected:'47',source:'source.md',line:2,quote:'Hay 47 participantes.'},
  {id:'q02',question:'¿Quien lo financia?',expected:null}];
const answer={id:'q01',answer:'47',citation:'source.md:L2',quote:'Hay 47 participantes.',abstain:false};
const abstention={id:'q02',answer:'',citation:'',quote:'',abstain:true};

test('both model conditions use the same envelope and locators without rubric metadata',()=>{
  const line={file:'source.md',line:2,text:'Hay 47 participantes.'};
  const full=renderLines([line,{file:'source.md',line:1,text:'# Example'}]),prepared=renderLines([line]);
  assert.equal(renderPrompt(questions,full).split('\nCONTEXTO\n')[0],renderPrompt(questions,prepared).split('\nCONTEXTO\n')[0]);
  assert(full.includes(prepared));assert(!renderPrompt(questions,'').includes('expected'));
  assert(!renderPrompt(questions,'').includes('47'));
});
test('response order is immaterial but missing, duplicate, extra and malformed answers are invalid',()=>{
  assert.deepEqual(scoreResponse({answers:[abstention,answer]},questions),scoreResponse({answers:[answer,abstention]},questions));
  for(const answers of [[answer],[answer,answer],[answer,abstention,{...answer,id:'foreign'}],[{...answer,abstain:'false'},abstention]]){
    const result=scoreResponse({answers},questions);assert(result.errors.length>0);assert.deepEqual(result.scores,[]);
  }
});
test('the strict rubric rejects units, wrong values, fabricated citations and false abstention equally',()=>{
  for(const changed of [{answer:'47 participantes'},{answer:'48'},{citation:'source.md:L3'},{quote:'Hay 48 participantes.'},{abstain:true}]){
    const result=scoreResponse({answers:[{...answer,...changed},abstention]},questions);
    assert.equal(result.errors.length,0);assert.equal(result.scores[0].groundedCorrect,false);
  }
  const contradictory=scoreResponse({answers:[{...answer,answer:'48'},abstention]},questions);
  assert.equal(contradictory.scores[0].answeredWithoutEvidence,true,'A correct quote cannot vindicate a false answer');
});
test('unanswerable questions require explicit clean abstention; invented answers remain failures',()=>{
  const good=scoreResponse({answers:[answer,abstention]},questions).scores[1];assert(good.appropriateAbstention);
  for(const changed of [{abstain:false,answer:'Patrocinador inventado'},{answer:'No se sabe'},{citation:'source.md:L1'}]){
    const bad=scoreResponse({answers:[answer,{...abstention,...changed}]},questions).scores[1];assert.equal(bad.appropriateAbstention,false);
  }
});
test('tool use and failed transport retain available raw answers and provider usage',()=>{
  const usage={input_tokens:10,output_tokens:5};
  const text=JSON.stringify({answers:[answer,abstention]});
  const stdout=[{type:'thread.started',thread_id:'must-not-publish'},
    {type:'item.started',item:{id:'private',type:'command_execution',command:'private'}},
    {type:'item.completed',item:{id:'private',type:'agent_message',text}},
    {type:'turn.completed',usage}].map(e=>JSON.stringify(e)).join('\n');
  const parsed=parseTransport(stdout);assert(parsed.errors.length>0);assert.deepEqual(parsed.usageEvents,[{type:'turn.completed',usage}]);
  assert.equal(parsed.assistantMessages[0],text);assert(!JSON.stringify(parsed).includes('private'));assert(!JSON.stringify(parsed).includes('must-not-publish'));
  const failure=parseTransport(stdout+'\ninvalid-json\n'+JSON.stringify({type:'turn.failed'}));assert(failure.errors.length>=3);
});
test('failed trials cannot inflate success totals; abstention and answerable outcomes stay separate',()=>{
  const scores=scoreResponse({answers:[answer,abstention]},questions).scores;
  const rows=[{condition:'prepared',order:1,valid:true,elapsedMs:9,scores,usage:null},
    {condition:'prepared',order:2,valid:false,elapsedMs:1,scores,usage:null}];
  const report=summarize(rows,'prepared');assert.equal(report.failed,1);assert.equal(report.valid,1);
  assert.equal(report.answerable.groundedCorrect,1);assert.equal(report.unanswerable.appropriateAbstentions,1);
  assert.equal(report.latencyMs.median,9);
  const losing=scoreResponse({answers:[{...answer,answer:'48'},abstention]},questions).scores;
  const comparison=summarize([{...rows[0],scores:losing}],'prepared');assert.equal(comparison.answerable.groundedCorrect,0);
});
