const fs = require('fs');
const path = './lib/hot-springs-data.ts';

const file = fs.readFileSync(path, 'utf8');
const regex = /{[^}]*?id:\s*"([^"]+)",[^}]*?name:\s*"([^"]+)",[^}]*?state:\s*"([^"]+)",[^}]*?city:\s*"([^"]+)",/gs;

const lines = file.split('\n');
let insideObject = false;
let currentObject = [];
let keepSet = new Set();
let seen = {};
let output = [];
let removedCount = 0;

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

// First pass: find which IDs to keep (first occurrence for each name/city/state in Arkansas)
let match;
while ((match = regex.exec(file)) !== null) {
  const id = match[1];
  const name = normalize(match[2]);
  const state = normalize(match[3]);
  const city = normalize(match[4]);
  if (state !== 'arkansas') continue;
  const key = `${name}|${city}|${state}`;
  if (!seen[key]) {
    seen[key] = id;
    keepSet.add(id);
  }
}

// Second pass: write out only the objects to keep
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!insideObject && line.trim().startsWith('{')) {
    insideObject = true;
    currentObject = [line];
    continue;
  }
  if (insideObject) {
    currentObject.push(line);
    if (line.trim().startsWith('},')) {
      // End of object
      const objectStr = currentObject.join('\n');
      const idMatch = objectStr.match(/id:\s*"([^"]+)"/);
      const stateMatch = objectStr.match(/state:\s*"([^"]+)"/);
      if (idMatch && stateMatch && normalize(stateMatch[1]) === 'arkansas') {
        if (keepSet.has(idMatch[1])) {
          output = output.concat(currentObject);
          keepSet.delete(idMatch[1]); // Only keep the first occurrence
        } else {
          removedCount++;
        }
      } else {
        output = output.concat(currentObject);
      }
      insideObject = false;
      currentObject = [];
    }
    continue;
  }
  // Not inside an object, just copy the line
  output.push(line);
}

fs.writeFileSync(path, output.join('\n'), 'utf8');
console.log(`Done! Removed ${removedCount} duplicate Arkansas hot spring objects.`);