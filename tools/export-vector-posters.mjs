import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url),ts=require('typescript'),cache=new Map();
function load(file){
  file=path.resolve(file);
  if(cache.has(file))return cache.get(file);
  const module={exports:{}};cache.set(file,module.exports);
  const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const local=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name+(path.extname(name)?'':'.ts'))):require(name);
  new Function('require','module','exports',source)(local,module,module.exports);
  cache.set(file,module.exports);
  return module.exports;
}

const {vectorSVG}=load(path.join(root,'components/game-frost/vector-scenes.ts'));
for(const id of ['goku','spider-man','harry-potter','ronaldo']){
  const file=path.join(root,'public/characters',`${id}-2d.svg`);
  fs.writeFileSync(file,vectorSVG(id,0,`poster-${id}`));
  console.log(`${path.relative(root,file)} ${fs.statSync(file).size} bytes`);
}
