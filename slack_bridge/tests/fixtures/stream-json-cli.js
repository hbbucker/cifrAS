const { spawn } = require('node:child_process');

const mode = process.argv[2] || 'success';

function writeFragmented(record) {
  const buffer = Buffer.from(`${JSON.stringify(record)}\n`);
  const split = Math.max(1, Math.floor(buffer.length / 2));
  process.stdout.write(buffer.subarray(0, split));
  setTimeout(() => process.stdout.write(buffer.subarray(split)), 5);
}

if (mode === 'success') {
  writeFragmented({ type: 'message', text: 'ação 🚀' });
  setTimeout(() => {
    process.stdout.write(`${JSON.stringify({ type: 'done', response: 'fixture complete' })}\n`);
    setTimeout(() => process.exit(0), 10);
  }, 15);
} else if (mode === 'missing-terminal') {
  process.stdout.write(`${JSON.stringify({ type: 'message', text: 'partial' })}\n`);
  process.exit(0);
} else if (mode === 'nonzero') {
  process.exit(7);
} else if (mode === 'ignore-term') {
  process.on('SIGTERM', () => {});
  process.stdout.write(`${JSON.stringify({ type: 'done', response: 'cleanup required' })}\n`);
  setInterval(() => {}, 1000);
} else if (mode === 'ignore-term-descendant') {
  process.on('SIGTERM', () => {});
  spawn(process.execPath, ['-e', "process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  process.stdout.write(`${JSON.stringify({ type: 'done', response: 'tree cleanup required' })}\n`);
  setInterval(() => {}, 1000);
} else if (mode.endsWith('-adapter-ignore-term-descendant')) {
  const engine = mode.split('-')[0];
  process.on('SIGTERM', () => {});
  spawn(process.execPath, ['-e', "process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const records = engine === 'antigravity'
    ? [{ event: 'result', result: { status: 'SUCCESS', response: 'cleanup response' } }]
    : [
      { type: 'item.completed', item: { type: 'agent_message', text: 'cleanup response' } },
      { type: 'turn.completed' },
    ];
  process.stdout.write(records.map(JSON.stringify).join('\n') + '\n');
  setInterval(() => {}, 1000);
} else if (mode === 'antigravity-success-then-cleanup-quota') {
  process.on('SIGTERM', () => {});
  process.stdout.write(`${JSON.stringify({ event: 'result', result: {
    status: 'SUCCESS', response: 'must not complete',
  } })}\n`);
  setTimeout(() => {
    process.stderr.write('Individual quota reached. Resets in 41s.');
  }, 40);
  setInterval(() => {}, 1000);
} else if (mode === 'secret-malformed') {
  process.stdout.write('{secret-fixture-value\n');
  process.stdout.write(`${JSON.stringify({ type: 'done', response: 'safe response' })}\n`);
  process.exit(0);
} else if (mode === 'codex-success') {
  const records = [
    { type: 'thread.started', thread_id: 'codex-fixture-session' },
    { type: 'item.started', item: { type: 'tool_use', tool_name: 'fixture' } },
    { type: 'item.completed', item: { type: 'agent_message', text: 'codex fixture response' } },
    { type: 'turn.completed' },
  ];
  process.stdout.write(records.map(JSON.stringify).join('\n') + '\n');
  process.exit(0);
} else if (mode === 'antigravity-success') {
  const records = [
    { event: 'init', conversation_id: 'agy-fixture-session' },
    { event: 'step_update', step_update: { status_text: 'fixture status' } },
    { event: 'step_update', step_update: { step_type: 'agent_response',
      conversation_id: 'agy-fixture-session', step_index: 1, state: 'DONE', text_delta: 'fixture milestone' } },
    { event: 'result', result: { status: 'SUCCESS', response: 'agy fixture response' } },
  ];
  process.stdout.write(records.map(JSON.stringify).join('\n') + '\n');
  process.exit(0);
} else if (mode === 'antigravity-quota') {
  process.stdout.write(`${JSON.stringify({ event: 'step_update', step_update: { status_text: 'partial' } })}\n`);
  process.stderr.write('Individual quota reached. Resets in 41s. Error ID: secret-fixture-id');
  process.exit(0);
}
