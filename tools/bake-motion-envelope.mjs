/** Cache framing from the actual skinned performance without changing its rig. */
import {readFile,writeFile,rename} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {Box3,Vector3,AnimationMixer,LoopOnce} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
globalThis.ProgressEvent??=class extends Event{constructor(type,properties){super(type);Object.assign(this,properties)}};
const path=process.argv[2]??'public/characters/wolverine-attack.glb';
const input=await readFile(path),jsonLength=input.readUInt32LE(12);
const original=JSON.parse(input.subarray(20,20+jsonLength).toString());
const binary=input.subarray(28+jsonLength);
const geometry=structuredClone(original);
geometry.buffers[0].uri='data:application/octet-stream;base64,'+binary.toString('base64');
// The offline framing pass never needs images, materials or a WebGL context.
delete geometry.images;delete geometry.textures;delete geometry.materials;
delete geometry.extensionsUsed;delete geometry.extensionsRequired;
for(const mesh of geometry.meshes)for(const primitive of mesh.primitives)delete primitive.material;
const gltf=await new GLTFLoader().parseAsync(JSON.stringify(geometry),'');
const clip=gltf.animations[0],mixer=new AnimationMixer(gltf.scene);
const action=mixer.clipAction(clip);action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
const box=new Box3(),samples=Math.ceil(clip.duration*60)+1,start=performance.now();
for(let i=0;i<samples;i++){
 action.enabled=true;action.paused=false;mixer.setTime(clip.duration*i/(samples-1));
 gltf.scene.updateMatrixWorld(true);box.union(new Box3().setFromObject(gltf.scene,true));
}
// Conservative padding also covers motion between the sampled frames.
box.expandByVector(box.getSize(new Vector3()).multiplyScalar(.015));
original.asset.extras={...original.asset.extras,gameFrostMotion:{clip:clip.name,samples,min:box.min.toArray(),max:box.max.toArray()}};
let json=Buffer.from(JSON.stringify(original));
json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);
const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(binary.length,0);binHeader.writeUInt32LE(0x004e4942,4);
const output=Buffer.concat([header,json,binHeader,binary]);
await writeFile(path+'.tmp',output);await rename(path+'.tmp',path);
console.log(JSON.stringify({path,bytes:output.length,offlineSeconds:(performance.now()-start)/1000,...original.asset.extras.gameFrostMotion}));
