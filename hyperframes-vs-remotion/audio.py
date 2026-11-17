# trilha sintetizada a 120 bpm (cortes de cena nos compassos) + whoosh nas trocas + ticks nas entradas
import numpy as np, wave, sys
SR=44100; T=36.0; n=int(SR*T); t=np.arange(n)/SR
out=np.zeros(n); rng=np.random.default_rng(7)
def add(s0,x,g=1.0):
    s0=int(s0*SR)
    if s0<0: x=x[-s0:]; s0=0
    L=min(len(x),n-s0)
    if L>0: out[s0:s0+L]+=x[:L]*g
cuts=[6,14,22,30]
# acordes por compasso (2 s): Am F C G
chords=[[220,261.63,329.63],[174.61,220,261.63],[261.63,329.63,392],[196,246.94,293.66]]
bass=[55,43.65,65.41,49]
for b in range(18):
    a=b*2.0; ch=chords[b%4]
    # pad
    L=int(2.4*SR); tt=np.arange(L)/SR; env=np.clip(tt/.4,0,1)*np.clip((2.4-tt)/.5,0,1)
    add(a-.1,sum(np.sin(2*np.pi*f*tt)+.4*np.sin(2*np.pi*f*2.004*tt) for f in ch)*env,.035)
    full = a>=6 and a<34
    for q in range(8):               # colcheias
        tq=a+q*.25
        # pluck arpejo
        f=ch[[0,1,2,1,0,2,1,2][q]]*2; L=int(.22*SR); tt=np.arange(L)/SR
        add(tq,(np.sin(2*np.pi*f*tt)+.3*np.sin(2*np.pi*2*f*tt))*np.exp(-tt*16),.07 if a>=2 else .045)
        if full or (a>=2 and q%2==0):
            # baixo
            L=int(.2*SR); tt=np.arange(L)/SR
            add(tq,np.tanh(2*np.sin(2*np.pi*bass[b%4]*2*tt))*np.exp(-tt*9),.10)
        if full and q%2==1:          # chimbal no contratempo
            L=int(.05*SR); x=rng.standard_normal(L); x=x-np.convolve(x,np.ones(8)/8,'same')
            add(tq,x*np.exp(-np.arange(L)/SR*90),.05)
    for q in range(4):               # bumbo
        if full or (a>=4 and q==0):
            L=int(.3*SR); tt=np.arange(L)/SR
            add(a+q*.5,np.sin(2*np.pi*(48*tt+ (110/30)*(1-np.exp(-tt*30))))*np.exp(-tt*11),.42)
        if full and q in (1,3):      # palma
            L=int(.12*SR); x=rng.standard_normal(L); x=x-np.convolve(x,np.ones(20)/20,'same')
            add(a+q*.5,x*np.exp(-np.arange(L)/SR*38),.07)
for c in cuts:                       # whoosh + impacto
    L=int(.9*SR); x=rng.standard_normal(L); x=np.convolve(x,np.ones(24)/24,'same'); e=np.sin(np.pi*np.arange(L)/L)**3
    add(c-.5,x*e,.5)
    L=int(.7*SR); tt=np.arange(L)/SR; add(c,np.sin(2*np.pi*40*tt)*np.exp(-tt*5),.35)
ticks=[.35,.63,.91, 3.4, 10.2,10.52,10.84,11.16,11.48, 16.3,16.52,16.74,16.96,17.18,17.4, 18.3,18.8,19.3, 23.7,24.55,25.4,26.25, 32.5,32.9,33.7]
for k in ticks:
    L=int(.07*SR); tt=np.arange(L)/SR; add(k,np.sin(2*np.pi*1500*tt)*np.exp(-tt*70),.09)
# acorde final
L=int(2*SR); tt=np.arange(L)/SR
add(34,sum(np.sin(2*np.pi*f*tt) for f in [110,220,329.63,440])*np.exp(-tt*1.8),.08)
out*=np.clip(t/.3,0,1)*np.clip((T-t)/1.6,0,1)
out=np.tanh(out*1.5); out/=np.abs(out).max()
with wave.open(sys.argv[1],'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767*.8).astype(np.int16).tobytes())
