# ClaudeStructure für Obsidian

Ein Obsidian-Plugin zur Integration von Claude AI in deinen Wissensmanagement-Workflow. Dieses Plugin wandelt unformatierte Informationen automatisch in strukturierte Markdown-Notizen um, die perfekt in deine Obsidian-Vault-Struktur passen.

## Funktionen

### Kerneigenschaften

- **Inhaltsanalyse**: Erkennt automatisch den Inhaltstyp (Begriff, Methode, Buch, Projekt, etc.) aus unformatiertem Text
- **Intelligente Strukturierung**: Wählt das passende Template und füllt es mit relevanten Informationen
- **YAML-Frontmatter**: Generiert vollständige Metadaten mit Tags, Aliassen und Attributen
- **Verlinkungen zu bestehendem Wissen**: Schlägt Verbindungen zu vorhandenen Notizen vor
- **DataView-Integration**: Erstellt nützliche DataView-Abfragen für dynamische Inhaltsintegration
- **Optimale Einordnung**: Schlägt den idealen Speicherort innerhalb der Vault-Struktur vor

### Workflow-Optimierung

- **Schnelle Verarbeitung**: Wandle mit einem Klick unformatierten Text in strukturierte Notizen um
- **Zusammenfassungsberichte**: Erhalte übersichtliche Berichte mit allen Verarbeitungsergebnissen
- **Nahtlose Integration**: Funktioniert nahtlos mit bestehender Vault-Struktur und Obsidian-Plugins

## Installation

### Voraussetzungen

- Obsidian v1.0.0 oder höher
- Ein Claude API-Schlüssel von Anthropic

### Manuelle Installation

1. Lade das neueste Release von GitHub herunter
2. Entpacke das Archiv in den `.obsidian/plugins/` Ordner deiner Vault
3. Aktiviere das Plugin in den Einstellungen unter Community Plugins

## Konfiguration

1. Öffne die Plugin-Einstellungen unter Einstellungen → ClaudeStructure
2. Füge deinen Claude API-Schlüssel hinzu
3. Passe die Vault-Struktur an deine Bedürfnisse an (optional)
4. Konfiguriere die erweiterten Einstellungen für Prompts (optional)

## Verwendung

### Einfacher Workflow

1. **Text markieren**
   - Öffne eine Notiz oder erstelle eine neue
   - Markiere unformatierten Text, den du strukturieren möchtest

2. **Claude aktivieren**
   - Drücke den konfigurierten Hotkey (z.B. Strg+Alt+C)
   - Oder klicke mit der rechten Maustaste und wähle "Mit Claude verarbeiten"
   - Oder verwende den Befehl "Markierten Text verarbeiten" aus der Befehlspalette

3. **Ergebnisse überprüfen**
   - Claude analysiert den Text und identifiziert den Inhaltstyp
   - Ein strukturiertes Dokument wird basierend auf dem passenden Template erstellt
   - Die neue Notiz wird im vorgeschlagenen Ordner gespeichert und geöffnet
   - Ein Bericht mit Verlinkungsvorschlägen und DataView-Abfragen wird erstellt

### Erweiterte Funktionen

- **Gesamte Notiz verarbeiten**
  - Öffne eine unformatierte Notiz
  - Verwende den Befehl "Aktuelle Notiz verarbeiten" aus der Befehlspalette

- **Notiztyp analysieren**
  - Verwende den Befehl "Notiztyp analysieren" für eine bestehende Notiz
  - Claude gibt den erkannten Inhaltstyp zurück, ohne die Notiz zu verändern

## Anpassungsmöglichkeiten

### Eigene Templates

Du kannst Claude für neue Inhaltstypen anpassen, indem du neue Templates erstellst:

1. Erstelle ein neues Template in `04_Templates 📑`, z.B. `Podcast.md`
2. Füge den Inhaltstyp in den Plugin-Einstellungen hinzu

### System-Prompt anpassen

Du kannst den Claude-Kontext anpassen, um spezifisches Verhalten zu fördern:

1. Öffne die Einstellungen über die Kommandopalette
2. Gehe zum Tab "ClaudeStructure"
3. Bearbeite den "System Prompt" unter "Erweiterte Einstellungen"
4. Speichere die Änderungen

## Kompatibilität mit anderen Plugins

Dieses Plugin ist vollständig kompatibel mit:

- **Templater**: Unterstützt Templater-Variablen in deinen Templates
- **DataView**: Erstellt und integriert DataView-Abfragen
- **Iconize**: Unterstützt emoji-basierte Ordnerstrukturen

## Häufige Probleme und Lösungen

- **API-Schlüssel ungültig**
  - Überprüfe, ob der API-Schlüssel korrekt eingetragen ist
  - Stelle sicher, dass dein Anthropic-Konto aktiv ist

- **Template nicht gefunden**
  - Überprüfe die Pfade in den Einstellungen
  - Stelle sicher, dass die Templates im richtigen Ordner sind

- **Inhaltstyp nicht erkannt**
  - Füge mehr Kontext zum Text hinzu
  - Passe den Analyse-Prompt in den Einstellungen an

## Datenschutz und Sicherheit

- Deine Daten werden nur für die Verarbeitung an die Claude API gesendet
- Der API-Schlüssel wird sicher in der lokalen Obsidian-Konfiguration gespeichert
- Keine Daten werden permanent auf externen Servern gespeichert

## Mitwirken

Beiträge zum Projekt sind willkommen! So kannst du helfen:

- **Issues melden**: Melde Fehler oder schlage neue Funktionen vor
- **Pull Requests**: Trage Code bei, um Fehler zu beheben oder neue Funktionen hinzuzufügen
- **Dokumentation**: Hilf uns, die Dokumentation zu verbessern

## Lizenz

Dieses Plugin steht unter der [MIT-Lizenz](LICENSE).