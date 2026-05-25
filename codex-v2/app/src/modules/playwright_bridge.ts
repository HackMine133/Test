import { spawn } from 'node:child_process';
import path from 'node:path';

export class PlaywrightBridge {
  async ask(projectScanPath: string, userMessage: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const script = path.resolve(__dirname, '../../../python/playwright_bridge.py');
      const child = spawn('python3', [script, projectScanPath, userMessage], { stdio: ['ignore', 'pipe', 'pipe'] });
      let out = '';
      let err = '';
      child.stdout.on('data', (d) => { out += d.toString(); });
      child.stderr.on('data', (d) => { err += d.toString(); });
      child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(err))));
    });
  }
}
