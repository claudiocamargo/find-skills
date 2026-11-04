# trilha ambiente sintetizada + "whoosh" nas trocas de cena
import numpy as np, wave, sys
SR=44100; T=80.5; n=int(SR*T); t=np.arange(n)/SR
cuts=[6.5,14,21.5,31,38,52,60,70]
chords=[[110,164.81,220,261.63],[87.31,130.81,174.61,261.63],[98,146.83,196,246.94],[82.41,123.47,164.81,246.94]]
out=np.zeros(n)
bar=T/8
for i in range(8):
    a,b=i*bar,(i+1)*bar; ch=chords[i%4]
    m=(t>=a-1.5)&(t<b+1.5); tt=t[m]
    env=np.clip((tt-(a-1.5))/3,0,1)*np.clip(((b+1.5)-tt)/3,0,1)
    s=sum(np.sin(2*np.pi*f*tt+j)*(.5 if j else 1)+.3*np.sin(2*np.pi*f*2.003*tt) for j,f in enumerate(ch))
    out[m]+=s*env*(1+.15*np.sin(2*np.pi*.2*tt))
out/=np.abs(out).max(); out*=.22
rng=np.random.default_rng(1)
for c in cuts:
    L=int(SR*.6); s0=int(SR*(c-.35)); x=rng.standard_normal(L)
    x=np.convolve(x,np.ones(30)/30,'same'); e=np.sin(np.pi*np.arange(L)/L)**2
    out[s0:s0+L]+=x*e*.35
# pulso grave suave a cada 2s
for k in np.arange(0,T,2.0):
    s0=int(SR*k); L=int(SR*.4); tt=np.arange(L)/SR
    out[s0:s0+L]+=np.sin(2*np.pi*55*tt)*np.exp(-tt*9)*.25
fade=np.clip(t/1.0,0,1)*np.clip((T-t)/2.0,0,1); out*=fade
out=np.clip(out,-1,1)
with wave.open(sys.argv[1],'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767*.9).astype(np.int16).tobytes())
