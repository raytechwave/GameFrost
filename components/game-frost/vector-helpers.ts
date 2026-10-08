/** Pure vector drawing/motion helpers. Every frame derives from one progress. */
export type V = {x:number;y:number};
export type VectorFrame = {
 markup:string;
 anchors:Record<string,V>;
 phase:string;
 bones?:Array<{name:string;a:V;b:V;length:number}>;
 contact?:{foot:V;ball:V;radius:number;released:boolean};
};
export const point=(x:number,y:number):V=>({x,y});
export const add=(a:V,b:V):V=>point(a.x+b.x,a.y+b.y);
export const sub=(a:V,b:V):V=>point(a.x-b.x,a.y-b.y);
export const mul=(a:V,k:number):V=>point(a.x*k,a.y*k);
export const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const blend=(a:V,b:V,t:number):V=>point(mix(a.x,b.x,t),mix(a.y,b.y,t));
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=(t:number)=>{t=clamp(t);return t*t*(3-2*t)};
export const ramp=(p:number,a:number,b:number)=>ease((p-a)/(b-a));
export const windowed=(p:number,a:number,b:number,c:number,d:number)=>ramp(p,a,b)*(1-ramp(p,c,d));
export const n=(x:number)=>Number(x.toFixed(3));
export const xy=(v:V)=>`${n(v.x)} ${n(v.y)}`;
export const length=(v:V)=>Math.hypot(v.x,v.y);
export const unit=(v:V):V=>mul(v,1/(length(v)||1));
export const perpendicular=(v:V):V=>point(-v.y,v.x);
export const rotate=(v:V,radians:number):V=>point(v.x*Math.cos(radians)-v.y*Math.sin(radians),v.x*Math.sin(radians)+v.y*Math.cos(radians));
export function ik(origin:V,target:V,upper:number,lower:number,bend=1){
 const delta=sub(target,origin),distance=clamp(length(delta),Math.abs(upper-lower)+.01,upper+lower-.01),direction=unit(delta);
 const cos=clamp((upper*upper+distance*distance-lower*lower)/(2*upper*distance),-1,1);
 const along=upper*cos,across=upper*Math.sqrt(Math.max(0,1-cos*cos))*bend;
 const joint=add(origin,add(mul(direction,along),mul(perpendicular(direction),across)));
 const end=add(origin,mul(direction,distance));
 return{origin,joint,end};
}
export function path(d:string,fill:string,stroke='#101323',width=3,extra=''){return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`}
export const line=(a:V,b:V,color:string,width=3,extra='')=>`<path d="M${xy(a)} L${xy(b)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
export const circle=(c:V,r:number,fill:string,stroke='none',width=2,extra='')=>`<circle cx="${n(c.x)}" cy="${n(c.y)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
export const ellipse=(c:V,rx:number,ry:number,fill:string,extra='')=>`<ellipse cx="${n(c.x)}" cy="${n(c.y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" ${extra}/>`;
export const group=(markup:string,origin:V,angle=0)=>`<g transform="translate(${xy(origin)}) rotate(${n(angle*180/Math.PI)})">${markup}</g>`;
export function segment(a:V,b:V,ra:number,rb:number,fill:string,stroke='#101323',width=3){
 const direction=unit(sub(b,a)),side=perpendicular(direction);
 const a1=add(a,mul(side,ra)),a2=sub(a,mul(side,ra)),b1=add(b,mul(side,rb)),b2=sub(b,mul(side,rb));
 return path(`M${xy(a1)} L${xy(b1)} Q${xy(add(b,mul(direction,rb)))} ${xy(b2)} L${xy(a2)} Q${xy(sub(a,mul(direction,ra)))} ${xy(a1)} Z`,fill,stroke,width);
}
/** Connected silhouettes are drawn from joint coordinates, never image cutouts. */
export function limb(a:V,b:V,c:V,upperWidth:number,lowerWidth:number,fill:string,shadow:string){
 const base=segment(a,b,upperWidth,lowerWidth+2,fill)+segment(b,c,lowerWidth+2,lowerWidth,fill)+circle(b,lowerWidth+1,fill);
 const side=mul(perpendicular(unit(sub(c,a))),-upperWidth*.42);
 return base+`<path d="M${xy(add(a,side))} Q${xy(add(b,side))} ${xy(add(c,side))}" fill="none" stroke="${shadow}" stroke-width="${Math.max(3,lowerWidth*.4)}" stroke-linecap="round" opacity=".55"/>`;
}
export function floor(id:string,x=300,ground=625,rx=120,opacity=.45){return `<defs><radialGradient id="${id}-floor"><stop stop-color="#030713" stop-opacity="${opacity}"/><stop offset="1" stop-color="#030713" stop-opacity="0"/></radialGradient></defs>`+ellipse(point(x,ground),rx,18,`url(#${id}-floor)`)};
export function effectBeam(origin:V,end:V,id:string,color:string,width:number,opacity:number){
 return `<g opacity="${n(opacity)}"><defs><linearGradient id="${id}-beam"><stop stop-color="${color}" stop-opacity=".85"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>`+line(origin,end,`url(#${id}-beam)`,width*3.2)+line(origin,end,color,width)+line(origin,end,'#ffffff',Math.max(2,width*.3))+circle(origin,width*1.1,'#ffffff')+circle(origin,width*1.55,color,'none',0,'opacity=".32"')+'</g>';
}
export function bone(name:string,a:V,b:V){return{name,a,b,length:length(sub(b,a))}};
