const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/hot-springs-data.ts');
const backupPath = filePath + '.bak14';

let content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, content);

// Add a comma after every closing brace '}' that is immediately followed by a '{' (start of a new object)
content = content.replace(/}\s*\n\s*{/g, '},\n{');

fs.writeFileSync(filePath, content);
console.log('Added missing commas between objects. Backup saved as lib/hot-springs-data.ts.bak14');
