const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/hot-springs-data.ts');
const backupPath = filePath + '.bak15';

let content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, content);

// Add a comma after every closing brace '}' that is followed by a comment and then a '{'
content = content.replace(/}(\s*\n\s*\/\/[^\n]*\n\s*){/g, '},$1{');

fs.writeFileSync(filePath, content);
console.log('Added missing commas after objects before comments. Backup saved as lib/hot-springs-data.ts.bak15');
