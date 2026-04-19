import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const drizzleDir = path.join(rootDir, 'drizzle');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

if (fs.existsSync(drizzleDir)) {
  const files = getAllFiles(drizzleDir);

  files.forEach(file => {
    if (file.endsWith('.json') || file.endsWith('.sql')) {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;

      // Note: We are reverting 'quiz' back to 'challenge' ONLY in the drizzle directory
      // so that Drizzle Kit can detect the change from 'challenge' to 'quiz' in schema.ts.
      // We also handle the potential 'challange' typo if it was there.
      
      const replacements = [
        { from: /quiz/g, to: 'challenge' },
        { from: /Quiz/g, to: 'Challenge' },
        { from: /QUIZ/g, to: 'CHALLENGE' }
      ];

      replacements.forEach(r => {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      });

      if (changed) {
        console.log(`Reverted content in: ${file}`);
        fs.writeFileSync(file, content, 'utf8');
      }
    }
  });
} else {
  console.error("Drizzle directory not found!");
}
