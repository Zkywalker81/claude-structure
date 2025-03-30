export const DEFAULT_SETTINGS = {
    apiKey: '',
    defaultProcessMode: 'auto', // 'auto', 'begriff', 'methode', etc.
    createSummaryReport: true,
    openNoteAfterCreation: true,
    includeInLaunchpad: true,
    advancedPrompts: {
      systemPrompt: `Du bist ein spezialisierter Assistent zur Organisation von Wissen in Obsidian. 
      Deine Aufgabe ist es, unformatierte Informationen in strukturierte Markdown-Notizen zu verwandeln, 
      die perfekt in die Vault-Struktur des Nutzers passen. Du ordnest Wissen ein, erstellst konsistente Templates 
      und schlägst sinnvolle Verlinkungen zu anderen Notizen vor.`,
      analyzePrompt: `Analysiere diesen Text und identifiziere, ob es sich um einen Begriff, eine Methode, 
      ein Buch, ein Projekt, eine Idee oder einen WebClip handelt.`,
      structurePrompt: `Fülle das Template mit dem Inhalt aus dem Text aus. Erstelle dabei einen passenden Titel, 
      YAML-Frontmatter, Tags und alle Abschnitte des Templates.`
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