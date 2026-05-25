import fs from 'node:fs/promises';
import path from 'node:path';
import { AgentRequest } from '../types';
import { Scanner } from './scanner';
import { PlaywrightBridge } from './playwright_bridge';
import { ResponseParser } from './response_parser';
import { Patcher } from './patcher';
import { CommandRunner } from './command_runner';

export class ChatLoop {
  private running = false;
  private scanner = new Scanner();
  private bridge = new PlaywrightBridge();
  private parser = new ResponseParser();
  private patcher = new Patcher();
  private runner = new CommandRunner();

  async run(request: AgentRequest): Promise<{ status: string; message: string }> {
    this.running = true;
    const { projectPath, userMessage, questionMode } = request;
    let message = userMessage;
    let buildLog = '';
    for (let step = 0; step < 10 && this.running; step += 1) {
      const scan = await this.scanner.scan(projectPath);
      const outgoing = questionMode ? message : `${message}\n\nBUILD_LOG:\n${buildLog}`;
      const responseRaw = await this.bridge.ask(scan.scanFilePath, outgoing);
      const parsed = this.parser.parse(responseRaw);
      if (parsed.files.length) {
        await this.patcher.apply(projectPath, parsed.files);
      }
      const runResult = await this.runner.runAll(parsed.commands, projectPath);
      buildLog = `${runResult.stdout}\n${runResult.stderr}`;
      await fs.writeFile(path.join(projectPath, 'build.log'), buildLog, 'utf-8');
      if (parsed.ready || questionMode) {
        return { status: 'Ready', message: parsed.readyMessage ?? 'Done' };
      }
      if (!parsed.next) {
        return { status: 'Idle', message: 'Model did not return [NEXT]' };
      }
      message = '[Next]';
    }
    return { status: 'Idle', message: 'Stopped' };
  }

  stop(): { status: string } {
    this.running = false;
    return { status: 'Stopped' };
  }
}
