import { App, PluginSettingTab, Setting } from 'obsidian';
import ClaudeStructurePlugin from './main';
import { ClaudeSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';

export class ClaudeSettingTab extends PluginSettingTab {
  plugin: ClaudeStructurePlugin;

  constructor(app: App, plugin: ClaudeStructurePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h1', { text: 'ClaudeStructure Einstellungen' });

    // API-Konfiguration
    containerEl.createEl('h2', { text: 'API-Konfiguration' });

    new Setting(containerEl)
      .setName('Claude API-Schlüssel')
      .setDesc('Dein API-Schlüssel für den Zugriff auf Claude. Erhalte einen Schlüssel unter anthropic.com')
      .addText(text => text
        .setPlaceholder('Gib deinen API-Schlüssel ein...')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        }));

    // Allgemeine Einstellungen
    containerEl.createEl('h2', { text: 'Allgemeine Einstellungen' });

    // Removed Standard-Verarbeitungsmodus setting

    new Setting(containerEl)
      .setName('Zusammenfassungsbericht erstellen')
      .setDesc('Erstellt einen Bericht mit Details zur erstellten Notiz')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.createSummaryReport)
        .onChange(async (value) => {
          this.plugin.settings.createSummaryReport = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Notiz nach Erstellung öffnen')
      .setDesc('Öffnet die neu erstellte Notiz automatisch im Editor')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.openNoteAfterCreation)
        .onChange(async (value) => {
          this.plugin.settings.openNoteAfterCreation = value;
          await this.plugin.saveSettings();
        }));

    // Removed In Launchpad einbinden setting

    // Erweiterte Einstellungen
    containerEl.createEl('h2', { text: 'Erweiterte Einstellungen' });

    new Setting(containerEl)
      .setName('System-Prompt')
      .setDesc('Der Basis-Prompt, der den Kontext für Claude definiert.')
      .addTextArea(text => text
        .setPlaceholder('Systemanweisung für Claude...')
        .setValue(this.plugin.settings.advancedPrompts.systemPrompt)
        .onChange(async (value) => {
          this.plugin.settings.advancedPrompts.systemPrompt = value;
          await this.plugin.saveSettings();
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Auf Standard zurücksetzen')
        .onClick(async () => {
          this.plugin.settings.advancedPrompts.systemPrompt = DEFAULT_SETTINGS.advancedPrompts.systemPrompt;
          await this.plugin.saveSettings();
          this.display();
        }));

    new Setting(containerEl)
      .setName('Analyse-Prompt')
      .setDesc('Der Prompt zur Erkennung des Inhaltstyps.')
      .addTextArea(text => text
        .setPlaceholder('Prompt zur Inhaltsanalyse...')
        .setValue(this.plugin.settings.advancedPrompts.analyzePrompt)
        .onChange(async (value) => {
          this.plugin.settings.advancedPrompts.analyzePrompt = value;
          await this.plugin.saveSettings();
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Auf Standard zurücksetzen')
        .onClick(async () => {
          this.plugin.settings.advancedPrompts.analyzePrompt = DEFAULT_SETTINGS.advancedPrompts.analyzePrompt;
          await this.plugin.saveSettings();
          this.display();
        }));

    new Setting(containerEl)
      .setName('Strukturierungs-Prompt')
      .setDesc('Der Prompt zur Strukturierung des Inhalts.')
      .addTextArea(text => text
        .setPlaceholder('Prompt zur Inhaltsstrukturierung...')
        .setValue(this.plugin.settings.advancedPrompts.structurePrompt)
        .onChange(async (value) => {
          this.plugin.settings.advancedPrompts.structurePrompt = value;
          await this.plugin.saveSettings();
        }))
      .addExtraButton(button => button
        .setIcon('reset')
        .setTooltip('Auf Standard zurücksetzen')
        .onClick(async () => {
          this.plugin.settings.advancedPrompts.structurePrompt = DEFAULT_SETTINGS.advancedPrompts.structurePrompt;
          await this.plugin.saveSettings();
          this.display();
        }));

    // Import/Export Bereich
    containerEl.createEl('h2', { text: 'Import/Export' });

    new Setting(containerEl)
      .setName('Einstellungen exportieren')
      .setDesc('Exportiere deine Einstellungen als JSON-Datei.')
      .addButton(button => button
        .setButtonText('Exportieren')
        .onClick(() => {
          const dataStr = JSON.stringify(this.plugin.settings, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'
            + encodeURIComponent(dataStr);
          
          const exportFileDefaultName = 'claude-structure-settings.json';
          
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }));

    new Setting(containerEl)
      .setName('Einstellungen importieren')
      .setDesc('Importiere deine gespeicherten Einstellungen.')
      .addButton(button => button
        .setButtonText('Importieren')
        .onClick(() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          
          input.onchange = async (e: Event) => {
            // @ts-ignore
            const file = e.target.files[0];
            if (!file) {
              return;
            }
            
            const reader = new FileReader();
            reader.onload = async (e) => {
              if (e.target && typeof e.target.result === 'string') { // Added null check and type check
                try {
                  const settings = JSON.parse(e.target.result); // No need for 'as string' now
                  this.plugin.settings = settings;
                    await this.plugin.saveSettings();
                    this.display();
                  } catch (err) {
                    console.error('Fehler beim Importieren der Einstellungen:', err);
                  }
                } else {
                  console.error('Fehler beim Lesen der Importdatei.');
                }
              };
            reader.readAsText(file);
          };
          
          input.click();
        }));
  }
}