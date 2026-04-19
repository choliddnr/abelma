import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

const renameMap = [
  { from: 'app/components/alphabet/AlphabetChallengeMode.vue', to: 'app/components/alphabet/AlphabetQuizMode.vue' },
  { from: 'app/constants/challengeDefaults.ts', to: 'app/constants/quizDefaults.ts' },
  { from: 'app/pages/alphabet/challenge.vue', to: 'app/pages/alphabet/quiz.vue' },
  { from: 'app/pages/parent/challenge.vue', to: 'app/pages/parent/quiz.vue' },
  { from: 'app/pages/words/challenge.vue', to: 'app/pages/words/quiz.vue' },
  { from: 'server/api/words/challenge', to: 'server/api/words/quiz' },
  { from: 'server/api/alphabet/challange', to: 'server/api/alphabet/quiz' }
];

renameMap.forEach(item => {
  const oldPath = path.join(rootDir, item.from);
  const newPath = path.join(rootDir, item.to);

  if (fs.existsSync(oldPath)) {
    console.log(`Renaming ${oldPath} to ${newPath}`);
    // Create parent directory for new path if it doesn't exist
    const newDir = path.dirname(newPath);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }
    fs.renameSync(oldPath, newPath);
  } else {
    console.warn(`Path not found: ${oldPath}`);
  }
});
