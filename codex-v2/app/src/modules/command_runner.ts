import { spawn } from 'node:child_process';

export class CommandRunner {
  async runAll(commands: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
    let stdout = '';
    let stderr = '';
    for (const cmd of commands) {
      if (!this.isSafe(cmd)) {
        stderr += `Blocked unsafe command: ${cmd}\n`;
        continue;
      }
      const result = await this.run(cmd, cwd);
      stdout += `\n$ ${cmd}\n${result.stdout}`;
      stderr += `\n$ ${cmd}\n${result.stderr}`;
    }
    return { stdout, stderr };
  }

  private isSafe(cmd: string): boolean {
    return !/(shutdown|reboot|rm\s+-rf\s+\/|mkfs|:\(\)\{)/i.test(cmd);
  }

  private run(cmd: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const child = spawn(cmd, { shell: true, cwd });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });
      child.on('close', () => resolve({ stdout, stderr }));
    });
  }
}
