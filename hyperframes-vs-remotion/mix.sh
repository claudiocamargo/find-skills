#!/bin/bash
# usage: bash mix.sh <frames_dir> <out.mp4> — narração (ElevenLabs, voz clonada) + trilha com ducking + efeitos
set -e
F=$1; OUT=$2; A=$(dirname "$0")/audio
CUTS=(10 20.5 29.9 40.3)
VO=(0.45 10.45 20.95 30.35 40.75)
POPS=(2.95 4.2 13.95 15.05 16.25 17.2 18.0 24.45 26.5 27.9 31.3 33.2 35.1 37.0 43.25 43.55 44.05)
in=(-i $A/music.mp3); fc="[0:a]volume=0.55,afade=t=in:d=0.4,afade=t=out:st=46.2:d=1.8[mus];"; n=1; vo=""; fx=""
for i in 0 1 2 3 4; do in+=(-i $A/s$((i+1)).mp3); d=$(echo "${VO[$i]}*1000/1" | bc); fc+="[$n:a]atempo=1.1,adelay=${d}:all=1[v$i];"; vo+="[v$i]"; n=$((n+1)); done
fc+="${vo}amix=inputs=5:normalize=0,highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,volume=1.9,asplit[vox][key];"
fc+="[mus][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck];"
j=0
for c in "${CUTS[@]}"; do
  in+=(-i $A/whoosh.mp3 -i $A/impact.mp3); d1=$(echo "($c-0.5)*1000/1" | bc); d2=$(echo "$c*1000/1" | bc)
  fc+="[$n:a]volume=0.5,adelay=${d1}:all=1[f$j];[$((n+1)):a]volume=0.45,adelay=${d2}:all=1[f$((j+1))];"; fx+="[f$j][f$((j+1))]"; n=$((n+2)); j=$((j+2)); done
for t in "${POPS[@]}"; do
  in+=(-i $A/pop.mp3); d=$(echo "$t*1000/1" | bc); fc+="[$n:a]volume=0.3,adelay=${d}:all=1[f$j];"; fx+="[f$j]"; n=$((n+1)); j=$((j+1)); done
fc+="[vox][duck]${fx}amix=inputs=$((j+2)):normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:48[a]"
ffmpeg -v error -y "${in[@]}" -framerate 30 -i $F/f%05d.png -filter_complex "$fc" -map $n:v -map "[a]" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -r 30 -c:a aac -b:a 192k -ar 48000 -ac 2 -t 48 -movflags +faststart "$OUT"
