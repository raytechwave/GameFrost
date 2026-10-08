"""Inspect every character's real frames, scroll/buttons, attachment and sound.

Run after building the static storefront and serving it on port 4175:
  python tools/vector-qa.py
GF_QA_URL can select another local preview. This does not certify real phones.
"""
import hashlib
import json
import math
import os
import subprocess
import time
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs' / 'preview'
BASE = os.environ.get('GF_QA_URL', 'http://127.0.0.1:4175').rstrip('/')
REPORT = ROOT / 'docs' / 'vector-motion-verification.json'
IDS = ['goku', 'spider-man', 'wolverine', 'harry-potter', 'ronaldo']
NAMES = ['Goku Ultra Instinct', 'Spider-Man', 'Wolverine', 'Harry Potter', 'Ronaldo']
SVG_IDS = ['goku', 'spider-man', 'harry-potter', 'ronaldo']
POSES = [0, .2, .35, .44, .48, .52, .62, .85, 1]
SAMPLES = sorted(set([i / 40 for i in range(41)] + [.439, .44, .441, .479, .48, .481, .499, .5, .501, .519, .52, .521, .679, .68, .681]))
result = {
    'scope': 'Built storefront in Linux headless Chromium; desktop and emulated mobile. Geometry checks inspect 1001 deterministic frames per new vector character. Sound checks inspect Web Audio scheduling, not listening quality. No physical-phone FPS or perfection claim.',
    'url': BASE,
    'checks': [], 'geometry': {}, 'poses': [], 'errors': [], 'sound': [],
}

# This evaluates the actual authored pure renderers, independently of the UI.
# Every reported bone is checked from its endpoints, then checked against the
# same limb's length at every other progress; a self-reported length alone is
# not accepted. Attachment equations are derived separately below.
GEOMETRY_JS = r'''
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const cache=new Map();
function load(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 const module={exports:{}};cache.set(file,module.exports);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const local=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name+(path.extname(name)?'':'.ts'))):require(name);
 new Function('require','module','exports',source)(local,module,module.exports);cache.set(file,module.exports);return module.exports;
}
const spec=[['goku','vector-goku.ts','renderGoku'],['spider-man','vector-spiderman.ts','renderSpiderMan'],['harry-potter','vector-harry.ts','renderHarry'],['ronaldo','vector-ronaldo.ts','renderRonaldo']];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),same=(a,b)=>a&&b&&dist(a,b)<1e-7;
const assert=(value,note)=>{if(!value)throw new Error(note)};
const reports={};
for(const [id,file,method] of spec){
 const render=load('components/game-frost/'+file)[method];assert(typeof render==='function',id+' renderer export absent');
 const lengths=new Map(),phases=new Set(),ranges={},timeline=[];
 let previous=null,maxJointStep=0,maxBoneDeviation=0;
 for(let i=0;i<=1000;i++){
  const p=i/1000,f=render(p,'qa-'+id);assert(f.markup&&!/NaN|Infinity|undefined/.test(f.markup),id+' nonfinite SVG '+p);
  assert(f.anchors?.head,id+' head attachment missing');assert(f.bones?.length>=8,id+' limbs not instrumented');
  phases.add(f.phase);
  for(const [name,v] of Object.entries(f.anchors)){
   assert(Number.isFinite(v.x)&&Number.isFinite(v.y),id+' invalid anchor '+name+' '+p);
   const r=ranges[name]??={minX:v.x,maxX:v.x,minY:v.y,maxY:v.y};
   r.minX=Math.min(r.minX,v.x);r.maxX=Math.max(r.maxX,v.x);r.minY=Math.min(r.minY,v.y);r.maxY=Math.max(r.maxY,v.y);
   if(previous?.[name]&&!/effect|ball|target|wandTip/i.test(name))maxJointStep=Math.max(maxJointStep,dist(v,previous[name]));
  }
  for(const b of f.bones){
   const actual=dist(b.a,b.b);assert(Number.isFinite(actual)&&actual>0,id+' degenerate bone '+b.name);
   assert(Math.abs(actual-b.length)<1e-6,id+' metadata inconsistent '+b.name+' '+p);
   if(!lengths.has(b.name))lengths.set(b.name,actual);
   const drift=Math.abs(actual-lengths.get(b.name));maxBoneDeviation=Math.max(maxBoneDeviation,drift);
   assert(drift<1e-6,id+' limb length changed '+b.name+' '+p+' '+drift);
  }
  const a=f.anchors;
  if(id==='goku')assert(same(a.effectOrigin,{x:(a.leftHand.x+a.rightHand.x)/2,y:(a.leftHand.y+a.rightHand.y)/2}),'Goku energy detached from palms '+p);
  if(id==='spider-man')assert(same(a.effectOrigin,a.rightHand),'Spider-Man web detached from wrist '+p);
  if(id==='harry-potter'){
   assert(same(a.wandBase,a.rightHand),'Harry wand detached from hand '+p);
   assert(same(a.effectOrigin,a.wandTip),'Harry red spell detached from wand tip '+p);
   assert(Math.abs(dist(a.wandBase,a.wandTip)-86)<1e-6,'Harry wand length changed '+p);
  }
  if(id==='ronaldo'){
   const c=f.contact;assert(c&&c.radius>0,'Ronaldo contact metadata missing');
   timeline.push({p,foot:c.foot,ball:c.ball,released:c.released,radius:c.radius});
  }
  previous=f.anchors;
 }
 const head=ranges.head;assert(Math.hypot(head.maxX-head.minX,head.maxY-head.minY)>3,id+' head/body never moves');
 const hands=Object.entries(ranges).filter(([k])=>/hand/i.test(k));
 assert(hands.some(([,r])=>Math.hypot(r.maxX-r.minX,r.maxY-r.minY)>12),id+' hands never perform action');
 assert(maxJointStep<12,id+' a joint teleports between 0.001-progress frames: '+maxJointStep);
 assert(phases.size>=4,id+' performance phases absent');
 if(id==='ronaldo'){
  const ready=timeline[0].ball,pre=timeline.filter(t=>t.p<.52),contact=timeline[520],next=timeline[521],end=timeline[1000];
  assert(pre.every(t=>dist(t.ball,ready)<1e-6),'Ronaldo ball drifts before foot contact');
  assert(Math.abs(dist(contact.foot,contact.ball)-contact.radius)<1e-6,'Ronaldo boot not tangent to ball at impact');
  assert(dist(contact.ball,next.ball)<8,'Ronaldo ball teleports on release');
  assert(!timeline[519].released&&timeline[521].released,'Ronaldo ball release not synchronized to contact');
  assert(dist(contact.ball,end.ball)>100,'Ronaldo ball never flies after kick');
 }
 reports[id]={sampledFrames:1001,boneLengths:Object.fromEntries(lengths),maxBoneLengthDeviation:maxBoneDeviation,maxJointStepPer001:maxJointStep,phases:[...phases],headMovement:Math.hypot(head.maxX-head.minX,head.maxY-head.minY),attachmentChecks:'passed'};
}
console.log(JSON.stringify(reports));
'''

SOUND_SPY = r'''
window.__gfSounds=[];window.__gfAudio={contexts:0,resumes:0,starts:0,stops:0,active:0};
window.addEventListener('game-frost:scene-sound',e=>window.__gfSounds.push({...e.detail,observedAt:performance.now()}));
const Native=window.AudioContext||window.webkitAudioContext;
if(Native){
 const proxy=new Proxy(Native,{construct(Target,args){
  const context=new Target(...args);window.__gfAudio.contexts++;
  const resume=context.resume.bind(context);context.resume=(...a)=>{window.__gfAudio.resumes++;return resume(...a)};
  for(const name of ['createOscillator','createBufferSource','createConstantSource']){
   if(!context[name])continue;const create=context[name].bind(context);
   context[name]=(...a)=>{const node=create(...a);let active=false;
    const start=node.start.bind(node),stop=node.stop.bind(node);
    node.start=(...s)=>{if(!active){active=true;window.__gfAudio.active++}window.__gfAudio.starts++;return start(...s)};
    node.stop=(...s)=>{window.__gfAudio.stops++;return stop(...s)};
    node.addEventListener('ended',()=>{if(active){active=false;window.__gfAudio.active--}});return node};
  }
  return context;
 }});window.AudioContext=proxy;if(window.webkitAudioContext)window.webkitAudioContext=proxy;
}
'''


def check(note, **detail):
    result['checks'].append({'check': note, **detail})
    print(note, flush=True)


def choose(page, index):
    page.get_by_role('button', name=f'{index+1:02d} {NAMES[index]}', exact=True).click()
    page.wait_for_function("id=>document.querySelector('.journey').dataset.chapter===id", arg=IDS[index])
    page.wait_for_selector('.journey-stage[data-status="ready"]', timeout=90000)
    assert page.locator('.journey-pending').count() == 0, IDS[index] + ' is still a placeholder'
    page.wait_for_timeout(80)


def seek(page, progress):
    slider = page.get_by_role('slider', name='Animation progress')
    slider.evaluate('''(el,value)=>{
      const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      set.call(el,String(value));
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }''', str(progress))
    page.wait_for_function("p=>Math.abs(Number(document.querySelector('.journey-controls input').value)-p)<.0006", arg=progress)
    if page.locator('.journey-stage svg[data-progress]').count():
        page.wait_for_function("p=>Math.abs(Number(document.querySelector('.journey-stage svg[data-progress]').dataset.progress)-p)<.0006", arg=progress)


def scroll_to(page, chapter, progress):
    assert page.locator('.journey.is-scroll').count(), 'Native scroll journey unexpectedly disabled'
    page.evaluate('''([chapter,p])=>{
      const root=document.querySelector('.journey'),header=document.querySelector('.site-header').getBoundingClientRect().height;
      const start=scrollY+root.getBoundingClientRect().top-header;
      scrollTo({top:start+Math.max(600,innerHeight*.95)*(chapter+.08+.8*p-.001),behavior:'instant'});
    }''', [chapter, progress])
    page.wait_for_function('''([id,p])=>{const root=document.querySelector('.journey');return root.dataset.chapter===id&&Math.abs(Number(root.dataset.progress)-p)<.004}''', arg=[IDS[chapter], progress], timeout=30000)
    page.wait_for_selector('.journey-stage[data-status="ready"]', timeout=90000)
    page.wait_for_function("p=>Math.abs(Number(document.querySelector('.journey-controls input').value)-p)<.004", arg=progress)


def frame_info(page):
    return page.locator('.journey-stage svg[data-progress]').evaluate('''svg=>{
     const b=svg.getBBox(),r=svg.getBoundingClientRect(),stage=svg.closest('.journey-stage').getBoundingClientRect();
     return{bbox:{x:b.x,y:b.y,width:b.width,height:b.height},rect:{x:r.x,y:r.y,width:r.width,height:r.height},stage:{x:stage.x,y:stage.y,width:stage.width,height:stage.height},
      progress:Number(svg.dataset.progress),phase:svg.dataset.phase,anchors:JSON.parse(svg.dataset.anchors),bones:JSON.parse(svg.dataset.bones||'[]'),contact:JSON.parse(svg.dataset.contact||'null'),
      paths:svg.querySelectorAll('path').length,images:svg.querySelectorAll('image').length,
      backgroundRects:[...svg.querySelectorAll('rect')].filter(e=>Number(e.getAttribute('width'))>=760&&Number(e.getAttribute('height'))>=700&&Number(e.getAttribute('opacity')??1)>0).length};
    }''')


def assert_framing(info, label):
    box, rect, stage = info['bbox'], info['rect'], info['stage']
    assert box['x'] >= -1 and box['y'] >= -1, (label, 'ink starts outside viewBox', box)
    assert box['x'] + box['width'] <= 761 and box['y'] + box['height'] <= 701, (label, 'ink extends outside viewBox', box)
    assert rect['x'] >= stage['x'] - 1 and rect['y'] >= stage['y'] - 1, (label, rect, stage)
    assert rect['x'] + rect['width'] <= stage['x'] + stage['width'] + 1, (label, rect, stage)
    assert rect['y'] + rect['height'] <= stage['y'] + stage['height'] + 1, (label, rect, stage)
    assert info['paths'] > 20 and not info['images'] and not info['backgroundRects'], (label, 'vector illustration contains a replacement image/background')


def contact_sheet(character, label, poses):
    tiles = []
    for pose in poses:
        image = Image.open(OUT / pose['file']).convert('RGB')
        image.thumbnail((250, 280))
        tile = Image.new('RGB', (260, 310), '#0a111d')
        tile.paste(image, ((260-image.width)//2, 25))
        ImageDraw.Draw(tile).text((10, 8), f"{pose['progress']:.3f}  {pose.get('phase','GLB')}", fill='white')
        tiles.append(tile)
    sheet = Image.new('RGB', (260*3, 310*math.ceil(len(tiles)/3)), '#0a111d')
    for i, tile in enumerate(tiles):
        sheet.paste(tile, ((i % 3)*260, (i // 3)*310))
    sheet.save(OUT / f'{character}-{label}-vector-pose-sheet.jpg', quality=90)


def sound_button(page, enabled):
    name = 'Mute character sound effects' if enabled else 'Enable character sound effects'
    return page.get_by_role('button', name=name, exact=True)


def sounds(page):
    return page.evaluate('({events:window.__gfSounds,audio:window.__gfAudio})')


def verify_sound(page, label):
    choose(page, 0)
    assert sounds(page)['audio']['contexts'] == 0, 'AudioContext created before user enabled sound'
    assert not sounds(page)['events'], 'Sound events occurred before opt-in'
    sound_button(page, False).click()
    sound_button(page, True).wait_for()
    assert sounds(page)['audio']['contexts'] == 1 and sounds(page)['audio']['resumes'] >= 1
    expected = {0: [(.26, 'energy-charge'), (.48, 'hand-beam')], 1: [(.44, 'wrist-web')], 2: [(1.65/4.8, 'claw-strike'), (2.35/4.8, 'grounded-landing')], 3: [(.5, 'wand-spell')], 4: [(.52, 'boot-ball-contact')]}
    for chapter in range(5):
        choose(page, chapter)
        # The preference is shared across chapters; enabling once must persist.
        assert sound_button(page, True).is_visible(), 'Sound preference reset on chapter change'
        seek(page, 0)
        page.wait_for_timeout(100)
        for progress, marker in expected[chapter]:
            seek(page, progress-.01)
            page.wait_for_timeout(100)
            count = len(sounds(page)['events'])
            seek(page, progress+.002)
            page.wait_for_timeout(25)
            events = sounds(page)['events']
            assert len(events) == count+1, (label, IDS[chapter], marker, events[count:])
            event = events[-1]
            assert event['scene'] == IDS[chapter] and event['marker'] == marker, event
            assert abs(event['progress']-progress) < .02, event
            seek(page, progress+.002)
            page.wait_for_timeout(90)
            assert len(sounds(page)['events']) == len(events), 'Holding a pose repeated its sound'
            # Backward seeking cancels the current voice, with no stale queue.
            seek(page, progress-.015)
            page.wait_for_timeout(80)
            assert sounds(page)['audio']['active'] == 0, 'Rewinding retained active audio sources'
            count = len(sounds(page)['events'])
            seek(page, progress+.002)
            page.wait_for_timeout(25)
            assert len(sounds(page)['events']) == count+1, 'Forward replay did not retrigger synchronized sound'
            result['sound'].append({'viewport': label, 'scene': IDS[chapter], 'marker': marker, 'progress': progress, 'result': 'forward crossing, held pose and rewind/replay passed'})
        if chapter < 4:
            choose(page, chapter+1)
            page.wait_for_timeout(80)
            assert sounds(page)['audio']['active'] == 0, 'Leaving a chapter retained active sounds'
    # Button playback and native document scrolling must cross the same audio
    # marker as direct pose inspection; sound is not a separate timer.
    choose(page, 0)
    seek(page, .46)
    page.wait_for_timeout(100)
    count = len(sounds(page)['events'])
    page.get_by_role('button', name='Play performance', exact=True).click()
    page.wait_for_function('n=>window.__gfSounds.length>n', arg=count, timeout=4000)
    assert sounds(page)['events'][-1]['marker'] == 'hand-beam'
    page.get_by_role('button', name='Pause performance', exact=True).click()
    page.wait_for_timeout(80)
    assert sounds(page)['audio']['active'] == 0, 'Pausing button playback retained audio'
    scroll_to(page, 0, .46)
    page.wait_for_timeout(100)
    count = len(sounds(page)['events'])
    scroll_to(page, 0, .49)
    page.wait_for_timeout(25)
    assert len(sounds(page)['events']) == count+1 and sounds(page)['events'][-1]['marker'] == 'hand-beam', 'Native scroll and audio marker were not synchronized'
    seek(page, 0)
    page.wait_for_timeout(100)
    choose(page, 4)
    seek(page, .51)
    page.wait_for_timeout(100)
    seek(page, .522)
    page.wait_for_timeout(25)
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(100)
    assert sounds(page)['audio']['active'] == 0, 'Background visibility left audio active'
    page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))")
    sound_button(page, True).click()
    count = len(sounds(page)['events'])
    seek(page, 0)
    seek(page, .6)
    page.wait_for_timeout(100)
    assert len(sounds(page)['events']) == count and sounds(page)['audio']['active'] == 0, 'Mute did not suppress effects'
    check(label+': gesture-only sound enable, all five exact action markers, hold/rewind/replay/chapter cancellation, simulated document-hidden cancellation, and mute', audio=sounds(page)['audio'])


def verify_viewport(browser, width, height, label):
    context = browser.new_context(viewport={'width': width, 'height': height})
    context.add_init_script(SOUND_SPY)
    page = context.new_page()
    page.on('pageerror', lambda error: result['errors'].append(str(error)))
    response = page.goto(BASE+'/', wait_until='networkidle')
    assert response.status == 200
    assert page.locator('.journey').get_attribute('data-chapter') == 'goku'
    assert page.locator('.journey.is-scroll').count() == 1, label+' scroll journey unavailable'
    assert page.locator('.showroom').count() == 1
    assert sounds(page)['audio']['contexts'] == 0
    page.screenshot(path=str(OUT/f'five-character-home-{width}.png'))
    for chapter, character in enumerate(IDS):
        choose(page, chapter)
        poses = []
        if character in SVG_IDS:
            assert page.locator('.journey-stage').get_attribute('data-renderer') == 'vector'
            assert page.locator('.journey-stage canvas').count() == 0
            assert page.locator('.journey-stage svg[data-progress]').count() == 1
            bounds = []
            for progress in SAMPLES:
                seek(page, progress)
                info = frame_info(page)
                assert_framing(info, f'{label} {character} {progress}')
                bounds.append(info['bbox'])
            for i, progress in enumerate(POSES):
                seek(page, progress)
                info = frame_info(page)
                filename = f'{character}-{label}-vector-pose-{i}.png'
                page.locator('.journey-stage').screenshot(path=str(OUT/filename))
                pose = {'viewport': label, 'character': character, 'progress': progress, 'phase': info['phase'], 'file': filename, 'source': 'button-controlled progress slider'}
                result['poses'].append(pose)
                poses.append(pose)
            seek(page, .42)
            before = page.locator('.journey-stage svg[data-progress]').evaluate('(svg)=>svg.innerHTML')
            seek(page, .86)
            seek(page, .42)
            after = page.locator('.journey-stage svg[data-progress]').evaluate('(svg)=>svg.innerHTML')
            assert before == after, label+' '+character+' same SVG pose differs after reverse seek'
            check(f'{label}: {character} vector frame/limb metadata, {len(SAMPLES)} bounded rendered poses and deterministic reverse seeking', renderer='actual SVG', poses=len(POSES))
        else:
            assert page.locator('.journey-stage canvas').count() == 1, 'Wolverine original GLB missing'
            assert page.locator('.journey-stage svg').count() == 0, 'Wolverine was substituted'
            for i, progress in enumerate(POSES):
                seek(page, progress)
                page.wait_for_timeout(100)
                filename = f'{character}-{label}-vector-pose-{i}.png'
                page.locator('.journey-stage').screenshot(path=str(OUT/filename))
                pose = {'viewport': label, 'character': character, 'progress': progress, 'file': filename, 'source': 'original GLB under shared progress controls'}
                result['poses'].append(pose)
                poses.append(pose)
            seek(page, .42)
            page.wait_for_timeout(100)
            before = page.locator('.journey-stage canvas').screenshot()
            seek(page, .86)
            seek(page, .42)
            page.wait_for_timeout(100)
            after = page.locator('.journey-stage canvas').screenshot()
            assert hashlib.sha256(before).digest() == hashlib.sha256(after).digest(), label+' Wolverine reverse seek is not deterministic'
            check(label+': Wolverine original GLB preserved; nine sampled poses and pixel-identical reverse seeking')
        contact_sheet(character, label, poses)
        seek(page, 0)
        page.get_by_role('button', name='Play performance', exact=True).click()
        page.wait_for_timeout(500)
        play_progress = float(page.get_by_role('slider', name='Animation progress').input_value())
        assert .01 < play_progress < .5, (character, 'play button did not advance', play_progress)
        page.get_by_role('button', name='Pause performance', exact=True).click()
        paused = page.get_by_role('slider', name='Animation progress').input_value()
        page.wait_for_timeout(250)
        assert page.get_by_role('slider', name='Animation progress').input_value() == paused
        page.get_by_role('button', name='Reset to ready pose', exact=True).click()
        assert page.get_by_role('slider', name='Animation progress').input_value() == '0'
        # Native scroll must operate the very same scene, in both directions.
        for progress in [0, .25, .5, .9, .25]:
            scroll_to(page, chapter, progress)
        check(label+': '+character+' play/pause/reset and native forward/reverse scroll use one progress controller')
        assert page.locator('.journey-stage canvas').count() + page.locator('.journey-stage svg[data-progress]').count() == 1
        assert sounds(page)['audio']['contexts'] == 0 and not sounds(page)['events'], 'Non-enabled navigation produced audio'
    verify_sound(page, label)
    choose(page, 0)
    page.get_by_role('button', name='Play performance', exact=True).click()
    page.wait_for_timeout(150)
    page.evaluate("scrollTo({top:document.body.scrollHeight,behavior:'instant'})")
    page.wait_for_timeout(250)
    stopped = page.get_by_role('slider', name='Animation progress').input_value()
    page.wait_for_timeout(250)
    assert page.get_by_role('slider', name='Animation progress').input_value() == stopped
    check(label+': offscreen playback stops; no runaway scene timer')
    page.locator('a[href="/shop"]:visible').first.click()
    page.wait_for_url('**/shop')
    assert page.locator('.journey-stage').count() == 0
    assert page.locator('canvas').count() == 0
    page.wait_for_timeout(100)
    assert sounds(page)['audio']['active'] == 0
    check(label+': route exit disposes character renderers and stops sound')
    context.close()


def verify_accessibility(browser):
    context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
    context.add_init_script(SOUND_SPY)
    page = context.new_page()
    page.on('pageerror', lambda error: result['errors'].append(str(error)))
    page.goto(BASE+'/', wait_until='networkidle')
    assert page.locator('.journey.is-scroll').count() == 0
    for chapter in [0, 1, 3, 4]:
        choose(page, chapter)
        assert page.get_by_role('button', name='Play performance', exact=True).is_disabled()
        seek(page, .5)
        held = page.get_by_role('slider', name='Animation progress').input_value()
        page.wait_for_timeout(150)
        assert page.get_by_role('slider', name='Animation progress').input_value() == held
    assert sounds(page)['audio']['contexts'] == 0
    context.close()
    check('Reduced motion removes scroll pinning and autoplay; four vector characters retain deliberate still-pose slider inspection with no unsolicited audio')
    context = browser.new_context()
    page = context.new_page()
    for width, height in [(320, 640), (360, 800), (390, 844), (430, 932), (768, 1024), (1024, 768), (1440, 1000), (844, 390)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.goto(BASE+'/', wait_until='networkidle')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), ('overflow', width, height)
        for chapter in [0, 1, 3, 4]:
            choose(page, chapter)
            assert_framing(frame_info(page), ('layout', width, height, IDS[chapter]))
        page.evaluate("document.documentElement.style.fontSize='200%'")
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), ('200% text overflow', width, height)
    context.close()
    check('Eight viewport sizes, short landscape and 200% root text: no horizontal overflow; character ink remains inside the SVG/stage')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    geometry = subprocess.run(['node', '--input-type=module', '-e', GEOMETRY_JS], cwd=ROOT, text=True, capture_output=True, check=True)
    result['geometry'] = json.loads(geometry.stdout)
    check('Four original vector characters: 4004 pure poses passed constant bone length, attachment, joint-continuity and Ronaldo boot/ball release equations')
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        verify_viewport(browser, 1440, 1000, 'desktop')
        verify_viewport(browser, 390, 844, 'mobile')
        verify_accessibility(browser)
        browser.close()
    assert not result['errors'], result['errors']
    result['passed'] = True


if __name__ == '__main__':
    started = time.monotonic()
    try:
        main()
    except Exception as error:
        result['passed'] = False
        result['failure'] = str(error)
        if isinstance(error, subprocess.CalledProcessError):
            result['failure'] += '\n'+(error.stderr or '')
        raise
    finally:
        result['durationSeconds'] = round(time.monotonic()-started, 3)
        REPORT.write_text(json.dumps(result, indent=2)+'\n')
        print('Report: '+str(REPORT), flush=True)
