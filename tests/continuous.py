from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1180,'height':820});page.goto('http://localhost:8090');page.click('#demo');page.wait_for_function('audio.duration>29');page.click('#play')
 samples=[]
 for target in [2,7,12,20,27,30]:
  page.wait_for_function('(t)=>audio.currentTime>=t-.03',arg=target,timeout=35000)
  page.wait_for_timeout(70)
  samples.append(page.evaluate('({audio:audio.currentTime,visual:Number(screenCanvas.dataset.time),scene:screenCanvas.dataset.scene})'.replace('screenCanvas','document.querySelector("canvas")')))
 assert all(abs(s['audio']-s['visual'])<.15 for s in samples),samples
 assert page.evaluate('audio.paused')
 print(json.dumps({'continuous_30s':'PASS','samples':samples}));b.close()
