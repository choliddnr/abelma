import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

const ignoreDirs = ['node_modules', '.git', '.nuxt', '.output', 'dist'];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(rootDir);

files.forEach(file => {
  // Only process text files
  if (file.endsWith('.ts') || file.endsWith('.vue') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    const replacements = [
      { from: /quiz/g, to: 'quiz' },
      { from: /Quiz/g, to: 'Quiz' },
      { from: /QUIZ/g, to: 'QUIZ' },
      { from: /quiz/g, to: 'quiz' },
      { from: /Quiz/g, to: 'Quiz' },
      { from: /QUIZ/g, to: 'QUIZ' }
    ];

    replacements.forEach(r => {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        changed = true;
      }
    });

    if (changed) {
      console.log(`Updated content in: ${file}`);
      fs.writeFileSync(file, content, 'utf8');
    }
  }
});
