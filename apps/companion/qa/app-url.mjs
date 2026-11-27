import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {APP_URL,isAppDocument} from '../desktop/app-url.mjs';
test('only the exact application document, with an optional fragment, can send IPC or run the close hook',async()=>{
  for(const url of [APP_URL,`${APP_URL}#`,`${APP_URL}#/start`,`${APP_URL}#/project/opaque/search`])assert.equal(isAppDocument(url),true,url);
  for(const url of [null,undefined,{},'peos://app/',`${APP_URL}?query=1`,`${APP_URL}/extra#route`,'peos://app/index.html.evil','peos://app/other.html#route','peos://user@app/index.html','peos://app:123/index.html','peos://app.evil/index.html','https://app/index.html','peos://app/%69ndex.html'])assert.equal(isAppDocument(url),false,String(url));
  const main=await readFile(new URL('../desktop/main.mjs',import.meta.url),'utf8');
  assert.ok(main.includes('event.sender!==window.webContents||event.senderFrame!==window.webContents.mainFrame||!isAppDocument(event.senderFrame.url)'));
  assert.ok(main.includes('isAppDocument(window.webContents.getURL())'));
});
