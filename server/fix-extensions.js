import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.log('No dist directory found.');
  process.exit(0);
}

const files = walk(distDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Add .js to relative imports and aliases
  let newContent = content.replace(/from\s+['"](\.[^'"]*?)['"]/g, "from '$1.js'");
  newContent = newContent.replace(/from\s+['"](@shared[^'"]*?)['"]/g, "from '$1.js'");
  // Also fix dynamic imports
  newContent = newContent.replace(/import\s*\(['"](\.[^'"]*?)['"]\)/g, "import('$1.js')");
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
  }
});
console.log('Fixed ESM import extensions inside dist/');
