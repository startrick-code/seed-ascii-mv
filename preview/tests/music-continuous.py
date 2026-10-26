from playwright.sync_api import sync_playwright
import os,json
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1180,'height':820});page.goto('http://localhost:8094');page.set_input_files('#file',os.environ['TEST_AUDIO']);page.wait_for_function('document.querySelector("#status").textContent.includes("已识别")');page.click('#play');samples=[]
 for target in [2,6.3,15,21.3,28,30]:
  page.wait_for_function('(t)=>audio.currentTime>=t-.03',arg=target,timeout=35000);page.wait_for_timeout(60)
  samples.append(page.evaluate('({audio:audio.currentTime,visual:Number(document.querySelector("canvas").dataset.time),scene:document.querySelector("canvas").dataset.scene})'))
 assert all(abs(s['audio']-s['visual'])<.15 for s in samples);assert page.evaluate('audio.paused');print(json.dumps({'actual_MP3_continuous':'PASS','samples':samples}));b.close()
