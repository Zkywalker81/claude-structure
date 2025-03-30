import { ItemView, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import { ClaudeAssistant } from '../assistant';
import { ProcessingResult } from '../types';

export const REPORT_VIEW_TYPE = 'claude-report-view';

export class ReportView extends ItemView {
  assistant: ClaudeAssistant;
  results: ProcessingResult | null = null;
  contentEl: HTMLElement;

  constructor(leaf: WorkspaceLeaf, assistant: ClaudeAssistant) {
    super(leaf);
    this.assistant = assistant;
  }

  getViewType(): string {
    return REPORT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Claude Bericht';
  }

  getIcon(): string {
    return 'brain-cog';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();

    container.createEl('div', { 
      cls: 'nav-header',
      text: 'Claude Strukturierungsbericht'
    });

    this.contentEl = container.createEl('div', { 
      cls: 'claude-report-content' 
    });

    // Falls bereits Ergebnisse vorliegen, sofort rendern
    if (this.results) {
      await this.renderResults();
    } else {
      this.contentEl.createEl('p', { 
        text: 'Noch keine Ergebnisse. Bitte verarbeite einen Text mit Claude.'
      });
    }
  }

  async onClose(): Promise<void> {
    // Cleanup
    this.contentEl.empty();
  }

  /**
   * Aktualisiert die Ergebnisse und rendert sie
   * @param results - Die neuen Verarbeitungsergebnisse
   */
  async updateResults(results: ProcessingResult): Promise<void> {
    this.results = results;
    await this.renderResults();
  }

  /**
   * Rendert die aktuellen Ergebnisse im View
   */
  private async renderResults(): Promise<void> {
    if (!this.results) return;

    // Inhaltsbereich leeren
    this.contentEl.empty();

    // Stil für den Bericht
    this.contentEl.addClass('claude-report');

    // Markdown-Inhalt generieren und rendern
    const summary = this.assistant.createSummary(this.results);
    const markdownContainer = this.contentEl.createEl('div');
    
    await MarkdownRenderer.renderMarkdown(
      summary,
      markdownContainer,
      '.', 
      null
    );
    
    // Wenn erfolgreich, Aktions-Buttons hinzufügen
    if (this.results.success) {
      const actionsContainer = this.contentEl.createEl('div', { 
        cls: 'claude-report-actions' 
      });
      
      // Button zum Öffnen der Notiz
      const openNoteBtn = actionsContainer.createEl('button', { 
        text: 'Notiz öffnen',
        cls: 'mod-cta'
      });
      
      openNoteBtn.addEventListener('click', () => {
        if (this.results?.file) {
          this.app.workspace.getLeaf().openFile(this.results.file);
        }
      });

      // Button zum Kopieren der DataView-Abfragen
      if (this.results.dataViewQueries) {
        const copyQueriesBtn = actionsContainer.createEl('button', { 
          text: 'DataView-Abfragen kopieren' 
        });
        
        copyQueriesBtn.addEventListener('click', () => {
          if (this.results?.dataViewQueries) {
            let allQueries = "";
            
            if (this.results.dataViewQueries.typeQuery) {
              allQueries += `/* Nach Typ */\n${this.results.dataViewQueries.typeQuery}\n\n`;
            }
            
            if (this.results.dataViewQueries.tagQuery) {
              allQueries += `/* Nach Tags */\n${this.results.dataViewQueries.tagQuery}\n\n`;
            }
            
            if (this.results.dataViewQueries.customQuery) {
              allQueries += `/* Benutzerdefiniert */\n${this.results.dataViewQueries.customQuery}`;
            }
            
            navigator.clipboard.writeText(allQueries);
            new Notice('DataView-Abfragen in die Zwischenablage kopiert!', 3000);
          }
        });
      }
    }
  }
}