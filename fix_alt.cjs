const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

let modifiedCount = 0;

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Find all <img indices
    let idx = 0;
    while ((idx = content.indexOf('<img', idx)) !== -1) {
      // Find the end of the tag
      let endIdx = content.indexOf('>', idx);
      if (endIdx === -1) break;
      
      let tag = content.substring(idx, endIdx + 1);
      if (!tag.includes('alt=')) {
        // missing alt
        let before = content.substring(0, endIdx);
        let after = content.substring(endIdx);
        
        if (before.endsWith('/')) {
          before = before.substring(0, before.length - 1) + ' alt="" /';
        } else {
          before = before + ' alt=""';
        }
        content = before + after;
        
        // Advance idx past the newly inserted alt=""
        idx = before.length;
      } else {
        idx = endIdx + 1;
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedCount++;
      console.log('Fixed missing alt in: ' + filePath);
    }
  }
});

console.log('Total files modified: ' + modifiedCount);
