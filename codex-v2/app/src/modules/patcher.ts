import fs from 'node:fs/promises';
import path from 'node:path';

export class Patcher {
  async apply(projectPath: string, files: Array<{ path: string; content: string }>): Promise<string[]> {
    const changed: string[] = [];
    const patchPlan: { create: string[]; update: string[]; delete: string[] } = { create: [], update: [], delete: [] };
    for (const file of files) {
      const fullPath = path.join(projectPath, file.path);
      const exists = await this.exists(fullPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      if (exists) {
        const backupPath = `${fullPath}.bak`;
        await fs.copyFile(fullPath, backupPath);
        patchPlan.update.push(file.path);
      } else {
        patchPlan.create.push(file.path);
      }
      await fs.writeFile(fullPath, file.content, 'utf-8');
      changed.push(file.path);
    }
    await fs.writeFile(path.join(projectPath, 'patch.json'), JSON.stringify(patchPlan, null, 2), 'utf-8');
    return changed;
  }

  private async exists(file: string): Promise<boolean> {
    try { await fs.access(file); return true; } catch { return false; }
  }
}
