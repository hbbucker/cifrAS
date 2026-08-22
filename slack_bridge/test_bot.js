const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const brainDir = path.join(__dirname, 'mock_brain_5');
if (!fs.existsSync(brainDir)) fs.mkdirSync(brainDir, { recursive: true });

let mapping = {
    'thread_1': { pendingId: 'slack_init_123', channel: 'C123', offset: 0 }
};

const applyNewLines = async (filePath, thread_ts, mData) => {
    console.log(`Processing file: ${filePath}`);
    try {
        const stats = fs.statSync(filePath);
        if (stats.size <= (mData.offset || 0)) return;

        const stream = fs.createReadStream(filePath, {
            start: mData.offset || 0,
            end: stats.size - 1,
            encoding: 'utf8'
        });

        let data = '';
        for await (const chunk of stream) {
            data += chunk;
        }

        const lastNewlineIndex = data.lastIndexOf('\n');
        if (lastNewlineIndex === -1) return; 

        const completeData = data.substring(0, lastNewlineIndex + 1);
        const bytesRead = Buffer.byteLength(completeData, 'utf8');

        mData.offset = (mData.offset || 0) + bytesRead;

        const lines = completeData.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
            try {
                const parsed = JSON.parse(line);
                console.log(`[BOT TO SLACK] Extracted from log:`, parsed.content || parsed.type);
            } catch(e) {
                console.log("JSON Parse error:", line);
            }
        }
    } catch (e) {
        console.error("Error processing new lines", e);
    }
};

const watcher = chokidar.watch(brainDir, {
    ignored: (filePath) => {
        return (
            filePath.includes('/.git') ||
            filePath.includes('\\.git') ||
            filePath.includes('/node_modules') ||
            filePath.includes('\\node_modules') ||
            filePath.includes('/target') ||
            filePath.includes('\\target') ||
            filePath.includes('/dist') ||
            filePath.includes('\\dist') ||
            filePath.includes('/workspaces') ||
            filePath.includes('\\workspaces')
        );
    },
    ignoreInitial: true,
    persistent: true
});

const handleFileChange = (filePath) => {
    if (!filePath.endsWith('transcript.jsonl')) return;
    
    const sessionId = filePath.split(path.sep).slice(-4)[0];
    console.log(`File change detected for session: ${sessionId}`);
    
    const hasPending = Object.values(mapping).some(m => m.pendingId);
    if (hasPending) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            for (const [thread_ts, mData] of Object.entries(mapping)) {
                if (mData.pendingId && data.includes(mData.pendingId)) {
                    console.log(`Mapped pending session ${mData.pendingId} to ${sessionId}`);
                    mData.sessionId = sessionId;
                    mData.offset = 0;
                    delete mData.pendingId;
                }
            }
        } catch(e) {}
    }

    for (const [thread_ts, mData] of Object.entries(mapping)) {
        if (mData.sessionId === sessionId) {
            applyNewLines(filePath, thread_ts, mData);
        }
    }
};

watcher.on('add', handleFileChange);
watcher.on('change', handleFileChange);

// SIMULATION
setTimeout(() => {
    const sessionId = 'session-789';
    const sessionLogDir = path.join(brainDir, sessionId, '.system_generated', 'logs');
    fs.mkdirSync(sessionLogDir, { recursive: true });
    
    const logFile = path.join(sessionLogDir, 'transcript.jsonl');
    
    fs.writeFileSync(logFile, JSON.stringify({ type: 'USER_INPUT', content: '[IGNORE_THIS_INTERNAL_ID: slack_init_123]' }) + '\n');
    
    setTimeout(() => {
        fs.appendFileSync(logFile, JSON.stringify({ source: 'MODEL', type: 'PLANNER_RESPONSE', content: 'Hello Slack integration!' }) + '\n');
    }, 500);
    setTimeout(() => process.exit(0), 1000);
}, 1000);
