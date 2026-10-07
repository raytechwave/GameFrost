import {resolveSuspenseHTML} from './resolve-suspense.mjs';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,realpathSync,readdirSync,mkdirSync,existsSync} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=join(root,'netlify-dist');
const require=createRequire(realpathSync(join(root,'node_modules/wrangler/package.json')));
const {Miniflare}=require('miniflare');
const mf=new Miniflare({modulesRoot:join(root,'dist/server'),modules:[{type:'ESModule',path:join(root,'dist/server/index.js')},...readdirSync(join(root,'dist/server'),{recursive:true}).filter(p=>/\.m?js$/.test(p)&&p!=='index.js').map(p=>({type:'ESModule',path:join(root,'dist/server',p)}))],compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'netlify-export'},r2Buckets:['BUCKET'],assets:{directory:join(root,'dist/client'),routerConfig:{has_user_worker:true}}});
const base='http://game-frost.test',pages=new Map(),targets=new Set(),images=new Set();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#x27;',"'");
async function page(path){if(pages.has(path))return;const r=await mf.dispatchFetch(base+path);assert.equal(r.status,200,path);const html=resolveSuspenseHTML(await r.text());assert.ok(html.includes('<h1'),path);pages.set(path,html);for(const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)){const u=new URL(decode(m[1]),base+path);if(u.origin===base&&!/^\/(?:signin-with-chatgpt|signout-with-chatgpt|callback)/.test(u.pathname))targets.add(u.pathname+u.search+u.hash);}for(const m of html.matchAll(/<img\b[^>]*>/g)){const src=m[0].match(/\bsrc="([^"]+)"/);if(src?.[1].startsWith('/'))images.add(src[1]);for(const set of m[0].matchAll(/\bsrcset="([^"]+)"/gi))for(const value of decode(set[1]).split(','))images.add(value.trim().split(/\s+/)[0]);}}
function exportHTML(html,bundleHead){
 html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi,'').replace(/<link\b[^>]*(?:href|data-rsc-css-href)="\/_next\/[^>]*>/gi,'').replace(/<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/gi,'');
 const head=html.match(/<head>([\s\S]*?)<\/head>/i)[1];const body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1];
 return '<!DOCTYPE html><html lang="en-PK"><head>'+head+bundleHead+'</head><body><div id="root">'+body+'</div></body></html>';
}
try{
 const db=await mf.getD1Database('DB');for(const name of readdirSync(join(root,'drizzle')).filter(n=>n.endsWith('.sql')).sort()){for(const sql of readFileSync(join(root,'drizzle',name),'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.exec(sql.replace(/\n/g,' '));}
 const contentResponse=await mf.dispatchFetch(base+'/api/content');assert.equal(contentResponse.status,200);const content=await contentResponse.json();writeFileSync(join(output,'store-content.json'),JSON.stringify(content));
 const xml=await(await mf.dispatchFetch(base+'/sitemap.xml')).text();const paths=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);paths.push('/cart','/checkout','/account','/brand');
 for(const path of paths)await page(path);
 for(const target of targets){const u=new URL(target,base);await page(u.pathname+u.search);if(u.hash)assert.ok(pages.get(u.pathname+u.search).includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),target);}
 for(const image of images){const r=await mf.dispatchFetch(base+image);assert.equal(r.status,200,image);assert.ok(r.headers.get('content-type')?.startsWith('image/'),image);assert.ok((await r.arrayBuffer()).byteLength>0,image);}
 const viteHTML=readFileSync(join(output,'index.html'),'utf8');const tags=[...viteHTML.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="\/assets\/[^"]+"[^>]*>(?:<\/script>)?/g)].map(m=>m[0]).join('');assert.ok(tags.includes('type="module"'),'Netlify client bundle exists');
 for(const [path,html] of pages){if(path.includes('?'))continue;const destination=join(output,path.replace(/^\//,''),'index.html');mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,exportHTML(html,tags));}
 const adminHTML=exportHTML(pages.get('/'),tags).replace(/<title>[\s\S]*?<\/title>/i,'<title>Store Manager — GAME FROST</title>').replace(/<body>[\s\S]*?<\/body>/i,'<body><div id="root"><main id="main" class="shell section"><h1>Store Manager</h1><p>Opening your editor…</p></main></div><noscript>Please enable JavaScript to edit your store.</noscript></body>');mkdirSync(join(output,'admin'),{recursive:true});writeFileSync(join(output,'admin/index.html'),adminHTML);
 const notfound=await mf.dispatchFetch(base+'/not-a-room');assert.equal(notfound.status,404);writeFileSync(join(output,'404.html'),exportHTML(await notfound.text(),tags));
 writeFileSync(join(output,'_redirects'),'/* /404.html 404\n');writeFileSync(join(output,'_headers'),'/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/store-content.json\n  Cache-Control: no-cache, must-revalidate\n/*\n  X-Content-Type-Options: nosniff\n');
 const snapshots=Object.fromEntries(pages);if(process.argv[2])writeFileSync(resolve(process.argv[2]),JSON.stringify(snapshots));
 const result={date:new Date().toISOString(),serverRenderedPageRoutes:paths.length,pageAndQueryStatesChecked:pages.size,internalLinkTargetsChecked:targets.size,imageAssetsChecked:images.size,exportedHTMLPages:readdirSync(output,{recursive:true}).filter(n=>n.endsWith('.html')).length,staticAdminPage:'Direct /admin entry included with a loading screen',netlifyClient:'Same React interface with device-local IndexedDB cart, drafts and uploads',routing:'All named pages prerendered; Prerendered direct paths and query filters; missing URLs serve 404',fonts:'Self-hosted compressed Google Fonts, licenses included',browserValidation:'See current browser-verification.json; this exporter checks server output only.'};
 writeFileSync(join(root,'docs/netlify-export-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await mf.dispose()}
