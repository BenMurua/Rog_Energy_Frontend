const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const colorMap = [
  { regex: /#0066ff/gi, replacement: 'var(--secondary)' },
  { regex: /#00d4aa/gi, replacement: 'var(--primary)' },
  { regex: /#1976d2/gi, replacement: 'var(--secondary)' },
  { regex: /#333333/gi, replacement: 'var(--text)' },
  { regex: /#333\b/gi, replacement: 'var(--text)' },
  { regex: /#bdbdbd/gi, replacement: 'var(--border)' },
  { regex: /#f5f7fa/gi, replacement: 'var(--background)' },
  { regex: /#ffffff\b/gi, replacement: 'var(--card)' },
  { regex: /#fff\b/gi, replacement: 'var(--card)' },
  { regex: /#4CAF50/gi, replacement: 'var(--price-up)' },
  { regex: /#F44336/gi, replacement: 'var(--price-down)' },
  { regex: /#FF9800/gi, replacement: 'var(--warning)' },
  { regex: /#e0e0e0/gi, replacement: 'var(--border)' }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.css') && file !== 'index.css') {
        results.push(filePath);
      } else if (file === 'index.css') {
        results.push(filePath);
      }
    }
  });
  return results;
}

const cssFiles = walk(directoryPath);

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // For index.css we skip replacing in the variable definitions block
  if (file.endsWith('index.css')) {
     const parts = content.split('/* 🔋 Battery Loader Animation */');
     if (parts.length > 1) {
       let block = parts[1];
       colorMap.forEach(co => {
         block = block.replace(co.regex, co.replacement);
       });
       content = parts[0] + '/* 🔋 Battery Loader Animation */' + block;
     }
  } else {
    colorMap.forEach(co => {
      content = content.replace(co.regex, co.replacement);
    });
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});

console.log('Colors replaced successfully.');
