const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('./app/admin', function(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Restore corrupted bg-white inside dark-themed components
  content = content.replace(/bg-white dark:bg-zinc-900\/(\d+)/g, 'bg-white/$1');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
    count++;
  }
});

console.log(`Done fixing ${count} files.`);
