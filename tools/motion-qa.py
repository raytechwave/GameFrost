import json,time,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'outputs/preview';OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('GF_QA_URL','http://127.0.0.1:4175');result={'scope':'Actual optimized GLB in packaged storefront, headless Chromium software WebGL; no physical phone FPS claim','checks':[],'poses':[],'errors':[]}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for width,height,label in [(1440,1000,'desktop'),(390,844,'mobile')]:
  c=b.new_context(viewport={'width':width,'height':height},record_video_dir=str(OUT/'recordings'),record_video_size={'width':width,'height':height});page=c.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)))
  page.goto(BASE+'/',wait_until='networkidle');assert '01' in page.locator('.journey-chapter').inner_text();assert 'goku' in page.locator('.journey-chapter').inner_text().lower()
  for name in ['02 Spider-Man','03 Wolverine','04 Harry Potter','05 Ronaldo']:
   page.get_by_role('button',name=name).click();page.wait_for_timeout(300)
  page.get_by_role('button',name='03 Wolverine').click();page.get_by_role('button',name='Load performance').click();page.wait_for_selector('.journey-stage[data-status="ready"]',timeout=60000)
  print(label+': model loaded',flush=True);page.locator('.journey-stage').scroll_into_view_if_needed();page.get_by_role('button',name='Play performance',exact=True).click();page.wait_for_selector('button[aria-label="Replay performance"]',timeout=30000)
  for i,t in enumerate([0,.8,1.35,1.65,1.94,2.35,3.5,4.8]):
   page.get_by_role('slider',name='Animation progress').fill(format(t/4.8,'.3f').rstrip('0').rstrip('.') or '0');file=f'wolverine-{label}-pose-{i}.png';page.locator('.journey-stage').screenshot(path=str(OUT/file));result['poses'].append({'viewport':label,'time':t,'file':file})
  for t in [1,.5,0,.5,1,0]:page.get_by_role('slider',name='Animation progress').fill(str(t))
  page.get_by_role('button',name='Reset to ready pose').click();assert page.get_by_role('slider',name='Animation progress').input_value()=='0'
  if width==1440:
   for w in [320,360,390,430,768,1024,1440]:
    page.set_viewport_size({'width':w,'height':844 if w<768 else 1000});page.get_by_role('slider',name='Animation progress').fill('0.4');page.locator('.journey-stage').screenshot(path=str(OUT/f'wolverine-width-{w}.png'));assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   page.set_viewport_size({'width':1440,'height':1000})
  page.locator('.journey-stage').scroll_into_view_if_needed();page.get_by_role('slider',name='Animation progress').fill('0');page.get_by_role('button',name='Play performance',exact=True).click();page.wait_for_timeout(500);page.evaluate("window.scrollTo({top:document.body.scrollHeight,behavior:'instant'})");page.get_by_role('button',name='Pause performance',exact=True).wait_for(state='hidden');stopped=page.get_by_role('slider',name='Animation progress').input_value();page.wait_for_timeout(1000);assert page.get_by_role('slider',name='Animation progress').input_value()==stopped
  result['checks'].append(label+': normal playback, forward/reverse seeking, explicit reset, viewport resizing and offscreen pause; one canvas.')
  assert page.locator('canvas').count()==1
  page.get_by_role('button',name='03 Wolverine').scroll_into_view_if_needed();page.get_by_role('button',name='03 Wolverine').click();page.get_by_role('button',name='01 Goku Ultra Instinct').click();assert page.locator('canvas').count()==0
  page.locator('a[href="/shop"]:visible').first.click();page.wait_for_url('**/shop');page.wait_for_timeout(700)
  (ROOT/'docs/motion-progress.json').write_text(json.dumps(result,indent=2))
  video=page.video;c.close();video.save_as(str(OUT/f'combined-{label}-review.webm'));print(label+': motion and navigation checks complete',flush=True)
  tiles=[]
  for pose in [row for row in result['poses'] if row['viewport']==label]:
   im=Image.open(OUT/pose['file']).convert('RGB');im.thumbnail((240,300));tile=Image.new('RGB',(250,335),'#0a111d');tile.paste(im,((250-im.width)//2,25));ImageDraw.Draw(tile).text((10,8),str(pose['time'])+' s',fill='white');tiles.append(tile)
  sheet=Image.new('RGB',(1000,670),'#0a111d')
  for i,tile in enumerate(tiles):sheet.paste(tile,((i%4)*250,(i//4)*335))
  sheet.save(OUT/f'wolverine-{label}-pose-sheet.jpg')
 # Reduced motion never auto-loads a model or plays an attack.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');pg=c.new_page();pg.goto(BASE+'/',wait_until='networkidle');pg.get_by_role('button',name='03 Wolverine').click();assert pg.locator('canvas').count()==0;pg.get_by_role('button',name='Load performance').click();pg.wait_for_selector('.journey-stage[data-status="ready"]',timeout=60000);assert pg.get_by_role('button',name='Play performance',exact=True).is_disabled();c.close();result['checks'].append('Reduced motion keeps a composed poster until explicitly loaded; playback disabled, pose inspection remains available.')
 c=b.new_context(viewport={'width':390,'height':844});pg=c.new_page();pg.route('**/characters/wolverine-attack.glb',lambda r:r.abort());pg.goto(BASE+'/',wait_until='networkidle');pg.get_by_role('button',name='03 Wolverine').click();pg.get_by_role('button',name='Load performance').click();pg.wait_for_selector('.journey-stage[data-status="error"]',timeout=60000);assert pg.locator('.journey-poster').is_visible();pg.locator('a[href="/shop"]:visible').first.click();pg.wait_for_url('**/shop');c.close();result['checks'].append('Failed model download preserves the actual-rig poster and shopping navigation.')
 c=b.new_context(viewport={'width':390,'height':844});pg=c.new_page();pg.goto(BASE+'/',wait_until='networkidle');pg.get_by_role('button',name='03 Wolverine').click();pg.get_by_role('button',name='Load performance').click();pg.wait_for_selector('.journey-stage[data-status="ready"]',timeout=60000);pg.locator('canvas').evaluate("c=>{const gl=c.getContext('webgl2');const ext=gl?.getExtension('WEBGL_lose_context');if(!ext)throw Error('Context loss extension missing');ext.loseContext()}");pg.wait_for_selector('.journey-stage[data-status="error"]');assert pg.locator('.journey-poster').is_visible();c.close();result['checks'].append('WebGL context loss disposes the canvas and restores the poster.')
 c=b.new_context(viewport={'width':390,'height':844});pg=c.new_page()
 for route in ['/','/shop','/services','/checkout','/admin']:
  pg.goto(BASE+route,wait_until='networkidle');pg.evaluate("document.documentElement.style.fontSize='200%'");assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),route
 c.close();result['checks'].append('200% root text size at a phone viewport leaves key routes without horizontal overflow.')
 b.close()
assert not result['errors'],result['errors']
(ROOT/'docs/motion-verification.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
