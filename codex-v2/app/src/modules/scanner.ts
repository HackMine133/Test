import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { ScanResult } from '../types';

const run = promisify(exec);

export class Scanner {
  async scan(projectPath: string): Promise<ScanResult> {
    const all = await fs.readdir(projectPath);
    const fileTree = all.slice(0, 200);
    const important = ['package.json', 'pyproject.toml', 'Cargo.toml', 'build.gradle', 'README.md'];
    const importantFiles: Record<string, string> = {};
    for (const file of important) {
      const full = path.join(projectPath, file);
      try { importantFiles[file] = await fs.readFile(full, 'utf-8'); } catch {}
    }
    const gitStatus = await this.safeCmd('git status --short', projectPath);
    const logs = await this.safeCmd('git log --oneline -n 20', projectPath);
    const changedFiles = gitStatus.split('\n').filter(Boolean).map((line) => line.slice(3));
    const configFiles = Object.keys(importantFiles);
    const scanFilePath = path.join(projectPath, 'project_scan.txt');
    const errors: string[] = [];
    const content = JSON.stringify({ fileTree, importantFiles, gitStatus, logs, changedFiles, configFiles }, null, 2);
    await fs.writeFile(scanFilePath, content, 'utf-8');
    return { fileTree, importantFiles, gitStatus, errors, logs, changedFiles, configFiles, scanFilePath };
  }

  private async safeCmd(cmd: string, cwd: string): Promise<string> {
    try {
      const { stdout, stderr } = await run(cmd, { cwd, maxBuffer: 2_000_000 });
      return `${stdout}\n${stderr}`.trim();
    } catch (err) {
      return String(err);
    }
  }
}
