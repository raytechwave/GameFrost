import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const args of [['tools/export-vector-posters.mjs'],['scripts/run-framework.mjs','build'],['scripts/content-snapshot.mjs'],['node_modules/vite/bin/vite.js','build','--config','netlify/vite.config.mjs'],['scripts/export-netlify.mjs'],['scripts/make-admin-kit.mjs'],['scripts/measure-final-performance.mjs']]){
 const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);
}
