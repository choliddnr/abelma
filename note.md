homepage: "Hore! Siap jadi anak hebat hari ini? Yuk, mulai main dan belajar!"
/alphabet: "Yuk, kita kenalan sama huruf! Ada A, B, C… huruf apa saja ya?"
/word: "Kita belajar kata-kata yuk! Ada Gambar A… Gambar B… Gambar C… Ada gambar apa ya?"
/games: "Main yuk! Ada permainan menebak gambar. Ada gambar A… Gambar B… Gambar C… Ada gambar apa ya?"
/storybook: "Baca buku yuk! Ada cerita A… Cerita B… Cerita C… Ada cerita apa ya?"
/challenge: "Ikutan misi yuk! Ada misi A… Misi B… Misi C… Ada misi apa ya?"
/rewards: "Klaim hadiahmu yuk! Ada hadiah A… Hadiah B… Hadiah C… Ada hadiah apa ya?"
/missions/word-match
/missions/letter-match
/missions/find-the-image
/missions/complete-the-word



A, ini huruf A besar. A, ini huruf A kecil. Ini B, yang ini juga B. B, B, B. Kali ini kita akan belajar huruf C. C, ini huruf C besar. C, ini huruf C kecil. Kali ini akan belajar huruf D. Yang ini huruf D besar. D, D. Yang ini huruf D kecil. Yuk teman-teman kita ulangi, yang ini huruf D besar, yang ini huruf D kecil. Kali ini kita akan belajar huruf E. Yang ini huruf E besar. E besar. Yang ini huruf E kecil. E kecil. Yuk teman-teman kita ulangi, E. Betul, ini E besar, ini E kecil.

help me to create e2e test for this module. i want to make sure that learning progress and quiz progress syncronized correcly with database, no error, limitaion for free tier is working and smooth navigation.

```markdown
I have prepared a test plan for the End-to-End Playwright tests for the CVC module.

The tests will specifically focus on:

Routing and Free Tier Limitation: Verifying the user can access the selector, click Level 1, and be successfully blocked by the Premium Lock on Level 2 (redirected to /parent/premium).
Learning Progress Persistence: Navigating into the Level 1 learning session, completing an interactive step (clicking "Gabungkan!"), and then reloading the page to ensure the progress was synced to the D1 database correctly without crashing.
Quiz Validation: Accessing the quiz mode to guarantee the logic loads correctly without errors.
Please review the plan in the artifact to your right. If you approve, I'll go ahead and generate the tests/cvc.spec.ts file and run it to verify everything works!
```

task: setting
1. learning levelup reward.
2. quiz setting to set coins for each correct answer, strake break to be rewarded, coins for strake break, level up reward.
3. make sure that quiz config usage at quiz mode.
4. make sure that level 1 is accessible to free user.
5. Make sure quiz-weights is recorded the quiz progress and sync with database correctly