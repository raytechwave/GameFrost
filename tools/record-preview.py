"""Record a stable-viewport combined storefront walkthrough, without QA resizes/screenshots."""
from pathlib import Path
import time,json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'outputs/preview';BASE='http://127.0.0.1:4175';result={'scope':'Actual final packaged application, stable Chromium viewport, software WebGL. Loading wait may be shortened in presentation MP4; animation speed unchanged.','recordings':[],'errors':[]}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for width,height,label in [(1440,1000,'desktop'),(390,844,'mobile')]:
  c=b.new_context(viewport={'width':width,'height':height},record_video_dir=str(OUT/'recordings/clean'),record_video_size={'width':width,'height':height});page=c.new_page();start=time.monotonic();page.on('pageerror',lambda e:result['errors'].append(str(e)))
  page.goto(BASE+'/',wait_until='networkidle');page.wait_for_timeout(2200);page.get_by_role('button',name='03 Wolverine').click();page.get_by_role('button',name='Load performance').click();load=time.monotonic()-start;page.wait_for_selector('.journey-stage[data-status="ready"]',timeout=60000);ready=time.monotonic()-start;print(label+' character loaded',flush=True)
  if width<700:page.locator('.journey-stage').scroll_into_view_if_needed()
  page.wait_for_timeout(1300);page.get_by_role('button',name='Play performance',exact=True).click();page.wait_for_selector('button[aria-label="Replay performance"]',timeout=30000);page.wait_for_timeout(1400);page.get_by_role('button',name='Reset to ready pose',exact=True).click();page.wait_for_timeout(1300)
  page.locator('a[href="/shop"]:visible').first.click();page.wait_for_url('**/shop');page.wait_for_timeout(1700);page.evaluate('window.scrollBy({top:480,behavior:"smooth"})');page.wait_for_timeout(1600);page.goto(BASE+'/visit',wait_until='networkidle');page.wait_for_timeout(1800);page.goto(BASE+'/admin',wait_until='networkidle');page.wait_for_timeout(1800);page.get_by_role('button',name='Character scenes',exact=True).click();page.wait_for_timeout(1800)
  video=page.video;c.close();video.save_as(str(OUT/f'combined-{label}-review.webm'));result['recordings'].append({'viewport':label,'loadStartedSeconds':round(load,3),'modelReadySeconds':round(ready,3),'mp4LoadingWaitTrim':[round(load+2,3),round(ready-.6,3)] if ready-load>4 else None});print(label+' combined walkthrough recorded',flush=True)
 b.close()
assert not result['errors'],result['errors'];(ROOT/'docs/preview-recording.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
