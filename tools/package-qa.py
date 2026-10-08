"""Serve freshly extracted delivery ZIPs through the actual Source ZIP launcher."""
import json,zipfile,tempfile,subprocess,socket,os,time
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
report={'scope':'Freshly extracted current ZIPs, Source ZIP launcher and Chromium emulated mobile. Dependencies were not reinstalled in this correction.','checks':[],'routes':[],'errors':[]}
paths=['/','/shop','/shop/playstation/ps5-slim-disc','/cart','/checkout','/trade-in','/services','/reviews','/new-games','/about','/visit','/guides','/faq','/policies','/account','/admin','/showroom']
with tempfile.TemporaryDirectory(prefix='gamefrost-package-',dir='/workspace') as temp,sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for name,label in [('GAME-FROST-Source-Review.zip','Source ZIP included build'),('GAME-FROST-Netlify-Drop-Review.zip','Drop ZIP')]:
  extracted=Path(temp)/label;extracted.mkdir()
  with zipfile.ZipFile(ROOT/'outputs/releases'/name) as archive:
   assert archive.testzip() is None
   assert not any('/node_modules/' in f or '/.git/' in f or '/.env.' in f and not f.endswith('.env.example') for f in archive.namelist())
   archive.extractall(extracted)
  if name.startswith('GAME-FROST-Source'):
   work=extracted/'GAME-FROST';script=work/'scripts/view.mjs';args=['node',str(script)]
  else:
   work=extracted;args=['node',str(ROOT/'scripts/view.mjs'),str(extracted)]
  with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
  env={**os.environ,'GF_PREVIEW_PORT':str(port)}
  server=subprocess.Popen(args,cwd=work,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
  try:
   base=f'http://127.0.0.1:{port}'
   for i in range(40):
    try:
     with urlopen(base,timeout=1) as response:assert response.status==200
     break
    except OSError:
     if server.poll() is not None:raise RuntimeError(server.stderr.read().decode())
     time.sleep(.1)
   else:raise RuntimeError('Extracted package launcher did not respond')
   context=browser.new_context(viewport={'width':390,'height':844});page=context.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)))
   for path in paths:
    response=page.goto(base+path,wait_until='networkidle');assert response.status==200,(label,path,response.status);assert page.locator('main h1').count();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),path
    report['routes'].append({'edition':label,'path':path,'http':200})
   response=page.goto(base+'/missing-test',wait_until='networkidle');assert response.status==404
   page.goto(base,wait_until='networkidle');assert page.locator('.showroom').count()==1
   page.get_by_role('button',name='03 Wolverine',exact=True).click()
   page.wait_for_selector('.journey-stage[data-status="ready"]',timeout=60000)
   page.get_by_role('slider',name='Animation progress').fill('0.4');assert page.locator('canvas').count()==1
   context.close();report['checks'].append(label+': 17 important mobile routes, real 404, restored showroom section and actual GLB rendered from freshly extracted files.')
   print(label,'passed',flush=True)
  finally:server.terminate();server.wait(timeout=10)
 browser.close()
with zipfile.ZipFile(ROOT/'outputs/releases/GAME-FROST-Preview-Evidence.zip') as archive:assert archive.testzip() is None
report['checks'].append('All three ZIPs pass CRC checks; source/drop exclude credentials, Git metadata and dependencies.')
assert not report['errors'],report['errors']
(ROOT/'docs/corrective-package-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report),flush=True)
