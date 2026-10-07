'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,Pause,RotateCcw,ArrowRight,ChevronRight} from 'lucide-react';
import {useContent} from './content';
import Link from './link';
import {scenesFor,type CharacterScene} from '@/lib/scenes';
import type {SceneController} from './character-stage';
import './journey.css';

function Performance({record}:{record:CharacterScene}){
 const host=useRef<HTMLDivElement>(null),controller=useRef<SceneController|null>(null),frame=useRef(0),progressRef=useRef(0);
 const [loaded,setLoaded]=useState(false),[status,setStatus]=useState('poster'),[progress,setProgress]=useState(0),[playing,setPlaying]=useState(false),[reduced,setReduced]=useState(false);
 const [visible,setVisible]=useState(true),[background,setBackground]=useState(false);
 const video=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setReduced(m.matches||document.documentElement.dataset.motion==='off');if(m.matches)setPlaying(false)};update();m.addEventListener('change',update);window.addEventListener('gf-motion',update);
 const visibility=()=>{setBackground(document.hidden);if(document.hidden)setPlaying(false)};document.addEventListener('visibilitychange',visibility);
 const io=new IntersectionObserver(([e])=>{setVisible(e.isIntersecting);if(!e.isIntersecting)setPlaying(false)});if(host.current)io.observe(host.current);
 return()=>{m.removeEventListener('change',update);window.removeEventListener('gf-motion',update);document.removeEventListener('visibilitychange',visibility);io.disconnect()}},[]);
 useEffect(()=>{if(!loaded||record.renderer!=='gltf')return;let cancelled=false;setStatus('loading');
 const lose=()=>{setPlaying(false);setStatus('error');controller.current?.dispose();controller.current=null};host.current?.addEventListener('gf-context-lost',lose);
 import('./character-stage').then(m=>{if(cancelled||!host.current)return;return m.mountCharacter(host.current,record)}).then(c=>{if(!c)return;if(cancelled){c.dispose();return}controller.current=c;c.seek(progressRef.current);setStatus('ready')}).catch(()=>{if(!cancelled){setStatus('error');setPlaying(false)}});
 return()=>{cancelled=true;cancelAnimationFrame(frame.current);host.current?.removeEventListener('gf-context-lost',lose);controller.current?.dispose();controller.current=null};
 },[loaded,record.asset,record.clip,record.renderer]);
 function seek(p:number){progressRef.current=p;setProgress(p);controller.current?.seek(p);if(video.current&&Number.isFinite(video.current.duration))video.current.currentTime=p*video.current.duration}
 useEffect(()=>{if(!playing)return;if(reduced||!visible||background||status!=='ready'){setPlaying(false);return}let last=0;
 const tick=(time:number)=>{if(!last)last=time;const p=Math.min(1,progressRef.current+(time-last)/1000/record.duration);last=time;seek(p);if(p<1)frame.current=requestAnimationFrame(tick);else setPlaying(false)};
 frame.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame.current);
 },[playing,reduced,visible,background,status,record.duration]);
 const playable=record.status==='ready'&&record.active;
 return <div className="journey-performance">
  <div className="journey-stage" data-status={status} ref={host}>
   {record.poster&&status!=='ready'&&<img className="journey-poster" src={record.poster} alt={record.name+' ready pose'} width="800" height="900" fetchPriority="high"/>}
   {!playable&&<div className="journey-pending"><span className="journey-outline" aria-hidden="true">{record.id==='goku'?'UI':record.id==='spider-man'?'02':record.id==='harry-potter'?'04':'05'}</span><p>{record.active?'Character artwork awaits the supplied scene.':'This performance is paused by the store owner.'}</p><small>No replacement character has been used.</small></div>}
   {loaded&&record.renderer==='video'&&<video ref={video} src={record.asset} poster={record.poster} playsInline muted preload="metadata" onLoadedMetadata={()=>setStatus('ready')} onError={()=>setStatus('error')} aria-label={record.name+' performance'}/>}
   {status==='loading'&&<span className="journey-status" role="status">Loading character… Shopping stays available.</span>}
   {status==='error'&&<span className="journey-status" role="status">Motion could not load. You can still shop.</span>}
  </div>
  {playable&&record.renderer!=='poster'&&<div className="journey-controls">
   {!loaded?<button className="btn cyan" onClick={()=>setLoaded(true)}><Play size={17}/> Load performance</button>:<>
    <button className="icon-btn" aria-label={playing?'Pause performance':progress>=1?'Replay performance':'Play performance'} disabled={status!=='ready'||reduced} onClick={()=>{if(progress>=1)seek(0);setPlaying(!playing)}}>{playing?<Pause size={18}/>:<Play size={18}/>}</button>
    <input aria-label="Animation progress" type="range" min="0" max="1" step="0.001" value={progress} disabled={status!=='ready'} onChange={e=>{setPlaying(false);seek(Number(e.target.value))}}/>
    <button className="icon-btn" aria-label="Reset to ready pose" disabled={status!=='ready'} onClick={()=>{setPlaying(false);seek(0)}}><RotateCcw size={18}/></button>
    <span className="journey-time">{(progress*record.duration).toFixed(1)} / {record.duration}s</span>
   </>}
   {reduced&&<small>Reduced motion · use the slider to inspect poses.</small>}
  </div>}
 </div>
}
export function Journey(){const{document}=useContent();const scenes=scenesFor(document);const[index,setIndex]=useState(0);const record=scenes[index];
 return <section className="journey" id="showroom" style={{'--scene-accent':record.accent} as React.CSSProperties} aria-label="GAME FROST character journey">
  <div className="shell journey-top"><span className="eyebrow">GAME FROST / PLAYER SELECT</span><Link href="/shop" className="text-link">Skip to the store <ArrowRight size={15}/></Link></div>
  <div className="shell journey-layout">
   <div className="journey-copy"><div className="journey-chapter"><span>{String(index+1).padStart(2,'0')}</span> / 05 · {record.name}</div>
    <h1>{record.title}</h1><p>{record.copy}</p><div className="action-row"><Link className="btn" href={record.href}>{record.cta} <ArrowRight size={17}/></Link><Link className="text-link" href="/shop">All products</Link></div>
    <div className="journey-detail"><span>ORIGINAL SEALS</span><span>CONSOLES · GAMES · GEAR</span><span>KARACHI, PK</span></div>
    {record.status==='asset-needed'&&<p className="journey-review-note">Integration preview: the accepted {record.name} assets were not included in the supplied website archive. This chapter remains unfinished.</p>}
   </div>
   <Performance key={record.id} record={record}/>
  </div>
  <nav className="shell journey-nav" aria-label="Character chapters">{scenes.map((s,i)=><button key={s.id} aria-current={i===index?'step':undefined} onClick={()=>setIndex(i)}><small>{String(i+1).padStart(2,'0')}</small><span>{s.name}</span>{i===index&&<ChevronRight size={16}/>}</button>)}</nav>
  <div className="shell journey-next"><span>Choose a chapter. Keep scrolling to shop.</span><button onClick={()=>setIndex((index+1)%5)} className="text-link">Next chapter <ArrowRight size={16}/></button></div>
 </section>
}
