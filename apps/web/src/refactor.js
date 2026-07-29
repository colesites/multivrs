const fs = require('fs').promises;
const path = require('path');

const SRC_DIR = __dirname;

async function walk(dir, callback) {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await walk(filePath, callback);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      await callback(filePath);
    }
  }
}

async function refactor() {
  await walk(SRC_DIR, async (filePath) => {
    let content = await fs.readFile(filePath, 'utf8');
    let original = content;

    // Replacements
    content = content.replace(/text-white\/([0-9]+)/g, 'text-foreground/$1');
    content = content.replace(/text-white(?!\w|-)/g, 'text-foreground');
    content = content.replace(/border-white\/([0-9]+)/g, 'border-foreground/$1');
    content = content.replace(/bg-white\/([0-9]+)/g, 'bg-foreground/$1');
    content = content.replace(/bg-\\[#030303\\]/g, 'bg-background');
    content = content.replace(/bg-black(?!\w|-)/g, 'bg-background');

    if (content !== original) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`Updated: ${filePath.replace(process.cwd(), '')}`);
    }
  });
}

refactor().catch(console.error);
