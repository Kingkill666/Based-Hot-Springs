const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/hot-springs-data.ts');
const backupPath = filePath + '.bak13';

let content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, content);

const lines = content.split('\n');
let fixedLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
  // If this line looks like a property value and the next line is a property (identifier: ...)
  if (
    trimmed &&
    !trimmed.endsWith(',') &&
    (trimmed.endsWith('}') || trimmed.endsWith(']') || trimmed.endsWith('"') || /[0-9]$/.test(trimmed)) &&
    nextLine &&
    /^[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(nextLine) &&
    nextLine !== '}'
  ) {
    fixedLines.push(line + ',');
  } else {
    fixedLines.push(line);
  }
}

fs.writeFileSync(filePath, fixedLines.join('\n'));
console.log('Added missing commas everywhere. Backup saved as lib/hot-springs-data.ts.bak13');
