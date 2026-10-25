---
name: architecture-ink-reveal
description: Entwickle Architekturzeichnungen mit animiertem Linienaufbau und Tusche-Reveal im Browser. Nutze den Skill für eine vollständige Bauwerks- und Gestaltungsabfrage, orthogonale Architekturillustrationen oder eine Webanimation aus einer vorhandenen Zeichnung.
---

# Architektur in Tusche

Erfasse zuerst, **welches Bauwerk und welches Ergebnis** gewünscht sind. Erzeuge oder übernimm die Zeichnung und setze bei Bedarf eine lokal prüfbare Browseranimation um. Antworte auf Deutsch, sofern keine andere Sprache vorgegeben ist.

## 1. Auftrag klären

Lies [references/abfrage.md](references/abfrage.md). Nutze die vollständige Abfrage als Checkliste und übernimm alle Angaben aus Gespräch, Referenzen und Briefings. Frage nur fehlende Entscheidungen ab. Beim bloßen Erstellen oder Bearbeiten des Skills starte kein Bauprojekt.

- Biete kurze Auswahlmöglichkeiten und Freitext an. Antworten wie `1a, 2c, 3: Museum ...` sind möglich.
- Kläre zuerst den Umfang: Bild, Animation, beides oder Integration in eine bestehende Website.
- Stelle Fragen in den drei Blöcken der Referenz. Auf Wunsch die komplette Abfrage auf einmal zeigen. Das Villa-Preset ist eine wählbare Abkürzung, keine feste Vorgabe.
- Fehlende optionale Angaben können mit gekennzeichneten Defaults gefüllt werden. Eine fehlende Antwort ersetzt keine notwendige Entscheidung über Motiv oder Ergebnisumfang.
- Speichere die Antworten und gewählten Defaults als `briefing.md` im Ausgabeprojekt. Bei beantworteten Kernfragen und bestehendem Umsetzungsauftrag direkt weitergehen, ohne zusätzliche Freigabeschleife. „Erst Vorschläge“ oder „noch nichts generieren“ respektieren.

## 2. Zeichnung erstellen oder übernehmen

Lies [references/umsetzung.md](references/umsetzung.md). Für neue Bilder nutze den verfügbaren `imagegen`-Skill oder ein anderes eingebundenes Bildwerkzeug (z. B. ein lokales Modell wie Qwen Image per MCP), keine programmatisch erfundene Ersatzillustration. Lokale Modelle brauchen für 1536 × 1024 mehrere Minuten; im Hintergrund warten statt eng abzufragen. Bestehende Zeichnungen als unveränderte Quellen übernehmen; die technische Aufbereitung erzeugt nur Animationsdaten und eine transparente Tintenebene.

Speichere bei Generierung den tatsächlich verwendeten Prompt als `drawing.prompt`. Halte Ansicht, Geschosse, Bauteile, Umgebung, Format, Farbigkeit und Ausschlüsse fest. Streng orthogonale Frontansicht bedeutet: keine perspektivischen Seitenflächen, verjüngten Finnen oder schrägen Untersichten. Diagonale Schlagschatten und Äste sind erlaubt. Kontrolliere das Ergebnis visuell und korrigiere konkrete Abweichungen gezielt.

Speichere Projektbilder im Ausgabeprojekt. Erfinde keine Quellpfade, Messwerte oder Linien. Gewünschter Bodenlinienanteil und tatsächlich gemessene Position sind getrennte Angaben.

## 3. Browseranimation bauen

Der Starter in `assets/browser-template/` kombiniert normalisierte SVG-Linien mit einer Canvas-Alpha-Maske. Er enthält Pause, Neustart, Zeitleiste, Loop und Reduced Motion. Nutze den Helfer mit dem tatsächlichen Skillpfad:

```sh
python3 /absolut/zum/skill/scripts/build_preview.py --image /absolut/zeichnung.png --output /absolut/neues-projekt --title "Beton, Linie für Linie." --duration 12
```

Der Helfer braucht Pillow und NumPy. Nicht mit `python3 -I` starten, sonst fehlen die User-Site-Pakete. Optionen und Grenzen stehen in der Umsetzungsreferenz. Den Bericht prüfen: Bei `"ground": null` oder auffällig wenigen `vertical_lines` die Zeichnung ansehen, die Bodenlinie messen und gezielt mit `--ground-y` bzw. `--vertical-min` neu in einen leeren Ordner bauen. Schräger Hang ohne waagerechte Linie: keine Bodenlinie erzwingen. Passe Starter und Texte an das Briefing an; projektspezifische Änderungen bleiben außerhalb des Skillordners. Bei Websiteintegration deren Vorgaben und Komponenten beachten. Keine globalen `line`- oder Canvas-Regeln überschreiben. Keine Bildgenerierung durch einen Shell-Unterprozess starten und keine API-Schlüssel für das integrierte Bildwerkzeug verlangen.

Technische Invarianten:

- SVG-Linien bei Dash-Werten auf 1 mit `pathLength="1"` versehen. Erkennung liefert Kandidaten, keinen Nachweis perspektivfreier Architektur.
- Alpha auf 0–255 begrenzen und RGBA als `uint8` speichern. Deckende Schwarz-Weiß-Masken maskieren nicht nach Helligkeit; der Alpha-Kanal ist entscheidend.
- Noise/Grain auf 0–1 normieren und das Feld einmal berechnen. Nur die Reveal-Schwelle animieren, sonst flackert die Zeichnung.
- Canvas pro Frame leeren; Alpha-Maske zeichnen, Bild mit `source-in` beschränken, Compositing-Zustand wiederherstellen.
- Dimensionen, SVG-ViewBox und Maskenseitenverhältnis aus den echten Bildmaßen ableiten. Das gesamte Bild ohne Beschnitt erhalten.
- Bei reduzierter Bewegung zunächst das fertige Bild zeigen; explizite Wiedergabe bleibt möglich.

## 4. Prüfen und zeigen

Starte einen lokalen HTTP-Server am Ausgabeordner und öffne die URL mit einem Browserwerkzeug. `file://` reicht wegen JSON-Ladedaten nicht. Bei belegtem Port einen freien wählen; keinen fremden Server verdrängen.

Prüfe einen frühen Frame, Zwischenstand und Endbild, dazu Pause, Neustart, Scrubbing und gegebenenfalls Loop. Kontrolliere Bildladen, Laufzeitfehler, vollständige Endzeichnung, Linienausrichtung, echte Alpha-Ebene und schmale Viewports. Vergleiche das tatsächliche Endbild mit der Quelle. Ein erfolgreicher HTTP-Status allein bestätigt die Animation nicht.

Nenne abschließend Browser-URL, Projektpfad, umgesetzten Umfang und relevante Grenzen. Eine Browseranimation ist noch kein MP4: Videoexport erfordert eine tatsächlich erzeugte und geprüfte Videodatei. Für Reels/TikTok/Shorts [references/video-export.md](references/video-export.md) lesen und `scripts/capture_frames.js` nutzen. Kein Deployment ohne entsprechenden Auftrag.
