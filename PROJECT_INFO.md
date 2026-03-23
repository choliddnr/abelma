# ABELMA - Project Information Document

## Project Overview

**Name:** Abelma (Anak Belajar Mandiri)  
**Description:** An Indonesian children's educational app for learning reading and spelling through interactive games, alphabet learning, and rewards system.  
**Version:** 0.0.0

---

## Tech Stack

### Frontend

- **Framework:** Vue 3.5.27
- **Build Tool:** Vite 7.3.1
- **Styling:** Tailwind CSS 4.1.18
- **State Management:** Pinia 3.0.4
- **Routing:** Vue Router 5.0.1

### Backend (Cloud Functions)

- **Runtime:** Cloudflare Workers Pages
- **Database:** Cloudflare D1 (SQLite)
- **Auth:** Better Auth 1.5.4

### Development & Tooling

- **TypeScript:** 5.9.3
- **Code Linting:** ESLint, oxlint
- **Code Formatting:** oxcfmt
- **Type Checking:** vue-tsc

---

## Database Schema

### Tables

| Table                 | Description                | Key Fields                                                         |
| --------------------- | -------------------------- | ------------------------------------------------------------------ |
| **user**              | Authentication users       | id, name, email, emailVerified, createdAt, updatedAt               |
| **profiles**          | User learning profiles     | id, userId, name, avatar, points, letterCase, timerDuration        |
| **rewards**           | Customizable rewards       | id, profileId, title, cost, emoji, status, claimedAt               |
| **stickers**          | Earnable stickers          | id, profileId, stickerId, earnedAt                                 |
| **analytics**         | Learning progress tracking | id, profileId, type (word/letter), targetId, mistakes, lastAttempt |
| **alphabet_progress** | Alphabet mastery           | profileId, score, level, weights (JSON)                            |
| **session**           | Auth sessions              | id, expiresAt, token, userId                                       |
| **account**           | Social accounts            | id, accountId, providerId, userId                                  |
| **verification**      | Email verification         | id, identifier, value, expiresAt                                   |

### Database ID

- **Cloudflare D1 ID:** `19bd7224-986f-441c-8bba-8b898e33b0e4`
- **Migrations Directory:** `drizzle/`

---

## Authentication

### Provider

- **Primary:** Google OAuth
- **Auth Library:** Better Auth

### Configuration (Environment Variables)

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID                           |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret                       |
| `BETTER_AUTH_SECRET`   | Better Auth session secret                       |
| `BETTER_AUTH_URL`      | Auth server URL (default: http://localhost:5173) |

---

## State Management

### Local Storage (Pinia Stores)

#### 1. Profile Store (`src/utils/profileStore.ts`)

- **Profiles:** Array of user profiles with name, avatar, id
- **Active Profile:** Currently selected profile
- **Functions:** `selectProfile()`, `createProfile()`, `deleteProfile()`

#### 2. Reward Store (`src/utils/rewardStore.ts`)

- **Points:** Per-profile point balance
- **Rewards:** Customizable reward list
- **Functions:** `addPoints()`, `deductPoints()`, `claimReward()`, `fulfillReward()`
- **Default Rewards:**
  - Es Krim Lezat (50 points) 🍦
  - Main Game 30 Menit (100 points) 🎮
  - Beli Mainan Baru (500 points) 🧸

#### 3. Sticker Store (`src/utils/stickerStore.ts`)

- **Earnable Stickers:** 6 tiers based on score
  - ⭐ Penjelajah Bintang (50 score)
  - 🐱 Kucing Keren (100 score)
  - 🧙 Penyihir Kata (150 score)
  - 🐲 Naga Api (200 score)
  - 🦉 Burung Hantu Pintar (250 score)
  - 🦄 Unicorn Pelangi (300 score)

#### 4. Analytics Store (`src/utils/analyticsStore.ts`)

- **Tracking:** Mistakes and last attempt per word/letter
- **Functions:** `recordMistake()`, `getProfileAnalytics()`

#### 5. Alphabet Store (`src/utils/alphabetStore.ts`)

- **Progress:** Score, level, weights per profile
- **Functions:** `getAlphabetState()`, `getCurrentAlphabetState()`

#### 6. Word Settings (`src/utils/wordSettings.ts`)

- **Settings:**
  - `timerDuration`: Number of seconds (0 = off)
  - `letterCase`: 'uppercase' | 'lowercase'
- **Default:** 30 seconds, uppercase

---

## Cloud Functions

### Sync API (`functions/api/sync.ts`)

#### GET Request

- **Endpoint:** `/api/sync`
- **Purpose:** Fetch all user profiles and associated data
- **Auth:** Session-based authentication

#### POST Request

- **Endpoint:** `/api/sync`
- **Purpose:** Sync local data to cloud
- **Payload Structure:**

```typescript
interface CloudProfile {
  id: string
  name: string
  avatar: string
  points: number
  letterCase?: string
  timerDuration?: number
  rewards: CloudReward[]
  stickers: CloudSticker[]
  analytics: CloudAnalytics[]
  alphabetProgress: CloudAlphabetProgress | null
}
```

#### Sync Features

- Retry logic with exponential backoff (max 3 retries)
- Cloud data takes precedence over local data
- Batch upsert for efficiency

---

## Views & Pages

### Main Views (`src/views/`)

| View                        | Purpose                  |
| --------------------------- | ------------------------ |
| `LoginView.vue`             | User authentication      |
| `HomeView.vue`              | Landing/home page        |
| `WordLandingView.vue`       | Word learning landing    |
| `WordDetailView.vue`        | Individual word learning |
| `WordDashboardView.vue`     | Word learning dashboard  |
| `WordChallengeView.vue`     | Spelling challenge       |
| `WordQuizView.vue`          | Quiz mode                |
| `WordSettingsView.vue`      | Word learning settings   |
| `AlphabetView.vue`          | Alphabet learning        |
| `AlphabetDetailView.vue`    | Individual letter detail |
| `AlphabetStorybookView.vue` | Storybook for letters    |
| `GamesView.vue`             | Games section            |
| `StickerGalleryView.vue`    | Sticker collection       |
| `RewardShopView.vue`        | Reward shop              |
| `ParentDashboardView.vue`   | Parent monitoring        |
| `ParentRewardView.vue`      | Parent reward management |

### Level Structure

- **Levels:** Located in `src/views/Level/`
- **Example:** `src/views/Level/1/LearnView.vue`

### Components

| Component                 | Purpose               |
| ------------------------- | --------------------- |
| `ProfileSelector.vue`     | Profile switching     |
| `MenuCard.vue`            | Menu items            |
| `LoadingSpinner.vue`      | Loading indicator     |
| `LoadingSkeleton.vue`     | Skeleton loading      |
| `ErrorBoundary.vue`       | Error handling        |
| `DroppableComp.vue`       | Drag & drop component |
| `LetterComp.vue`          | Letter display        |
| **Storybook Components:** |
| `StoryScene.vue`          | Story scene           |
| `StoryLayout.vue`         | Story layout          |
| `LetterHero.vue`          | Letter hero           |
| `InteractionZone.vue`     | Interaction area      |
| `SpellingChallenge.vue`   | Spelling UI           |

---

## Data Files

### Static Data

- **Alphabet Data:** `AlphabetData.json`
- **Words:** `src/data/words.ts`

### Configuration

- **Word Settings:** `src/utils/wordSettings.ts`
- **Audio:** `src/utils/audio.ts`

---

## Environment Variables

### Required

| Variable               | Description                |
| ---------------------- | -------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `BETTER_AUTH_SECRET`   | Better Auth session secret |
| `BETTER_AUTH_URL`      | Auth server URL            |

### Local Development

```bash
pnpm dev
# Frontend at http://localhost:5173
# API proxy at http://127.0.0.1:8787
```

### Cloud Deployment

```bash
pnpm dev:pages
# Cloudflare Pages dev mode
```

---

## Development Scripts

```bash
# Development
pnpm dev                    # Vite dev server
pnpm dev:pages              # Cloudflare Pages dev

# Build
pnpm build                  # Production build
pnpm build-only             # Build only (no type check)
pnpm preview                # Preview production build

# Database
pnpm db:generate            # Generate migrations
pnpm db:migrate:local       # Apply migrations locally
pnpm db:migrate:remote      # Apply migrations remotely

# Code Quality
pnpm lint                   # Run all linters
pnpm lint:oxlint           # OX lint
pnpm lint:eslint           # ESLint
pnpm format                 # Format code with oxcfmt
pnpm type-check             # TypeScript check
```

---

## Folder Structure

```
abelma/
├── src/
│   ├── views/                    # Vue components (pages)
│   │   ├── Level/
│   │   │   └── 1/
│   │   │       └── LearnView.vue
│   │   ├── WordLandingView.vue
│   │   ├── WordDetailView.vue
│   │   ├── WordDashboardView.vue
│   │   ├── WordChallengeView.vue
│   │   ├── WordQuizView.vue
│   │   ├── WordSettingsView.vue
│   │   ├── AlphabetView.vue
│   │   ├── AlphabetDetailView.vue
│   │   ├── AlphabetStorybookView.vue
│   │   ├── GamesView.vue
│   │   ├── StickerGalleryView.vue
│   │   ├── RewardShopView.vue
│   │   ├── ParentDashboardView.vue
│   │   ├── ParentRewardView.vue
│   │   ├── LoginView.vue
│   │   └── HomeView.vue
│   ├── components/               # Reusable components
│   │   ├── storybook/
│   │   │   ├── StoryScene.vue
│   │   │   ├── StoryLayout.vue
│   │   │   ├── LetterHero.vue
│   │   │   └── InteractionZone.vue
│   │   ├── SpellingChallenge.vue
│   │   ├── ProfileSelector.vue
│   │   ├── MenuCard.vue
│   │   └── Loading*.vue
│   ├── utils/                    # Store implementations
│   │   ├── profileStore.ts
│   │   ├── rewardStore.ts
│   │   ├── stickerStore.ts
│   │   ├── analyticsStore.ts
│   │   ├── alphabetStore.ts
│   │   ├── wordSettings.ts
│   │   └── syncService.ts
│   ├── stores/                   # Pinia stores
│   │   └── storybookStore.ts
│   ├── lib/                      # Library utilities
│   │   ├── auth.ts
│   │   └── auth-client.ts
│   ├── types/                    # TypeScript types
│   │   ├── sync.ts
│   │   └── env.ts
│   ├── db/                       # Database schema
│   │   └── schema.ts
│   ├── data/                     # Static data
│   │   └── words.ts
│   ├── assets/                   # Static assets
│   │   ├── main.css
│   │   ├── base.css
│   │   └── logo.svg
│   └── router/                   # Routes
│       └── index.ts
├── functions/
│   └── api/
│       ├── sync.ts
│       └── state.ts
├── drizzle/                      # Database migrations
├── public/                       # Static public files
├── wrangler.toml                 # Cloudflare config
├── vite.config.ts                # Vite config
├── package.json
└── ...
```

---

## Sync Service Architecture

### Flow

```
Local Storage (Browser)
    ↓
triggerSync() / loadFromCloud()
    ↓
Cloudflare Function (/api/sync)
    ↓
D1 Database (SQLite)
```

### Retry Logic

- **Max Retries:** 3
- **Base Delay:** 1000ms
- **Backoff:** Exponential (2^attempt)

---

## Key Features

1. **Multi-Profile Support:** Multiple children profiles per account
2. **Progress Tracking:** Mistakes, completion time per word/letter
3. **Gamification:** Points, stickers, custom rewards
4. **Parent Dashboard:** Monitor child progress
5. **Offline Support:** Local storage sync with cloud
6. **Configurable Learning:** Timer, letter case settings
7. **Responsive Design:** Tailwind CSS styling

---

## Notes for Future Development

- [ ] Add more word/letter content
- [ ] Implement parent email notifications
- [ ] Add social sharing features
- [ ] Implement analytics dashboard
- [ ] Add dark mode theme
- [ ] Add voice feedback for correct/incorrect answers
- [ ] Implement achievements system
- [ ] Add tutorial/onboarding flow
- [ ] Add parental controls (time limits, content filtering)
- [ ] Implement export progress reports for parents

---

_Generated: $(date +%Y-%m-%d)_
_Project: ABELMA - Anak Belajar Mandiri_
