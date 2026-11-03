"""Original procedural instrumental: 105 BPM, no third-party samples."""
import json, wave
from pathlib import Path
import numpy as np
P=Path(__file__).parent; C=json.loads((P/'config.json').read_text());SR=48000;beat=60/105
rng=np.random.default_rng(273)
def osc(f,t):return np.sin(2*np.pi*f*t)
def make(variant,v):
 dur=sum(x[1] for x in v['scenes']);a=np.zeros((int((dur+.3)*SR),2),np.float64)
 def add(sig,start,volume=1,pan=0):
  i=int(start*SR)
  if i<0:return
  n=min(len(sig),len(a)-i)
  if n<=0:return
  a[i:i+n,0]+=sig[:n]*volume*np.sqrt((1-pan)/2);a[i:i+n,1]+=sig[:n]*volume*np.sqrt((1+pan)/2)
 def note(f,d=.4):
  t=np.arange(int(d*SR))/SR;return (osc(f,t)+.25*osc(f*2.003,t)+.12*osc(f*3,t))*np.exp(-t*9)*(1-np.exp(-t*200))
 def kick():
  t=np.arange(int(.4*SR))/SR;phase=2*np.pi*(48*t+75*.022*(1-np.exp(-t/.022)));return np.sin(phase)*np.exp(-t*12)
 def hat(d=.07):
  t=np.arange(int(d*SR))/SR;n=rng.normal(0,1,len(t));n=np.r_[0,np.diff(n)];return n*np.exp(-t*65)*.2
 def rim():
  t=np.arange(int(.12*SR))/SR;return (osc(1800,t)+osc(740,t)+rng.normal(0,.3,len(t)))*np.exp(-t*65)
 # Original F minor progression and syncopated marimba phrase.
 chords=[[174.61,207.65,261.63],[138.59,174.61,207.65],[155.56,196,233.08],[130.81,164.81,196]]
 for n in range(int(dur/beat)+1):
  t=n*beat;bar=n//4;ch=chords[(bar//2)%4];build=.65 if t<8 else 1
  if n%4 in (0,2) or n%8==7:add(kick(),t,.42*build)
  if n%4 in (1,3):add(rim(),t,.13*build,.12)
  for off in (0,.5,.75):add(hat(),t+off*beat,.16,(-1 if off==.5 else 1)*.45)
  if n%4 in (0,1,3):
   add(note(ch[(n//2)%3]*2,.6),t+beat*.25,.13*build,-.2)
   lt=np.arange(int(.55*SR))/SR;freq=ch[0]/3;log=(osc(freq,lt)+.3*osc(freq*2,lt))*np.exp(-lt*7);add(log,t+beat*.1,.27*build)
  if n%4==0:
   tt=np.arange(int(beat*3.5*SR))/SR;pad=sum(osc(f,tt) for f in ch)/3*np.sin(np.pi*np.minimum(tt/(beat*3.5),1))**2;add(pad,t,.065)
 # Per-scene whooshes / impacts and pins pops, independent of chosen duration.
 start=0
 for scene,length in v['scenes']:
  if start:
   tt=np.arange(int(.23*SR))/SR;noise=rng.normal(0,1,len(tt));smooth=np.convolve(noise,np.ones(7)/7,mode='same');add(smooth*np.sin(np.pi*tt/.23)**2,start-.12,.13,-.25);add(kick(),start,.19)
  if scene==4:
   for offset in (.4,.7,1):add(note(750+offset*350,.14),start+offset,.2)
  if scene==5:add(note(1046.5,1),start+.35,.17)
  if scene==6:
   tt=np.arange(int(.09*SR))/SR;add(rng.normal(0,1,len(tt))*.08,start+length/3,.1)
  if scene==8:
   for off,f in zip((0,.16,.32),(523.25,622.25,830.61)):add(note(f,.7),start+length-2+off,.16)
  start+=length
 a=a[:int(dur*SR)];fade=np.minimum(np.arange(len(a))/SR/.08,1)*np.minimum((len(a)-np.arange(len(a)))/SR/.6,1);a*=fade[:,None];a=np.tanh(a*1.2)*.8
 with wave.open(str(P/'output'/f'{variant}-music.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((a*32767).astype('<i2').tobytes())
for k,v in C['variants'].items():make(k,v)
print('Original music and SFX rendered for all four edits')
