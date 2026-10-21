import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const files=await fs.readdir('prototype',{recursive:true});
for(const f of ['server.mjs',...files.filter(f=>/\.(mjs|js)$/.test(f)).map(f=>'prototype/'+f)]){
 const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
 if(r.status!==0)throw Error(f+'\n'+r.stderr);
}
console.log('JavaScript syntax checks passed.');
