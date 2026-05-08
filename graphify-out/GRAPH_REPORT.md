# Graph Report - . (2026-05-04)

## Corpus Check

- Large corpus: 225 files · ~821,088 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary

- 297 nodes · 160 edges · 43 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- [[_COMMUNITY_App Dashboards & Navigation|App Dashboards & Navigation]]
- [[_COMMUNITY_Audio & Core State|Audio & Core State]]
- [[_COMMUNITY_Interactive Learning Logic|Interactive Learning Logic]]
- [[_COMMUNITY_Level Progression|Level Progression]]
- [[_COMMUNITY_Quiz Mechanics|Quiz Mechanics]]
- [[_COMMUNITY_Feedback & Animations|Feedback & Animations]]
- [[_COMMUNITY_UI Interactions|UI Interactions]]
- [[_COMMUNITY_Premium & Access Control|Premium & Access Control]]
- [[_COMMUNITY_API & Backend Utilities|API & Backend Utilities]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 152|Community 152]]
- [[_COMMUNITY_Community 153|Community 153]]
- [[_COMMUNITY_Community 154|Community 154]]
- [[_COMMUNITY_Community 155|Community 155]]
- [[_COMMUNITY_Community 156|Community 156]]
- [[_COMMUNITY_Community 157|Community 157]]
- [[_COMMUNITY_Community 158|Community 158]]
- [[_COMMUNITY_Community 159|Community 159]]
- [[_COMMUNITY_Community 160|Community 160]]
- [[_COMMUNITY_Community 161|Community 161]]
- [[_COMMUNITY_Community 162|Community 162]]
- [[_COMMUNITY_Community 163|Community 163]]
- [[_COMMUNITY_Community 164|Community 164]]
- [[_COMMUNITY_Community 165|Community 165]]
- [[_COMMUNITY_Community 166|Community 166]]
- [[_COMMUNITY_Community 167|Community 167]]
- [[_COMMUNITY_Community 168|Community 168]]
- [[_COMMUNITY_Community 169|Community 169]]
- [[_COMMUNITY_Community 170|Community 170]]
- [[_COMMUNITY_Community 171|Community 171]]
- [[_COMMUNITY_Community 172|Community 172]]
- [[_COMMUNITY_Community 173|Community 173]]
- [[_COMMUNITY_Community 174|Community 174]]
- [[_COMMUNITY_Community 175|Community 175]]
- [[_COMMUNITY_Community 176|Community 176]]
- [[_COMMUNITY_Community 177|Community 177]]
- [[_COMMUNITY_Community 178|Community 178]]
- [[_COMMUNITY_Community 179|Community 179]]
- [[_COMMUNITY_Community 180|Community 180]]

## God Nodes (most connected - your core abstractions)

1. `profileStore` - 10 edges
2. `handleLetterClick()` - 7 edges
3. `popConfetti()` - 6 edges
4. `dropAtSlot()` - 6 edges
5. `playEffectAudio()` - 5 edges
6. `handleCorrect()` - 5 edges
7. `stopTimer()` - 4 edges
8. `playAudio()` - 4 edges
9. `playSequence()` - 4 edges
10. `playWordAudio()` - 4 edges

## Surprising Connections (you probably didn't know these)

- `handleLetterClick()` --calls--> `playSequence()` [INFERRED]
  app/components/alphabet/AlphabetQuizMode.vue → app/composables/useAudio.ts
- `handleMerge()` --calls--> `playWordAudio()` [INFERRED]
  app/pages/ddv/learn/[level].vue → app/composables/useAudio.ts
- `playTargetWord()` --calls--> `playWordAudio()` [INFERRED]
  app/pages/words/[category]/[word]/exercise.vue → app/composables/useAudio.ts
- `onResponse()` --calls--> `playEffectAudio()` [INFERRED]
  app/pages/rewards.vue → app/composables/useAudio.ts
- `onResponse()` --calls--> `playEffectAudio()` [INFERRED]
  app/pages/challenge/index.vue → app/composables/useAudio.ts

## Communities (181 total, 35 thin omitted)

### Community 0 - "App Dashboards & Navigation"

Cohesion: 0.12
Nodes (17): MenuBubble Component, Alphabet Dashboard, Cvc Dashboard, Ddv Dashboard, Home Page, Nasal Dashboard, alphabetStore, analyticsStore (+9 more)

### Community 1 - "Audio & Core State"

Cohesion: 0.16
Nodes (11): onResponse(), playAudio(), playEffectAudio(), playLetterSound(), playSequence(), playSyllableAudio(), playWordAudio(), speakTTS() (+3 more)

### Community 2 - "Interactive Learning Logic"

Cohesion: 0.19
Nodes (7): checkCompletion(), dropAtSlot(), onDrop(), onTouchEnd(), playTargetWord(), popConfetti(), putBackLetter()

### Community 3 - "Level Progression"

Cohesion: 0.36
Nodes (7): finishLevel(), goToNextLevel(), handleComplete(), handleMerge(), handleStepComplete(), nextItem(), popConfetti()

### Community 4 - "Quiz Mechanics"

Cohesion: 0.43
Nodes (6): handleClusterCorrect(), handleConnectComplete(), handleConnectMatch(), handleCorrect(), handleDiphthongCorrect(), popConfetti()

### Community 5 - "Feedback & Animations"

Cohesion: 0.5
Nodes (7): handleLetterClick(), handleTimeout(), launchConfetti(), pickNextLetter(), shuffleLetters(), startTimer(), stopTimer()

### Community 7 - "UI Interactions"

Cohesion: 0.47
Nodes (4): handleClick(), popConfetti(), reset(), shuffleOptions()

### Community 11 - "Community 11"

Cohesion: 0.83
Nodes (3): clearTracing(), onSaved(), retry()

## Knowledge Gaps

- **42 isolated node(s):** `Abelma Logo`, `Underwater Background 1`, `Underwater Background 2`, `Letter A Illustration`, `Letter B Illustration` (+37 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `playWordAudio()` connect `Audio & Core State` to `Interactive Learning Logic`, `Level Progression`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `playEffectAudio()` connect `Audio & Core State` to `Interactive Learning Logic`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `handleMerge()` connect `Level Progression` to `Audio & Core State`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `playEffectAudio()` (e.g. with `onResponse()` and `onResponse()`) actually correct?**
  _`playEffectAudio()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Abelma Logo`, `Underwater Background 1`, `Underwater Background 2` to the rest of the system?**
  _42 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Dashboards & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
