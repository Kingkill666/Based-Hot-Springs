const fs = require('fs');
const path = './lib/hot-springs-data.ts';

const file = fs.readFileSync(path, 'utf8');
// This regex matches each hot spring object and extracts id, name, city, and state
const regex = /{[^}]*?id:\s*"([^"]+)",[^}]*?name:\s*"([^"]+)",[^}]*?state:\s*"([^"]+)",[^}]*?city:\s*"([^"]+)",/gs;

const seen = {};
let match;
while ((match = regex.exec(file)) !== null) {
  const id = match[1];
  const name = match[2].toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const state = match[3].toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const city = match[4].toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const key = `${name}|${city}|${state}`;
  if (!seen[key]) seen[key] = [];
  seen[key].push(id);
}

let found = false;
console.log('Potential duplicates by name, city, and state:');
for (const [key, ids] of Object.entries(seen)) {
  if (ids.length > 1) {
    found = true;
    console.log(`- ${key}: ids = ${ids.join(', ')}`);
  }
}
if (!found) {
  console.log('No duplicates found by name, city, and state!');
}