import { TFile } from 'obsidian';

export interface ClaudeSettings {
    apiKey: string;
    // defaultProcessMode: string; // Removed
    createSummaryReport: boolean;
    openNoteAfterCreation: boolean;
    // includeInLaunchpad: boolean; // Removed
    advancedPrompts: {
      systemPrompt: string;
      analyzePrompt: string;
      structurePrompt: string;
    };
  }
  
  export interface VaultStructure {
    folders: string[];
    templatePaths: {
      [key: string]: string;
    };
    typeToFolder: {
      [key: string]: string;
    };
  }
  
  export interface ProcessingResult {
    success: boolean;
    contentType?: string;
    title?: string;
    file?: TFile | undefined; // Updated type
    path?: string;
    linkSuggestions?: {
      directLinks: string[];
      thematicLinks: string[];
      hierarchicalLinks: string[];
    };
    dataViewQueries?: {
      typeQuery: string;
      tagQuery: string;
      customQuery: string;
    };
    error?: string;
  }
  
  export interface ApiResponse {
    content: {
      type: string;
      text: string;
    }[];
  }