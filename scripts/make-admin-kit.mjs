import {readdirSync,readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),source=join(root,'netlify-dist'),dest=join(root,'dist/client/admin-kit');
const all=readdirSync(source,{recursive:true,withFileTypes:true}).filter(f=>f.isFile()).map(f=>join(f.parentPath,f.name).slice(source.length+1).replaceAll('\\','/'));
const files=all.filter(f=>f!=='export-manifest.json'&&(!f.endsWith('.html')||f==='index.html'));
writeFileSync(join(source,'export-manifest.json'),JSON.stringify({files:[...files,'export-manifest.json']}));
rmSync(dest,{recursive:true,force:true});mkdirSync(dest,{recursive:true});for(const name of[...files,'export-manifest.json']){const path=join(dest,name);mkdirSync(dirname(path),{recursive:true});cpSync(join(source,name),path)}
console.log(JSON.stringify({netlifyExportKitFiles:files.length+1}));
