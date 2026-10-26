"""Run with static server at :8090. BROWSER=webkit selects Playwright WebKit."""
from playwright.sync_api import sync_playwright
import os, hashlib, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    engine=os.environ.get('BROWSER','chromium')
    args={'headless':True}
    if engine=='chromium': args.update(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    browser=getattr(p,engine).launch(**args)
    page=browser.new_page(viewport={'width':1180,'height':820},device_scale_factor=2,has_touch=True)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8090');page.click('#demo')
    page.wait_for_function('audio.duration>29');assert page.evaluate('audio.paused')
    page.click('#play');page.wait_for_function('audio.currentTime>.4')
    page.wait_for_function('analysis.sample().rms>0.005')
    page.click('#play');page.wait_for_timeout(150)
    t=page.evaluate('audio.currentTime');pixels=page.eval_on_selector('canvas','c=>c.toDataURL()')
    page.wait_for_timeout(400);assert page.evaluate('audio.currentTime')==t
    assert pixels==page.eval_on_selector('canvas','c=>c.toDataURL()')
    for t,scene in [(0,'boot'),(12,'dimension'),(20,'life'),(28,'consciousness'),(3.8,'boot'),(8,'creation'),(14,'dimension'),(22,'life')]:
        page.evaluate('(t)=>audio.currentTime=t',t);page.wait_for_timeout(200)
        assert page.locator('canvas').get_attribute('data-scene')==scene
    page.evaluate('audio.currentTime=12');page.wait_for_timeout(180)
    original=page.eval_on_selector('canvas','c=>c.toDataURL()')
    for t in [28,20,0,12]:page.evaluate('(t)=>audio.currentTime=t',t);page.wait_for_timeout(160)
    assert original==page.eval_on_selector('canvas','c=>c.toDataURL()')
    page.click('#play');page.wait_for_function('!audio.paused')
    page.eval_on_selector('#seek','e=>{e.value=20;e.dispatchEvent(new Event("input"));e.dispatchEvent(new Event("change"));}')
    page.wait_for_function('!audio.paused && audio.currentTime>20.1');page.click('#play')
    page.locator('summary').click();page.select_option('#quality','24');page.fill('#offset','1.5')
    page.select_option('#chapter','11');page.wait_for_function('Math.abs(audio.currentTime-9.5)<.05')
    page.fill('#offset','0');page.locator('summary').click()
    for w,h in [(1024,768),(1366,1024),(768,1024)]:
        page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(180)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert page.eval_on_selector('canvas','c=>Math.abs(c.clientWidth/c.clientHeight-16/9)<.02')
    page.set_viewport_size({'width':1180,'height':820})
    page.click('#hideControls');assert not page.locator('.controls').is_visible();page.click('#showControls')
    # Real file chooser path using our original generated WAV, no third-party asset.
    data=page.evaluate('async()=>Array.from(new Uint8Array(await (await fetch(audio.src)).arrayBuffer()))')
    page.set_input_files('#file',{'name':'original.wav','mimeType':'audio/wav','buffer':bytes(data)})
    page.wait_for_function('audio.duration>29');page.click('#play');page.wait_for_function('audio.currentTime>.2')
    page.evaluate('audio.currentTime=29.8');page.wait_for_timeout(600);assert page.evaluate('audio.paused')
    page.click('#play');page.wait_for_function('audio.currentTime>.1 && audio.currentTime<2');page.click('#play')
    for t in [3.8,8,14,22,28]:
        page.evaluate('(t)=>audio.currentTime=t',t);page.wait_for_timeout(200);page.screenshot(path=str(root/f'docs/scene-{t}.png'))
    assert not errors,errors
    print(json.dumps({'engine':engine,'result':'PASS','checks':['manual-start','real-FFT-RMS','pause-clock-and-pixels','direct-seeks','repeat-seek-identical','scrub-resume','offset','24fps-setting','3-viewports-16:9','immersive','local-file-play','30-second-stop','restart','no-JS-errors']},ensure_ascii=False))
    browser.close()
