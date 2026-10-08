"""Inspect native scroll, actual model frames and the restored showroom."""
import base64,hashlib,json,time,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs/preview'
BASE='http://127.0.0.1:4175'
report={'scope':'Chromium software WebGL; desktop and emulated mobile. Four missing performances are not certified.','checks':[],'errors':[],'poses':[],'recordings':[]}
NAMES=['Goku Ultra Instinct','Spider-Man','Wolverine','Harry Potter','Ronaldo']
IDS=['goku','spider-man','wolverine','harry-potter','ronaldo']
class Recorder:
 def __init__(self,page,label):
  self.label=label;self.folder=OUT/'recordings'/'scroll'/label;self.folder.mkdir(parents=True,exist_ok=True);self.frames=[]
  self.session=page.context.new_cdp_session(page)
  def frame(event):
   path=self.folder/f'{len(self.frames):06d}.jpg';path.write_bytes(base64.b64decode(event['data']));self.frames.append((path,event['metadata']['timestamp']))
   self.session.send('Page.screencastFrameAck',{'sessionId':event['sessionId']})
  self.session.on('Page.screencastFrame',frame)
  self.session.send('Page.startScreencast',{'format':'jpeg','quality':75,'everyNthFrame':1})
 def finish(self):
  self.session.send('Page.stopScreencast');assert len(self.frames)>1
  parts=[]
  for i,(path,timestamp) in enumerate(self.frames):
   parts.append(f"file '{path}'")
   duration=max(.01,self.frames[i+1][1]-timestamp) if i+1<len(self.frames) else 1
   parts.append(f'duration {duration:.6f}')
  parts.append(f"file '{self.frames[-1][0]}'")
  manifest=self.folder/'frames.txt';manifest.write_text('\n'.join(parts)+'\n')
  subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(manifest),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-crf','25','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart','-fps_mode','vfr',str(OUT/f'combined-{self.label}-review.mp4')],check=True)
  return {'viewport':self.label,'frames':len(self.frames),'description':'CDP screencast with original frame timestamps; untrimmed software WebGL pace, no sped-up playback.'}
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for width,height,label in [(1440,1000,'desktop'),(390,844,'mobile')]:
  context=browser.new_context(viewport={'width':width,'height':height})
  page=context.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)))
  recording=Recorder(page,label)
  page.goto(BASE,wait_until='networkidle')
  assert page.locator('.journey.is-scroll').count()==1
  assert page.locator('.journey').get_attribute('data-chapter')=='goku'
  assert page.locator('.showroom').count()==1
  assert page.locator('canvas').count()==0
  page.screenshot(path=str(OUT/f'home-{width}.png'))
  def move(chapter,progress=0):
   page.evaluate('''([chapter,p])=>{const root=document.querySelector('.journey');const start=scrollY+root.getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().height;scrollTo({top:start+Math.max(600,innerHeight*.95)*(chapter+.08+.8*p-.001),behavior:'instant'})}''',[chapter,progress])
   page.wait_for_function('''([id,p])=>{const e=document.querySelector('.journey');return e.dataset.chapter===id&&Math.abs(Number(e.dataset.progress)-p)<.005}''',arg=[IDS[chapter],progress],timeout=30000)
  for chapter in [0,1,2]:
   page.get_by_role('button',name=f'{chapter+1:02d} {NAMES[chapter]}',exact=True).click()
   page.wait_for_function('id=>document.querySelector(".journey").dataset.chapter===id',arg=IDS[chapter])
   page.wait_for_timeout(350)
  start=time.monotonic();page.wait_for_selector('.journey-stage[data-status="ready"]',timeout=90000)
  report['checks'].append({'viewport':label,'modelReadyWaitSeconds':round(time.monotonic()-start,3),'note':'Software renderer; not a physical device loading benchmark.'})
  assert page.locator('.journey-stage canvas').count()==1
  print(label,'Wolverine ready',flush=True)
  for i,t in enumerate([0,.8,1.35,1.65,1.94,2.35,3.5,4.8]):
   move(2,t/4.8)
   page.wait_for_function("p=>Math.abs(Number(document.querySelector('.journey-controls input').value)-p)<.005",arg=t/4.8)
   page.wait_for_timeout(180)
   file=f'wolverine-{label}-pose-{i}.png'
   page.locator('.journey-stage').screenshot(path=str(OUT/file))
   report['poses'].append({'viewport':label,'seconds':t,'file':file,'source':'native scroll'})
  move(2,.4);before=page.locator('.journey-stage canvas').screenshot()
  move(2,.85);move(2,.4);after=page.locator('.journey-stage canvas').screenshot()
  assert hashlib.sha256(before).digest()==hashlib.sha256(after).digest(),'Reverse seeking changed the same pose'
  report['checks'].append(label+': eight actual scroll-driven poses, exact same rendered pixels after reverse seeking, one character canvas.')
  page.screenshot(path=str(OUT/f'restored-wolverine-{width}.png'))
  page.get_by_role('button',name='Play performance',exact=True).click()
  page.wait_for_selector('button[aria-label="Replay performance"]',timeout=30000)
  page.get_by_role('button',name='Reset to ready pose',exact=True).click()
  assert page.get_by_role('slider',name='Animation progress').input_value()=='0'
  for chapter in [3,4]:
   page.get_by_role('button',name=f'{chapter+1:02d} {NAMES[chapter]}',exact=True).click()
   page.wait_for_function('id=>document.querySelector(".journey").dataset.chapter===id',arg=IDS[chapter])
   page.wait_for_timeout(300)
   assert page.locator('.journey-stage canvas').count()==0
  report['checks'].append(label+': all five chapter buttons change document scroll in order; outgoing GLB disposed; manual playback/reset still work.')
  page.get_by_role('link',name='Enter the 3D store',exact=True).click()
  page.get_by_role('button',name='Enter the 3D store',exact=True).click()
  page.wait_for_selector('.showroom.is-ready',timeout=60000)
  page.wait_for_timeout(700)
  assert page.locator('canvas').count()==1
  page.screenshot(path=str(OUT/f'restored-showroom-{width}.png'))
  for i in range(6):
   page.locator('.room-navigation button').nth(i).click()
   page.wait_for_timeout(400)
   assert page.locator('.room-navigation button').nth(i).get_attribute('aria-pressed')=='true'
  page.locator('.room-navigation button').first.click()
  page.get_by_role('button',name='Roam the store',exact=True).click()
  assert page.locator('.showroom.is-roaming').count()==1
  page.get_by_role('button',name='Move forward',exact=True).click()
  page.wait_for_timeout(300)
  page.get_by_role('button',name='Exit free roam',exact=True).click()
  page.locator('.room-product-chip').first.click()
  page.get_by_role('dialog').wait_for()
  assert 'PlayStation 5 Slim Disc' in page.get_by_role('dialog').inner_text()
  page.keyboard.press('Escape')
  page.get_by_role('button',name='Expand showroom',exact=True).click()
  assert page.locator('.showroom.is-expanded').count()==1
  page.keyboard.press('Escape')
  assert page.locator('.showroom.is-expanded').count()==0
  report['checks'].append(label+': restored homepage showroom, all six departments, native entry link, free roam, product inspection, fullscreen/Escape; one visible 3D renderer.')
  page.locator('a[href="/shop"]:visible').first.click()
  page.wait_for_url('**/shop');assert page.locator('canvas').count()==0
  page.wait_for_timeout(600);report['recordings'].append(recording.finish());context.close()
  print(label,'journey and showroom checks passed',flush=True)
 context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 page=context.new_page();page.goto(BASE,wait_until='networkidle');assert page.locator('.journey.is-scroll').count()==0
 page.get_by_role('button',name='03 Wolverine',exact=True).click();assert page.locator('canvas').count()==0
 assert page.locator('.journey-poster').is_visible()
 context.close();report['checks'].append('Reduced motion retains a poster and accessible chapter buttons; no automatic model load or scroll pinning.')
 context=browser.new_context(viewport={'width':390,'height':844})
 page=context.new_page();page.route('**/characters/wolverine-attack.glb',lambda r:r.abort());page.goto(BASE,wait_until='networkidle');page.get_by_role('button',name='03 Wolverine',exact=True).click()
 page.wait_for_selector('.journey-stage[data-status="error"]',timeout=60000);assert page.locator('.journey-poster').is_visible()
 page.get_by_role('link',name='Enter the 3D store',exact=True).click();assert page.get_by_role('button',name='Enter the 3D store',exact=True).is_visible()
 context.close();report['checks'].append('Model download failure preserves the real-rig poster and usable showroom/store navigation.')
 context=browser.new_context();page=context.new_page()
 for width,height in [(320,640),(360,800),(390,844),(430,932),(768,1024),(1024,768),(1440,1000),(844,390)]:
  page.set_viewport_size({'width':width,'height':height});page.goto(BASE,wait_until='networkidle')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,height)
  page.evaluate("document.documentElement.style.fontSize='200%'")
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),('200%',width,height)
  assert page.locator('.showroom').count()==1
 context.close();browser.close()
 report['checks'].append('Eight viewport sizes plus 200% root text: no horizontal overflow; short/enlarged layouts retain natural flow.')
assert not report['errors'],report['errors']
(ROOT/'docs/scroll-showroom-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report),flush=True)
