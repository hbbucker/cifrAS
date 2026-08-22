const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, 'mock_brain_2');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const watcher = chokidar.watch(path.join(dir, '*', 'log.txt'), { ignoreInitial: true, persistent: true });
watcher.on('all', (event, p) => console.log(event, p));
watcher.on('ready', () => {
    console.log("Ready. Creating file...");
    const sub = path.join(dir, 'sess_1');
    if (!fs.existsSync(sub)) fs.mkdirSync(sub);
    fs.writeFileSync(path.join(sub, 'log.txt'), "hello");
    setTimeout(() => {
        fs.appendFileSync(path.join(sub, 'log.txt'), " world");
    }, 500);
    setTimeout(() => process.exit(0), 1000);
});
