import fs from 'fs';
import path from 'path';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.02\)/g, 'var(--glass-bg-subtle)');
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'var(--glass-bg-subtle)');
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--glass-bg)');
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'var(--glass-bg-hover)');
      content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.2\)/g, 'var(--glass-border-strong)');
      content = content.replace(/'white'/g, '\'var(--text-primary)\'');
      content = content.replace(/\"white\"/g, '\"var(--text-primary)\"');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('./src/pages');
processDir('./src/components');
console.log('Done refactoring colors!');
