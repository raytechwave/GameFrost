/** Test-only loopback harness. Never use as a public server or deploy adapter. */
import {createServer} from 'node:http';
import {readFileSync,readdirSync,realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(realpathSync(join(root,'node_modules/wrangler/package.json'))),{Miniflare}=require('miniflare');
const mf=new Miniflare({modulesRoot:join(root,'dist/server'),modules:[{type:'ESModule',path:join(root,'dist/server/index.js')},...readdirSync(join(root,'dist/server'),{recursive:true}).filter(p=>/\.m?js$/.test(p)&&p!=='index.js').map(p=>({type:'ESModule',path:join(root,'dist/server',p)}))],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'browser-qa'},r2Buckets:['BUCKET'],assets:{directory:join(root,'dist/client'),routerConfig:{has_user_worker:true}}});
const db=await mf.getD1Database('DB');for(const name of readdirSync(join(root,'drizzle')).filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync(join(root,'drizzle',name),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.exec(sql.replace(/\n/g,' '));
const server=createServer(async(req,res)=>{try{
 const headers=new Headers();for(const[k,v]of Object.entries(req.headers))if(v&&!k.startsWith('oai-authenticated-user-'))headers.set(k,String(v));
 // This cookie exists only in the test harness and never reaches production auth.
 if(/(?:^|;\s*)gf_qa_owner=yes(?:;|$)/.test(headers.get('cookie')||'')){headers.set('oai-authenticated-user-id','qa-owner');headers.set('oai-authenticated-user-email','kingasadkhan1556@gmail.com')}
 headers.delete('host');headers.delete('content-length');const chunks=[];for await(const chunk of req)chunks.push(chunk);
 const response=await mf.dispatchFetch('http://127.0.0.1:4176'+req.url,{method:req.method,headers,body:chunks.length?Buffer.concat(chunks):undefined});
 const outgoing={};response.headers.forEach((v,k)=>outgoing[k]=v);res.writeHead(response.status,outgoing);res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){res.writeHead(500).end(String(e))}});
server.listen(4176,'127.0.0.1',()=>console.log('Loopback-only mock-identity QA harness ready; not a live site.'));
async function shutdown(){server.close();await mf.dispose();process.exit(0)}process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
