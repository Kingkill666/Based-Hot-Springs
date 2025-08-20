const fs = require('fs');
const path = './lib/hot-springs-data.ts';

const file = fs.readFileSync(path, 'utf8');
const lines = file.split('\n');

let insideObject = false;
let currentObject = [];
let currentId = null;
let idSet = new Set();
let output = [];
let removedCount = 0;

function extractId(line) {
  const match = line.match(/id:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (!insideObject && line.trim().startsWith('{')) {
    insideObject = true;
    currentObject = [line];
    currentId = null;
    continue;
  }

  if (insideObject) {
    currentObject.push(line);
    if (!currentId) {
      currentId = extractId(line);
    }
    if (line.trim().startsWith('},')) {
      // End of object
      if (currentId && idSet.has(currentId)) {
        removedCount++;
        // skip this object
      } else {
        if (currentId) idSet.add(currentId);
        output = output.concat(currentObject);
      }
      insideObject = false;
      currentObject = [];
      currentId = null;
    }
    continue;
  }

  // Not inside an object, just copy the line
  output.push(line);
}

fs.writeFileSync(path, output.join('\n'), 'utf8');
console.log(`Done! Removed ${removedCount} duplicate hot spring objects.`);