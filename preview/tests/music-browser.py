from playwright.sync_api import sync_playwright
from pathlib import Path
import os,json
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1180,'height':820},device_scale_factor=2,has_touch=True);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://localhost:8094');page.wait_for_function('Director.timeline.length===5')
 page.click('#demo');page.wait_for_function('audio.duration>29');page.click('#play');page.wait_for_function('audio.currentTime>.2');page.click('#play')
 page.set_input_files('#file',os.environ['TEST_AUDIO']);page.wait_for_function('document.querySelector("#status").textContent.includes("已识别")')
 page.click('#play');page.wait_for_function('audio.currentTime>.2');page.evaluate('audio.currentTime=7');page.wait_for_function('analysis.sample().mid>.05');page.wait_for_timeout(200);page.click('#play');page.wait_for_timeout(100)
 t=page.evaluate('audio.currentTime');img=page.eval_on_selector('canvas','c=>c.toDataURL()');page.wait_for_timeout(300);assert t==page.evaluate('audio.currentTime');assert img==page.eval_on_selector('canvas','c=>c.toDataURL()')
 for t in [2,6.3,15,21.3,24,28]:
  page.evaluate('(t)=>audio.currentTime=t',t);page.wait_for_timeout(200);page.screenshot(path=str(root/f'docs/music-{t}.png'))
 page.evaluate('audio.currentTime=15');page.wait_for_timeout(180);img=page.eval_on_selector('canvas','c=>c.toDataURL()')
 for t in [28,7,21,15]:page.evaluate('(t)=>audio.currentTime=t',t);page.wait_for_timeout(180)
 assert img==page.eval_on_selector('canvas','c=>c.toDataURL()')
 page.locator('summary').click();page.select_option('#chapter','20.773');page.wait_for_function('Math.abs(audio.currentTime-20.773)<.03')
 page.uncheck('#reactive');page.wait_for_timeout(180);off=page.eval_on_selector('canvas','c=>c.toDataURL()');page.check('#reactive');page.wait_for_timeout(180);assert off!=page.eval_on_selector('canvas','c=>c.toDataURL()');page.locator('summary').click()
 page.click('#hideControls');assert not page.locator('.controls').is_visible();page.click('#showControls')
 for w,h in [(1024,768),(1366,1024),(768,1024)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(100);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.set_viewport_size({'width':1180,'height':820});page.click('#play');page.eval_on_selector('#seek','e=>{e.value=23;e.dispatchEvent(new Event("input"));e.dispatchEvent(new Event("change"));}');page.wait_for_function('!audio.paused&&audio.currentTime>23.1');page.click('#play')
 page.evaluate('audio.currentTime=29.7');page.click('#play');page.wait_for_timeout(700);assert page.evaluate('audio.paused')
 assert not errors,errors
 print('PASS actual MP3: local-file SHA match, real mid-band, pause pixels, repeat seeks, 20.773s chapter, response switch, immersive, 3 viewports, scrub-resume, 30s stop, no JS errors')
 b.close()
