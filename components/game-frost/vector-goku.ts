import {
 add, blend, bone, circle, clamp, effectBeam, floor, group, ik,
 limb, line, mul, n, path, perpendicular, point, ramp, rotate, segment,
 sub, unit, windowed, xy, type V, type VectorFrame,
} from './vector-helpers';

/**
 * An original vector fan illustration. All joints, ink, palms and energy share
 * one deterministic pose; no independent sprite or effect animation is used.
 */
export function renderGoku(progress:number,id:string):VectorFrame {
 const p=clamp(progress);
 const load=windowed(p,.05,.24,.79,1);
 const charge=windowed(p,.18,.39,.68,.96);
 const reach=windowed(p,.42,.50,.70,.94);
 const recoil=windowed(p,.51,.58,.68,.85);
 const center=point(292-13*recoil+4*charge,337+12*load+7*recoil);
 const tilt=-.055*load-.055*recoil;
 const at=(x:number,y:number)=>add(center,rotate(point(x,y),tilt));
 const leftShoulder=at(-33,-65),rightShoulder=at(33,-61);
 const leftHip=at(-24,65),rightHip=at(27,65);
 const leftFoot=point(211,610),rightFoot=point(386,610);
 const leftLeg=ik(leftHip,add(leftFoot,point(0,-13)),112,105,1);
 const rightLeg=ik(rightHip,add(rightFoot,point(-8,-13)),112,105,-1);
 const cuppedLeft=at(62,-8),cuppedRight=at(72,16);
 const chargeLeft=at(85,-24),chargeRight=at(94,-1);
 const releaseLeft=at(124,-35),releaseRight=at(130,-10);
 const leftTarget=blend(blend(cuppedLeft,chargeLeft,charge),releaseLeft,reach);
 const rightTarget=blend(blend(cuppedRight,chargeRight,charge),releaseRight,reach);
 const leftArm=ik(leftShoulder,leftTarget,87,88,1);
 const rightArm=ik(rightShoulder,rightTarget,88,87,1);
 const leftHand=leftArm.end,rightHand=rightArm.end;
 const effectOrigin=mul(add(leftHand,rightHand),.5);
 const effectTarget=point(694,effectOrigin.y-15);
 const head=at(-5,-143);
 const aura=windowed(p,.12,.36,.70,.98);
 const orb=windowed(p,.23,.43,.50,.56);
 const beam=p>=.48&&p<=.68?ramp(p,.48,.497)*(1-ramp(p,.657,.68)):0;
 const skin=`url(#${id}-skin)`,skinShade='#a85a48';
 const orange=`url(#${id}-orange)`,blue=`url(#${id}-blue)`;
 const ink='#171c31';

 // Inked surface details are calculated in each live bone's coordinate system.
 const muscle=(a:V,b:V,width:number,side=1)=>{
  const d=unit(sub(b,a)),s=mul(perpendicular(d),side);
  const v=(along:number,across:number)=>add(a,add(mul(sub(b,a),along),mul(s,across)));
  return path(`M${xy(v(.14,width*.44))} Q${xy(v(.40,width*.79))} ${xy(v(.68,width*.38))}`,'none',skinShade,2.4)
   +path(`M${xy(v(.34,-width*.4))} Q${xy(v(.60,-width*.64))} ${xy(v(.82,-width*.25))}`,'none','#fff0d7',2,'opacity=".55"')
   +path(`M${xy(v(.73,width*.11))} Q${xy(v(.87,width*.43))} ${xy(v(.96,0))}`,'none',skinShade,1.7,'opacity=".7"');
 };
 const pants=(hip:V,knee:V,ankle:V,near:boolean)=>{
  const d=unit(sub(ankle,knee));
  const bootTop=sub(ankle,mul(d,48));
  const side=perpendicular(unit(sub(knee,hip)));
  const foldA=add(blend(hip,knee,.20),mul(side,near?15:-13));
  const foldB=add(blend(hip,knee,.64),mul(side,near?-8:8));
  return limb(hip,knee,ankle,34,25,orange,'#934028')
   +path(`M${xy(add(hip,mul(side,9)))} Q${xy(foldA)} ${xy(foldB)} L${xy(add(knee,mul(side,-7)))}`,'none','#9b3d24',3)
   +path(`M${xy(add(knee,mul(side,17)))} Q${xy(add(knee,point(-12,10)))} ${xy(add(knee,mul(side,-17)))}`,'none','#ffd29b',3,'opacity=".7"')
   +path(`M${xy(add(blend(knee,ankle,.2),mul(side,-13)))} L${xy(add(blend(knee,ankle,.45),mul(side,-4)))}`,'none','#a74429',2)
   +segment(bootTop,ankle,22,18,blue,ink,3)
   +segment(bootTop,add(bootTop,mul(d,9)),23,22,'#e44b37',ink,2)
   +line(add(bootTop,mul(side,-8)),add(ankle,mul(side,-6)),'#498cc3',2)
   +group(
    path('M-19 -17 Q-7 -12 4 -17 L12 -2 Q30 0 34 10 Q20 15-18 11 Z',blue,ink,3)
    +path('M-18 10 Q7 15 34 10 L34 15 Q6 21-19 15 Z','#242c43',ink,2)
    +path('M2 -8 Q14-4 20 2','none','#69a9ce',2)
    +path('M-16 -9 L7 -8','none','#e26447',3),ankle);
 };
 const palm=(position:V,armJoint:V,upper:boolean)=>{
  const axis=unit(sub(position,armJoint));
  const angle=Math.atan2(axis.y,axis.x);
  // The palm's (0,0), also its beam anchor, is the same IK endpoint.
  return group(
   upper
    ?path('M-10 -9 Q-4 -17 5 -12 L16 -6 Q22 -4 19 1 L8 1 Q15 7 11 10 L1 6 Q-2 14-8 10 L-14 2 Z',skin,ink,2.7)
     +path('M3 -8 L13 -4 M1 -3 L12 0 M-3 2 L4 6','none',skinShade,1.7)
    :path('M-13 -8 Q-5 -13 3 -7 L12 -1 Q22 -2 22 3 Q21 8 10 8 L4 12 Q-2 17-8 11 L-15 3 Z',skin,ink,2.7)
     +path('M3 2 L15 4 M-1 7 L8 10 M-6 -4 Q-2 0-3 5','none',skinShade,1.7),position,angle);
 };

 const defs=`<defs>
  <linearGradient id="${id}-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0d1"/><stop offset=".43" stop-color="#edb188"/><stop offset="1" stop-color="#c7785a"/></linearGradient>
  <linearGradient id="${id}-orange" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="#ffd18c"/><stop offset=".42" stop-color="#ef893e"/><stop offset="1" stop-color="#b8472a"/></linearGradient>
  <linearGradient id="${id}-blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#265d96"/><stop offset=".5" stop-color="#163b6b"/><stop offset="1" stop-color="#101f43"/></linearGradient>
  <linearGradient id="${id}-hair" x1=".12" y1="0" x2=".8" y2="1"><stop stop-color="#fcffff"/><stop offset=".43" stop-color="#c7d9e4"/><stop offset=".8" stop-color="#8099af"/><stop offset="1" stop-color="#50667f"/></linearGradient>
  <radialGradient id="${id}-orb"><stop stop-color="#ffffff"/><stop offset=".23" stop-color="#eaffff"/><stop offset=".55" stop-color="#77e8ff" stop-opacity=".8"/><stop offset="1" stop-color="#5bbaff" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}-aura" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d8fbff" stop-opacity=".05"/><stop offset=".5" stop-color="#7fddff" stop-opacity=".18"/><stop offset="1" stop-color="#b3eeff" stop-opacity=".04"/></linearGradient>
 </defs>`;
 const auraArt=`<g opacity="${n(aura)}">`
  +group(path('M-150 276 Q-177 204-125 154 L-145 128 Q-104 107-122 72 L-99 57 Q-112 9-78-20 L-86-53 Q-44-49-55-90 L-28-125 L-15-97 L11-156 L33-102 Q68-109 58-65 L88-76 L85-24 Q117-25 103 23 L131 35 Q104 74 125 95 L146 93 Q133 133 151 163 Q191 219 144 277 Z',`url(#${id}-aura)`,'none',0),center,tilt)
  +group(path('M-112 258 Q-151 176-110 103 L-94 69 Q-110 6-74-27 M-58-91 L-47-119 M63-78 Q99-32 79 14 L106 50 M135 170 Q155 219 127 253','none','#9cddf6',2.2,'opacity=".46"'),center,tilt)
  +group(path('M-127 193 L-116 178 L-126 159 M97 67 L87 43 L99 23 M-67-35 L-55-45 L-63-65 M121 225 L108 201 L119 190','none','#def9ff',2.4,'opacity=".75"'),center,tilt)
  +'</g>';

 const torso=group(
  // Back of the torn blue gi and a continuous skin silhouette.
  path('M-39 -71 L-53 -57 L-43 -20 L-35 -31 L-28 -55 Z',blue,ink,3)
  +path('M-12 -112 L12 -111 L18 -72 Q34-74 44-58 L36 -19 L30 53 L23 67 L-22 66 L-34 44 L-39 -9 Q-47 -55-35 -65 L-17 -74 Z',skin,ink,3.4)
  +path('M-16 -83 Q-6 -76 5 -82 M-12 -73 L-3 -60 L6 -72','none',skinShade,2.2)
  +path('M-27 -62 Q-10 -58-4 -48 Q14 -62 32 -52 M-4 -48 L-3 -19','none',skinShade,2.6)
  +path('M-32 -48 Q-30 -22-7 -24 Q-1 -20 0 -26 M2 -26 Q23 -22 32 -43','none',skinShade,2.8)
  +path('M-26 -39 Q-19 -47-11 -45 M9 -44 Q18 -51 27 -44','none','#fff4df',3.5,'opacity=".7"')
  +path('M-1 -15 L1 43 M-16 -12 Q-9 -18-2 -11 M4 -11 Q15 -17 21 -9 M-17 8 Q-10 2-2 8 M5 7 Q14 3 19 11 M-14 27 Q-7 21 0 28 M5 27 Q12 23 17 29','none',skinShade,2.2)
  +path('M-29 -2 Q-26 10-23 14 M-25 21 L-22 29 M28 -2 Q23 11 24 19 M23 27 L19 39','none','#99533f',2.2)
  +path('M-23 39 L-11 52 L0 49 L11 53 L22 42','none',skinShade,2.3)
  +path('M-22 -5 L-18 -2 M15 17 L12 20 M-12 31 L-8 29 M-28 -50 L-24 -52 M15 -59 L20 -56','none','#85513f',1.4,'opacity=".68"')
  // Torn shoulder cloth is part of the body silhouette, not a detached layer.
  +path('M31 -68 L41 -65 L47 -49 L38 -44 L32 -50 L28 -39 L23 -47 L27 -58 Z',blue,ink,2.8)
  +path('M34 -60 L40 -51 M-43 -56 L-37 -43','none','#4c95c7',2)
  +path('M-34 51 Q-4 62 32 49 L34 65 L17 76 L-21 72 L-36 65 Z',blue,ink,3)
  +path('M-33 59 Q-6 67 29 57','none','#5a8cba',2)
  +path('M15 66 L26 79 L31 105 L18 99 L9 77 Z',blue,ink,2.5)
  +path('M-26 67 L-32 88 L-41 96 L-43 78 L-36 65 Z',blue,ink,2.5)
  +path('M-11 70 L-15 104 L-8 114 L1 81 L10 79 L18 69 Z',orange,ink,2.6),center,tilt);

 const face=group(
  // Silvery rear spikes frame a strongly inked three-quarter anime face.
  path('M-45 -18 L-67 -39 L-55 -43 L-79 -65 L-48 -60 L-70 -96 L-33 -78 L-35 -118 L-9 -86 L12 -125 L25 -87 L58 -112 L47 -76 L82 -84 L63 -58 L83 -55 L54 -36 L53 -9 L27 14 L-13 12 Z',`url(#${id}-hair)`,ink,3)
  +path('M-32 -24 Q-40 -27-42 -15 Q-43 -3-32 3 L-27 20 Q-17 34 3 42 L27 29 L42 11 L39 -29 Q26 -51-2 -53 Q-25 -49-32 -24 Z',skin,ink,3)
  +path('M-35 -19 Q-39 -16-32 -10 L-30 -2 M-27 1 L-25 11','none',skinShade,1.8)
  +path('M-22 -18 Q-5 -25 6 -15 L1 -5 L-17 -9 Z','#f4fbff',ink,2)
  +path('M15 -17 Q31 -25 38 -21 L35 -10 L21 -6 Z','#f4fbff',ink,2)
  +path('M-23 -22 L3 -17 M17 -20 L37 -26','none',ink,4)
  +path('M-8 -19 L-8 -8 M28 -21 L28 -11','none','#5a7685',4)
  +path('M7 -15 L3 6 L12 9 L15 4','none','#864d43',2.1)
  +path('M-1 22 Q12 24 24 17 M5 29 L13 30','none',ink,2)
  +path('M-19 3 L-12 10 M-21 10 L-14 16 M27 0 L23 5 M27 6 L23 12 M-5 34 L0 36','none',skinShade,1.4)
  +path('M16 -1 L20 3 L18 11','none','#fff0d9',2.4,'opacity=".6"')
  // Forelocks and angular silver highlights retain the accepted UI direction.
  +path('M-50 -38 L-70 -68 L-43 -58 L-42 -95 L-20 -72 L-7 -112 L7 -73 L28 -107 L25 -64 L49 -86 L40 -51 L62 -62 L42 -35 L30 -24 L27 -48 L15 -29 L9 -51 L-1 -26 L-8 -47 L-25 -23 L-28 -43 L-36 -15 L-37 -36 Z',`url(#${id}-hair)`,ink,3)
  +path('M-39 -71 L-31 -48 L-28 -39 M-8 -91 L-6 -60 M20 -84 L17 -59 M39 -65 L31 -47 M-21 -60 L-16 -42','none','#f6ffff',3.6,'opacity=".92"')
  +path('M-47 -44 L-36 -48 M-12 -55 L-9 -42 M8 -66 L5 -55 M26 -54 L23 -42','none','#627f99',2)
  +path('M-56 -66 L-46 -62 M-25 -81 L-20 -72 M43 -78 L36 -67','none','#e7f5ff',2)
  +path('M-36 -4 L-34 10 L-26 8','none',ink,2),head,tilt-.035*reach);

 const farArm=limb(leftShoulder,leftArm.joint,leftHand,18,12,skin,skinShade)
  +muscle(leftShoulder,leftArm.joint,18,-1)
  +muscle(leftArm.joint,leftHand,12,-1)+palm(leftHand,leftArm.joint,true);
 const nearArm=limb(rightShoulder,rightArm.joint,rightHand,22,13,skin,skinShade)
  +muscle(rightShoulder,rightArm.joint,22,1)
  +muscle(rightArm.joint,rightHand,13,1)
  +path(`M${xy(add(rightArm.joint,point(-4,-7)))} Q${xy(add(rightArm.joint,point(4,-2)))} ${xy(add(rightArm.joint,point(3,5)))}`,'none',skinShade,2)
  +palm(rightHand,rightArm.joint,false);

 const chargeArt=`<g opacity="${n(orb)}">`
  +circle(effectOrigin,46+orb*12,`url(#${id}-orb)`)
  +circle(effectOrigin,12+orb*9,'#ebffff','#8de9ff',2)
  +path(`M${xy(add(effectOrigin,point(-34,-14)))} Q${xy(add(effectOrigin,point(-15,-36)))} ${xy(add(effectOrigin,point(18,-24)))} M${xy(add(effectOrigin,point(35,11)))} Q${xy(add(effectOrigin,point(12,35)))} ${xy(add(effectOrigin,point(-19,26)))}`,'none','#b3f5ff',2.4)
  +line(add(effectOrigin,point(-49,6)),add(effectOrigin,point(-33,3)),'#78dfff',2)
  +line(add(effectOrigin,point(14,-42)),add(effectOrigin,point(10,-30)),'#d9fdff',2)
  +line(add(effectOrigin,point(31,35)),add(effectOrigin,point(23,25)),'#c1faff',2)+'</g>';

 const beamArt=beam>0
  ?effectBeam(effectOrigin,effectTarget,id,'#75dcff',17+beam*7,beam)
   +`<g opacity="${n(beam*.85)}">`
    +path(`M${xy(add(effectOrigin,point(5,-14)))} Q${xy(blend(effectOrigin,effectTarget,.39))} ${xy(add(effectTarget,point(0,-14)))}`,'none','#b0f5ff',2)
    +path(`M${xy(add(effectOrigin,point(5,15)))} Q${xy(add(blend(effectOrigin,effectTarget,.58),point(0,18)))} ${xy(add(effectTarget,point(-6,16)))}`,'none','#a8eaff',2)
    +'</g>'
  :'';
 const markup=defs+floor(id,298,625,145,.50)+auraArt
  +pants(leftHip,leftLeg.joint,leftLeg.end,false)
  +pants(rightHip,rightLeg.joint,rightLeg.end,true)
  +farArm+torso+face+nearArm+chargeArt+beamArt;
 const phase=p<.24?'prepare':p<.48?'charge':p<.68?'attack':p<.92?'settle':'recover';
 return {
  markup,phase,
  anchors:{head,leftShoulder,rightShoulder,leftElbow:leftArm.joint,rightElbow:rightArm.joint,
   leftHand,rightHand,effectOrigin,effectTarget,leftHip,rightHip,leftKnee:leftLeg.joint,
   rightKnee:rightLeg.joint,leftAnkle:leftLeg.end,rightAnkle:rightLeg.end,leftFoot,rightFoot},
  bones:[bone('left-upper-arm',leftShoulder,leftArm.joint),bone('left-forearm',leftArm.joint,leftHand),
   bone('right-upper-arm',rightShoulder,rightArm.joint),bone('right-forearm',rightArm.joint,rightHand),
   bone('left-thigh',leftHip,leftLeg.joint),bone('left-shin',leftLeg.joint,leftLeg.end),
   bone('right-thigh',rightHip,rightLeg.joint),bone('right-shin',rightLeg.joint,rightLeg.end)],
 };
}
