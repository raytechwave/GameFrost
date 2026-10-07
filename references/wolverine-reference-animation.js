import * as T from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const canvas=document.querySelector('#scene'),stage=document.querySelector('.stage'),fx=document.querySelector('#fx'),g=fx.getContext('2d'),play=document.querySelector('#play'),range=document.querySelector('#progress'),status=document.querySelector('#status');
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.05,50);scene.environment=new T.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
scene.environmentIntensity=.55;scene.add(new T.HemisphereLight(0xcde1ff,0x232431,.75));
function light(color,intensity,x,y,z){let l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);return l}
const key=light(0xffe9c8,3,-3,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=4;key.shadow.camera.bottom=-2;key.shadow.bias=-.0004;light(0x82b9ff,3,3,3,-2);light(0xffffff,.7,0,1,4);
const floor=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.38}));floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
let model,bones={},rest=new Map(),p=0,running=false,stamp=0,W=0,H=0;
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=(a,b,x)=>{x=clamp((x-a)/(b-a));return x*x*(3-2*x)};
const manager=new T.LoadingManager();manager.setURLModifier(url=>{if(url.startsWith('blob:')||url.startsWith('data:'))return url;let name=decodeURIComponent(url).split(/[\\/]/).pop();if(name.includes('Normal'))return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';name=({'Material__28_Diffuse.png':'wolverine_hair_d.tga.png','Material__26_Diffuse.png':'T_Wolverine_Body_d.tga.png','Material__29_Diffuse.png':'wolverine_innards_d.jpg'})[name]||name;return 'source/textures/'+name});
const texturesReady=new Promise(resolve=>manager.onLoad=resolve);
const loader=new FBXLoader(manager);const textures=new T.TextureLoader();
const tex=name=>{const t=textures.load('source/textures/'+name);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t};
const body=tex('Wolverine_Body_001_C.png'),boot=tex('Wolverine_Boots_001_C.png'),glove=tex('Wolverine_Gauntlet_001_C.png');
const fbx=await fetch('source/source/LOGAN%20LIVE%20ACTION%20.fbx').then(r=>r.arrayBuffer());model=loader.parse(fbx,'');model.scale.setScalar(.01);scene.add(model);
model.traverse(n=>{if(n.isBone&&!bones[n.name]){bones[n.name]=n;rest.set(n,n.quaternion.clone())}if(n.isMesh){n.castShadow=true;n.frustumCulled=false;n.material=(Array.isArray(n.material)?n.material:[n.material]).map(m=>{let map=m.map;if(n.name==='Wolverine001_Bootsmo'){map=/Boots/.test(m.name)?boot:/Glove/.test(m.name)?glove:body}if(map)map.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({name:m.name,map,color:0xffffff,roughness:.62,metalness:.04,side:T.DoubleSide,transparent:false,opacity:1,alphaTest:/28/.test(m.name)?.4:0})})}});
model.traverse(n=>{if(n.name==='Wolverine001_Bootsmo'&&n.isMesh)for(const m of n.material){m.roughness=/Boots|Glove/.test(m.name)?.44:.65;m.metalness=/Boots|Glove/.test(m.name)?.12:.04}});
model.updateMatrixWorld(true);
const hipRest=bones['Bip001'].position.clone(),ankles={},footOrient={},bladeTips=[];
for(const side of ['R','L']){const f=bones['Bip001-'+side+'-Foot'];ankles[side]=f.getWorldPosition(new T.Vector3());footOrient[side]=f.getWorldQuaternion(new T.Quaternion())}
model.traverse(mesh=>{if(!mesh.isSkinnedMesh||mesh.name!=='Wolverine001_Bootsmo')return;mesh.skeleton.update();const geo=mesh.geometry,si=geo.attributes.skinIndex,sw=geo.attributes.skinWeight,metalIndex=mesh.material.length;mesh.material.push(new T.MeshStandardMaterial({color:0xb6c6d0,metalness:.95,roughness:.22}));
const clawAt=i=>{for(let k=0;k<4;k++){const b=mesh.skeleton.bones[si.array[i*4+k]];if(b?.name.includes('Bone_Claw')&&sw.array[i*4+k]>.4)return b}return null};
const prior=geo.groups.map(x=>({...x}));geo.clearGroups();let begin=0,prev=-1;
for(let i=0;i<geo.attributes.position.count;i+=3){const cl=clawAt(i),mat=cl?metalIndex:prior.find(x=>i>=x.start&&i<x.start+x.count)?.materialIndex||0;if(mat!==prev){if(i>begin)geo.addGroup(begin,i-begin,prev);begin=i;prev=mat}}
geo.addGroup(begin,geo.attributes.position.count-begin,prev);
for(const side of ['R','L'])for(let j=1;j<=3;j++){const name='Bone_Claw_'+side+'_00'+j,b=bones[name],start=b.getWorldPosition(new T.Vector3()),dir=bones[name+'_end'].getWorldPosition(new T.Vector3()).sub(start).normalize();let max=-Infinity,tip,tipIndex;
for(let i=0;i<si.count;i++){if(clawAt(i)?.name!==name)continue;const v=new T.Vector3().fromBufferAttribute(geo.attributes.position,i);mesh.applyBoneTransform(i,v);v.applyMatrix4(mesh.matrixWorld);const d=v.clone().sub(start).dot(dir);if(d>max){max=d;tip=v;tipIndex=i}}
if(tip)bladeTips.push({side,mesh,index:tipIndex,bone:b,local:b.worldToLocal(tip.clone())})
}
});
function rotateWorld(name,axis,angle){const b=bones[name];if(!b)return;const parent=b.parent.getWorldQuaternion(new T.Quaternion());const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(...axis).applyQuaternion(parent.clone().invert()),angle);b.quaternion.premultiply(q);b.updateWorldMatrix(false,true)}
const v3=a=>new T.Vector3(...a),pos=n=>bones[n].getWorldPosition(new T.Vector3());
function worldDelta(b,q){const par=b.parent.getWorldQuaternion(new T.Quaternion()),local=par.clone().invert().multiply(q).multiply(par);b.quaternion.premultiply(local);b.updateWorldMatrix(false,true)}
function aim(b,from,to,twist){const q=new T.Quaternion().setFromUnitVectors(from.clone().normalize(),to.clone().normalize());worldDelta(b,q);if(twist)worldDelta(bones[twist],q)}
function limbFrame(x,y){x=x.clone().normalize();y=y.clone().addScaledVector(x,-y.dot(x)).normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,new T.Vector3().crossVectors(x,y)))}
function armIK(side,target,pole){const U='Bip001-'+side+'-UpperArm',F='Bip001-'+side+'-Forearm',H='Bip001-'+side+'-Hand';const u=pos(U),f=pos(F),hand=pos(H),l1=u.distanceTo(f),l2=f.distanceTo(hand),dir=target.clone().sub(u),d=Math.min(dir.length(),(l1+l2)*.96);dir.normalize();target=u.clone().addScaledVector(dir,d);const along=(l1*l1-l2*l2+d*d)/(2*d),off=Math.sqrt(Math.max(0,l1*l1-along*along));const normal=pole.clone().sub(u);normal.addScaledVector(dir,-normal.dot(dir)).normalize();const elbow=u.clone().addScaledVector(dir,along).addScaledVector(normal,off);const oldFrame=limbFrame(f.clone().sub(u),hand.clone().sub(f)),newFrame=limbFrame(elbow.clone().sub(u),target.clone().sub(elbow)),turn=newFrame.multiply(oldFrame.invert());worldDelta(bones[U],turn);worldDelta(bones['Bip001_Bn_'+side+'_UArmTw'],turn);const nf=pos(F);aim(bones[F],pos(H).sub(nf),target.sub(nf),'Bip001-'+side+'-ForeTwist')}
// Targets are meters in the character's neutral frame. Asymmetric poses avoid a robotic mirror stance.
const keys=[
 {t:0,r:[-.48,1.00,.39],l:[.35,1.13,.46],yaw:-.18,lean:.23,root:.10},
 {t:.38,r:[-.52,.99,.34],l:[.34,1.14,.46],yaw:-.22,lean:.26,root:.10},
 {t:.95,r:[-.52,1.20,-.06],l:[.35,1.09,.51],yaw:-.45,lean:.38,root:.20},
 {t:1.22,r:[-.48,1.56,.22],l:[.25,1.03,.63],yaw:-.42,lean:.40,root:.24},
 {t:1.53,r:[-.45,1.62,.28],l:[.14,1.01,.71],yaw:-.42,lean:.43,root:.28},
 {t:1.64,r:[-.40,1.49,.53],l:[.30,.99,.57],yaw:-.20,lean:.44,root:.28},
 {t:1.94,r:[.26,.97,.76],l:[.50,1.03,.23],yaw:.60,lean:.39,root:.22},
 {t:2.12,r:[.29,.86,.63],l:[.49,1.02,.21],yaw:.54,lean:.32,root:.19},
 {t:2.31,r:[.13,.82,.63],l:[.48,1.00,.28],yaw:.33,lean:.39,root:.24},
 {t:2.83,r:[-.24,1.03,.57],l:[.37,1.10,.43],yaw:-.02,lean:.30,root:.13},
 {t:3.65,r:[-.46,1.01,.40],l:[.35,1.14,.46],yaw:-.18,lean:.23,root:.10},
 {t:4.8,r:[-.48,1.00,.39],l:[.35,1.13,.46],yaw:-.18,lean:.23,root:.10}
];
const clawRest=new Map(Object.values(bones).filter(b=>/^Bone_Claw_[RL]_00[123]$/.test(b.name)).map(b=>[b,b.scale.clone()]));
const headRestQ=bones['Bip001-Head'].getWorldQuaternion(new T.Quaternion());
const faceRest=new Map(Object.values(bones).filter(b=>b.name.startsWith('ch_wolverine_')&&!b.name.endsWith('_end')).map(b=>[b,b.position.clone()]));
function faceOffset(name,delta){const b=bones[name];if(!b)return;const q=bones['Bip001-Head'].getWorldQuaternion(new T.Quaternion()).multiply(headRestQ.clone().invert()),v=v3(delta).applyQuaternion(q),w=b.getWorldPosition(new T.Vector3()).add(v);b.position.copy(b.parent.worldToLocal(w));b.updateWorldMatrix(false,true)}
function legIK(side,target,pole,point){const U='Bip001-'+side+'-Thigh',F='Bip001-'+side+'-Calf',H='Bip001-'+side+'-Foot',up=pos(U),mid=pos(F),end=pos(H),l1=up.distanceTo(mid),l2=mid.distanceTo(end),dir=target.clone().sub(up),d=Math.min(dir.length(),(l1+l2)*.988);dir.normalize();target=up.clone().addScaledVector(dir,d);const along=(l1*l1-l2*l2+d*d)/(2*d),off=Math.sqrt(Math.max(0,l1*l1-along*along)),normal=pole.clone().sub(up);normal.addScaledVector(dir,-normal.dot(dir)).normalize();const knee=up.clone().addScaledVector(dir,along).addScaledVector(normal,off);aim(bones[U],mid.clone().sub(up),knee.sub(up),'Bip001_Bn_'+side+'_ThighTw');aim(bones[F],pos(H).sub(pos(F)),target.clone().sub(pos(F)));bones[H].quaternion.copy(bones[H].parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(footOrient[side]));bones[H].updateWorldMatrix(false,true);rotateWorld(H,[1,0,0],point)}
function pose(t){
 clawRest.forEach((s,b)=>{b.scale.copy(s);b.scale.y*=.68+.32*smooth(.12,.68,t)});
 rest.forEach((q,b)=>b.quaternion.copy(q));faceRest.forEach((v,b)=>b.position.copy(v));bones['Bip001'].position.copy(hipRest);model.updateMatrixWorld(true);
 let k=0;while(k<keys.length-2&&t>keys[k+1].t)k++;const a=keys[k],b=keys[k+1],u=smooth(a.t,b.t,t),yaw=T.MathUtils.lerp(a.yaw,b.yaw,u),lean=T.MathUtils.lerp(a.lean,b.lean,u);
 const flight=clamp((t-1.22)/.90),air=t>1.22&&t<2.12,arc=air?4*flight*(1-flight):0;
 const crouch=.14+.23*smooth(.38,.97,t)*(1-smooth(.97,1.22,t))+.23*smooth(2.12,2.28,t)*(1-smooth(2.28,2.95,t));
 const travel=v3([-.10*smooth(1.22,2.12,t),.40*arc-crouch,.80*smooth(1.22,2.12,t)]);
 const breathe=.006*Math.sin(t*3.6)*(1-smooth(.3,.8,t)+smooth(3.05,4.3,t));travel.y+=breathe;
 const hip=bones['Bip001'],hp=hip.getWorldPosition(new T.Vector3()).add(travel);hip.position.copy(hip.parent.worldToLocal(hp));model.updateMatrixWorld(true);
 rotateWorld('Bip001',[1,0,0],T.MathUtils.lerp(a.root,b.root,u));
 rotateWorld('Bip001-Pelvis',[0,1,0],yaw*.22);
 rotateWorld('Bip001',[0,0,1],-.14*arc);
 rotateWorld('Bip001-Pelvis',[0,0,1],-.045*arc);
 for(const n of ['Bip001-Spine','Bip001-Spine1','Bip001-Spine2']){rotateWorld(n,[0,1,0],yaw*.78/3);rotateWorld(n,[1,0,0],lean/3)}
 rotateWorld('Bip001-Neck',[0,1,0],-yaw*.65);rotateWorld('Bip001-Head',[1,0,0],-(lean+T.MathUtils.lerp(a.root,b.root,u))*.75);
 // Fixed ground contact before launch and after landing; feet tuck at different heights in flight.
 const tuck=Math.pow(Math.sin(Math.PI*flight),1.2);
 for(const side of ['R','L']){const lead=side==='L',target=ankles[side].clone().add(v3([travel.x+(lead?.16:-.16),0,travel.z+(lead?.08:-.08)]));if(air){target.y+=.40*arc+tuck*(lead?.44:.21);target.z+=tuck*(lead?.40:-.43);target.x+=tuck*(lead?-.12:.09)}
 const pole=v3([side==='R'?-.58:.49,.55,1.2]).add(travel);legIK(side,target,pole,air?tuck*(lead?.12:.70):0)}
 armIK('R',v3(a.r).lerp(v3(b.r),u).add(travel),pos('Bip001-R-UpperArm').add(v3([-.8,-.2,-.6])));
 armIK('L',v3(a.l).lerp(v3(b.l),u).add(travel),pos('Bip001-L-UpperArm').add(v3([.8,0,-1])));
 // Restrained facial performance: brow knit, squint and cheek tension at the strike.
 const focus=.15+.65*smooth(.3,.95,t)*(1-smooth(2.5,3.9,t)),snarl=smooth(1.52,1.83,t)*(1-smooth(2.12,2.65,t));
 const blink=(1-smooth(0,.06,Math.abs(t-.16)))+(1-smooth(0,.07,Math.abs(t-3.57)));
 for(const side of ['R','L']){const sign=side==='R'?1:-1;
 faceOffset('ch_wolverine_Bn_'+side+'_eyebrow_001',[sign*.0015*focus,-.0035*focus,0]);
 faceOffset('ch_wolverine_Bn_'+side+'_eyebrow_002',[0,-.0015*focus,0]);
 faceOffset('ch_wolverine_Bn_'+side+'_eyelid_top',[0,-.0016*focus-.006*blink,0]);
 faceOffset('ch_wolverine_Bn_'+side+'_eyelid_bttm',[0,.0014*snarl+.0015*blink,0]);
 faceOffset('ch_wolverine_Bn_'+side+'_cheek',[0,.0032*snarl,.0006*snarl]);}
 faceOffset('ch_wolverine_Bn_M_eyebrow',[0,-.0025*focus,0]);
 model.updateMatrixWorld(true);
}
function tipPositions(){return bladeTips.filter(b=>b.side==='R').map(b=>{const v=new T.Vector3().fromBufferAttribute(b.mesh.geometry.attributes.position,b.index);b.mesh.applyBoneTransform(b.index,v);return v.applyMatrix4(b.mesh.matrixWorld)})}
const trailFrames=[];
for(let i=0;i<=90;i++){const t=1.45+i/90*.62;pose(t);trailFrames.push({t,points:tipPositions()})}pose(0);
let sceneTop=0,viewH=0;
function screen(v){const p=v.clone().project(camera);return[(p.x*.5+.5)*W,sceneTop+(-p.y*.5+.5)*viewH]}
function stroke(points,width,color){if(points.length<2)return;g.beginPath();points.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.lineCap='round';g.lineJoin='round';g.strokeStyle=color;g.lineWidth=width;g.stroke()}
// A short motion echo at the real blade tips only. No screen scratches, symbols or detached sparks.
function effects(t){if(reduce.matches||t<1.67||t>2.03)return;const history=trailFrames.filter(f=>f.t<=t&&f.t>t-.035);for(let j=0;j<3;j++){const points=history.map(f=>screen(f.points[j]));points.push(screen(tipPositions()[j]));stroke(points,1,'rgba(222,238,249,.28)')}}

function resize(){W=stage.clientWidth;H=stage.clientHeight;const mobile=W<600;sceneTop=0;viewH=H;renderer.setSize(W,viewH,false);canvas.style.position='absolute';canvas.style.top='0';canvas.style.height=viewH+'px';camera.aspect=W/viewH;camera.position.set(mobile?.75:1.35,mobile?1.48:1.50,mobile?Math.max(5.5,6.25-(W-320)*.011):4.65);camera.lookAt(-.06,.87,.40);camera.updateProjectionMatrix();fx.width=W*renderer.getPixelRatio();fx.height=H*renderer.getPixelRatio();draw()}
function draw(){if(!model)return;pose(p);renderer.render(scene,camera);g.setTransform(renderer.getPixelRatio(),0,0,renderer.getPixelRatio(),0,0);g.clearRect(0,0,W,H);effects(p);range.value=p*1000;document.querySelector('#time').textContent=p.toFixed(1)+' / 4.8 s';document.querySelector('#phase').textContent=p<.35?'READY':p<1.18?'CROUCH / LOAD':p<1.72?'LEAP':p<2.24?'AIRBORNE STRIKE':p<2.8?'LAND / ABSORB':p<4.7?'RECOVERY':'READY';}
function tick(t){if(!running)return;if(!stamp)stamp=t;p=Math.min(4.8,p+(t-stamp)/1000);stamp=t;draw();if(p<4.8)requestAnimationFrame(tick);else{running=false;play.textContent='Replay attack'}}
play.onclick=()=>{if(running){running=false;play.textContent='Continue';return}if(p>=4.8)p=0;if(reduce.matches){p=1.85;draw();return}running=true;stamp=0;play.textContent='Pause';requestAnimationFrame(tick)};range.oninput=()=>{running=false;p=Number(range.value)/1000;play.textContent='Play attack';draw()};document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;play.textContent='Continue'}});
stage.addEventListener('wheel',e=>{if(reduce.matches)return;if((e.deltaY>0&&p>=4.8)||(e.deltaY<0&&p<=0))return;e.preventDefault();running=false;p=T.MathUtils.clamp(p+e.deltaY*.004,0,4.8);play.textContent='Play attack';draw()},{passive:false});
await texturesReady;new ResizeObserver(resize).observe(stage);status.textContent='';play.disabled=false;range.disabled=false;window.ready=true;window.seek=t=>{p=t;draw()};window.inspect=()=>({bones:Object.keys(bones),bounds:new T.Box3().setFromObject(model).getSize(new T.Vector3()).toArray()});window.trailFrames=trailFrames;window.bladeTips=bladeTips;window.model=model;window.bones=bones;window.T=T;window.pose=pose;window.renderer=renderer;window.scene=scene;window.camera=camera;resize();
