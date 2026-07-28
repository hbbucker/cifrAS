const { spawn } = require('child_process');
const crypto = require('crypto');
const sessionId = 'test_interactive_' + crypto.randomUUID();

const child = spawn('agy', ['--conversation', sessionId, '--dangerously-skip-permissions']);
let output = '';

child.stdout.on('data', (data) => {
    output += data.toString();
    console.log('[STDOUT]', data.toString());
});

child.stderr.on('data', (data) => {
    console.log('[STDERR]', data.toString());
});

setTimeout(() => {
    console.log('Sending first message...');
    child.stdin.write("Start a 5 second schedule.\n");
}, 2000);

setTimeout(() => {
    console.log('Sending second message while schedule is running...');
    child.stdin.write("Are you waiting for the schedule?\n");
}, 4000);

setTimeout(() => {
    child.stdin.write("/exit\n");
}, 10000);

