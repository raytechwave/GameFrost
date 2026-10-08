import type {CharacterScene} from '@/lib/scenes';
import type {SceneController} from './character-stage';
import {vectorFrame} from './vector-scenes';
let nextStage=0;
/** Original connected vector anatomy, driven by the shared scroll/play clock. */
export function mountVector(host:HTMLElement,record:CharacterScene):SceneController{
 const prefix='gf-vector-'+(++nextStage),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 760 700');svg.setAttribute('role','img');svg.setAttribute('aria-label',record.name+' animated 2D character');
 svg.setAttribute('class','journey-vector');svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:hidden';
 let disposed=false,last=-1;
 const seek=(value:number)=>{if(disposed)return;const progress=Math.max(0,Math.min(1,value));if(progress===last)return;last=progress;
  const frame=vectorFrame(record.id,progress,prefix);svg.innerHTML=frame.markup;
  svg.dataset.progress=String(progress);svg.dataset.phase=frame.phase;svg.dataset.anchors=JSON.stringify(frame.anchors);svg.dataset.bones=JSON.stringify(frame.bones??[]);
  if(frame.contact)svg.dataset.contact=JSON.stringify(frame.contact);else delete svg.dataset.contact;
 };
 host.appendChild(svg);seek(0);
 return{seek,dispose(){disposed=true;svg.remove()}};
}
