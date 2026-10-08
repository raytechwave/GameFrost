import {
  add, blend, bone, circle, clamp, ellipse, floor, group, ik, limb, line,
  mix, mul, n, path, perpendicular, point, ramp, rotate, segment, sub,
  windowed, xy, type V, type VectorFrame,
} from './vector-helpers';

/**
 * Original Harry illustration. No raster pieces, independently running effects,
 * or interpolated bone lengths: one reversible clock poses the whole scene.
 */
export function renderHarry(progress:number,id:string):VectorFrame {
  const p=clamp(progress), key=id.replace(/[^a-zA-Z0-9_-]/g,'');
  const load=windowed(p,.03,.25,.29,.5);
  const extend=ramp(p,.28,.5), recover=ramp(p,.84,1);
  const cast=windowed(p,.28,.5,.84,1), follow=windowed(p,.7,.84,.85,1);
  const root=point(293+cast*12-load*5,445+load*7-cast*5);
  const torsoAngle=cast*.065-load*.038;
  const local=(q:V)=>add(root,rotate(q,torsoAngle));
  const leftShoulder=local(point(-31,-106));
  const rightShoulder=local(point(34,-109));
  const leftHip=local(point(-22,4)), rightHip=local(point(22,5));
  const leftFoot=point(246-load*3-cast*5,607);
  const rightFoot=point(343+cast*13,607);
  const leftLeg=ik(leftHip,leftFoot,86,88,1);
  const rightLeg=ik(rightHip,rightFoot,86,88,-1);
  const idleHand=point(344,383), loadedHand=point(335,319);
  let handTarget=blend(idleHand,loadedHand,ramp(p,.04,.27));
  handTarget=blend(handTarget,point(473,311),extend);
  handTarget=blend(handTarget,point(460,328),follow*.72);
  handTarget=blend(handTarget,idleHand,recover);
  const rightArm=ik(rightShoulder,handTarget,73,68,1);
  const leftArm=ik(leftShoulder,point(239-cast*7,423+load*3),74,65,1);
  const wandAngle=mix(mix(-.58,-1.08,ramp(p,.06,.27)),-.17,extend)+follow*.06;
  const finalWandAngle=mix(wandAngle,-.58,recover);
  const rightHand=rightArm.end, leftHand=leftArm.end;
  // The wand is painted inside the very same hand-local matrix used here.
  const wandTip=add(rightHand,rotate(point(86,0),finalWandAngle));
  const aim=rotate(point(1,0),finalWandAngle);
  const beamLength=Math.min(174,(690-wandTip.x)/Math.max(.25,aim.x));
  const effectTarget=add(wandTip,mul(aim,Math.max(8,beamLength)*mix(.04,1,ramp(p,.5,.585))));
  const power=windowed(p,.49,.51,.7,.79);
  const head=local(point(6,-177));
  const headAngle=torsoAngle-cast*.026;
  const tail=cast*19+follow*7;
  const defs=`<defs>
    <linearGradient id="${key}-robe" x1="0" x2="1" y1="0" y2=".65"><stop stop-color="#303a55"/><stop offset=".48" stop-color="#172238"/><stop offset="1" stop-color="#080e20"/></linearGradient>
    <linearGradient id="${key}-sleeve" x1="0" x2=".25" y1="0" y2="1"><stop stop-color="#35435e"/><stop offset=".55" stop-color="#1c2940"/><stop offset="1" stop-color="#101728"/></linearGradient>
    <linearGradient id="${key}-skin" x1="0" x2="1" y1="0" y2=".8"><stop stop-color="#ffe0be"/><stop offset=".65" stop-color="#efba92"/><stop offset="1" stop-color="#c9856c"/></linearGradient>
    <linearGradient id="${key}-scarf" x1="0" x2="1"><stop stop-color="#a52735"/><stop offset=".48" stop-color="#e1514c"/><stop offset="1" stop-color="#702132"/></linearGradient>
    <linearGradient id="${key}-red" x1="0" x2="1"><stop stop-color="#fff0de"/><stop offset=".09" stop-color="#ff674d"/><stop offset=".58" stop-color="#f62143"/><stop offset="1" stop-color="#a9143c" stop-opacity=".1"/></linearGradient>
    <radialGradient id="${key}-flare"><stop stop-color="#fff5d8"/><stop offset=".14" stop-color="#ffb198"/><stop offset=".4" stop-color="#ff4b51" stop-opacity=".7"/><stop offset="1" stop-color="#ff173d" stop-opacity="0"/></radialGradient>
  </defs>`;

  const shoes=(foot:V,back=false)=>group(
    path('M-12 -9 Q-3 -12 9 -7 L16 2 Q28 0 34 9 L35 15 Q13 20 -16 15 L-18 7 Z',back?'#151d2a':'#202a39','#080d1c',3)
    +path('M-16 12 Q10 17 34 12 L35 17 Q11 21 -17 17 Z','#080b13','#080b13',1)
    +path('M2 -5 L14 2 L8 9 L-2 4 Z','#344156','none',0)
    +line(point(3,1),point(13,4),'#7a8390',1.2)
    +line(point(0,5),point(10,8),'#788190',1.2)
    +path('M18 7 Q27 5 31 10','none','#718095',1.2),foot);
  const legs=limb(leftLeg.origin,leftLeg.joint,leftLeg.end,19,13,'#1a2337','#070c18')
    +limb(rightLeg.origin,rightLeg.joint,rightLeg.end,19,13,'#28334b','#11182b')
    +line(add(rightLeg.origin,point(5,0)),add(rightLeg.joint,point(5,-5)),'#64728a',1.2,'opacity=".48"')
    +line(add(rightLeg.joint,point(4,6)),add(rightLeg.end,point(4,-15)),'#64728a',1.2,'opacity=".4"')
    +shoes(leftLeg.end,true)+shoes(rightLeg.end);
  const rearSleeve=limb(leftArm.origin,leftArm.joint,leftArm.end,25,14,`url(#${key}-sleeve)`,'#060d1a')
    +segment(add(leftHand,point(-5,-8)),add(leftHand,point(4,0)),15,13,'#491f31','#111728',2)
    +group(path('M-10 -2 Q-11 4 -5 11 L1 16 Q7 17 9 11 L10 2 Q5 -7 -1 -8 Z',`url(#${key}-skin)`,'#472f33',2)
      +line(point(-3,5),point(2,12),'#b67964',1.1)
      +line(point(3,4),point(6,10),'#b67964',1.1),leftHand,-.14);

  const robe=group(
    // The silhouette includes the shoulders, sides, and flowing hem in one path.
    path(`M-34 -119 Q-57 -109 -52 -82 L-53 11 Q-63 82 -72 145 Q-36 163 -11 137 L-6 6 L21 9 L24 144 Q49 161 ${76+tail} 139 Q${56+tail} 82 47 23 L48 -85 Q50 -110 30 -120 L12 -112 L-7 -113 Z`, `url(#${key}-robe)`,'#0a1020',3.4)
    +path(`M-47 -94 Q-38 -56 -40 15 Q-45 94 -57 143 L-32 142 Q-18 79 -21 25 L-25 -73 Z`,'#35415a','none',0,'opacity=".65"')
    +path(`M32 -88 L32 5 Q${48+tail*.55} 80 ${65+tail} 139 L44 136 Q29 82 22 18 L20 -69 Z`,'#090e1e','none',0,'opacity=".9"')
    +path(`M-54 94 Q-43 107 -30 97 M38 93 Q${48+tail*.4} 84 ${61+tail*.75} 108 M-59 128 Q-48 136 -38 127`,'none','#59647a',1.4,'opacity=".45"')
    +path('M-18 -112 L12 -115 L32 -79 L28 -4 Q3 7 -22 -2 L-26 -74 Z','#d6dce4','#11192b',2.5)
    +path('M-19 -101 L-6 -115 L7 -100 L-5 -80 Z','#f2f2ee','#778594',1.5)
    +path('M7 -100 L16 -115 L28 -99 L15 -80 Z','#f2f2ee','#778594',1.5)
    +path('M5 -98 L14 -98 L15 -84 L11 -78 L17 -33 L8 -20 L1 -34 L7 -79 L2 -86 Z','#b73340','#4a2331',1.8)
    +path('M5 -78 L12 -71 M4 -63 L14 -53 M5 -44 L15 -34','none','#e7bb5a',3.5)
    +path('M-29 -115 L-12 -113 L-19 -52 L-34 -65 L-28 -78 L-38 -84 Z','#273750','#0c1428',2)
    +path('M27 -115 L14 -111 L23 -50 L37 -69 L30 -79 L40 -85 Z','#1b2944','#0c1428',2)
    +path('M-33 -90 L-26 -78 L-32 -65 L-19 -52 M34 -94 L30 -80 L36 -69 L25 -54','none','#8f7350',1.3,'opacity=".75"')
    // A small embroidered lion crest, deliberately made from vector strokes.
    +group(path('M-8 -10 L7 -10 L9 1 Q7 9 0 13 Q-8 9 -10 1 Z','#a32d37','#d7ac5e',1.4)
      +path('M-4 0 Q-6 -6 0 -5 Q5 -5 3 -1 L0 0 L4 4 L1 8 L-2 4 L-6 7 M0 -3 L5 -6','none','#f1c86e',1.3),point(-36,-56))
    +path('M-37 -22 L-23 -19 M-38 -16 L-24 -13','none','#071020',1.4)
    +path('M-14 -1 Q2 6 20 0','none','#738091',1,'opacity=".65"')
    ,root,torsoAngle);

  const frontSleeve=limb(rightArm.origin,rightArm.joint,rightHand,25,13,`url(#${key}-sleeve)`,'#0a1124')
    +line(add(rightArm.origin,point(4,-9)),add(rightArm.joint,point(3,-8)),'#7c8ba2',1.5,'opacity=".55"')
    +line(add(rightArm.joint,point(3,-7)),add(rightHand,point(-7,-5)),'#7c8ba2',1.3,'opacity=".4"')
    +group(path('M-15 -14 L-4 -13 L-4 13 L-15 15 Z','#7f2936','#0a1124',2)
      +line(point(-10,-12),point(-10,13),'#d5ae66',2),rightHand,finalWandAngle);

  const neckAndScarf=group(
    path('M-9 -155 L17 -155 L20 -123 L11 -114 L-8 -120 Z',`url(#${key}-skin)`,'#442a2a',2)
    +path('M-9 -139 Q4 -133 18 -139 L19 -128 Q6 -122 -8 -127 Z','#c28670','none',0)
    +path('M-17 -132 Q0 -141 23 -130 L21 -113 Q3 -107 -17 -118 Z',`url(#${key}-scarf)`,'#4c2236',2)
    +path('M-12 -131 L-7 -115 M0 -135 L4 -111 M13 -133 L15 -113','none','#e8b65c',5)
    +path('M-10 -116 Q-20 -88 -26 -51 L-7 -45 Q4 -77 1 -110 Z',`url(#${key}-scarf)`,'#4c2236',2)
    +path('M-15 -102 L1 -95 M-20 -81 L-3 -74 M-24 -61 L-8 -55','none','#f0bd65',5)
    +path('M-26 -49 L-27 -42 M-22 -48 L-22 -40 M-18 -47 L-18 -39 M-14 -46 L-15 -39 M-10 -45 L-12 -38','none','#cfa665',1.8)
    +path('M-7 -117 Q1 -123 8 -116','none','#f59d79',1.2,'opacity=".6"'),root,torsoAngle);

  const face=group(
    ellipse(point(-28,10),8,13,`url(#${key}-skin)`)
    +path('M-29 -17 Q-36 4 -25 25 Q-14 42 5 44 Q24 40 32 21 L33 10 L38 8 L34 -5 Q34 -20 23 -28 Z',`url(#${key}-skin)`,'#352329',2.5)
    +path('M-27 6 Q-23 22 -12 28 L-12 36 Q-24 29 -28 15 Z','#c78a75','none',0,'opacity=".65"')
    +path('M15 19 Q21 15 28 19 Q25 23 17 24 Z','#e69f89','none',0,'opacity=".65"')
    +path('M-31 4 Q-25 -1 -25 13 L-28 16','none','#ad705f',1.5)
    +path('M11 -2 L16 13 L24 15','none','#a86d60',1.5)
    +path('M24 15 L28 13','none','#7c524c',1.2)
    +path('M0 29 Q9 26 17 28','none','#754548',1.6)
    +path('M3 33 Q10 35 14 32','none','#cd977e',1.3)
    +path('M-22 -9 Q-14 -15 -4 -10 M11 -11 Q19 -16 29 -10','none','#2c2330',2.8)
    +path('M-20 -2 Q-13 -8 -5 -2 Q-11 2 -18 1 Z','#fff3dd','#5c4142',1.2)
    +path('M13 -2 Q20 -7 28 -2 Q22 3 15 1 Z','#fff3dd','#5c4142',1.2)
    +ellipse(point(-9,-2),3.1,4.1,'#4d715e')+circle(point(-8,-2),1.8,'#152526')+circle(point(-7,-3.3),.8,'#fff')
    +ellipse(point(23,-2),3.1,4.1,'#4d715e')+circle(point(24,-2),1.8,'#152526')+circle(point(25,-3.3),.8,'#fff')
    // Round spectacles retain their bridge and arms on every head transform.
    +circle(point(-13,-1),13.1,'#a9e5ee','#191c2c',2.6,'fill-opacity=".08"')
    +circle(point(21,-1),13.1,'#a9e5ee','#191c2c',2.6,'fill-opacity=".08"')
    +path('M0 -2 Q4 -6 8 -2 M-26 -3 L-30 -5 M34 -4 L36 -5','none','#191c2c',2.5)
    +path('M-21 -7 Q-16 -11 -10 -10 M13 -7 Q19 -11 25 -10','none','#e7f8ff',1.6,'opacity=".55"')
    +path('M-31 4 Q-43 -7 -36 -24 L-42 -28 L-32 -33 L-34 -43 L-21 -39 L-13 -50 L-5 -44 L6 -53 L11 -43 L25 -47 L23 -39 Q42 -29 33 -10 L26 -21 L17 -17 L11 -31 L3 -18 L-5 -25 L-15 -13 L-21 -22 L-27 -12 Z','#181824','#080e1b',2.8)
    +path('M-31 -27 Q-21 -37 -13 -31 M-10 -39 Q-3 -42 2 -35 M9 -39 Q20 -37 24 -30 M-22 -19 L-17 -26','none','#454356',2,'opacity=".7"')
    +path('M10 -27 L5 -20 L11 -20 L7 -13','none','#aa5d59',1.6)
    +path('M-30 -8 Q-27 -13 -24 -16','none','#393748',2)
    ,head,headAngle);

  const handAndWand=group(
    // Finger silhouette wraps the handle; fingers and wand share one matrix.
    path('M-10 -9 Q-6 -17 0 -14 L6 -11 L14 -7 L13 5 Q10 13 2 13 L-8 8 Z',`url(#${key}-skin)`,'#553538',2.1)
    +path('M0 -3 L86 0 L0 3 Z','#4c2a26','#1c1620',1.4)
    +path('M0 -3 L19 -2 L19 2 L0 3 Z','#78503b','#34252a',1.3)
    +line(point(22,-1),point(84,-.15),'#cf9b6d',.9)
    +path('M-3 -11 Q3 -14 6 -7 L7 -1 Q5 3 1 1 L-2 -5 Z','#f7c9a2','#985f54',1.4)
    +path('M3 3 Q9 0 12 3 L11 6 L4 8 Z','#f3bb94','#985f54',1.2)
    +path('M1 8 Q7 5 10 8 L8 11 L2 12 Z','#eeb28c','#985f54',1.1)
    +line(point(8,-2),point(16,-2),'#ab7a51',1.3)
    ,rightHand,finalWandAngle);

  const charge=windowed(p,.29,.46,.49,.515);
  let magic='';
  if(charge>.001) {
    magic+=circle(wandTip,7+charge*7,`url(#${key}-flare)`,'none',0,`opacity="${n(charge*.78)}"`)
      +circle(wandTip,3+charge*2,'#ffb5a0','none',0,`opacity="${n(charge)}"`);
  }
  if(power>.001) {
    const across=perpendicular(aim), distance=sub(effectTarget,wandTip);
    let bolt=`M${xy(wandTip)}`;
    for(let i=1;i<=8;i++) {
      const along=add(wandTip,mul(distance,i/8));
      const ripple=Math.sin(i*2.1+p*29)*Math.sin(i/8*Math.PI)*6*power;
      bolt+=` L${xy(add(along,mul(across,ripple)))}`;
    }
    magic+=`<g opacity="${n(power)}">`
      +line(wandTip,effectTarget,'#df1b48',34,'opacity=".08"')
      +line(wandTip,effectTarget,'#ff2845',18,'opacity=".18"')
      +line(wandTip,effectTarget,`url(#${key}-red)`,8)
      +path(bolt,'none','#ffccc0',2.3)
      +circle(wandTip,31,`url(#${key}-flare)`)
      +circle(wandTip,5.2,'#fff2d3')
      +circle(effectTarget,19,`url(#${key}-flare)`);
    // Every ember derives from p and remains inside the spell's swept corridor.
    for(let i=0;i<9;i++) {
      const travel=((p-.5)*2.7+i*.113)%1;
      const t=clamp(travel), side=Math.sin(i*2.4+p*17)*13*Math.sin(t*Math.PI);
      const ember=add(add(wandTip,mul(distance,t)),mul(across,side));
      magic+=line(sub(ember,mul(aim,5+i%3)),ember,i%3?'#ff634f':'#ffe1be',1.1+i%2,`opacity="${n((1-t)*.85)}"`);
    }
    // A brief radial burst is centered precisely on the tip, never on the wrist.
    const flash=1-ramp(p,.52,.585);
    for(let i=0;i<8;i++) {
      const ray=rotate(point(1,0),i*Math.PI/4+p*2);
      magic+=line(add(wandTip,mul(ray,9)),add(wandTip,mul(ray,14+flash*14)),'#ff9b82',1.5,`opacity="${n(flash*.8)}"`);
    }
    magic+='</g>';
  }
  const reflected=power>.01?`<g opacity="${n(power*.17)}">`
    +line(rightArm.joint,rightHand,'#ff5b61',3)
    +path(`M${xy(local(point(42,-80)))} Q${xy(local(point(43,-39)))} ${xy(local(point(37,13)))}`,'none','#ff5360',3)
    +'</g>':'';
  const markup=defs+floor(key,300,625,126,.55)
    +ellipse(point(305,617),101,5,'#9b2c53',`opacity="${n(power*.15)}"`)
    +legs+rearSleeve+robe+frontSleeve+neckAndScarf+face+handAndWand+reflected+magic;
  return {
    markup,
    anchors:{head,leftShoulder,rightShoulder,leftElbow:leftArm.joint,rightElbow:rightArm.joint,
      leftHand,rightHand,wandBase:rightHand,wandTip,effectOrigin:wandTip,effectTarget,
      leftHip,rightHip,leftKnee:leftLeg.joint,rightKnee:rightLeg.joint,
      leftFoot:leftLeg.end,rightFoot:rightLeg.end},
    phase:p<.28?'Gathering focus':p<.5?'Extending the wand':p<.7?'Red spell':p<.87?'Follow-through':'Returning to ready',
    bones:[bone('left upper arm',leftShoulder,leftArm.joint),bone('left forearm',leftArm.joint,leftHand),
      bone('right upper arm',rightShoulder,rightArm.joint),bone('right forearm',rightArm.joint,rightHand),
      bone('left thigh',leftHip,leftLeg.joint),bone('left shin',leftLeg.joint,leftLeg.end),
      bone('right thigh',rightHip,rightLeg.joint),bone('right shin',rightLeg.joint,rightLeg.end)],
  };
}
