# Vollständige Abfrage

Übernimm bereits beantwortete Punkte aus dem Gespräch. Auswahlmöglichkeiten sind Vorschläge; Freitext ist immer möglich. Mehrfachauswahl zulassen, wo sie sinnvoll ist. Keine Architekturfakten aus einer Stilwahl erfinden.

## Block 1 — Was soll gebaut und geliefert werden?

1. **Ergebnis:** a) fertige Zeichnung, b) Browseranimation aus vorhandenem Bild, c) neue Zeichnung plus Animation, d) Integration in eine Website. Bei d URL/Projektpfad und Einbauposition klären.
2. **Bauwerk:** a) Wohnhaus/Villa, b) öffentliches Gebäude, c) Gewerbe/Kultur, d) anderes Motiv. Nutzung/Bezeichnung als Freitext, z. B. „kleines Kunstmuseum“.
3. **Grundlage:** a) frei entwerfen, b) Foto/Rendering/Zeichnung übernehmen, c) Referenz nur als Stilvorlage. Motivquelle und Stilquelle unterscheiden. Lokale Pfade/Links erfragen; fehlende Bildanhänge im normalen Chat erbitten, nicht über ein reines Texteingabewerkzeug.
4. **Architekturstil:** a) brutalistisch, b) minimalistisch/modernistisch, c) klassisch/historisch, d) eigener Stil/Mischung. Kein Default bei offenem Baukörper.
5. **Geschosse und Proportion:** Geschosszahl, breit/schmal/hoch und relevante Maße. Exakte Maße nur bei gewünschter Maßstäblichkeit.
6. **Baukörper und Dach:** kompakter Block, Seitenflügel, Staffelung, Auskragung; Flach-/Sattel-/Pultdach. Pflichtbauteile und Positionen erfassen.
7. **Materialien und Fassade:** Beton/Schalbeton, Putz, Ziegel, Naturstein, Holz, Stahl/Glas; Texturen und Kontraste. Beim Bestandsmotiv exakt zu erhaltende Merkmale klären.
8. **Besondere Elemente:** Eingang/Treppe links oder rechts, Fensterteilung, doppelte Raumhöhe, Finnen/Stützen, Balkon, Pflanzwand. Positionen, Anzahl und Größenverhältnisse der Pflichtdetails erfassen.

## Block 2 — Wie soll die Zeichnung aussehen?

9. **Ansicht:** a) streng orthogonale Frontansicht, b) orthogonale Seiten-/Rückansicht, c) Perspektive, d) Axonometrie. Bei b/c/d Seite/Kamerarichtung klären. Keine Frontansicht erzwingen, wenn Perspektive gewünscht ist.
10. **Ausschnitt:** a) gesamtes Gebäude zentriert, b) großzügiger Umraum, c) Detail. Freiraum für Website-Texte nur nach Wunsch.
11. **Zeichenstil:** a) präzise Tusche mit Stippel/Korn, b) reine technische Linien, c) lockere Skizze. Für andere Medien Anpassung des Starters klären.
12. **Papier und Farbe:** a) warmes Off-White/Schwarz, b) Weiß/Schwarz, c) transparente Tinte, d) eigene Farben. Websitehintergrund und Bildhintergrund separat behandeln.
13. **Schatten:** a) weiche diagonale Schlagschatten, b) dezente Tiefe, c) keine. Bei Bedarf Lichtrichtung/Kontrast.
14. **Umgebung:** a) kahle Winterbäume, b) Vegetation nach Angabe, c) keine. Personen/Fahrzeuge/Mobiliar nur nach Vorgabe übernehmen oder hinzufügen.
15. **Bodenlinie:** a) durchgehend bei ca. 82 % Höhe, b) andere Position/Art, c) keine zusätzliche Linie. Beim Bestandsbild reale Position messen und ohne Änderungsauftrag erhalten.
16. **Format/Auflösung:** a) 3:2 / 1536 × 1024, b) 16:9, c) Hochformat/Quadrat, d) exakte Pixelmaße. Für b/c Maße vorschlagen und dokumentieren.
17. **Ausschlüsse/Text:** Vorschlag: keine Labels, Raster, Rahmen, Menschen oder Texte im Motiv. Abweichungen und genaue Texte klären. Überschrift/Steuerung außerhalb der Zeichnung separat festlegen.

## Block 3 — Animation und Einbau

Bei reinem Bildauftrag überspringen.

18. **Animationsart:** a) Linien vor Tinte/Schatten, b) nur Linien, c) nur organisches Tusche-Reveal. Linien-Only enthält nur erkannte/ergänzte Kanten, nicht automatisch alle Baumäste und Körnung.
19. **Richtung:** a) oben nach unten, b) unten nach oben, c) links nach rechts, d) aus der Mitte. Für freie Choreografie Bauteilreihenfolge erfassen.
20. **Timing:** a) 12 Sekunden als Vorschlag, b) eigene Dauer. Startpause, Kontur-/Tuscheanteil und Endstandzeit bei konkretem Wunsch klären.
21. **Start:** a) beim Laden, b) per Klick, c) bei Sichtbarkeit. c) benötigt Anpassung mit IntersectionObserver.
22. **Wiederholung:** a) einmal bis Endbild, b) Loop, c) Loop mit Pause nach Angabe. Kein automatischer Loop gegen ausdrückliche Einmal-Wiedergabe.
23. **Bedienung:** a) Pause/Neustart/Zeitleiste/Loop, b) nur Neustart, c) keine sichtbaren Elemente. Tastatur und Reduced Motion erhalten.
24. **Präsentation:** a) eigene Vorschauseite, b) randloses Modul, c) bestehende Gestaltung. Titel, Kurztext und vorhandenes Branding klären; keine Logos erfinden.
25. **Technik/Ziel:** a) statisches HTML/CSS/JS, b) Framework/CMS, c) zusätzlicher Videoexport. Bei b Projekt und Einbauort; bei c Format, Framerate und Loop-Länge abfragen. Tatsächlich erzeugte Formate liefern, keine Exportversprechen.
26. **Ablage/Varianten:** Ausgabeordner und Anzahl unterschiedlicher Entwürfe. Ohne Vorgabe eine Variante in eigenem Projektunterordner; nichts überschreiben. Alle ausdrücklich beauftragten Varianten liefern.

## Kompakte Antwortvorlage

```text
Ergebnis / Ablage:
Bauwerk / Nutzung / Geschosse:
Stil / Baukörper / Dach:
Materialien / Pflichtdetails mit Position:
Referenzen / Was muss erhalten bleiben:
Ansicht / Ausschnitt:
Tusche / Papier / Schatten / Umgebung:
Bodenlinie / Format / Ausschlüsse:
Animation / Richtung / Dauer:
Start / Loop / Bedienung:
Präsentation / Technik / Exporte:
```

## Wählbares Villa-Preset

Nur bei „wie die Villa“, „gleiche Einstellungen“ oder ausdrücklicher Presetwahl:

- Zweigeschossige brutalistische Schalbetonvilla; zwei schlanke Betonfinnen; zentrale doppelhohe Glasfront mit dünnen Stahlprofilen; massive Seitenflügel; auskragendes Obergeschoss; gerade Eingangstreppe links; niedrige Pflanzwand rechts.
- Orthogonale Frontansicht, vollständig/zentriert, schwarze Tusche, Stippel/Korn, weiche diagonale Schatten, warmes Off-White, kahle Winterbäume beidseits.
- 1536 × 1024, Bodenlinie ungefähr bei 82 %, keine Menschen/Labels/Raster/Rahmen oder Farben außer Schwarz/Grau/Papier.
- 12 Sekunden, Konturen vor Tinte, Reveal von oben nach unten, Autostart, einmalig, Pause/Neustart/Zeitleiste/optionaler Loop.
- Statisches HTML/CSS/JS. Bei vorhandenem Bild gelten reale Maße/Bodenposition; das Preset verändert das Original nicht.

## Übergabe

`briefing.md` enthält Antworten, gewählte Defaults, Pflichtmerkmale, Quellpfade und Umfang. Sollwerte und Messdaten trennen. Fehlende Pflichtangaben gezielt klären; optionale Feindetails mit Vorschlägen ergänzen. Bei vollständigen Angaben und Umsetzungsauftrag keine weitere Freigabe verlangen.
