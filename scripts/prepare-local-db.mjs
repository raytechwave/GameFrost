/** Prepare local development D1 only. Never applies migrations to a remote database. */
import {mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
await mkdir(join(root,'.wrangler'),{recursive:true});
const config=join(root,'.wrangler/local-db-config.json');
await writeFile(config,JSON.stringify({name:'site-creator-d1-local-setup',compatibility_date:'2026-05-15',d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:join(root,'drizzle')}]},null,2));
const result=spawnSync(process.execPath,[join(root,'node_modules/wrangler/bin/wrangler.js'),'d1','migrations','apply','DB','--local','--config',config,'--persist-to',join(root,'.wrangler/state')],{cwd:root,input:'y\n',stdio:['pipe','inherit','inherit'],env:{...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:join(root,'.wrangler/logs'),WRANGLER_REGISTRY_PATH:join(root,'.wrangler/dev-registry'),CLOUDFLARE_CF_FETCH_ENABLED:'false'}});
if(result.error)throw result.error;process.exit(result.status??1);
