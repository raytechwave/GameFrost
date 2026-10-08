import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type {CharacterScene} from '@/lib/scenes';

export type SceneController = {seek:(progress:number)=>void; dispose:()=>void};
/** A baked clip owns every joint. No image limbs, guessed sockets, or root reset. */
export async function mountCharacter(host:HTMLElement,record:CharacterScene):Promise<SceneController> {
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,host.clientWidth<600?1.25:1.5));
 renderer.setClearColor(0x000000,0); renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.1; renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFShadowMap;
 const scene=new T.Scene(), camera=new T.PerspectiveCamera(32,1,.05,80);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();
 const environment=pmrem.fromScene(room,.04); scene.environment=environment.texture;
 scene.environmentIntensity=.55;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xcde1ff,0x232431,.75));
 const key=new T.DirectionalLight(0xffe9c8,3);key.position.set(-3,5,4);key.castShadow=true;
 key.shadow.mapSize.set(host.clientWidth<600?512:1024,host.clientWidth<600?512:1024);
 key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=4;key.shadow.camera.bottom=-2;key.shadow.bias=-.0004;scene.add(key);
 const rim=new T.DirectionalLight(0x82b9ff,3);rim.position.set(3,3,-2);scene.add(rim);
 const fill=new T.DirectionalLight(0xffffff,.7);fill.position.set(0,1,4);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.38}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
 let gltf;
 try{gltf=await new GLTFLoader().loadAsync(record.asset)}catch(error){floor.geometry.dispose();floor.material.dispose();environment.dispose();renderer.dispose();throw error}
 const model=gltf.scene;scene.add(model);
 model.traverse(n=>{if((n as T.Mesh).isMesh){n.castShadow=true;n.frustumCulled=false}});
 const clip=gltf.animations.find(a=>a.name===record.clip)??(!record.clip?gltf.animations[0]:undefined);
 if(!clip){dispose();throw new Error('The selected animation clip is missing.')}
 const mixer=new T.AnimationMixer(model),action=mixer.clipAction(clip);
 action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();
 // The camera fits the complete movement envelope, including the airborne head.
 const envelope=new T.Box3();
 const cached=gltf.asset.extras?.gameFrostMotion;
 const finiteBounds=(v:unknown):v is number[]=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
 if(cached?.clip===clip.name&&finiteBounds(cached.min)&&finiteBounds(cached.max)&&cached.min.every((v:number,i:number)=>v<cached.max[i])){
  envelope.set(new T.Vector3().fromArray(cached.min),new T.Vector3().fromArray(cached.max));
 }else{
  for(let i=0;i<=32;i++){mixer.setTime(clip.duration*i/32);model.updateMatrixWorld(true);envelope.union(new T.Box3().setFromObject(model,true))}
 }
 mixer.setTime(0);
 const center=envelope.getCenter(new T.Vector3()),size=envelope.getSize(new T.Vector3());
 let disposed=false,p=0;
 const draw=()=>{if(disposed)return;action.enabled=true;action.paused=false;mixer.setTime(p*clip.duration);model.updateMatrixWorld(true);renderer.render(scene,camera)};
 const resize=()=>{if(disposed)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h);camera.aspect=w/h;
  const half=Math.max(size.y/2,size.x/(2*camera.aspect));
  const distance=half/Math.tan(T.MathUtils.degToRad(camera.fov/2))*1.16+size.z*.45;
  camera.position.copy(center).add(new T.Vector3(.21,.10,1).normalize().multiplyScalar(distance));camera.lookAt(center);camera.updateProjectionMatrix();draw()};
 function dispose(){model?.traverse(n=>{const m=n as T.Mesh;if(!m.isMesh)return;m.geometry.dispose();for(const material of(Array.isArray(m.material)?m.material:[m.material])){for(const v of Object.values(material))if(v instanceof T.Texture)v.dispose();material.dispose()}});floor.geometry.dispose();floor.material.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove()}
 host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label',record.name+' animated character');
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.dispatchEvent(new CustomEvent('gf-context-lost'))});
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 return{seek(value){p=T.MathUtils.clamp(value,0,1);draw()},dispose(){disposed=true;ro.disconnect();mixer.stopAllAction();mixer.uncacheRoot(model);dispose()}};
}
