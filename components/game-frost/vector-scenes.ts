import {renderGoku} from './vector-goku';
import {renderSpiderMan} from './vector-spiderman';
import {renderHarry} from './vector-harry';
import {renderRonaldo} from './vector-ronaldo';
import type {VectorFrame} from './vector-helpers';
import type {CharacterId} from '@/lib/scenes';
export const vectorIds=['goku','spider-man','harry-potter','ronaldo'] as const;
export function vectorFrame(id:CharacterId,progress:number,prefix='gf-vector'):VectorFrame{
 const p=Math.max(0,Math.min(1,progress));
 if(id==='goku')return renderGoku(p,prefix);
 if(id==='spider-man')return renderSpiderMan(p,prefix);
 if(id==='harry-potter')return renderHarry(p,prefix);
 if(id==='ronaldo')return renderRonaldo(p,prefix);
 throw new Error('This character uses its supplied 3D performance.');
}
export function vectorSVG(id:CharacterId,progress:number,prefix='gf-vector'){
 const frame=vectorFrame(id,progress,prefix);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 700" fill="none" role="img" aria-label="${id} illustrated performance">${frame.markup}</svg>`;
}
