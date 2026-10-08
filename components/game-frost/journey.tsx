'use client';
import {useEffect,useRef,useState} from 'react';
import {Play,Pause,RotateCcw,ArrowRight,ChevronRight} from 'lucide-react';
import {useContent} from './content';
import Link from './link';
import {scenesFor,type CharacterScene} from '@/lib/scenes';
import type {SceneController} from './character-stage';
import './journey.css';

function Performance({record,scrollProgress}:{record:CharacterScene;scrollProgress:number|null}){
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
 // Native scrolling and manual playback use the same deterministic pose controller.
 useEffect(()=>{if(scrollProgress===null||reduced)return;setPlaying(false);seek(scrollProgress)},[scrollProgress,reduced,status]);
 useEffect(()=>{if(scrollProgress===null||reduced||record.status!=='ready'||!record.active||record.renderer==='poster')return;const connection=(navigator as any).connection;if(connection?.saveData||/2g/.test(connection?.effectiveType||''))return;setLoaded(true)},[scrollProgress!==null,reduced,record.status,record.active,record.renderer]);
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
export function Journey(){const{document:content}=useContent();const scenes=scenesFor(content);const[index,setIndex]=useState(0);const record=scenes[index];
 const root=useRef<HTMLElement>(null),panel=useRef<HTMLDivElement>(null),step=useRef(1),headerHeight=useRef(80),scrollFrame=useRef(0);
 const [progress,setProgress]=useState(0),[scrolling,setScrolling]=useState(false),[trackHeight,setTrackHeight]=useState<number>(),[top,setTop]=useState(80);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');let enabled=false;
  const update=()=>{scrollFrame.current=0;if(!enabled||!root.current)return;const distance=Math.max(0,headerHeight.current-root.current.getBoundingClientRect().top);const position=Math.min(5,distance/step.current+.001);const chapter=Math.min(4,Math.floor(position));const local=position-chapter;setIndex(chapter);setProgress(Math.round(Math.max(0,Math.min(1,(local-.08)/.8))*10000)/10000);document.documentElement.dataset.journeyActive=distance<step.current*5?'true':'false'};
  const queue=()=>{if(!scrollFrame.current)scrollFrame.current=requestAnimationFrame(update)};
  const measure=()=>{if(!panel.current)return;const header=document.querySelector('.site-header');const height=header?.getBoundingClientRect().height??80;headerHeight.current=height;setTop(height);document.documentElement.style.setProperty('--gf-header-height',`${height}px`);const available=window.innerHeight-height;const motionOff=media.matches||document.documentElement.dataset.motion==='off';const fits=available>=600&&panel.current.scrollHeight<=available+2;enabled=!motionOff&&fits;step.current=Math.max(600,window.innerHeight*.95);setScrolling(enabled);setTrackHeight(enabled?panel.current.offsetHeight+step.current*5:undefined);if(!enabled)delete document.documentElement.dataset.journeyActive;queue()};
  const ro=new ResizeObserver(measure);if(panel.current)ro.observe(panel.current);const header=document.querySelector('.site-header');if(header)ro.observe(header);
  window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',measure);window.addEventListener('gf-motion',measure);media.addEventListener('change',measure);measure();
  return()=>{ro.disconnect();cancelAnimationFrame(scrollFrame.current);window.removeEventListener('scroll',queue);window.removeEventListener('resize',measure);window.removeEventListener('gf-motion',measure);media.removeEventListener('change',measure);delete document.documentElement.dataset.journeyActive;document.documentElement.style.removeProperty('--gf-header-height')};
 },[]);
 function choose(chapter:number){if(scrolling&&root.current){const start=window.scrollY+root.current.getBoundingClientRect().top-headerHeight.current;window.scrollTo({top:start+step.current*(chapter+.001),behavior:'instant'})}else{setIndex(chapter);setProgress(0)}}
 return <section ref={root} className={`journey ${scrolling?'is-scroll':''}`} id="character-journey" data-chapter={record.id} data-progress={progress} style={{'--scene-accent':record.accent,'--journey-top':`${top}px`,height:trackHeight} as React.CSSProperties} aria-label="GAME FROST character journey">
  <div ref={panel} className="journey-panel">
  <div className="shell journey-top"><span className="eyebrow">GAME FROST / FIVE CHAPTERS</span><Link href="#showroom" className="text-link">Enter the 3D store <ArrowRight size={15}/></Link></div>
  <div className="shell journey-layout">
   <div className="journey-copy"><div className="journey-chapter"><span>{String(index+1).padStart(2,'0')}</span> / 05 · {record.name}</div>
    <h1>{record.title}</h1><p>{record.copy}</p><div className="action-row"><Link className="btn" href={record.href}>{record.cta} <ArrowRight size={17}/></Link><Link className="text-link" href="/shop">All products</Link></div>
    <div className="journey-detail"><span>ORIGINAL SEALS</span><span>CONSOLES · GAMES · GEAR</span><span>KARACHI, PK</span></div>
    {record.status==='asset-needed'&&<p className="journey-review-note">Integration preview: the accepted {record.name} assets were not included in the supplied website archive. This chapter remains unfinished.</p>}
   </div>
   <Performance key={record.id} record={record} scrollProgress={scrolling?progress:null}/>
  </div>
  <nav className="shell journey-nav" aria-label="Character chapters">{scenes.map((s,i)=><button key={s.id} aria-current={i===index?'step':undefined} onClick={()=>choose(i)}><small>{String(i+1).padStart(2,'0')}</small><span>{s.name}</span>{i===index&&<ChevronRight size={16}/>}</button>)}</nav>
  <div className="shell journey-next"><span>{scrolling?'Scroll to advance the action and enter the next chapter.':'Choose a chapter. The 3D store is directly below.'}</span>{index<4?<button onClick={()=>choose(index+1)} className="text-link">Next chapter <ArrowRight size={16}/></button>:<Link href="#showroom" className="text-link">Enter the store <ArrowRight size={16}/></Link>}</div>
  </div>
 </section>
}
