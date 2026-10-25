# Umsetzung und Validierung

## Helfer und Starter

`scripts/build_preview.py` bereitet die Vorlage auf und kopiert `assets/browser-template/` in einen neuen/leeren Ausgabeordner. Er braucht Python 3, NumPy und Pillow. Vorhandene Bibliotheken prüfen; bei Bedarf projektlokale virtuelle Umgebung, kein globales Upgrade. Der Browserstarter benötigt keine externen Bibliotheken oder Schriften.

```sh
python3 /absolut/zum/skill/scripts/build_preview.py \
  --image /absolut/zeichnung.png --output /absolut/neue-vorschau \
  --title "Beton, Linie für Linie." --duration 12 --mode both --direction top-down
```

| Option | Wirkung |
| --- | --- |
| `--mode both\|contours\|ink` | Konturen plus Tinte, nur Konturen oder nur Tinte |
| `--direction top-down\|bottom-up\|left-right\|center-out` | Maskenrichtung |
| `--duration 12` | Gesamtdauer in Sekunden |
| `--loop` | Wiederholung aktivieren, sonst einmalig |
| `--no-autoplay` | Auf Klick warten |
| `--paper 243` | Papierhelligkeit manuell, sonst 93. Perzentil |
| `--ink 17` | Neutraler Tintenkanal 0–64; 17 = #111111 |
| `--background '#f5f2e9'` | Papierfarbe der Browserzeichnung |
| `--horizontal-min 70` / `--vertical-min` | Mindestlänge in Quellpixeln; senkrecht standardmäßig 3 % der Bildhöhe (mind. 24 px), damit auch Fensterprofile erkannt werden |
| `--ground-y 840` | Geprüfte Bodenposition manuell angeben |
| `--title` / `--subtitle` | Texte außerhalb des Motivs |

Vorhandene Projektordner nicht überschreiben. Erst Starter separat erzeugen und dann integrieren. Konfiguration und Metadaten enthalten keine lokalen privaten Quellpfade. Quellbild wird unverändert mitkopiert. Farbige Bilder nicht stillschweigend entsättigen; zuerst klären, ob eine monochrome Interpretation gewünscht ist.

`config.js` enthält Parameter. `app.js` bezieht Bildmaße, ViewBox und Maskenseitenverhältnis aus den Daten. `--mode contours` ist eine reduzierte Kantendarstellung, keine vollständige Vektorisierung. Vollständiges SVG mit Bäumen/Schattierung erfordert gesonderte Arbeit.

## Papier zu Alpha

Für Float-Grauwertdaten:

```python
level = clip(gray * (255.0 / (paper - 4.0)), 0, 255)
alpha = clip((255.0 - level) * (255.0 / (255.0 - ink)), 0, 255)
```

RGB konstant auf `ink`, Alpha runden und nach `uint8` wandeln. Helles Papier verschwindet, dunkle Körnung kann bleiben. Es ist eine Tinteninterpretation, keine verlustfreie Rekonstruktion von Farben. Prüfe Alpha-Bereich und Darstellung auf Papier sowie kontrastierendem Hintergrund. Ungleichmäßig beleuchtete Scans oder wenig Papierfläche brauchen eventuell manuelle Aufbereitung; das Ergebnis zeigen.

## Linien und Boden

Der Helfer nutzt ein lokales 31 × 31-Mittelwertfenster, C=25 und invertierte Dunkelklassifikation, danach horizontale/vertikale zusammenhängende Abschnitte. Diese portable NumPy-Umsetzung ist nicht bitidentisch mit jeder OpenCV-Implementierung. Ursprungsidee:

```python
ink = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
                           cv2.THRESH_BINARY_INV, 31, 25)
long_h = cv2.morphologyEx(ink, cv2.MORPH_OPEN,
    cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1)))
```

Lange Linien können auch Schalungsfugen, Schatten und Mobiliar sein. Unterbrochene/geneigte Kanten fehlen eventuell. Kontrolliere Vektoroverlay und Perspektivfreiheit separat. Gewünschte schräge Bauteile mit passenden Pfaden erhalten.

Die Bodenerkennung sucht zwischen 45 und 97 % der Bildhöhe die Zeile mit den meisten dunklen Pixeln (Grauwert < 120), die mindestens 55 % der Breite bedeckt und 85 % der Breite überspannt. Lange Gebäudekanten (Balkenunterseiten, Dachränder) fallen so meist heraus. `ground` ist null, wenn keine solche Zeile gefunden wird, etwa bei einem schrägen Hang. Automatisch ermittelte und manuell vorgegebene Bodenlinien werden unterschieden. `width - 1` ist der letzte Pixelindex. Nenne gemessene Werte als Messwerte, nie als ursprüngliche Gestaltungsvorgabe.

## Ablauf

SVG-Dashwerte auf 1 normieren. Der Starter setzt den Fortschritt per JS statt CSS-Keyframes, damit Pause/Seek/Neustart deterministisch sind. Das Maskenfeld mischt 62 % Richtungsverlauf, 32 % Noise in drei Skalen und 6 % konstante Körnung. Noise/Grain liegen in 0–1.

Im kombinierten Modus beginnt das Reveal nach ca. 13 % der Dauer und endet bei ca. 85 %. Konturen blenden zum Schluss aus, damit das Endbild keine doppelten Kanten hat. Volle Endsicht explizit setzen. Timing in `app.js` bei Bedarf anpassen. Alpha-Maske verwenden: clear → source-over/Maske → source-in/Bild → Zustand zurücksetzen.

## Browserprüfung

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /absolut/neue-vorschau
```

Freien Port wählen. URL im Browser öffnen; `file://` reicht für JSON nicht. Ein `queued` von `open_in_codex` bestätigt keine sichtbare Navigation; gegebenenfalls normalen Browser öffnen und URL liefern.

Für Checks bietet der Starter `window.architecturePreview.seek(ms)` und `.state`; Seek pausiert. Prüfe frühen Frame, Zwischenstand, vollständiges Ende, Ausrichtung, Alpha und Ladefehler, Replay/Pause/Scrubbing, gegebenenfalls Loop und Reduced Motion, sowie schmale Viewports ohne Überlauf.

Das Python-Skript ist für diese technische Animations-/Alphaaufbereitung vorgesehen. Andere visuelle Motivänderungen erfolgen über den Bildbearbeitungsworkflow. Ein Video oder Framework-Modul nur als geliefert bezeichnen, wenn tatsächlich erzeugt und geprüft.
