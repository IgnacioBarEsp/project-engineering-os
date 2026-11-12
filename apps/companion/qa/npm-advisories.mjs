import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { createDeflateRaw, constants } from 'node:zlib';
import { setTimeout as sleep } from 'node:timers/promises';

// Bounded regressions for the older advisories also visible in the original npm baseline.
// Payloads/controls follow the primary reports and upstream6.28.1 commits, indexed in #204 evidence.
// They execute the actual bundled modules. They do not assert exposure of a Companion user project.
const require=createRequire(import.meta.url),npm=fileURLToPath(new URL('../node_modules/npm/',import.meta.url));
const braceRoot=path.join(npm,'node_modules/brace-expansion');
const braceCjs=require(braceRoot),braceEsm=await import(pathToFileURL(path.join(braceRoot,'dist/esm/index.js')));
for(const [format,brace] of [['CJS',braceCjs],['ESM',braceEsm]]) {
  test(`bundled brace-expansion ${format} preserves legitimate ranges and nesting`,()=>{
    assert.deepEqual(brace.expand('{a,b}{1..2}'),['a1','a2','b1','b2']);
    assert.deepEqual(brace.expand('x{{a,b}}y'),['x{a}y','x{b}y']);
  });
  test(`GHSA-6j4f-fj2g-mc7p ${format}: comma-post recursion and large argument arrays stay bounded`,{timeout:10000},()=>{
    for(const input of ['{'+'{a},'.repeat(7500)+'b}','{{x},'+'a,'.repeat(125000)+'b}']) {
      const result=brace.expand(input,{max:1});assert.ok(Array.isArray(result));assert.ok(result.length<=1);
    }
  });
  test(`GHSA-qhr7-859c-m2p7 ${format}: both nested recursion sites refuse stack exhaustion`,{timeout:10000},()=>{
    for(const input of ['{a,'.repeat(4100)+'z'+'}'.repeat(4100),'{'.repeat(3300)+'a,b'+'}'.repeat(3300)])assert.ok(Array.isArray(brace.expand(input,{max:4})));
  });
  test(`GHSA-q2hr-2g5m-vwhr ${format}: rewrite parsing has a finite pass cap`,{timeout:10000},()=>{
    assert.ok(Number.isSafeInteger(brace.EXPANSION_MAX_REWRITES));
    const result=brace.expand('{a}'+'}'.repeat(16000)+',z}');assert.ok(Array.isArray(result));assert.ok(result.length<=2);
  });
}

const undiciRoot=path.join(npm,'node_modules/undici'),{Client,WebSocket}=require(undiciRoot),retry=require(path.join(undiciRoot,'lib/interceptor/retry.js'));
async function serverFixture(t,listener) {
  const server=createServer({joinDuplicateHeaders:true},listener),sockets=new Set();
  server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});
  server.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(()=>{for(const socket of sockets)socket.destroy();server.close();});
  return {server,url:`http://127.0.0.1:${server.address().port}`};
}
test('GHSA-r53p-7pc4-xj5r: a resumed error response cannot append bytes outside its original framing',{timeout:10000},async t=>{
  let requests=0,retries=0;const injected='HTTP/1.1 302 Found\r\nContent-Length: 0\r\n\r\n';
  const {url}=await serverFixture(t,(req,res)=>{
    if(requests++===0){res.statusCode=404;res.setHeader('content-length','2');res.end('1',()=>res.destroy());}
    else {assert.equal(req.headers.range,'bytes=1-1');res.statusCode=206;res.setHeader('connection','close');res.setHeader('content-range',`bytes 1-${injected.length+1}/${injected.length+2}`);res.end('2'+injected);}
  });
  const client=new Client(url).compose(retry());t.after(()=>client.destroy());
  const response=await client.request({method:'GET',path:'/',retryOptions:{retry(error,_context,done){done(error.message.includes('other side closed')&&retries++===0?null:error);}}});
  assert.equal(response.statusCode,404);await assert.rejects(response.body.text(),error=>error.code==='UND_ERR_REQ_RETRY'&&error.message==='Content-Range mismatch');assert.equal(requests,2);
});
test('retry legitimate HEAD preserves content-length without inventing a response body',{timeout:10000},async t=>{
  const {url}=await serverFixture(t,(_req,res)=>{res.setHeader('content-length','1234');res.end();});
  const client=new Client(url).compose(retry());t.after(()=>client.destroy());const response=await client.request({method:'HEAD',path:'/'});
  assert.equal(response.statusCode,200);assert.equal(response.headers['content-length'],'1234');assert.equal(await response.body.text(),'');
});
for(const requested of [false,true])test(requested?'WebSocket legitimate requested subprotocol still connects':'GHSA-rfgv-xxqx-mfg5: unrequested subprotocol closes instead of uncaught exception',{timeout:10000},async t=>{
  const {server,url}=await serverFixture(t,(_req,res)=>res.end());server.on('upgrade',(req,socket)=>{
    assert.equal(req.headers['sec-websocket-protocol'],requested?'chat':undefined);
    const accept=createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\nSec-WebSocket-Protocol: chat\r\n\r\n');
    socket.on('data',()=>socket.end(Buffer.from([0x88,0x00])));
  });
  const ws=new WebSocket(url.replace('http:','ws:'),requested?['chat']:[]);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',()=>{if(!requested)return reject(Error('Unrequested protocol was accepted'));assert.equal(ws.protocol,'chat');ws.close();resolve();});ws.addEventListener('error',()=>requested?reject(Error('Legitimate handshake rejected')):resolve());});
});
async function compressed(input) {
  const def=createDeflateRaw(),parts=[];def.on('data',part=>parts.push(part));def.write(input);
  await new Promise(resolve=>def.flush(constants.Z_SYNC_FLUSH,resolve));def.destroy();return Buffer.concat(parts);
}
test('GHSA-3wwx-pv8p-q78v: direct inflater rejects over-limit malformed DEFLATE without an unhandled late error',{timeout:10000},async()=>{
  const {PerMessageDeflate}=require(path.join(undiciRoot,'lib/web/websocket/permessage-deflate.js')),limit=1024*1024;
  const payload=Buffer.concat([await compressed(Buffer.alloc(limit+64*1024)),Buffer.from([0,0,0,0,0,255,255])]);
  let calls=0;const decoder=new PerMessageDeflate(new Map(),{maxPayloadSize:limit});
  await new Promise((resolve,reject)=>decoder.decompress(payload,true,error=>{calls++;if(!error||error.code!=='UND_ERR_WS_MESSAGE_SIZE_EXCEEDED')reject(error??Error('Oversize accepted'));else resolve();}));
  await sleep(50);assert.equal(calls,1);
  const legitimate=await compressed(Buffer.from('valid text')),control=new PerMessageDeflate(new Map(),{maxPayloadSize:limit});
  const text=await new Promise((resolve,reject)=>control.decompress(legitimate.subarray(0,-4),true,(error,value)=>error?reject(error):resolve(value.toString())));assert.equal(text,'valid text');
});
