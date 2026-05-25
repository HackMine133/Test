import { contextBridge, ipcRenderer } from 'electron';
import { AgentRequest } from './types';

contextBridge.exposeInMainWorld('codex', {
  pickFolder: (): Promise<string | null> => ipcRenderer.invoke('project:pick-folder'),
  runAgent: (request: AgentRequest) => ipcRenderer.invoke('agent:run', request),
  stopAgent: () => ipcRenderer.invoke('agent:stop')
});
