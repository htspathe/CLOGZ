"""Synchronize narration stems without time stretching; mix original music and export captions."""
from pathlib import Path
import subprocess,json,wave
import numpy as np
from scipy.ndimage import maximum_filter1d,gaussian_filter1d
P=Path(__file__).parent;C=json.loads((P/'config.json').read_text());SR=48000
scripts=json.loads((P/'assets/narration.json').read_text());short=json.loads((P/'assets/short-narration.json').read_text())
def decode(f):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(f),'-f','f32le','-ar',str(SR),'-ac','1','-']),dtype='<f4').copy()
def timestamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
def writewav(f,a):
 with wave.open(str(f),'wb') as w:w.setnchannels(a.shape[1] if a.ndim>1 else 1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(a,-.99,.99)*32767).astype('<i2').tobytes())
def finalize(variant):
 v=C['variants'][variant];duration=sum(s[1] for s in v['scenes']);voice=np.zeros(int(duration*SR));captions=[];start=0
 for scene,length in v['scenes']:
  key=f'voice-{scene}';words=scripts[scene]
  if variant=='reel' and scene==1:key='short-site';words=short[key]
  if variant=='teaser' and scene in [0,4,5,7,8]:key={0:'short-site',4:'short-pins',5:'short-price',7:'short-benefits',8:'short-end'}[scene];words=short[key]
  a=decode(P/'assets'/f'{key}.mp3');idx=np.where(np.abs(a)>.008)[0]
  if len(idx):a=a[max(0,idx[0]-int(.06*SR)):min(len(a),idx[-1]+int(.12*SR))]
  seconds=len(a)/SR
  if seconds>length:raise ValueError(f'{variant} scene {scene}: voice {seconds:.2f}s exceeds {length}s; shorten script, never accelerate')
  offset=min(.18,(length-seconds)/2);at=start+offset;i=round(at*SR);voice[i:i+len(a)]+=a
  # Sentence-sized captions faithful to the audio, held only during its phrase.
  captions.append((at,at+seconds,words.replace('CLOGZ point S N','www.clogz.sn')));start+=length
 srt='\n\n'.join(f'{i+1}\n{timestamp(a)} --> {timestamp(b)}\n{s}' for i,(a,b,s) in enumerate(captions))+'\n'
 (P/'output'/f'{variant}.srt').write_text(srt)
 writewav(P/'output'/f'{variant}-voice.wav',voice)
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(P/'output'/f'{variant}-music.wav'),'-f','f32le','-ar',str(SR),'-ac','2','-']);music=np.frombuffer(raw,dtype='<f4').reshape(-1,2).copy()
 active=maximum_filter1d(np.abs(voice)[::480],size=35)>.012;duck=gaussian_filter1d(active.astype(float),6);duck=np.interp(np.arange(len(voice))/480,np.arange(len(duck)),duck)
 mix=music*(.9-.65*duck[:,None])+voice[:,None]*1.25;writewav(P/'output'/f'{variant}-mix.wav',mix)
 if __import__('os').environ.get('AUDIO_ONLY'):print(variant,'audio and subtitles ready',flush=True);return
 out={'master':'CLOGZ_V3_Master_40s_Vertical','reel':'CLOGZ_V3_Reel_30s','teaser':'CLOGZ_V3_Teaser_15s','youtube':'CLOGZ_V3_YouTube_43s'}[variant]
 for vo in [False,True]:
  args=['ffmpeg','-y','-v','error','-i',str(P/'output'/f'{variant}-silent.mp4'),'-i',str(P/'output'/(f'{variant}-'+('mix' if vo else 'music')+'.wav'))]
  if vo:args+=['-i',str(P/'output'/f'{variant}.srt')]
  args+=['-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k']
  if vo:args+=['-map','2:0','-c:s','mov_text','-metadata:s:s:0','language=fra','-disposition:s:0','default']
  args+=['-movflags','+faststart','-t',str(duration),str(P/'output'/(out+('_Voix_Provisoire' if vo else '_Musique')+'.mp4'))]
  subprocess.run(args,check=True)
 print(variant,'synced, no time stretching',flush=True)
if __name__=='__main__':
 import sys
 for k in sys.argv[1:] or C['variants']:finalize(k)
