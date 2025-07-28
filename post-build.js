import fs from 'fs-extra';
import { join } from 'path';

// Copy non-bundled files to dist
const filesToCopy = [
  'manifest.json',
  'background.js',
  'content.js',
  'icons'
];

async function copyFiles() {
  try {
    for (const file of filesToCopy) {
      await fs.copy(file, join('dist', file));
    }
    
    // Update HTML files to reference correct script paths
    const htmlFiles = ['newtab.html', 'popup.html', 'welcome.html', 'settings.html'];
    
    for (const htmlFile of htmlFiles) {
      if (await fs.pathExists(join('dist', htmlFile))) {
        let content = await fs.readFile(join('dist', htmlFile), 'utf8');
        
        // Replace script references
        content = content.replace(
          /<script src="(.*?)\.js"><\/script>/g, 
          '<script src="assets/$1.js"></script>'
        );
        
        await fs.writeFile(join('dist', htmlFile), content, 'utf8');
      }
    }
    
    console.log('Post-build processing completed successfully');
  } catch (err) {
    console.error('Error in post-build processing:', err);
    process.exit(1);
  }
}

copyFiles();