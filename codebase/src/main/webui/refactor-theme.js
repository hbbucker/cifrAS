import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

const replacements = [
    // Backgrounds
    { rx: /\bbg-white\s+dark:bg-gray-[89]00\b/g, to: 'bg-bg-card' },
    { rx: /\bdark:bg-gray-[89]00\s+bg-white\b/g, to: 'bg-bg-card' },
    { rx: /\bbg-gray-50\s+dark:bg-gray-900\b/g, to: 'bg-bg-main' },
    { rx: /\bbg-gray-100\s+dark:bg-gray-800\b/g, to: 'bg-bg-elevated' },
    { rx: /\bbg-gray-50\b/g, to: 'bg-bg-main' },
    { rx: /\bbg-white\b/g, to: 'bg-bg-card' },
    { rx: /\bdark:bg-gray-[89]00\b/g, to: '' },
    
    // Text
    { rx: /\btext-gray-900\s+dark:text-white\b/g, to: 'text-text-main' },
    { rx: /\bdark:text-white\s+text-gray-900\b/g, to: 'text-text-main' },
    { rx: /\btext-gray-800\s+dark:text-gray-200\b/g, to: 'text-text-main' },
    { rx: /\bdark:text-gray-200\s+text-gray-800\b/g, to: 'text-text-main' },
    { rx: /\btext-gray-[56]00\s+dark:text-gray-[34]00\b/g, to: 'text-text-mute' },
    { rx: /\bdark:text-gray-[34]00\s+text-gray-[56]00\b/g, to: 'text-text-mute' },
    { rx: /\btext-gray-900\b/g, to: 'text-text-main' },
    { rx: /\btext-gray-800\b/g, to: 'text-text-main' },
    { rx: /\btext-gray-500\b/g, to: 'text-text-mute' },
    { rx: /\btext-gray-600\b/g, to: 'text-text-mute' },
    { rx: /\bdark:text-white\b/g, to: '' },
    { rx: /\bdark:text-gray-[1234]00\b/g, to: '' },
    
    // Borders
    { rx: /\bborder-gray-200\s+dark:border-gray-[78]00\b/g, to: 'border-border-main' },
    { rx: /\bdark:border-gray-[78]00\s+border-gray-200\b/g, to: 'border-border-main' },
    { rx: /\bborder-gray-100\s+dark:border-gray-[78]00\b/g, to: 'border-border-main' },
    { rx: /\bborder-gray-[12]00\b/g, to: 'border-border-main' },
    { rx: /\bdark:border-gray-[78]00\b/g, to: '' },

    // Hovers Background
    { rx: /\bhover:bg-gray-50\s+dark:hover:bg-gray-[78]00\b/g, to: 'hover:bg-bg-elevated' },
    { rx: /\bhover:bg-gray-100\s+dark:hover:bg-gray-[78]00\b/g, to: 'hover:bg-bg-elevated' },
    { rx: /\bdark:hover:bg-gray-[78]00\s+hover:bg-gray-50\b/g, to: 'hover:bg-bg-elevated' },
    { rx: /\bhover:bg-gray-50\b/g, to: 'hover:bg-bg-elevated' },
    { rx: /\bdark:hover:bg-gray-[78]00\b/g, to: '' }
];

let changedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    for (const rule of replacements) {
        content = content.replace(rule.rx, rule.to);
    }
    
    // Cleanup double spaces that might have been left by removing dark: classes
    content = content.replace(/[ \t]{2,}/g, ' ');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`Updated ${file}`);
        changedCount++;
    }
}

console.log(`\nUpdated ${changedCount} files.`);
