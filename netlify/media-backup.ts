import type {StoreDocument} from '../lib/cms-model';
import {scenesFor} from '../lib/scenes';
import {makeZip,type ZipEntry} from './export-package';

/** Public content only. Customer photos and records never enter a site backup. */
export async function downloadMediaBackup(doc:StoreDocument){
 const sources=[...new Set([...doc.products.map(p=>p.image||''),...doc.games.map(g=>g.image),...doc.pages.flatMap(p=>p.blocks.map(b=>b.image)),...Object.values(doc.settings.editorial),...scenesFor(doc).flatMap(s=>[s.poster,s.asset])].filter(Boolean))];
 const entries:ZipEntry[]=[],manifest:{url:string;file:string;mime:string;bytes:number}[]=[];
 for(let i=0;i<sources.length;i++){
  const url=sources[i],response=await fetch(url);
  if(!response.ok)throw new Error('Backup stopped: could not read '+url+'. No incomplete backup has been downloaded.');
  const bytes=new Uint8Array(await response.arrayBuffer()),mime=response.headers.get('content-type')||'application/octet-stream';
  const file='media/'+String(i+1).padStart(3,'0')+(mime.includes('png')?'.png':mime.includes('jpeg')?'.jpg':mime.includes('webp')?'.webp':url.endsWith('.glb')?'.glb':'.bin');
  entries.push({name:file,bytes});manifest.push({url,file,mime,bytes:bytes.byteLength});
 }
 const encoder=new TextEncoder();
 entries.push({name:'content.json',bytes:encoder.encode(JSON.stringify(doc,null,2))},{name:'media-manifest.json',bytes:encoder.encode(JSON.stringify(manifest,null,2))},{name:'RESTORE.txt',bytes:encoder.encode('Restore content.json with Store Manager. On a different hosted instance, upload the image files using Images and update each URL according to media-manifest.json before publishing. Animated models belong in the source public/characters directory; image upload does not create a rig. The Netlify package exporter automatically bundles published public uploads. Customer records and private photos are intentionally excluded.')});
 const zip=makeZip(entries),object=URL.createObjectURL(new Blob([zip as BlobPart],{type:'application/zip'})),a=document.createElement('a');a.href=object;a.download='GAME-FROST-Content-and-Media-Backup.zip';a.click();setTimeout(()=>URL.revokeObjectURL(object),30000);
}
