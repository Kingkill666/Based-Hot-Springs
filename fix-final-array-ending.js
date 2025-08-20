const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/hot-springs-data.ts');
const backupPath = filePath + '.bak16';

let content = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, content);

// Replace any ending like '}];' or '    }];' with '}
];' at the end of the file
content = content.replace(/}\s*]};?\s*$/g, '\n}\n];\n');

fs.writeFileSync(filePath, content);
console.log('Fixed final array ending. Backup saved as lib/hot-springs-data.ts.bak16');
