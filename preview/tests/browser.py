# Current revision requires TEST_AUDIO to point to the local, unbundled music.
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('music-browser.py')),run_name='__main__')
