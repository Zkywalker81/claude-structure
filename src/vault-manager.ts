import { App, TFile, TFolder, Notice } from 'obsidian';
import { VaultStructure } from './types';
import { VAULT_STRUCTURE } from './constants';

export class VaultManager {
  private app: App;
  public structure: VaultStructure;

  constructor(app: App) {
    this.app = app;
    this.structure = VAULT_STRUCTURE;
  }

  /**
   * Lädt ein Template aus der Vault
   * @param contentType - Der Inhaltstyp
   * @returns - Der Inhalt des Templates
   */
  public async loadTemplate(contentType: string): Promise<string> {
    try {
      const normalizedType = contentType.toLowerCase().trim();
      const templatePath = this.structure.templatePaths[normalizedType];
      
      if (!templatePath) {
        console.warn(`Kein Template für Typ ${normalizedType} gefunden, verwende Standard-Template`);
        return this.loadTemplate('begriff'); // Fallback auf Begriff-Template
      }
      
      const templateFile = this.app.vault.getAbstractFileByPath(templatePath);
      if (!templateFile || !(templateFile instanceof TFile)) {
        throw new Error(`Template-Datei nicht gefunden: ${templatePath}`);
      }
      
      return await this.app.vault.read(templateFile);
    } catch (error) {
      console.error('Fehler beim Laden des Templates:', error);
      
      // Fallback-Template für Notfälle
      return `---
title: "Neue Notiz"
aliases: []
date_created: <% tp.date.now("YYYY-MM-DD") %>
date_modified: <% tp.date.now("YYYY-MM-DD") %>
tags: []
kategorie: "Allgemein"
status: "Entwurf"
importance: normal
---

# Neue Notiz

## Inhalt

## Verbindungen

## Notizen
`;
    }
  }
  
  /**
   * Erstellt eine neue Notiz in der Vault
   * @param content - Der Inhalt der Notiz
   * @param title - Der Titel der Notiz
   * @param folderPath - Der Pfad zum Ordner
   * @returns - Die erstellte Datei
   */
  public async createNote(content: string, title: string, folderPath: string): Promise<TFile> {
    try {
      // Sicherstellen, dass der Ordner existiert
      await this.ensureFolderExists(folderPath);
      
      // Dateinamen sicher erstellen (Sonderzeichen entfernen)
      const fileName = this.sanitizeFileName(title) + '.md';
      const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      // Prüfen, ob die Datei bereits existiert
      const existingFile = this.app.vault.getAbstractFileByPath(fullPath);
      if (existingFile) {
        const incrementedPath = await this.getIncrementedFilePath(folderPath, fileName);
        return await this.app.vault.create(incrementedPath, content);
      }
      
      return await this.app.vault.create(fullPath, content);
    } catch (error) {
      console.error('Fehler beim Erstellen der Notiz:', error);
      
      // Fallback zur Inbox
      const safeTitle = this.sanitizeFileName(title) || 'Neue_Notiz';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fallbackPath = `00_Inbox 📥/${safeTitle}_${timestamp}.md`;
      
      return await this.app.vault.create(fallbackPath, content);
    }
  }
  
  /**
   * Stellt sicher, dass ein Ordner existiert, erstellt ihn bei Bedarf
   * @param folderPath - Der Pfad zum Ordner
   */
  public async ensureFolderExists(folderPath: string): Promise<void> {
    if (!folderPath) return;
    
    const folders = folderPath.split('/');
    let currentPath = '';
    
    for (const folder of folders) {
      currentPath = currentPath ? `${currentPath}/${folder}` : folder;
      const exists = this.app.vault.getAbstractFileByPath(currentPath);
      
      if (!exists) {
        await this.app.vault.createFolder(currentPath);
      }
    }
  }
  
  /**
   * Bereinigt einen Dateinamen von ungültigen Zeichen
   * @param fileName - Der ursprüngliche Dateiname
   * @returns - Der bereinigte Dateiname
   */
  public sanitizeFileName(fileName: string): string {
    if (!fileName) return 'Unbenannt';
    
    // Ungültige Zeichen für Dateinamen ersetzen
    return fileName
      .replace(/[\\/:*?"<>|]/g, '_')  // Ungültige Zeichen durch Unterstrich ersetzen
      .replace(/\s+/g, '_')           // Leerzeichen durch Unterstrich ersetzen
      .replace(/__+/g, '_')           // Mehrfache Unterstriche reduzieren
      .trim();
  }
  
  /**
   * Erzeugt einen eindeutigen Dateipfad durch Inkrementieren
   * @param folderPath - Der Ordnerpfad
   * @param fileName - Der Dateiname
   * @returns - Der eindeutige Dateipfad
   */
  public async getIncrementedFilePath(folderPath: string, fileName: string): Promise<string> {
    const baseName = fileName.replace('.md', '');
    let counter = 1;
    let newPath = '';
    
    do {
      newPath = `${folderPath}/${baseName}_${counter}.md`;
      counter++;
    } while (this.app.vault.getAbstractFileByPath(newPath));
    
    return newPath;
  }
  
  /**
   * Holt alle vorhandenen Notizentitel aus der Vault
   * @returns - Array von Notizentiteln
   */
  public async getAllNoteTitles(): Promise<string[]> {
    const files = this.app.vault.getMarkdownFiles();
    const titles: string[] = [];
    
    for (const file of files) {
      // Ignoriere Templates
      if (file.path.startsWith('04_Templates')) {
        continue;
      }
      
      // Extrahiere den Titel aus den Metadaten, falls vorhanden
      const metadata = this.app.metadataCache.getFileCache(file)?.frontmatter;
      if (metadata?.title) {
        titles.push(metadata.title);
      } else {
        // Andernfalls verwende den Dateinamen ohne Erweiterung
        titles.push(file.basename);
      }
    }
    
    return titles;
  }
  
  /**
   * Öffnet eine Notiz im Editor
   * @param file - Die zu öffnende Datei
   */
  public async openNote(file: TFile): Promise<void> {
    const leaf = this.app.workspace.getLeaf();
    await leaf.openFile(file);
  }
  
  /**
   * Ersetzt Templater-Variablen mit tatsächlichen Werten
   * @param content - Der Inhalt mit Templater-Variablen
   * @returns - Der Inhalt mit ersetzten Variablen
   */
  public processTemplaterVariables(content: string): string {
    const now = new Date();
    
    // Einfache Ersetzungen für häufige Templater-Variablen
    return content
      .replace(/<% tp\.date\.now\("YYYY-MM-DD"\) %>/g, 
        now.toISOString().split('T')[0])
      .replace(/<% tp\.date\.now\("DD\.MM\.YYYY"\) %>/g, 
        now.toLocaleDateString('de-DE'))
      .replace(/<% tp\.file\.title %>/g, 
        'Neue Notiz'); // Wird später ersetzt
  }
  
  /**
   * Extrahiert Titel aus dem YAML-Frontmatter einer Markdown-Notiz
   * @param content - Der Markdown-Inhalt
   * @returns - Der extrahierte Titel
   */
  public extractTitleFromContent(content: string): string {
    // Suche nach title: im YAML-Frontmatter
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1];
    }
    
    // Alternativ: Suche nach dem ersten Überschriften-Level-1
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch && headingMatch[1]) {
      return headingMatch[1];
    }
    
    return 'Neue Notiz';
  }
  
  /**
   * Ersetzt den Templater-Platzhalter für den Dateititel
   * @param content - Der Inhalt mit Platzhaltern
   * @param title - Der einzusetzende Titel
   * @returns - Der Inhalt mit ersetztem Titel
   */
  public replaceTitlePlaceholder(content: string, title: string): string {
    // Ersetze tp.file.title im Inhalt
    return content.replace(/<% tp\.file\.title %>/g, title);
  }
  
  /**
   * Schlägt den optimalen Ordner für einen Inhaltstyp vor
   * @param contentType - Der Inhaltstyp
   * @returns - Der Ordnerpfad
   */
  public suggestFolderForContentType(contentType: string): string {
    const normalizedType = contentType.toLowerCase().trim();
    return this.structure.typeToFolder[normalizedType] || '00_Inbox 📥';
  }