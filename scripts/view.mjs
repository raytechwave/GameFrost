import {createServer} from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await realpath(process.argv[2]||fileURLToPath(new URL('../netlify-dist',import.meta.url)));
const port=Number(process.env.GF_PREVIEW_PORT||4175);
const types={'.mp4':'video/mp4','.jpg':'image/jpeg','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.glb':'model/gltf-binary','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
const server=createServer(async(request,response)=>{
 if(!['GET','HEAD'].includes(request.method)){response.writeHead(405).end();return}
 try{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(pathname.includes('\0')||pathname.includes('\\')){response.writeHead(400).end();return}
  let file=resolve(root,'.'+pathname),status=200;
  if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403).end();return}
  try{const info=await stat(file);if(info.isDirectory())file=join(file,'index.html');await stat(file)}catch{file=join(root,'404.html');status=404}
  file=await realpath(file);if(!file.startsWith(root+sep)){response.writeHead(403).end();return}
  const body=await readFile(file);
  response.writeHead(status,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  response.end(request.method==='HEAD'?undefined:body);
 }catch{response.writeHead(500,{'Content-Type':'text/plain'}).end('Preview unavailable. Build the Netlify edition first.')}
});
server.on('error',error=>{console.error(error.message+' Set GF_PREVIEW_PORT to a free port.');process.exit(1)});
server.listen(port,'127.0.0.1',()=>console.log('GAME FROST review preview: http://127.0.0.1:'+port+'\nStatic edition: browser-local editing and drafts. No live publication.'));
