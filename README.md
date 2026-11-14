# Pink Chess

Ein pinkes Schachspiel für Handy und Browser: gegen Ben mit drei Schwierigkeitsstufen, online per Einladungslink oder lokal zu zweit. Enthält das pink-weiß karierte App-Icon, eine Installationshilfe, ein Web-App-Manifest und eine Offline-Hinweisseite.

## Starten

Empfohlen: Node.js 24 oder neuer.

```sh
npm ci
npm run build
npm run start:node
```

Öffne danach die angezeigte Adresse (standardmäßig http://localhost:3000). Auf dem eigenen Rechner ist das eine lokale Vorschau; Freunde auf anderen Geräten benötigen eine erreichbare Hosting-Adresse.

## Hosting

Zwei Serverformate sind vorbereitet:

- **Sites / Cloudflare:** Ein einzelner Worker in `dist/server/index.js`, statische Dateien in `dist/client`, D1-Migrationen in `drizzle`. Der Sites-Build und seine Konfiguration sind erhalten.
- **Node-Hosting:** `npm run start:node`, Gesundheitsprüfung unter `/healthz`. `PORT` wählt den Serverport. `DATA_DIR` muss bei dauerhaftem Hosting auf ein persistentes Datenverzeichnis zeigen; dort liegt `pink-chess.sqlite`. Ohne persistentes Datenverzeichnis können Online-Partien bei einem Neustart des Hosting-Dienstes verloren gehen. SQLite-Migrationen werden beim Serverstart einmalig angewendet.

Die Web-App wird mit ihrem gemeinsamen Partienspeicher auf Sites / Cloudflare veröffentlicht. GitHub enthält den vollständigen Quellcode; GitHub Pages allein kann die Online-API nicht ausführen.

## Auf dem Handy

Nach erfolgreichem HTTPS-Hosting die Spieladresse in Safari oder Chrome öffnen. Der Knopf „Aufs Handy“ erklärt das Hinzufügen auf den Startbildschirm. Wo der Browser eine direkte Installation unterstützt, zeigt das Spiel „App installieren“ an. Die Installation selbst bestätigt der Nutzer im Browser.

Ben und Online-Partien benötigen Internet. Der Service Worker speichert keine Spiel-APIs oder privaten Spielstände zwischen. Browserdaten enthalten die Spielerzugänge; nach dem Löschen dieser Daten ist der Zugang zur Online-Partie verloren. Einladungen und Partien sind sieben Tage gültig.

## Prüfen

```sh
node --experimental-strip-types tests/game-api.mjs
node --import ./scripts/sites-env.mjs tests/worker-runtime.mjs
node tests/node-hosting.mjs
node node_modules/typescript/bin/tsc --noEmit
```

Die Tests prüfen Schachregeln, Zugrechte, gleichzeitige Beitritte, Versionskonflikte, Schachmatt, Ablauf, persistente Online-Abläufe, den tatsächlich gebauten Worker sowie den alternativen Node-Server. TypeScript-Prüfung, API-Tests, Worker-Tests und Node-Hosting-Tests werden vor der Veröffentlichung ausgeführt. Die verwaltete Browser-Vorschau ist in dieser Umgebung nicht erreichbar; der Installationsdialog auf einem echten Handy bleibt ungeprüft.

## Freunde einladen

1. In der App „Mit Freunden“ wählen.
2. „Freunde einladen“ anklicken.
3. Den Einladungslink kopieren oder über „Einladung teilen“ weitergeben.
4. Die zweite Person öffnet den Link auf ihrem eigenen Gerät und spielt Schwarz.

Die Spieloberfläche ist per Link erreichbar. Jede Partie ist nur mit ihrem zufälligen Einladungslink zugänglich. Nach dem Beitritt ist der zweite Platz belegt; geheime Spielerzugänge liegen im Browser und nur als Hash im Partienspeicher. Die Züge werden serverseitig geprüft und automatisch synchronisiert. Einladungen und Partien laufen nach sieben Tagen ab.

Das App-Icon zeigt eine pinke Dame vor einem weiß-rosa Schachbrett. Es ist als Favicon und in den Größen für iPhone-Home-Bildschirm und Android-Installation eingebunden.

## iPhone-Oberfläche

Die App öffnet mit einer Modusauswahl. Ben, Online-Einladungen und das Spiel zu zweit sind von dort erreichbar. „Modi“ führt zurück; eine laufende Partie lässt sich fortsetzen. Ben und lokale Partien haben getrennte Browser-Spielstände. Einladungslinks öffnen unmittelbar die Online-Partie.

Das Brett verwendet weiße und rosa Felder, einen plastischen Rand und glänzende SVG-Figuren in hellem Rosé (Weiß) und kräftigem Pink (Schwarz). Auf schmalen Displays stehen Spielstatus und Brett oben; Einstellungen und Zugliste folgen darunter. Bedienelemente sind für Touch ausgelegt, Eingabefelder verhindern den iOS-Fokuszoom durch eine Schriftgröße von mindestens 16px. Safe Areas, dynamische Bildschirmhöhe und Querformat werden berücksichtigt.

In Safari über „Teilen → Zum Home-Bildschirm“ installieren. Das Apple-Touch-Icon mit der pinken Dame und dem weiß-rosa Schachbrett bleibt eingebunden. JavaScript und CSS tragen Versionskennungen, damit Updates auch bei vorherigem Browserbesuch geladen werden.

## Züge und Bewegung

Die Oberfläche bezeichnet die Seiten als Rosé und Pink. Der Spielverlauf zeigt beide Seiten mit Notation sowie Start- und Zielfeld und scrollt zum neuesten Zug. Der letzte gegnerische Zug erscheint zusätzlich am Brett und als Richtungspfeil.

Neue Spielzüge gleiten 620 Millisekunden über das Brett, mit leicht erhöhter Figur und mitbewegtem Schatten. Beide Figuren einer Rochade bewegen sich gleichzeitig; geschlagene Figuren blenden aus. Nach einer Bauernumwandlung erscheint die gewählte Figur am Ziel. Rücknahme, Spielwechsel und wiederhergestellte Partien werden nicht als neue Züge animiert. Die Systemoption für reduzierte Bewegung wird berücksichtigt.

Die Bewegungslogik wird mit `node --experimental-strip-types tests/board-motion.mjs` geprüft.
