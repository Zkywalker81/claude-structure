import { Plugin, Notice, addIcon } from 'obsidian';
import { DEFAULT_SETTINGS } from './constants';
import { ClaudeSettingTab } from './settings';
import { ClaudeAPI } from './claude-api';
import { VaultManager } from './vault-manager';
import { ClaudeAssistant } from './assistant';
import { ReportView, REPORT_VIEW_TYPE } from './views/report-view';
import { ClaudeSettings } from './types';

export default class ClaudeStructurePlugin extends Plugin {
  settings: ClaudeSettings;
  vaultManager: VaultManager;
  claudeAPI: ClaudeAPI;
  assistant: ClaudeAssistant;

  async onload() {
    console.log('ClaudeStructure Plugin geladen');
    
    // Einstellungen laden
    await this.loadSettings();
    
    // Icons registrieren
    this.registerIcons();
    
    // Komponenten initialisieren
    this.vaultManager = new VaultManager(this.app);
    this.claudeAPI = new ClaudeAPI(this.settings.apiKey, this.settings.advancedPrompts.systemPrompt);
    this.assistant = new ClaudeAssistant(this.app, this.settings, this.vaultManager, this.claudeAPI);
    
    // Registriere den eigenen View-Typ
    this.registerView(
      REPORT_VIEW_TYPE,
      (leaf) => new ReportView(leaf, this.assistant)
    );
    
    // Commands registrieren
    this.registerCommands();
    
    // Ribbon-Icon hinzufügen
    this.addRibbonIcon('brain-cog', 'Claude Assistant', () => {
      this.showClaudeMenu();
    });
    
    // Einstellungs-Tab hinzufügen
    this.addSettingTab(new ClaudeSettingTab(this.app, this));
    
    // Kontextmenü hinzufügen
    this.registerEditorContextMenu();
    
    // Führe Startinitalisierung erst nach dem laden des Layouts durch
    this.app.workspace.onLayoutReady(() => {
      this.initializePlugin();
    });
  }
  
  async onunload() {
    console.log('ClaudeStructure Plugin entladen');
    // Aufräumen bei Plugin-Deaktivierung
    this.app.workspace.detachLeavesOfType(REPORT_VIEW_TYPE);
  }
  
  private registerIcons() {
    // Custom Icons für das Plugin
    addIcon('brain-cog', `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.86 2.8-2.11 3.4A4 4 0 0 1 8 14c-1.5 0-2.8-.86-3.4-2.11a4 4 0 0 1-4.9-5.89 4 4 0 0 1 5.89-4.9A4 4 0 0 1 12 2z"/><path d="M18 18a4 4 0 1 1-5.89-3.4c.86-.28 1.5-1.1 1.5-2.6a4 4 0 0 1 6.5-3.12 4 4 0 0 1-2.11 7.12z"/><circle cx="12" cy="12" r="3"/></svg>`);
  }
  
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  async saveSettings() {
    await this.saveData(this.settings);
    // Aktualisiere Komponenten nach dem Speichern der Einstellungen
    this.claudeAPI.updateApiKey(this.settings.apiKey);
    this.claudeAPI.updateSystemPrompt(this.settings.advancedPrompts.systemPrompt);
  }
  
  private registerCommands() {
    // Befehl für die Verarbeitung von markiertem Text
    this.addCommand({
      id: 'process-selected-text',
      name: 'Markierten Text verarbeiten',
      editorCallback: (editor, view) => {
        this.processSelectedText(editor, view);
      }
    });
    
    // Befehl für die Verarbeitung der aktuellen Notiz
    this.addCommand({
      id: 'process-current-note',
      name: 'Aktuelle Notiz verarbeiten',
      editorCallback: (editor, view) => {
        this.processCurrentNote(editor, view);
      }
    });
    
    // Befehl für die Analyse des Notiztyps
    this.addCommand({
      id: 'analyze-note-type',
      name: 'Notiztyp analysieren',
      editorCallback: (editor, view) => {
        this.analyzeNoteType(editor, view);
      }
    });
  }
  
  private registerEditorContextMenu() {
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor, view) => {
        menu.addItem((item) => {
          item
            .setTitle('Mit Claude verarbeiten')
            .setIcon('brain-cog')
            .onClick(() => {
              this.processSelectedText(editor, view);
            });
        });
      })
    );
  }
  
  private async initializePlugin() {
    // Überprüfen der API-Schlüssel auf Gültigkeit
    if (this.settings.apiKey) {
      try {
        // Optional: Test-API-Aufruf um Schlüssel zu validieren
        // await this.claudeAPI.testConnection();
        console.log('Claude API-Verbindung hergestellt');
      } catch (error) {
        new Notice('Claude API-Schlüssel konnte nicht validiert werden. Bitte überprüfe deine Einstellungen.');
        console.error('Claude API Verbindungsfehler:', error);
      }
    }
  }
  
  private showClaudeMenu() {
    // Zeige ein Menü mit Plugin-Optionen an
    const menu = this.app.workspace.activeLeaf?.dropdown.createMenu();
    menu?.addItem((item) => item
      .setTitle('Text verarbeiten')
      .setIcon('pencil')
      .onClick(() => {
        const editor = this.app.workspace.activeEditor?.editor;
        const view = this.app.workspace.activeEditor;
        if (editor && view) {
          this.processSelectedText(editor, view);
        }
      }));
      
    menu?.addItem((item) => item
      .setTitle('Einstellungen')
      .setIcon('gear')
      .onClick(() => {
        this.app.setting.open();
        this.app.setting.openTabById('claude-structure');
      }));
  }
  
  private async processSelectedText(editor: any, view: any) {
    const selectedText = editor.getSelection();
    
    if (!selectedText) {
      new Notice('Bitte Text markieren, der verarbeitet werden soll', 3000);
      return;
    }
    
    if (!this.settings.apiKey) {
      new Notice('Bitte Claude API-Schlüssel in den Einstellungen hinterlegen', 5000);
      return;
    }
    
    try {
      const results = await this.assistant.processText(selectedText);
      
      if (results.success && this.settings.createSummaryReport) {
        await this.openReportView(results);
      }
    } catch (error) {
      console.error("Fehler bei der Verarbeitung:", error);
      new Notice(`Fehler: ${error.message}`, 10000);
    }
  }
  
  private async processCurrentNote(editor: any, view: any) {
    const noteContent = editor.getValue();
    
    if (!noteContent) {
      new Notice('Die aktuelle Notiz ist leer', 3000);
      return;
    }
    
    if (!this.settings.apiKey) {
      new Notice('Bitte Claude API-Schlüssel in den Einstellungen hinterlegen', 5000);
      return;
    }
    
    try {
      const results = await this.assistant.processText(noteContent);
      
      if (results.success && this.settings.createSummaryReport) {
        await this.openReportView(results);
      }
    } catch (error) {
      console.error("Fehler bei der Verarbeitung:", error);
      new Notice(`Fehler: ${error.message}`, 10000);
    }
  }
  
  private async analyzeNoteType(editor: any, view: any) {
    const noteContent = editor.getValue();
    
    if (!noteContent) {
      new Notice('Die aktuelle Notiz ist leer', 3000);
      return;
    }
    
    if (!this.settings.apiKey) {
      new Notice('Bitte Claude API-Schlüssel in den Einstellungen hinterlegen', 5000);
      return;
    }
    
    try {
      const contentType = await this.claudeAPI.analyzeContentType(noteContent);
      new Notice(`Erkannter Notiztyp: ${contentType}`, 5000);
    } catch (error) {
      console.error("Fehler bei der Analyse:", error);
      new Notice(`Fehler: ${error.message}`, 10000);
    }
  }
  
  private async openReportView(results: any) {
    // Bericht in einem eigenen View öffnen
    const workspace = this.app.workspace;
    
    // Prüfen, ob es bereits ein geöffnetes Blatt mit dem Report-View gibt
    let leaf = workspace.getLeavesOfType(REPORT_VIEW_TYPE)[0];
    
    if (!leaf) {
      // Falls nicht, ein neues Blatt erstellen
      leaf = workspace.getLeaf('split', 'vertical');
      await leaf.setViewState({ type: REPORT_VIEW_TYPE });
    }
    
    // View-Inhalt aktualisieren
    if (leaf.view instanceof ReportView) {
      leaf.view.updateResults(results);
      workspace.revealLeaf(leaf);
    }
  }