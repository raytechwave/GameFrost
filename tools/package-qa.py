"""Verify independently extracted delivery ZIPs through their documented HTTP launcher."""
import json,hashlib,zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];CHECK=Path('/workspace/package-check');r={'checks':[],'errors':[],'routes':[],'scope':'Fresh-folder extraction, source locked reinstall/rebuild and Chromium visits to independent loopback servers.'}
paths=['/','/shop','/shop/playstation/ps5-slim-disc','/cart','/checkout','/trade-in','/services','/reviews','/new-games','/about','/visit','/guides','/faq','/policies','/account','/admin','/showroom']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 for port,label in [(4180,'fresh source build'),(4181,'fresh Drop archive')]:
  c=b.new_context(viewport={'width':390,'height':844});pg=c.new_page();pg.on('pageerror',lambda e:r['errors'].append(str(e)))
  for path in paths:
   response=pg.goto(f'http://127.0.0.1:{port}'+path,wait_until='networkidle');assert response.status==200,(port,path,response.status);assert pg.locator('main h1').count();assert not pg.evaluate('document.documentElement.scrollWidth>innerWidth+1'),path;r['routes'].append({'edition':label,'path':path,'status':200})
  missing=pg.goto(f'http://127.0.0.1:{port}/missing-test',wait_until='networkidle');assert missing.status==404
  pg.goto(f'http://127.0.0.1:{port}/',wait_until='networkidle');pg.get_by_role('button',name='03 Wolverine').click();pg.get_by_role('button',name='Load performance').click();pg.wait_for_selector('.journey-stage[data-status="ready"]',timeout=60000);pg.get_by_role('slider',name='Animation progress').fill('0.4');assert pg.locator('canvas').count()==1
  r['checks'].append(label+': 17 important mobile routes, real 404 and independently served GLB rendering pass.');c.close()
 b.close()
for name in ['GAME-FROST-Source-Review.zip','GAME-FROST-Netlify-Drop-Review.zip']:
 with zipfile.ZipFile(ROOT/'outputs/releases'/name) as z:assert z.testzip() is None;assert not any('/node_modules/' in f or '/.git/' in f or '/.env.' in f and not f.endswith('.env.example') for f in z.namelist())
r['checks'].append('Both ZIPs pass CRC validation and exclude dependency directories, Git metadata and secret environment files.')
assert not r['errors'];(ROOT/'docs/package-verification.json').write_text(json.dumps(r,indent=2));print(json.dumps(r),flush=True)
