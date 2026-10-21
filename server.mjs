import http from 'node:http';
import {readFile, realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(fileURLToPath(new URL('./prototype',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.png':'image/png','.json':'application/json','.txt':'text/plain','.LICENSE':'text/plain'};
export const policy="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
export function createSampleServer(){return http.createServer(async(req,res)=>{
 res.setHeader('Content-Security-Policy',policy);
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('Cache-Control','no-store');
 const local=req.socket.localPort;
 if(![`127.0.0.1:${local}`,`localhost:${local}`].includes(req.headers.host)){res.writeHead(403);return res.end('Local host required');}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Read-only sample server');}
 try{
  let pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  if(pathname==='/')pathname='/index.html';
  if(pathname.includes('\\')||pathname.split('/').some(p=>p.startsWith('.'))){res.writeHead(404);return res.end();}
  const candidate=path.resolve(root,'.'+pathname);
  if(!candidate.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
  const resolved=await realpath(candidate);
  if(!resolved.startsWith(root+path.sep)||!(await stat(resolved)).isFile()){res.writeHead(404);return res.end();}
  const type=mime[path.extname(resolved)];if(!type){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',type);res.end(req.method==='HEAD'?undefined:await readFile(resolved));
 }catch{res.writeHead(404);res.end('Not found');}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4281);
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local port');
 createSampleServer().listen(port,'127.0.0.1',()=>console.log(`BYOU IQ Sample: http://127.0.0.1:${port}`));
}
