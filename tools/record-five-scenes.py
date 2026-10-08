"""Record the real five-scene scroll journey and showroom for the review ZIP."""
import base64,json,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs'/'preview'
BASE='http://127.0.0.1:4175'
IDS=['goku','spider-man','wolverine','harry-potter','ronaldo']
NAMES=['Goku Ultra Instinct','Spider-Man','Wolverine','Harry Potter','Ronaldo']
report={'scope':'Actual production build in Chromium, software renderer, original screencast timestamps, no speeding up. Each MP4 contains browser-synthesized effects captured from the same timeline. Emulated phone is not a physical-device test.','recordings':[],'soundEvents':[],'errors':[]}
CAPTURE_AUDIO="""window.__gfCapture=null;const proto=DynamicsCompressorNode.prototype,connect=proto.connect;proto.connect=function(destination,...rest){if(this.context&&destination===this.context.destination&&!window.__gfCapture){const tap=this.context.createMediaStreamDestination();connect.call(this,tap);window.__gfCapture=tap.stream}return connect.call(this,destination,...rest)}"""

class Recorder:
 def __init__(self,page,label):
  self.label=label;self.folder=OUT/'recordings'/('five-scene-'+label);self.folder.mkdir(parents=True,exist_ok=True);self.frames=[]
  self.session=page.context.new_cdp_session(page)
  def on_frame(event):
   path=self.folder/f'{len(self.frames):06d}.jpg';path.write_bytes(base64.b64decode(event['data']));self.frames.append((path,event['metadata']['timestamp']))
   self.session.send('Page.screencastFrameAck',{'sessionId':event['sessionId']})
  self.session.on('Page.screencastFrame',on_frame)
  self.session.send('Page.startScreencast',{'format':'jpeg','quality':76,'everyNthFrame':1})
 def finish(self):
  self.session.send('Page.stopScreencast');assert len(self.frames)>1
  lines=[]
  for i,(path,stamp) in enumerate(self.frames):
   lines.append(f"file '{path}'")
   duration=max(.01,self.frames[i+1][1]-stamp) if i+1<len(self.frames) else .1
   lines.append(f'duration {duration:.6f}')
  lines.append(f"file '{self.frames[-1][0]}'")
  manifest=self.folder/'frames.txt';manifest.write_text('\n'.join(lines)+'\n')
  target=OUT/f'five-scene-{self.label}-review.mp4'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(manifest),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-crf','25','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart','-fps_mode','vfr',str(target)],check=True)
  return {'viewport':self.label,'frames':len(self.frames),'file':target.name,'bytes':target.stat().st_size}

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for width,height,label in [(1440,1000,'desktop'),(390,844,'mobile')]:
  context=browser.new_context(viewport={'width':width,'height':height})
  page=context.new_page();page.add_init_script(CAPTURE_AUDIO+";window.__gfPreviewSound=[];window.addEventListener('game-frost:scene-sound',e=>window.__gfPreviewSound.push({...e.detail,observedAt:performance.now()}));")
  page.on('pageerror',lambda e:report['errors'].append(str(e)))
  page.goto(BASE+'/',wait_until='networkidle')
  assert page.locator('.journey.is-scroll').count()==1,label+' native scroll is not active'
  page.get_by_role('button',name='Enable character sound effects',exact=True).click()
  page.get_by_role('button',name='Mute character sound effects',exact=True).wait_for()
  page.evaluate('''()=>{window.__gfAudioChunks=[];window.__gfAudioRecorder=new MediaRecorder(window.__gfCapture);window.__gfAudioRecorder.ondataavailable=e=>{if(e.data.size)window.__gfAudioChunks.push(e.data)};window.__gfAudioRecorder.start()}''')
  recorder=Recorder(page,label)
  for i,(scene,name) in enumerate(zip(IDS,NAMES)):
   page.get_by_role('button',name=f'{i+1:02d} {name}',exact=True).click()
   page.wait_for_function('id=>document.querySelector(".journey").dataset.chapter===id',arg=scene,timeout=30000)
   page.wait_for_selector('.journey-stage[data-status="ready"]',timeout=90000)
   assert page.locator('.journey-stage svg[data-progress]').count()==1 if scene!='wolverine' else page.locator('.journey-stage canvas').count()==1
   page.get_by_role('button',name='Play performance',exact=True).click()
   page.wait_for_function("Number(document.querySelector('.journey-controls input').value)>.94",timeout=12000)
   page.wait_for_timeout(120)
   report['soundEvents'].extend(page.evaluate('window.__gfPreviewSound.splice(0)'))
   print(label,scene,'played',flush=True)
  assert page.locator('.journey').get_attribute('data-chapter')=='ronaldo'
  page.locator('a[href="#showroom"]').first.click()
  page.get_by_role('button',name='Enter the 3D store',exact=True).click()
  page.wait_for_selector('.showroom.is-ready',timeout=90000);page.wait_for_timeout(1600)
  page.screenshot(path=str(OUT/f'five-scene-home-{width}.png'))
  audio=page.evaluate('''async()=>{const recorder=window.__gfAudioRecorder;await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop()});const blob=new Blob(window.__gfAudioChunks,{type:'audio/webm'}),bytes=new Uint8Array(await blob.arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=32768)value+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(value)}''')
  audio_path=OUT/'recordings'/('five-scene-'+label)/'audio.webm';audio_path.write_bytes(base64.b64decode(audio))
  recording=recorder.finish();target=OUT/recording['file'];muxed=target.with_name(target.stem+'-muxed.mp4')
  subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(target),'-i',str(audio_path),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','112k','-shortest','-movflags','+faststart',str(muxed)],check=True)
  muxed.replace(target);audio_path.unlink()
  recording.update({'bytes':target.stat().st_size,'audioTrack':'Browser-synthesized effects, synchronized to the five action timelines.','note':'The interactive website also offers an independent Sound on/off control.'})
  report['recordings'].append(recording)
  context.close()
 browser.close()

assert not report['errors'],report['errors']
assert {e['scene'] for e in report['soundEvents']}==set(IDS),report['soundEvents']
report['passed']=True
report['date']='2026-10-08'
(ROOT/'docs'/'five-scene-preview.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'recordings':report['recordings'],'soundEvents':len(report['soundEvents'])},indent=2))
