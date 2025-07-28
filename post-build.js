import fs from 'fs-extra';
import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCopy = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.js',
  'settings.js',
  'welcome.js',
  'icons',
  'styles'
];

const foldersToCreate = [
  'dist/icons',
  'dist/styles'
];

async function copyFiles() {
  try {
    console.log('Starting post-build processing...');

    // Create necessary folders
    for (const folder of foldersToCreate) {
      await fs.ensureDir(folder);
      console.log(`Created folder: ${folder}`);
    }

    // Copy files
    for (const file of filesToCopy) {
      if (await fs.pathExists(file)) {
        await fs.copy(file, join('dist', file));
        console.log(`Copied: ${file}`);
      } else {
        console.warn(`File not found: ${file}`);
      }
    }

    // Fix HTML files to use correct asset paths
    const htmlFiles = ['newtab.html', 'popup.html', 'welcome.html', 'settings.html'];
    
    for (const htmlFile of htmlFiles) {
      const distPath = join('dist', htmlFile);
      if (await fs.pathExists(distPath)) {
        let content = await fs.readFile(distPath, 'utf8');
        
        // Fix script and CSS references for Vite build
        content = content.replace(
          /src="\.\/src\/(.*?)\.jsx"/g,
          'src="assets/$1.js"'
        );
        content = content.replace(
          /href="\.\/src\/(.*?)\.css"/g,
          'href="assets/$1.css"'
        );
        
        await fs.writeFile(distPath, content, 'utf8');
        console.log(`Updated paths in: ${htmlFile}`);
      }
    }
    
    console.log('Post-build processing completed successfully');
  } catch (err) {
    console.error('Error in post-build processing:', err);
    process.exit(1);
  }
}

copyFiles();