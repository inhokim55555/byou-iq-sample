import test from 'node:test';
import assert from 'node:assert/strict';
import {createSampleServer} from '../server.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import {readShipmentWorkbook} from '../prototype/shipment-xlsx-import.mjs';
test('untrusted spreadsheets are rejected before any file bytes are read',async()=>{
 let read=false;
 await assert.rejects(readShipmentWorkbook({arrayBuffer(){read=true;throw Error('must not read');}}),/File imports are disabled/);
 assert.equal(read,false);
});
test('sample server isolates files, network and write routes',async()=>{
 const s=createSampleServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const port=s.address().port;
 const request=(url,method='GET',host=`127.0.0.1:${port}`)=>new Promise((resolve,reject)=>{const q=http.request({hostname:'127.0.0.1',port,path:url,method,headers:{Host:host}},r=>{let body='';r.on('data',c=>body+=c);r.on('end',()=>resolve({status:r.statusCode,headers:r.headers,body}));});q.on('error',reject);q.end();});
 try{
  const page=await request('/');assert.equal(page.status,200);assert.match(page.headers['content-security-policy'],/connect-src 'none'/);
  assert.match(page.body,/sample-guard.js/);
  for(const route of ['/api/workspace','/api/auth/session','/../package.json','/%2e%2e/package.json','/%2e%2e%5cpackage.json','/.env','/server.mjs'])assert.equal((await request(route)).status,404,route);
  assert.equal((await request('/api/send','POST')).status,405);
  assert.equal((await request('/','GET','attacker.example')).status,403);
 }finally{await new Promise(r=>s.close(r));}
});
test('sample source cannot enable live mode or silently fall through to a backend',async()=>{
 assert.match(await fs.readFile('prototype/app.mjs','utf8'),/const isLiveMode = \(\) => false/);
 assert.match(await fs.readFile('prototype/portfolio-sample.mjs','utf8'),/throw new Error\('This connected workflow is unavailable/);
 assert.equal(JSON.parse(await fs.readFile('package.json','utf8')).dependencies,undefined);
});
