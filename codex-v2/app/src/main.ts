import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import { ChatLoop } from './modules/chat_loop';
import { AgentRequest } from './types';

let mainWindow: BrowserWindow | null = null;
const chatLoop = new ChatLoop();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 980,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0f1118'
  });

  mainWindow.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('project:pick-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return result.filePaths[0] ?? null;
  });

  ipcMain.handle('agent:run', async (_evt, payload: AgentRequest) => chatLoop.run(payload));

  ipcMain.handle('agent:stop', async () => chatLoop.stop());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
