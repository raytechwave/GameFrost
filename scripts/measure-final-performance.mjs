import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),dir=join(root,'netlify-dist');
const manifest=JSON.parse(readFileSync(join(dir,'.vite/manifest.json')));
function graph(key,seen=new Set()){if(seen.has(key))return seen;seen.add(key);for(const dependency of manifest[key]?.imports??[])graph(dependency,seen);return seen}
const main=Object.keys(manifest).find(key=>manifest[key].isEntry),home=Object.keys(manifest).find(key=>key.endsWith('/home.tsx'));
const localStore=Object.keys(manifest).find(key=>key.endsWith('local-store.ts'));
const automatic=[...new Set([...graph(main),...graph(home),...graph(localStore)])].map(key=>manifest[key].file).filter(file=>file.endsWith('.js'));
const total=[...new Set(Object.values(manifest).map(row=>row.file))].filter(file=>file.endsWith('.js'));
const size=file=>({file,raw:readFileSync(join(dir,file)).length,gzip:gzipSync(readFileSync(join(dir,file))).length});
const initial=automatic.map(size),all=total.map(size);
const result={date:new Date().toISOString(),initialJavaScriptGzipBytes:initial.reduce((n,row)=>n+row.gzip,0),allJavaScriptGzipBytes:all.reduce((n,row)=>n+row.gzip,0),initial,all,character:JSON.parse(readFileSync(join(root,'docs/wolverine-optimization.json'))),limits:'Build compression sizes, not load-time or physical-phone FPS evidence. Total optional-feature JavaScript exceeds the original 250 KB total budget; the initial non-3D shell is measured separately. GLB gzip delivery depends on hosting compression.'};
writeFileSync(join(root,'docs/final-performance.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({initialGzip:result.initialJavaScriptGzipBytes,totalGzip:result.allJavaScriptGzipBytes}));
