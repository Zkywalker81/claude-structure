import { App, Notice, TFile } from 'obsidian';
import { ClaudeSettings, ProcessingResult } from './types';
import { VaultManager } from './vault-manager';
import { ClaudeAPI } from './claude-api';

export class ClaudeAssistant {
  private app: App;
  public settings: ClaudeSettings;
  private vaultManager: VaultManager;
  private claudeAPI: ClaudeAPI;

  constructor(app: App, settings: ClaudeSettings, vaultManager: VaultManager, claudeAPI: ClaudeAPI) {
    this.app = app;
    this.settings = settings;
    this.vaultManager = vaultManager;
    this.claudeAPI = claudeAPI;
  }

  /**
   * Verarbeitet unformatierten Text zu einer strukturierten Notiz
   * @param text - Der unformatierte Text
   * @returns - Das Verarbeitungsergebnis
   */
  public async processText(text: string): Promise<ProcessingResult> {
    try {
      new Notice("Analysiere Text...");
      
      // 1. Inhaltstyp analysieren
      const contentType = await this.claudeAPI.analyzeContentType(text);
      const normalizedType = contentType.toLowerCase().trim();
      
      new Notice(`Inhaltstyp erkannt: ${normalizedType}`);
      
      // 2. Template laden
      const templateContent = await this.vaultManager.loadTemplate(normalizedType);
      
      // 3. Strukturierte Notiz erstellen
      new Notice("Erstelle strukturierte Notiz...");
      const structuredNote = await this.claudeAPI.createStructuredNote(text, normalizedType, templateContent);
      
      // 4. Titel aus dem Inhalt extrahieren
      const title = this.vaultManager.extractTitleFromContent(structuredNote);

      // 5. Optimalen Speicherort vorschlagen (using structuredNote before Templater)
      const suggestedPath = await this.claudeAPI.suggestStoragePath(
        structuredNote, // Use original structured note for path suggestion
        normalizedType,
        this.vaultManager.structure
      );

      // 6. Notiz in der Vault erstellen (using structuredNote)
      new Notice("Erstelle Notiz in der Vault...");
      const createdFile = await this.vaultManager.createNote(
        structuredNote, // Use original structured note content
        title,
        suggestedPath
      );

      // 7. Templater-Verarbeitung (falls Templater aktiv)
      new Notice("Verarbeite Template (Templater)...");
      await this.vaultManager.processNoteWithTemplater(createdFile);
      // Hinweis: Der Inhalt von createdFile kann sich jetzt geändert haben.

      // 8. Verlinkungsvorschläge generieren (using structuredNote before Templater)
      const existingNoteTitles = await this.vaultManager.getAllNoteTitles();
      const linkSuggestions = await this.claudeAPI.suggestLinks(structuredNote, existingNoteTitles);

      // 9. DataView-Abfragen generieren (using structuredNote before Templater)
      const dataViewQueries = await this.claudeAPI.generateDataViewQueries(structuredNote, normalizedType);

      // 10. Notiz öffnen wenn gewünscht
      if (this.settings.openNoteAfterCreation) {
        await this.vaultManager.openNote(createdFile);
      }
      
      // 11. Zusammenfassung erstellen
      new Notice("Notiz erfolgreich erstellt!", 5000);
      
      return {
        success: true,
        contentType: normalizedType,
        title: title,
        file: createdFile,
        path: suggestedPath,
        linkSuggestions: linkSuggestions,
        dataViewQueries: dataViewQueries
      };
    } catch (error) {
      console.error("Fehler bei der Textverarbeitung:", error);
      new Notice(`Fehler: ${error.message}`, 10000);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Erzeugt eine Zusammenfassung der Ergebnisse
   * @param results - Die Verarbeitungsergebnisse
   * @returns - Markdown-Zusammenfassung
   */
  public createSummary(results: ProcessingResult): string {
    if (!results.success) {
      return `# ❌ Fehler bei der Verarbeitung\n\n${results.error}`;
    }
    
    let summary = `# ✅ Notiz erfolgreich erstellt\n\n`;
    
    summary += `## 📝 Details\n`;
    summary += `- **Titel:** ${results.title}\n`;
    summary += `- **Typ:** ${results.contentType}\n`;
    summary += `- **Speicherort:** \`${results.path}/${results.title}.md\`\n\n`;
    
    summary += `## 🔗 Vorgeschlagene Verlinkungen\n`;
    
    if (results.linkSuggestions?.directLinks && results.linkSuggestions.directLinks.length > 0) {
      summary += `### Direkte Verlinkungen\n`;
      for (const link of results.linkSuggestions.directLinks) {
        summary += `- [[${link}]]\n`;
      }
      summary += `\n`;
    }
    
    if (results.linkSuggestions?.thematicLinks && results.linkSuggestions.thematicLinks.length > 0) {
      summary += `### Thematische Verlinkungen\n`;
      for (const link of results.linkSuggestions.thematicLinks) {
        summary += `- [[${link}]]\n`;
      }
      summary += `\n`;
    }
    
    summary += `## 📊 DataView-Abfragen\n`;
    
    if (results.dataViewQueries?.typeQuery) {
      summary += `### Gleicher Inhaltstyp\n\`\`\`dataview\n${results.dataViewQueries.typeQuery}\n\`\`\`\n\n`;
    }
    
    if (results.dataViewQueries?.tagQuery) {
      summary += `### Nach Tags\n\`\`\`dataview\n${results.dataViewQueries.tagQuery}\n\`\`\`\n\n`;
    }
    
    if (results.dataViewQueries?.customQuery) {
      summary += `### Benutzerdefinierte Abfrage\n\`\`\`dataview\n${results.dataViewQueries.customQuery}\n\`\`\`\n\n`;
    }
    
    return summary;
  }
}