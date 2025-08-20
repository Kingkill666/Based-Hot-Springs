const fs = require('fs');
const path = './lib/hot-springs-data.ts';

const lines = fs.readFileSync(path, 'utf8').split('\n');
let output = [];
let fixedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // If a line ends with '}' (not '},') and the next non-empty line starts with '{', add a comma
  if (
    line.trim().endsWith('}') &&
    !line.trim().endsWith('},') &&
    i + 1 < lines.length
  ) {
    // Find the next non-empty line
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length && lines[j].trim().startsWith('{')) {
      output.push(line + ',');
      fixedCount++;
      continue;
    }
  }
  output.push(line);
}

fs.writeFileSync(path, output.join('\n'), 'utf8');
console.log(`Done! Added ${fixedCount} missing commas between objects.`);