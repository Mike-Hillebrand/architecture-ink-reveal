# Videoexport (Reels, TikTok, Shorts)

Nur ausführen, wenn ein Video ausdrücklich beauftragt ist. Format, Länge, Ton und Texte vorher im Briefing festhalten.

## 1. Frames aufnehmen

Die Vorschau muss über HTTP laufen (siehe `umsetzung.md`). Dann:

```sh
npm i playwright-core            # einmalig, in einem Hilfsordner außerhalb des Skills
node /absolut/zum/skill/scripts/capture_frames.js http://127.0.0.1:8766/ /absolut/frames 30 12000
```

Das Skript fährt die Animation per `seek(ms)` deterministisch ab, statt in Echtzeit mitzuschneiden. So gibt es keine verlorenen oder doppelten Frames. Ausgabe: `f0000.png …` in doppelter Auflösung des Zeichenblatts (Standard 2160 px breit).

## 2. 9:16 schneiden

Zeichnung oben/mittig auf 1080 × 1920, Papierfarbe als Fläche, Texte per `drawtext`. Texte zwischen y ≈ 250 und 1450 halten; unten und rechts liegen die Bedienelemente der Apps.

```sh
ffmpeg -framerate 30 -i frames/f%04d.png -i beat.wav -filter_complex \
 "[0]scale=1080:720:flags=lanczos,tpad=stop_mode=clone:stop_duration=3,\
pad=1080:1920:0:600:color=0xeeece5,format=yuv420p,\
drawtext=fontfile=/System/Library/Fonts/Supplemental/Georgia.ttf:textfile=titel.txt:fontsize=96:fontcolor=0x25251f:x=(w-text_w)/2:y=380[v];\
[1]atrim=0:15,afade=t=in:d=0.6,afade=t=out:st=13:d=2,loudnorm=I=-14:TP=-1.5[a]" \
 -map "[v]" -map "[a]" -t 15 -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart reel.mp4
```

- Mehrere Gebäude: je Gebäude eine Framefolge als Eingang, mit `concat=n=2:v=1:a=0` hintereinander, dann `pad` und Texte mit `enable='between(t,a,b)'`.
- Text mit Umlauten über `textfile=` statt `text=`, das spart Escaping.
- **zsh:** In Shell-Funktionen Variablen vor einem Doppelpunkt als `${1}` schreiben. `$1:t` ist sonst ein zsh-Modifikator und zerstört den Filter.
- Ton: ohne Ton werden Reels schlechter ausgespielt. Musik oder Sprecher nur aus einer Quelle mit Nutzungsrecht verwenden, Lautheit auf ca. −14 LUFS.

## 3. Prüfen

- `ffprobe`: 1080 × 1920, 30 fps, H.264 + AAC, erwartete Dauer.
- Mehrere Standbilder (Anfang, Mitte, Ende) ansehen: Texte lesbar, nichts abgeschnitten, Endbild vollständig.
- Ton vor der Übergabe einmal anhören oder vom Nutzer anhören lassen. Ein erzeugtes Audio ist noch nicht geprüft.
