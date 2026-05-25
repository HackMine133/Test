import React, { useState } from 'react';

declare global {
  interface Window {
    codex: {
      pickFolder: () => Promise<string | null>;
      runAgent: (r: { projectPath: string; userMessage: string; questionMode?: boolean }) => Promise<{ status: string; message: string }>;
      stopAgent: () => Promise<{ status: string }>;
    };
  }
}

export function App() {
  const [project, setProject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Idle');
  const [logs, setLogs] = useState('CodeX V2 ready. AI can make mistakes. Verify important changes.');

  const pick = async () => {
    const folder = await window.codex.pickFolder();
    if (folder) setProject(folder);
  };

  const run = async (questionMode = false) => {
    setStatus('Thinking');
    const result = await window.codex.runAgent({ projectPath: project, userMessage: message, questionMode });
    setStatus(result.status);
    setLogs(result.message);
  };

  return <div className='layout'>
    <aside className='left'>
      <h2>Project</h2>
      <button onClick={pick}>Choose Folder</button>
      <p>{project || 'No folder selected'}</p>
    </aside>
    <main className='center'>
      <h1>CodeX V2</h1>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Describe your task...' />
      <div className='row'>
        <button onClick={() => run(false)}>Run Agent</button>
        <button onClick={() => run(true)}>Question Mode</button>
      </div>
    </main>
    <aside className='right'><h3>Logs</h3><pre>{logs}</pre></aside>
    <footer className='bottom'>Status: {status} • Warning: AI may be wrong. Review changes before release.</footer>
  </div>;
}
