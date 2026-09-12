import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLines, renderPrompt, scoreResponse, parseTransport, summarize } from '../scripts/model-benchmark.mjs';

const questions=[{id:'q01',question:'¿Cuantas personas?',expected:'47',source:'source.md',line:2,quote:'Hay 47 participantes.'},
  {id:'q02',question:'¿Quien lo financia?',expected:null}];
const answer={id:'q01',answer:'47',citation:'source.md:L2',quote:'Hay 47 participantes.',abstain:false};
const abstention={id:'q02',answer:'',citation:'',quote:'',abstain:true};

test('nothing in the prompt reveals which questions can be answered', () => {
  // The previous version of this test asserted that the strings 'expected' and '47' were absent, which is
  // the spelling of one leak rather than the property. An independent review reintroduced the exact bias of
  // the discarded pilot — a third field on each public question saying whether it was answerable — and all
  // six regressions stayed green.
  //
  // The property is that answerability must not be observable in the prompt at all. Three question sets
  // that differ ONLY in whether each question has an answer key must render byte-identical prompts. That
  // kills a leaked field, a leaked id, a leaked count and anything else derived from the key, without this
  // test having to know what form the leak takes.
  const asked = [{ id: 'q01', question: '¿Cuantas personas?' }, { id: 'q02', question: '¿Quien lo financia?' }];
  const key = { expected: '47', source: 'source.md', line: 2, quote: 'Hay 47 participantes.' };
  const empty = { expected: null, source: null, line: null, quote: null };
  const context = renderLines([{ file: 'source.md', line: 2, text: 'Hay 47 participantes.' }]);

  const allAnswerable = asked.map(question => ({ ...question, ...key }));
  const noneAnswerable = asked.map(question => ({ ...question, ...empty }));
  const mixed = [{ ...asked[0], ...key }, { ...asked[1], ...empty }];

  assert.equal(renderPrompt(allAnswerable, context), renderPrompt(noneAnswerable, context),
    'El prompt cambia según haya clave de respuesta: filtra qué preguntas son respondibles.');
  assert.equal(renderPrompt(mixed, context), renderPrompt(noneAnswerable, context),
    'Un conjunto mixto se distingue de uno sin respuestas: filtra cuáles lo son.');
});

test('both conditions share one envelope and one locator encoding', () => {
  const lines = [{ file: 'b.md', line: 1, text: 'segunda fuente' }, { file: 'a.md', line: 2, text: 'Hay 47 participantes.' }];
  const full = renderLines(lines), prepared = renderLines([lines[1]]);
  // Same instructions and same question block, whatever the context is.
  assert.equal(renderPrompt(questions, full).split('\nCONTEXTO\n')[0], renderPrompt(questions, prepared).split('\nCONTEXTO\n')[0]);
  // The narrower context is a subset of the wider one, so neither condition sees material the other cannot.
  assert(full.includes(prepared));
  // One locator shape for every line in either condition. An encoding that differed per condition would
  // hand the model a way to tell them apart, which is the other bias the discarded pilot had.
  for (const rendered of [full, prepared]) {
    for (const line of rendered.split('\n')) {
      assert.match(line, /^\[[^\]:]+:L\d+\] /, `Localizador fuera de forma: ${line}`);
    }
  }
  // Rendering is order-independent, so the same set of lines cannot produce two different contexts.
  assert.equal(renderLines([...lines].reverse()), full);
});

test('a citation is only valid when it names the right file, not just the right line', () => {
  // Every answer in the real question set sits at :L2 of its own source, so the file name is the only
  // thing that distinguishes one subject's citation from another's. A rubric that compared the line alone
  // would score a citation to the wrong document as correct.
  const wrongFile = { ...answer, citation: 'otro.md:L2' };
  const [scored] = scoreResponse({ answers: [wrongFile, abstention] }, questions).scores;
  assert.equal(scored.correctValue, true, 'El valor sigue siendo el correcto.');
  assert.equal(scored.validCitation, false, 'La cita nombra otro archivo y no puede valer.');
  assert.equal(scored.groundedCorrect, false);
  assert.equal(scored.answeredWithoutEvidence, true);
});

test('the published latency is a median, and the denominators count their own subset', () => {
  const run = (order, condition, elapsedMs, scores) => ({ order, condition, valid: true, elapsedMs, scores, usage: null });
  const good = [{ id: 'q01', answerable: true, correctValue: true, validCitation: true, groundedCorrect: true, falseAbstention: false, answeredWithoutEvidence: false, appropriateAbstention: false },
    { id: 'q02', answerable: false, correctValue: false, validCitation: false, groundedCorrect: false, falseAbstention: false, answeredWithoutEvidence: false, appropriateAbstention: true }];
  const runs = [run(1, 'full', 10, good), run(2, 'full', 40, good), run(3, 'full', 100, good),
    run(4, 'full', 999, good)];
  runs[3].valid = false; runs[3].scores = [];
  const summary = summarize(runs, 'full');
  // Three valid trials of 10, 40 and 100: the median is 40. Minimum or mean would not be.
  assert.equal(summary.latencyMs.median, 40);
  assert.equal(summary.latencyMs.min, 10);
  assert.equal(summary.latencyMs.max, 100);
  // An invalid trial is counted, never scored, and never inflates a denominator.
  assert.equal(summary.attempted, 4);
  assert.equal(summary.valid, 3);
  assert.equal(summary.failed, 1);
  assert.equal(summary.answerable.evaluated, 3, 'Una pregunta respondible por ensayo válido.');
  assert.equal(summary.unanswerable.evaluated, 3, 'Una pregunta sin respuesta por ensayo válido.');
  assert.equal(summary.answerable.groundedCorrect, 3);
  assert.equal(summary.unanswerable.appropriateAbstentions, 3);
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
