export type AgentStatus = 'Idle' | 'Scanning' | 'Thinking' | 'Applying' | 'Building' | 'Ready';

export interface AgentRequest {
  projectPath: string;
  userMessage: string;
  questionMode?: boolean;
}

export interface ScanResult {
  fileTree: string[];
  importantFiles: Record<string, string>;
  gitStatus: string;
  errors: string[];
  logs: string;
  changedFiles: string[];
  configFiles: string[];
  scanFilePath: string;
}

export interface ParsedResponse {
  plan: string;
  files: Array<{ path: string; content: string }>;
  commands: string[];
  next: boolean;
  ready: boolean;
  readyMessage?: string;
}
