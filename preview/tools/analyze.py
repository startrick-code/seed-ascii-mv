"""Local-only analysis. Usage: python3 tools/analyze.py /path/to/audio.mp3
No audio samples are written to the project; output contains coarse statistics only.
"""
import sys, subprocess,json,hashlib
from pathlib import Path
import numpy as np
from scipy.signal import find_peaks
p=Path(sys.argv[1]);sr=22050
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-t','30','-ac','1','-ar',str(sr),'-f','f32le','-'])
x=np.frombuffer(raw,dtype='<f4');n=2048;hop=220
frames=np.lib.stride_tricks.sliding_window_view(np.pad(x,(n//2,n)),n)[::hop][:int(30*sr/hop)+1]
rms=np.sqrt(np.mean(frames**2,axis=1));spec=np.abs(np.fft.rfft(frames*np.hanning(n),axis=1));freq=np.fft.rfftfreq(n,1/sr)
bands=[np.sqrt(np.mean(spec[:,(freq>=lo)&(freq<hi)]**2,axis=1)) for lo,hi in [(35,220),(220,2200),(2200,9000)]]
flux=np.maximum(np.diff(np.log1p(spec),axis=0,prepend=np.log1p(spec[:1])),0).mean(axis=1)
peaks,_=find_peaks(flux,prominence=np.percentile(flux,70)*.6,distance=int(.22*sr/hop))
times=np.arange(len(rms))*hop/sr
for k in range(30):
 m=(times>=k)&(times<k+1);print(k,round(float(np.mean(rms[m])),4),round(float(np.max(rms[m])),4))
print('onsets',[(round(float(times[i]),3),round(float(flux[i]),3)) for i in peaks if times[i]>5.5])
duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)]))
# Each 100ms row is a scalar analysis window, not FFT bins or recoverable samples.
scale=lambda v:np.clip(v/max(float(np.percentile(v,95)),1e-6),0,1)
values=[scale(rms),*[scale(b) for b in bands]]
profile=[]
for t in np.arange(0,30.001,.1):
 idx=int(np.argmin(abs(times-t)));profile.append([round(float(v[idx]),3) for v in values])
out={'schema':1,'duration':duration,'previewDuration':30,'audioSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'method':{'sampleRate':sr,'window':n,'hop':hop,'profileStep':.1,'columns':['rms','bass35_220','mid220_2200','high2200_9000'],'normalization':'each feature / first-30s 95th percentile, clipped 0..1','warning':'Spectral-flux peaks are onset candidates, NOT annotated beats. No perceptual beat annotation performed.'},'onsetCandidates':[{'time':round(float(times[i]),3),'strength':round(float(min(1,flux[i]/np.percentile(flux,98))),3),'kind':'spectral-flux-candidate'} for i in peaks if times[i]>5.5],'profile':profile}
target=Path('music-timeline.json')
if target.exists():
 old=json.loads(target.read_text())
 for key in ['scenes','events','notes']:
  if key in old: out[key]=old[key]
target.write_text(json.dumps(out,indent=2)+'\n')
