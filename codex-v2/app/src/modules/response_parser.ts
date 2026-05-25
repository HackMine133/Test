import { ParsedResponse } from '../types';

export class ResponseParser {
  parse(raw: string): ParsedResponse {
    const plan = this.extract(raw, '[PLAN]', '[FILES]');
    const filesBlock = this.extract(raw, '[FILES]', '[COMMANDS]');
    const commandsBlock = this.extract(raw, '[COMMANDS]', '[NEXT]', '[READY]');
    const ready = raw.includes('[READY]');
    const next = raw.includes('[NEXT]');
    const readyMessage = ready ? raw.split('[READY]')[1]?.trim() : undefined;
    const files = [...filesBlock.matchAll(/FILE:\n([\s\S]*?)\n\nCONTENT:\n([\s\S]*?)\nEND_FILE/g)].map((m) => ({
      path: m[1].trim(),
      content: m[2]
    }));
    const commands = commandsBlock.split('\n').map((s) => s.trim()).filter(Boolean);
    return { plan: plan.trim(), files, commands, next, ready, readyMessage };
  }

  private extract(raw: string, start: string, ...ends: string[]): string {
    const s = raw.indexOf(start);
    if (s < 0) return '';
    const from = s + start.length;
    const endIndexes = ends.map((e) => raw.indexOf(e, from)).filter((v) => v >= 0);
    const to = endIndexes.length ? Math.min(...endIndexes) : raw.length;
    return raw.slice(from, to).trim();
  }
}
