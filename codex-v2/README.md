# CodeX V2

Author: SonLove_

CodeX V2 is a desktop autonomous development agent (Electron + React + TypeScript + Python + Playwright) that operates through browser ChatGPT without API usage.

## Features
- Project folder selection and autonomous agent loop.
- Project scan generation (`project_scan.txt`).
- Browser bridge with persistent Playwright profile.
- Protocol parser: `[PLAN] [FILES] [COMMANDS] [NEXT]/[READY]`.
- Safe patch application with backups and `patch.json` history.
- Command execution with dangerous command blocking.
- Dark Codex-like desktop UI with statuses: Idle, Scanning, Thinking, Applying, Building, Ready.
- AI warning integrated in UI.

## Structure
- `app` - Electron main process and core runtime modules.
- `ui` - React frontend.
- `python` - Playwright browser bridge.
- `profiles` - persistent browser profiles.
- `runtime` `browser` `agent` `project` - reserved product domains.

## Run
```bash
npm install
npm run dev
```

## Security
- No direct API usage.
- No arbitrary python execution from model output.
- Unsafe shell commands are blocked.
- Backups are created before updates.
