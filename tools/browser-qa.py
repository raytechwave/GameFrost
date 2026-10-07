"""Run against the built static package, using the installed Chromium and Playwright."""
import json, os, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs' / 'preview'
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('GF_QA_URL', 'http://127.0.0.1:4175')
DOC = json.loads((ROOT / 'netlify-dist/store-content.json').read_text())
def product_path(p):
    import re
    return '/shop/' + re.sub('[^a-z0-9]+', '-', p['platform'].lower()) + '/' + p['id']
ROUTES = list(dict.fromkeys(list(DOC['seo']) + ['/admin'] + [product_path(p) for p in DOC['products'] if p.get('active', True)] + ['/games/' + g['id'] for g in DOC['games']] + ['/guides/' + g['slug'] for g in DOC['guides']]))
IMPORTANT = ['/', '/shop', product_path(DOC['products'][0]), '/trade-in', '/services', '/checkout', '/account', '/new-games', '/reviews', '/about', '/visit', '/guides', '/faq', '/policies', '/admin']
report = {'environment':'Headless Chromium on Linux; emulated viewports, not a physical phone', 'routes':[], 'layouts':[], 'functional':[], 'errors':[], 'screenshots':[]}

resume=os.environ.get('GF_QA_RESUME')=='1'
if resume and (ROOT/'docs/browser-route-scan.json').exists():
    report=json.loads((ROOT/'docs/browser-route-scan.json').read_text())
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    context = browser.new_context(viewport={'width':1440,'height':1000})
    page = context.new_page()
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    def visit(route):
        response = page.goto(BASE + route, wait_until='networkidle')
        page.wait_for_selector('.site-header')
        assert response.status == 200, (route, response.status)
        text = page.locator('main').inner_text()
        assert not any(x in text for x in ['Let’s reset this display.', 'The store is temporarily unavailable.', 'This room isn’t here.']), (route, text[:150])
        assert page.locator('main h1').count(), route
        return text
    for width in ([] if resume else [1440,390]):
        page.set_viewport_size({'width':width,'height':1000 if width==1440 else 844})
        for i,route in enumerate(ROUTES):
            text = visit(route)
            page.evaluate("window.scrollTo({top:document.body.scrollHeight,behavior:'instant'})")
            page.wait_for_timeout(70)
            broken = page.locator('img').evaluate_all('(imgs)=>imgs.filter(i=>i.complete&&i.currentSrc&&i.naturalWidth===0).map(i=>i.currentSrc)')
            overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth+1')
            report['routes'].append({'width':width,'path':route,'h1':page.locator('main h1').first.inner_text(),'overflow':overflow,'brokenImages':broken})
            assert not broken, (route,broken)
            if route in IMPORTANT:
                page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
                file=('home' if route=='/' else route.strip('/').replace('/','-'))+'-'+str(width)+'.png'
                page.screenshot(path=str(OUT/file),full_page=True)
                report['screenshots'].append(file)
            if i%20==0: print('Routes:',width,i+1,'/',len(ROUTES),flush=True)
    for width in ([] if resume else [320,360,390,430,768,1024,1440]):
        page.set_viewport_size({'width':width,'height':844 if width<768 else 1000})
        for route in IMPORTANT:
            visit(route)
            overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth+1')
            report['layouts'].append({'width':width,'path':route,'overflow':overflow})
        print('Layouts:',width,'complete',flush=True)
    (ROOT/'docs/browser-route-scan.json').write_text(json.dumps(report,indent=2))
    page.set_viewport_size({'width':844,'height':390})
    for route in ['/', '/shop', '/admin', '/services']:
        visit(route);report['layouts'].append({'width':844,'height':390,'path':route,'overflow':page.evaluate('document.documentElement.scrollWidth > innerWidth+1')})
    page.set_viewport_size({'width':390,'height':844})
    visit('/')
    page.get_by_role('button',name='Open menu').click()
    assert page.get_by_role('dialog').is_visible()
    page.keyboard.press('Escape')
    page.get_by_role('dialog').wait_for(state='hidden')
    page.get_by_role('button',name='Search products').click()
    page.get_by_role('textbox',name='Search catalog').fill('PS5')
    page.get_by_role('dialog').get_by_role('link').filter(has_text='PlayStation 5').first.wait_for()
    page.keyboard.press('Escape')
    report['functional'].append('Mobile menu and search open, keyboard Escape closes them, and product search returns matching products.')
    visit(product_path(DOC['products'][0]))
    page.get_by_role('button',name='Add to cart',exact=True).first.click()
    page.wait_for_timeout(300)
    visit('/cart');assert DOC['products'][0]['name'] in page.locator('main').inner_text()
    page.get_by_role('button',name='Increase '+DOC['products'][0]['name']+' quantity').click()
    page.wait_for_timeout(200)
    visit('/checkout')
    for field,value in [('contact-phone','03001234567'),('contact-name','QA Customer'),('contact-city','Karachi'),('contact-address','QA address, test only')]:page.locator('#'+field).fill(value)
    page.get_by_role('checkbox').check()
    page.get_by_role('button',name='Save order draft on this device').click()
    page.wait_for_selector('.confirmation')
    assert 'No order, reservation, payment or message' in page.locator('main').inner_text()
    visit('/account');assert 'DRAFT' in page.locator('main').inner_text();assert '290,000' in page.locator('main').inner_text().replace('1,45,000','145,000') or '2,90,000' in page.locator('main').inner_text()
    report['functional'].append('Product → persistent cart → quantity 2 → validated local checkout → private account draft, total PKR 290000, with no submission/payment claim.')
    visit('/shop?platform=PlayStation&q=PS5')
    assert 'PlayStation' in page.url
    visit('/shop?q=doesnotexist123');assert 'No models match' in page.locator('main').inner_text()
    visit('/visit');assert '+923350263448' in page.locator('main').inner_text();assert '3:00 PM' in page.locator('main').inner_text()
    missing=page.goto(BASE+'/not-a-real-route',wait_until='networkidle');assert missing.status==404;assert 'This room isn’t here.' in page.locator('main').inner_text()
    report['functional'].append('Search URLs, empty results, confirmed contact details and a real HTTP 404 work.')
    visit('/admin')
    page.get_by_role('button',name='Character scenes',exact=True).click();assert 'Goku Ultra Instinct' in page.locator('main').inner_text()
    page.screenshot(path=str(OUT/'admin-scenes-mobile.png'),full_page=True)
    page.get_by_role('button',name='Customer requests',exact=True).click();assert 'need the hosted backend' in page.locator('main').inner_text()
    # Exercise actual local API adapter through the browser, including draft/public separation and conflict rejection.
    result=page.evaluate('''async()=>{const snapshot=await(await fetch('/api/admin')).json();const doc=structuredClone(snapshot.document);doc.products[0].name='QA product draft';const save=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save',revision:snapshot.revision,document:doc})});const stale=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save',revision:snapshot.revision,document:doc})});return{saved:save.status,stale:stale.status,revision:(await save.json()).revision,doc}}''')
    assert result['saved']==200 and result['stale']==409,result
    visit(product_path(DOC['products'][0]));assert DOC['products'][0]['name'] in page.locator('main').inner_text()
    visit('/admin')
    page.get_by_role('button',name='Preview',exact=True).click()
    page.wait_for_timeout(500)
    assert 'Draft preview' in page.frame_locator('iframe[title="Store draft preview"]').locator('body').inner_text()
    page.keyboard.press('Escape')
    page.get_by_role('button',name='Apply locally',exact=True).first.click()
    page.wait_for_timeout(300)
    visit(product_path(DOC['products'][0]));assert 'QA product draft' in page.locator('main').inner_text()
    fresh=browser.new_context(viewport={'width':390,'height':844});other=fresh.new_page();other.goto(BASE+product_path(DOC['products'][0]),wait_until='networkidle');assert DOC['products'][0]['name'] in other.locator('main').inner_text();fresh.close()
    report['functional'].append('Local admin scene controls, draft preview, draft/public separation, stale-save HTTP 409, and local apply work; an independent visitor remains unchanged as advertised.')
    visit('/admin')
    page.get_by_role('button',name='Versions & backup',exact=True).click()
    with page.expect_download() as exported:page.get_by_role('button',name='Netlify package',exact=True).last.click()
    exported.value.save_as(str(ROOT/'outputs/browser-export-test.zip'))
    report['functional'].append('The actual browser admin Netlify export downloads a ZIP.')
    context.close();browser.close()
report['layoutFailures']=[row for row in report['layouts'] if row['overflow']]
report['routeFailures']=[row for row in report['routes'] if row['overflow'] or row['brokenImages']]
(ROOT/'docs/browser-verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'routes':len(report['routes']),'layouts':len(report['layouts']),'errors':report['errors'],'overflow':report['layoutFailures'],'functional':report['functional']}),flush=True)
