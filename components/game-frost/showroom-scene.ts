import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {rooms as defaultRooms,displays as defaultDisplays,walkPosition,type RoomId} from './showroom-data';

export type ShowroomController={go:(id:RoomId)=>void;setRoam:(active:boolean)=>void;move:(forward:number,side:number)=>void;setMotion:(active:boolean)=>void;dispose:()=>void};
type Options={name:string;rooms:typeof defaultRooms;products:import('@/lib/catalog').Product[];quality:'economy'|'balanced'|'high';editorial:Record<'lounge'|'retro'|'services',string>;onReady:()=>void;onPick:(id:string)=>void;onHover:(name:string)=>void;onPosition:(x:number,z:number)=>void;onError:()=>void;motion:boolean};

export function mountShowroom(host:HTMLElement,options:Options):ShowroomController{
 const rooms=options.rooms;const displays=options.products.map((product,i)=>({...defaultDisplays[i],product}));
 const coarse=matchMedia('(pointer: coarse)').matches;const quality=coarse&&options.quality==='balanced'?'economy':options.quality;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#080d17');scene.fog=new THREE.FogExp2('#080d17',.026);
 const camera=new THREE.PerspectiveCamera(coarse?66:61,1,.1,80);camera.position.set(0,2.65,14);
 const renderer=new THREE.WebGLRenderer({antialias:!coarse&&quality==='high',powerPreference:quality==='economy'?'low-power':'default'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='economy'?1:quality==='high'?(coarse?1.3:1.65):1.25));renderer.setClearColor('#080d17');
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.tabIndex=-1;host.appendChild(renderer.domElement);
 const resources=new Set<{dispose:()=>void}>();const animated:{mesh:THREE.Mesh;base:number;index:number}[]=[];const hitTargets:THREE.Object3D[]=[];let disposed=false;
 const track=<T extends {dispose:()=>void}>(resource:T):T=>{resources.add(resource);return resource};
 const material=(color:string,metalness=.4,roughness=.4)=>track(new THREE.MeshStandardMaterial({color,metalness,roughness}));
 const dark=material('#101927',.7,.25),wall=material('#101622',.25,.65),edge=material('#27354a',.6,.3);
 function box(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material=dark){const mesh=new THREE.Mesh(track(new THREE.BoxGeometry(w,h,d)),mat);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
 function lightBar(w:number,h:number,d:number,x:number,y:number,z:number,color:string){return box(w,h,d,x,y,z,track(new THREE.MeshBasicMaterial({color,toneMapped:false})));}
 const floorGeo=track(new THREE.PlaneGeometry(22,27));
 let mirror:Reflector|null=null;
 if(!coarse&&quality==='high'){mirror=new Reflector(floorGeo,{textureWidth:512,textureHeight:512,color:0x233344,clipBias:.003});mirror.rotation.x=-Math.PI/2;mirror.position.set(0,-.02,-1);scene.add(mirror);track(mirror.getRenderTarget());for(const mat of Array.isArray(mirror.material)?mirror.material:[mirror.material])track(mat);}
 else{const floor=new THREE.Mesh(floorGeo,material('#162030',.8,.28));floor.rotation.x=-Math.PI/2;floor.position.z=-1;scene.add(floor);}
 box(.3,6.5,27,-11,3.2,-1,wall);box(.3,6.5,27,11,3.2,-1,wall);box(22,6.5,.3,0,3.2,-14.5,wall);
 scene.add(new THREE.HemisphereLight('#b8dafa','#101020',2.8));const overhead=new THREE.DirectionalLight('#d7e8ff',2.6);overhead.position.set(0,7,6);scene.add(overhead);
 // Structural ceiling ribs and inset light strips give the camera a sense of scale.
 for(let z=8;z>=-13;z-=4){box(22,.18,.3,0,6,z,edge);lightBar(13,.045,.08,0,5.88,z,'#badbfa');box(.24,6.4,.24,-10.4,3.15,z,edge);box(.24,6.4,.24,10.4,3.15,z,edge);}
 for(const x of [-2.7,2.7])lightBar(.035,.02,23,x,.013,-1,'#397685');
 for(let z=8;z>=-13;z-=2){lightBar(.6,.02,.035,0,.012,z,'#427488');}
 for(const x of [-10.8,10.8])lightBar(.03,.14,25,x,.18,-1,'#8beaff');
 // The entry frame closes behind the camera as the store comes into view.
 for(const x of [-7.5,7.5]){box(.22,5.5,.3,x,2.75,10,edge);lightBar(.035,5.2,.04,x,2.75,10.18,'#8beaff');}
 box(15.2,.22,.3,0,5.4,10,edge);lightBar(14.5,.035,.04,0,5.33,10.18,'#8beaff');
 const loader=new THREE.TextureLoader();let texturesPending=0;
 function texture(url:string,done:(texture:THREE.Texture)=>void){texturesPending++;loader.load(url,t=>{if(disposed){t.dispose();return;}track(t);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);done(t);texturesPending--;if(!texturesPending)options.onReady();},undefined,()=>{if(disposed)return;texturesPending--;if(!texturesPending)options.onReady();});}
 function poster(url:string,w:number,h:number,x:number,y:number,z:number,rotation=0){const mesh=new THREE.Mesh(track(new THREE.PlaneGeometry(w,h)),track(new THREE.MeshBasicMaterial({color:'#111b2a',side:THREE.DoubleSide})));mesh.position.set(x,y,z);mesh.rotation.y=rotation;scene.add(mesh);texture(url,t=>{const m=mesh.material;m.map=t;m.color.set('#ffffff');m.needsUpdate=true;});return mesh;}
 poster(options.editorial.lounge||`/images/editorial/lounge-${coarse?768:1536}.webp`,10,6,0,3,-14.25);
 poster(options.editorial.retro||`/images/editorial/retro-${coarse?768:1536}.webp`,7.2,4.8,-10.77,2.7,-9,Math.PI/2);
 poster(options.editorial.services||`/images/editorial/services-${coarse?768:1536}.webp`,6.8,4.5,7.25,2.7,-14.25);
 function label(text:string,sub:string,x:number,y:number,z:number,color:string,w=3.4){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d')!;
  ctx.textAlign='center';ctx.fillStyle=color;ctx.font='600 58px Arial';ctx.fillText(text,512,102);ctx.fillStyle='#99aec8';ctx.font='25px Arial';ctx.fillText(sub,512,157);
  const t=track(new THREE.CanvasTexture(canvas));t.colorSpace=THREE.SRGBColorSpace;
  const plane=new THREE.Mesh(track(new THREE.PlaneGeometry(w,w/4)),track(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false})));plane.position.set(x,y,z);scene.add(plane);return plane;
 }
 label(options.name,'KARACHI / YOUR NEXT WORLD',0,5.1,-12.5,'#eaf6ff',9.5);
 label(rooms[1].label.toUpperCase(),'01 / PLAYSTATION + XBOX',-5.2,4.3,-4.8,'#8beaff',5);
 label(rooms[2].label.toUpperCase(),'02 / PLAY ANYWHERE',5.2,4.3,-4.8,'#ffa58c',5);
 label(rooms[3].label.toUpperCase(),'03 / VR + SIMULATION',5.2,4.3,-11,'#baadff',5);
 label(rooms[4].label.toUpperCase(),'04 / PRESS START AGAIN',-5.8,4.3,-11,'#ffd58b',5);
 for(const [index,display] of displays.entries()){
  const [x,y,z]=display.position;
  const plinth=new THREE.Mesh(track(new THREE.CylinderGeometry(1.25,1.4,.75,quality==='high'?48:24)),dark);plinth.position.set(x,.39,z);scene.add(plinth);
  const base=new THREE.Mesh(track(new THREE.CylinderGeometry(1.42,1.42,.055,quality==='high'?48:24)),track(new THREE.MeshBasicMaterial({color:display.color,toneMapped:false})));base.position.set(x,.06,z);scene.add(base);
  const ring=new THREE.Mesh(track(new THREE.TorusGeometry(1.29,.013,8,64)),track(new THREE.MeshBasicMaterial({color:display.color,toneMapped:false})));ring.rotation.x=Math.PI/2;ring.position.set(x,.78,z);scene.add(ring);
  const lamp=new THREE.PointLight(display.color,7,4,2);lamp.position.set(x,1,z);if(quality!=='economy')scene.add(lamp);
  const photo=new THREE.Mesh(track(new THREE.PlaneGeometry(2.8,2.4)),track(new THREE.MeshBasicMaterial({transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false})));
  photo.position.set(x,y+.48,z);photo.userData.productId=display.product.id;photo.userData.name=display.product.name;scene.add(photo);hitTargets.push(photo);animated.push({mesh:photo,base:y+.48,index});
  texture(display.product.image!,t=>{photo.material.map=t;photo.material.opacity=1;photo.material.needsUpdate=true;const image=t.image as {width:number;height:number};const aspect=image.width/image.height;photo.geometry.dispose();photo.geometry=track(new THREE.PlaneGeometry(aspect>=1?2.9:2.35*aspect,aspect>=1?2.9/aspect:2.35));});
  label(display.product.platform,display.product.name,x,.97,z+1.1,display.color,2.8);
 }
 // A sparse cloud of frost particles adds depth without hiding the products.
 const coords=new Float32Array((coarse?50:100)*3);for(let i=0;i<coords.length;i+=3){coords[i]=(Math.random()-.5)*20;coords[i+1]=Math.random()*5+.3;coords[i+2]=Math.random()*25-14;}
 const dust=new THREE.Points(track(new THREE.BufferGeometry()),track(new THREE.PointsMaterial({color:'#b8eaff',size:.015,transparent:true,opacity:.4,depthWrite:false})));dust.geometry.setAttribute('position',new THREE.BufferAttribute(coords,3));scene.add(dust);
 const target=new THREE.Vector3(...rooms[0].position),look=new THREE.Vector3(...rooms[0].look),currentLook=look.clone();let roam=false,motion=options.motion,visible=true,yaw=0,pitch=0,drag=false,dragDistance=0,lastX=0,lastY=0,hover='',lastTime=performance.now(),lastHud=0,lastRender=0;
 const keys=new Set<string>();const ray=new THREE.Raycaster();const pointer=new THREE.Vector2();
 function go(id:RoomId){const room=rooms.find(r=>r.id===id)!;target.set(...room.position);look.set(...room.look);if(!motion){camera.position.copy(target);currentLook.copy(look);}if(roam){yaw=Math.atan2(-(room.look[0]-room.position[0]),-(room.look[2]-room.position[2]));pitch=Math.atan2(room.look[1]-room.position[1],Math.hypot(room.look[0]-room.position[0],room.look[2]-room.position[2]));}renderOnce();}
 function renderOnce(){if(disposed)return;camera.lookAt(currentLook);for(const {mesh} of animated)mesh.lookAt(camera.position.x,mesh.position.y,camera.position.z);renderer.render(scene,camera);}
 function resize(){if(!host.clientWidth||!host.clientHeight)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);renderOnce();}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();
 const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;keys.clear();},{threshold:.02});io.observe(host);
 function picking(event:PointerEvent,select=false){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(hitTargets,false)[0];const name=hit?.object.userData.name||'';if(name!==hover){hover=name;options.onHover(name);renderer.domElement.style.cursor=name?'pointer':roam?'grab':'default';}if(select&&hit)options.onPick(hit.object.userData.productId);}
 const down=(event:PointerEvent)=>{if(!roam)return;drag=true;dragDistance=0;lastX=event.clientX;lastY=event.clientY;renderer.domElement.setPointerCapture(event.pointerId);};
 const move=(event:PointerEvent)=>{if(drag&&roam){const dx=event.clientX-lastX,dy=event.clientY-lastY;dragDistance+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.003,-.4,.4);lastX=event.clientX;lastY=event.clientY;}else picking(event);};
 const up=(event:PointerEvent)=>{const wasDragging=drag;drag=false;if(renderer.domElement.hasPointerCapture(event.pointerId))renderer.domElement.releasePointerCapture(event.pointerId);if(!wasDragging||dragDistance<6)picking(event,true);};
 const keyDown=(event:KeyboardEvent)=>{if(!roam||!visible||event.ctrlKey||event.metaKey||event.altKey||(event.target instanceof HTMLElement&&event.target.closest('input,textarea,select,[role="dialog"],button,a,[contenteditable]')))return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(event.key.toLowerCase())){event.preventDefault();keys.add(event.key.toLowerCase());}};
 const keyUp=(event:KeyboardEvent)=>keys.delete(event.key.toLowerCase());
 const blur=()=>{keys.clear();drag=false;};
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',blur);
 window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',blur);
 const lost=(event:Event)=>{event.preventDefault();options.onError();};renderer.domElement.addEventListener('webglcontextlost',lost);
 function moveCamera(forward:number,side:number){if(!roam)return;const next=walkPosition(camera.position.x-Math.sin(yaw)*forward+Math.cos(yaw)*side,camera.position.z-Math.cos(yaw)*forward-Math.sin(yaw)*side);camera.position.set(next.x,2.1,next.z);target.copy(camera.position);}
 camera.lookAt(currentLook);
 renderer.setAnimationLoop((time:number)=>{
  if(!visible||document.hidden||disposed){lastTime=time;return;}const fps=roam&&quality!=='economy'?60:quality==='economy'?24:30;if(time-lastRender<1000/fps)return;lastRender=time;const dt=Math.min(.05,(time-lastTime)/1000);lastTime=time;if(!motion&&!roam&&camera.position.distanceTo(target)<.001&&currentLook.distanceTo(look)<.001)return;
  if(roam){let forward=0,side=0;if(keys.has('w')||keys.has('arrowup'))forward+=dt*3.1;if(keys.has('s')||keys.has('arrowdown'))forward-=dt*3.1;if(keys.has('a')||keys.has('arrowleft'))side-=dt*3.1;if(keys.has('d')||keys.has('arrowright'))side+=dt*3.1;moveCamera(forward,side);currentLook.set(camera.position.x-Math.sin(yaw)*Math.cos(pitch)*8,camera.position.y+Math.sin(pitch)*8,camera.position.z-Math.cos(yaw)*Math.cos(pitch)*8);}
  else{const blend=motion?1-Math.exp(-dt*2.25):1;camera.position.lerp(target,blend);currentLook.lerp(look,blend);}
  camera.lookAt(currentLook);
  for(const {mesh,base,index} of animated){mesh.position.y=base+(motion?Math.sin(time*.0012+index)*.085:0);mesh.lookAt(camera.position.x,mesh.position.y,camera.position.z);}
  if(motion)dust.rotation.y=Math.sin(time*.00003)*.02;
  renderer.render(scene,camera);
  if(time-lastHud>180){lastHud=time;options.onPosition(camera.position.x,camera.position.z);}
 });
 return{go,setRoam(active){roam=active;keys.clear();if(active){const direction=new THREE.Vector3();camera.getWorldDirection(direction);yaw=Math.atan2(-direction.x,-direction.z);pitch=Math.asin(direction.y);camera.position.y=2.1;target.copy(camera.position);}else{target.copy(camera.position);look.copy(currentLook);}renderer.domElement.style.touchAction=active?'none':'pan-y';},move:moveCamera,setMotion(active){motion=active;},dispose(){if(disposed)return;disposed=true;renderer.setAnimationLoop(null);ro.disconnect();io.disconnect();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',blur);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',blur);renderer.domElement.removeEventListener('webglcontextlost',lost);for(const resource of resources)resource.dispose();renderer.dispose();renderer.domElement.remove();}};
}
