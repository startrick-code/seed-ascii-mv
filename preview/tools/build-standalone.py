from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'index.html').read_text().replace('<link rel="stylesheet" href="style.css" />','<style>'+(r/'style.css').read_text()+'</style>')
for name in ['core','geometry','scenes','director','audio-analysis','app']:
 code=(r/(name+'.js')).read_text()
 if name=='director':
  start=code.index('  const ready=');end=code.index('\n  function configure',start)
  code=code[:start]+'  const ready=Promise.resolve(configure('+(r/'music-timeline.json').read_text()+'));'+code[end:]
 s=s.replace('<script src="'+name+'.js"></script>','<script>'+code+'</script>')
(r/'standalone.html').write_text(s)
