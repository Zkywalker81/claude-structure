export const DEFAULT_SETTINGS = {
    apiKey: '',
    // defaultProcessMode: 'auto', // Removed
    createSummaryReport: true,
    openNoteAfterCreation: true,
    // includeInLaunchpad: true, // Removed
    advancedPrompts: {
      systemPrompt: `Du bist ein spezialisierter Assistent zur Organisation von Wissen in Obsidian.
      Deine Aufgabe ist es, unformatierte Informationen in strukturierte Markdown-Notizen zu verwandeln, 
      die perfekt in die Vault-Struktur des Nutzers passen. Du ordnest Wissen ein, erstellst konsistente Templates 
      und schlägst sinnvolle Verlinkungen zu anderen Notizen vor.`,
     analyzePrompt: `Analysiere diesen Text und identifiziere, welcher Inhaltstyp am besten passt.
Mögliche Typen: Begriff, Methode, Buch, Projekt, Idee, WebClip, Zitat, Studie.

Konzentriere dich auf diese Signale:
- Begriffe: Definitionen, Konzepte, Terminologie
- Methoden: Schritte, Prozesse, Anleitungen
- Bücher: Autor, Titel, Zusammenfassungen
- Projekte: Ziele, Meilensteine, Zeitrahmen
- Ideen: Kreative Gedanken, Innovationen
- WebClips: Web-Inhalte, URLs, Online-Quellen
- Zitate: Direkte Äußerungen mit Quellenangabe
- Studien: Forschungsergebnisse, Daten, Methodik

Text: "{text}"

Antworte nur mit einem Wort: dem identifizierten Inhaltstyp.`,
     structurePrompt: `Hier ist ein unformatierter Text:
"{text}"

Basierend auf dem identifizierten Inhaltstyp "{contentType}", verwende dieses Template:
\`\`\`markdown
{templateContent}
\`\`\`

Aufgabe:
1. Fülle das Template vollständig aus mit den relevanten Informationen aus dem Text.
2. Erstelle einen passenden Titel und YAML-Frontmatter mit sinnvollen tags, aliases, etc.
3. Behalte die Templater-Syntax (z.B. \`<% tp.date.now() %>\`) bei.
4. Ergänze fehlende Abschnitte sinnvoll, basierend auf dem verfügbaren Inhalt.
5. Stelle sicher, dass alle Markdown-Formatierungen korrekt sind.

Liefere nur die fertige Markdown-Notiz zurück, ohne zusätzliche Erklärungen.`
   }
  };
  
  export const VAULT_STRUCTURE = {
    folders: [
      '00_Inbox 📥',
      '01_Notizen 📝',
      '02_Wissen 🧠/Begriffe 📚',
      '02_Wissen 🧠/Methoden 🛠️',
      '02_Wissen 🧠/Studien 🔬',
      '02_Wissen 🧠/Themen 📊',
      '02_Wissen 🧠/Theorien 💡',
      '02_Wissen 🧠/Zitate 💬',
      '03_Projekte 📋/Beruflich 💼',
      '03_Projekte 📋/Privat 🏠',
      '04_Templates 📑',
      '05_Schreiben ✍️/Artikel 📰',
      '05_Schreiben ✍️/Blog 💻',
      '05_Schreiben ✍️/Newsletter 📧',
      '05_Schreiben ✍️/Videoscripte 🎬',
      '07_Ideen und Brainstorming 💭/Experimente 🧪',
      '07_Ideen und Brainstorming 💭/Produktideen 💰',
      '07_Ideen und Brainstorming 💭/Visionen 🔮',
      '08_Medien 📀/Bücher 📖',
      '08_Medien 📀/Podcasts 🎧',
      '08_Medien 📀/Videos 📺',
      '08_Medien 📀/Zusammenfassungen 📋'
    ],
    templatePaths: {
      begriff: '04_Templates 📑/Begriff.md',
      methode: '04_Templates 📑/Methode.md',
      buch: '04_Templates 📑/Buch.md',
      projekt: '04_Templates 📑/Projekt.md',
      idee: '04_Templates 📑/Idee.md',
      webclip: '04_Templates 📑/WebClip.md',
      zitat: '04_Templates 📑/Zitat.md',
      studie: '04_Templates 📑/Studie.md'
    },
    typeToFolder: {
      begriff: '02_Wissen 🧠/Begriffe 📚',
      methode: '02_Wissen 🧠/Methoden 🛠️',
      buch: '08_Medien 📀/Bücher 📖',
      projekt: '03_Projekte 📋',
      idee: '07_Ideen und Brainstorming 💭',
      webclip: '00_Inbox 📥',
      zitat: '02_Wissen 🧠/Zitate 💬',
      studie: '02_Wissen 🧠/Studien 🔬'
    }
  };