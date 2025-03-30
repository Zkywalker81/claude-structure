import { requestUrl, Notice } from 'obsidian';
import { ApiResponse } from './types';

export class ClaudeAPI {
  private apiKey: string;
  private apiEndpoint: string;
  private systemPrompt: string;
  private model: string;

  constructor(apiKey: string, systemPrompt: string) {
    this.apiKey = apiKey;
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
    this.systemPrompt = systemPrompt || 'Du bist ein hilfreicher Assistent für Obsidian-Notizen.';
    this.model = 'claude-3-sonnet-20240229'; // Aktuelles Modell, bei Bedarf aktualisieren
  }

  /**
   * Aktualisiert den API-Schlüssel
   */
  public updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Aktualisiert den System-Prompt
   */
  public updateSystemPrompt(systemPrompt: string): void {
    this.systemPrompt = systemPrompt;
  }

  /**
   * Testet die Verbindung zur Claude API
   */
  public async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('API-Schlüssel nicht konfiguriert');
    }
    
    try {
      // Einfache Anfrage, um die Verbindung zu testen
      await this.query('Sage nur "OK" ohne weitere Erklärung.', { max_tokens: 10 });
      return true;
    } catch (error) {
      console.error('Claude API-Test fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Sendet eine Anfrage an die Claude API
   * @param userPrompt - Die Benutzeranfrage
   * @param options - Zusätzliche Optionen für die API
   * @returns - Die Antwort von Claude
   */
  public async query(userPrompt: string, options: { temperature?: number; max_tokens?: number } = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API-Schlüssel nicht konfiguriert');
    }

    try {
      const defaultOptions = {
        max_tokens: 4000,
        temperature: 0.7,
      };
      
      const requestOptions = { ...defaultOptions, ...options };
      
      // Verwende die Obsidian requestUrl API für HTTP-Anfragen
      const response = await requestUrl({
        url: this.apiEndpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: requestOptions.max_tokens,
          temperature: requestOptions.temperature,
          messages: [
            {
              role: 'system',
              content: this.systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
      });
      
      if (response.status !== 200) {
        throw new Error(`API-Fehler: ${response.json.error?.message || response.status}`);
      }
      
      const data = response.json as ApiResponse;
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API-Aufruf fehlgeschlagen:', error);
      throw error;
    }
  }
  
  /**
   * Spezialisierte Funktion zur Inhaltsanalyse
   * @param text - Der zu analysierende Text
   * @returns - Identifizierter Inhaltstyp
   */
  public async analyzeContentType(text: string): Promise<string> {
    const prompt = `Analysiere diesen Text und identifiziere, welcher Inhaltstyp am besten passt.
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
    
    Text: "${text.substring(0, 2000)}" ${text.length > 2000 ? '... (Text gekürzt)' : ''}
    
    Antworte nur mit einem Wort: dem identifizierten Inhaltstyp.`;
    
    return await this.query(prompt, { temperature: 0.3, max_tokens: 20 });
  }
  
  /**
   * Erstellt eine strukturierte Notiz basierend auf Template und Inhalt
   * @param text - Der unformatierte Text
   * @param contentType - Der identifizierte Inhaltstyp
   * @param templateContent - Der Inhalt des Templates
   * @returns - Die strukturierte Notiz
   */
  public async createStructuredNote(text: string, contentType: string, templateContent: string): Promise<string> {
    const prompt = `
    Hier ist ein unformatierter Text:
    "${text}"
    
    Basierend auf dem identifizierten Inhaltstyp "${contentType}", verwende dieses Template:
    \`\`\`markdown
    ${templateContent}
    \`\`\`
    
    Aufgabe:
    1. Fülle das Template vollständig aus mit den relevanten Informationen aus dem Text.
    2. Erstelle einen passenden Titel und YAML-Frontmatter mit sinnvollen tags, aliases, etc.
    3. Behalte die Templater-Syntax (z.B. \`<% tp.date.now() %>\`) bei.
    4. Ergänze fehlende Abschnitte sinnvoll, basierend auf dem verfügbaren Inhalt.
    5. Stelle sicher, dass alle Markdown-Formatierungen korrekt sind.
    
    Liefere nur die fertige Markdown-Notiz zurück, ohne zusätzliche Erklärungen.`;
    
    return await this.query(prompt, { temperature: 0.5 });
  }
  
  /**
   * Schlägt Verlinkungen zu bestehenden Notizen vor
   * @param structuredNote - Die strukturierte Notiz
   * @param existingNotes - Liste vorhandener Notizen
   * @returns - Vorschläge für Verlinkungen
   */
  public async suggestLinks(structuredNote: string, existingNotes: string[]): Promise<any> {
    const existingNotesStr = existingNotes.slice(0, 200).join('\n'); // Begrenzen auf 200 Notizen
    
    const prompt = `
    Hier ist eine strukturierte Notiz:
    \`\`\`markdown
    ${structuredNote.substring(0, 3000)}
    \`\`\`
    
    Und hier ist eine Liste bestehender Notizen in der Vault:
    \`\`\`
    ${existingNotesStr}
    \`\`\`
    
    Identifiziere potenzielle Verbindungen zwischen dieser neuen Notiz und den bestehenden Notizen.
    Suche nach:
    1. Direkten Erwähnungen von Konzepten
    2. Thematischen Überschneidungen
    3. Hierarchischen Beziehungen
    
    Gib das Ergebnis als JSON-Objekt zurück mit diesen Schlüsseln:
    - directLinks: Array von Notizen, die direkt erwähnt werden
    - thematicLinks: Array von Notizen mit thematischem Bezug
    - hierarchicalLinks: Array von übergeordneten oder untergeordneten Notizen
    
    Antworte nur mit dem JSON-Objekt, ohne zusätzliche Erklärungen.`;
    
    const response = await this.query(prompt, { temperature: 0.3 });
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Fehler beim Parsen der Link-Vorschläge:', error);
      return {
        directLinks: [],
        thematicLinks: [],
        hierarchicalLinks: []
      };
    }
  }
  
  /**
   * Generiert DataView-Abfragen basierend auf dem Noteninhalt
   * @param note - Die strukturierte Notiz
   * @param contentType - Der Inhaltstyp
   * @returns - Generierte DataView-Abfragen
   */
  public async generateDataViewQueries(note: string, contentType: string): Promise<any> {
    const prompt = `
    Hier ist eine strukturierte ${contentType}-Notiz:
    \`\`\`markdown
    ${note.substring(0, 3000)}
    \`\`\`
    
    Erstelle nützliche DataView-Abfragen für diese Notiz basierend auf ihrem Inhaltstyp (${contentType}).
    Die Abfragen sollten:
    1. Verwandte Notizen desselben Typs anzeigen
    2. Relevante Verknüpfungen basierend auf Tags oder Kategorien herstellen
    3. Nützliche Dashboards oder Übersichten ermöglichen
    
    Berücksichtige die üblichen DataView-Abfragetypen (LIST, TABLE, TASK, CALENDAR).
    
    Gib das Ergebnis als JSON-Objekt zurück mit diesen Schlüsseln:
    - typeQuery: DataView-Abfrage für verwandte Notizen desselben Typs
    - tagQuery: DataView-Abfrage basierend auf gemeinsamen Tags
    - customQuery: Eine zusätzliche, spezifische Abfrage für diesen Inhalt
    
    Antworte nur mit dem JSON-Objekt, ohne zusätzliche Erklärungen.`;
    
    const response = await this.query(prompt, { temperature: 0.4 });
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Fehler beim Parsen der DataView-Abfragen:', error);
      return {
        typeQuery: '',
        tagQuery: '',
        customQuery: ''
      };
    }
  }
  
  /**
   * Schlägt den optimalen Speicherort für die Notiz vor
   * @param note - Die strukturierte Notiz
   * @param contentType - Der Inhaltstyp
   * @param vaultStructure - Die Vault-Struktur
   * @returns - Der vorgeschlagene Speicherpfad
   */
  public async suggestStoragePath(note: string, contentType: string, vaultStructure: any): Promise<string> {
    const folderStructure = JSON.stringify(vaultStructure.folders);
    
    const prompt = `
    Hier ist eine strukturierte ${contentType}-Notiz:
    \`\`\`markdown
    ${note.substring(0, 1000)}
    \`\`\`
    
    Und hier ist die Ordnerstruktur der Vault:
    \`\`\`json
    ${folderStructure}
    \`\`\`
    
    Basierend auf dem Inhaltstyp (${contentType}) und dem Inhalt der Notiz,
    schlage den optimalen Speicherort in der Vault-Struktur vor.
    
    Berücksichtige diese allgemeinen Zuordnungen:
    - Begriffe gehen in "02_Wissen 🧠/Begriffe 📚"
    - Methoden gehen in "02_Wissen 🧠/Methoden 🛠️"
    - Bücher gehen in "08_Medien 📀/Bücher 📖"
    - Projekte gehen in "03_Projekte 📋/Beruflich 💼" oder "03_Projekte 📋/Privat 🏠"
    - Ideen gehen in "07_Ideen und Brainstorming 💭"
    - WebClips gehen in "00_Inbox 📥" zur späteren Verarbeitung
    
    Antworte nur mit dem vollständigen Pfad, ohne zusätzliche Erklärungen.`;
    
    return await this.query(prompt, { temperature: 0.3, max_tokens: 100 });
  }
}