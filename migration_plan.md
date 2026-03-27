# ABELMA State Management Migration Plan

## 📋 Overview

This document outlines the migration plan from the current state management implementation (stores in `src/utils/`) to a proper Pinia setup store structure following Vue 3 best practices.

---

## 🎯 Current State

### Location: `src/utils/`

- `profileStore.ts` - User profile management
- `rewardStore.ts` - Points and rewards
- `stickerStore.ts` - Sticker collection
- `analyticsStore.ts` - Learning analytics
- `alphabetStore.ts` - Alphabet progress
- `wordSettings.ts` - Learning settings
- `syncService.ts` - Cloud sync logic

### Issues Identified:

1. Stores are in wrong directory (should be in `src/stores/`)
2. May not follow Pinia setup store pattern properly
3. Potential lack of type safety
4. Missing persistence configuration
5. Sync logic mixed with store logic

---

## 🏗️ Target State

### New Structure:

```
src/stores/
├── profileStore.ts       # User profiles (setup store)
├── rewardStore.ts        # Rewards & points (setup store)
├── stickerStore.ts       # Sticker collection (setup store)
├── analyticsStore.ts     # Learning analytics (setup store)
├── alphabetStore.ts      # Alphabet progress (setup store)
├── settingsStore.ts      # Word settings (setup store)
├── storybookStore.ts     # Alphabet storybook state (setup store)
├── syncStore.ts          # Sync orchestration (setup store)
└── index.ts              # Store registration
```

---

## 📝 Migration Phases

### Phase 1: Preparation & Type Definition

**Goal:** Create proper TypeScript types and interface definitions

**Tasks:**

1. Create `src/types/stores.ts` with all store-related types
2. Define interfaces for:
   - `Profile`, `Reward`, `Sticker`, `Analytics`, `AlphabetProgress`
   - Cloud sync types from `functions/api/sync.ts`
3. Add persistence types for localStorage

**Estimated Time:** 2-3 hours

---

### Phase 2: Create Setup Stores

**Goal:** Migrate each store to Pinia setup store pattern

#### 2.1 Auth Store (`src/stores/authStore.ts`)

```typescript
// NEW: Consolidate auth-related state
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

**Features:**

- Session management
- Auth state persistence
- Better Auth integration

---

#### 2.2 Profile Store (`src/stores/profileStore.ts`)

```typescript
// Migration from src/utils/profileStore.ts
interface ProfileState {
  profiles: Profile[]
  activeProfileId: string | null
  selectedProfile: Profile | null
}

interface ProfileActions {
  selectProfile: (id: string) => Promise<void>
  createProfile: (name: string, avatar?: string) => Promise<Profile>
  deleteProfile: (id: string) => Promise<void>
  loadFromCloud: () => Promise<void>
  triggerSync: () => Promise<void>
}
```

**Key Changes:**

- Move from utils to stores directory
- Use `defineStore('profile')` setup pattern
- Add `persist` configuration
- Separate sync logic into `syncStore`

---

#### 2.3 Reward Store (`src/stores/rewardStore.ts`)

```typescript
// Migration from src/utils/rewardStore.ts
interface RewardState {
  points: number
  rewards: Reward[]
  defaultRewards: DefaultReward[]
}

interface RewardActions {
  addPoints: (amount: number) => Promise<void>
  deductPoints: (amount: number) => Promise<void>
  claimReward: (rewardId: string) => Promise<boolean>
  fulfillReward: (rewardId: string) => Promise<void>
  loadFromCloud: () => Promise<void>
  triggerSync: () => Promise<void>
}
```

**Key Changes:**

- Points persistence with localStorage
- Reward list management
- Sync with cloud rewards

---

#### 2.4 Sticker Store (`src/stores/stickerStore.ts`)

```typescript
// Migration from src/utils/stickerStore.ts
interface StickerState {
  stickers: Sticker[]
  defaultStickers: DefaultSticker[]
}

interface StickerActions {
  addSticker: (stickerId: string) => Promise<void>
  getEarnableStickers: () => Sticker[]
  loadFromCloud: () => Promise<void>
  triggerSync: () => Promise<void>
}
```

**Key Changes:**

- Sticker tier persistence
- Sync with cloud stickers

---

#### 2.5 Analytics Store (`src/stores/analyticsStore.ts`)

```typescript
// Migration from src/utils/analyticsStore.ts
interface AnalyticsState {
  analytics: Analytics[]
}

interface AnalyticsActions {
  recordMistake: (profileId: string, type: string, targetId: string) => Promise<void>
  getProfileAnalytics: (profileId: string) => Promise<Analytics[]>
  loadFromCloud: () => Promise<void>
  triggerSync: () => Promise<void>
}
```

**Key Changes:**

- Analytics persistence
- Cloud sync integration

---

#### 2.6 Alphabet Store (`src/stores/alphabetStore.ts`)

```typescript
// Migration from src/utils/alphabetStore.ts
interface AlphabetState {
  progress: AlphabetProgress[]
}

interface AlphabetActions {
  getAlphabetState: (profileId: string) => AlphabetProgress | null
  getCurrentAlphabetState: () => AlphabetProgress | null
  updateProgress: (profileId: string, data: Partial<AlphabetProgress>) => Promise<void>
  loadFromCloud: () => Promise<void>
  triggerSync: () => Promise<void>
}
```

**Key Changes:**

- Progress tracking per profile
- Cloud sync for alphabet data

---

#### 2.7 Settings Store (`src/stores/settingsStore.ts`)

```typescript
// Migration from src/utils/wordSettings.ts
interface SettingsState {
  timerDuration: number
  letterCase: 'uppercase' | 'lowercase'
}

interface SettingsActions {
  setTimerDuration: (duration: number) => Promise<void>
  setLetterCase: (caseType: 'uppercase' | 'lowercase') => Promise<void>
  loadFromCloud: () => Promise<void>
  triggerSync: () => Promise<void>
}
```

**Key Changes:**

- Local persistence (no cloud sync needed)
- Global settings across all profiles

---

#### 2.8 Sync Store (`src/stores/syncStore.ts`)

```typescript
// NEW: Centralize sync logic
interface SyncState {
  isSyncing: boolean
  lastSync: Date | null
  syncError: Error | null
}

interface SyncActions {
  triggerSync: () => Promise<void>
  loadFromCloud: () => Promise<void>
  handleSyncError: (error: Error) => void
}
```

**Key Changes:**

- Centralize retry logic
- Exponential backoff configuration
- Error handling
- Sync status tracking

---

### Phase 3: Store Registration

**Goal:** Register all stores with Pinia

**Tasks:**

1. Create `src/stores/index.ts`
2. Import and register all stores
3. Ensure proper store names and IDs

**File Structure:**

```typescript
// src/stores/index.ts
import { defineStore } from 'pinia'
import { createPinia } from 'pinia'

// ... imports ...

export const pinia = createPinia()

export default pinia
```

---

### Phase 4: Update Components & Views

**Goal:** Update all Vue components to use new store pattern

**Tasks:**

1. Update `src/components/` to use new stores
2. Update `src/views/` to use new stores
3. Replace direct localStorage access with store methods
4. Update sync triggers in appropriate views

**Pattern:**

```vue
<!-- OLD -->
<script setup>
import { profileStore } from '@/utils/profileStore'
import { onMounted } from 'vue'

onMounted(() => {
  profileStore.loadFromCloud()
})
</script>

<!-- NEW -->
<script setup>
import { useProfileStore } from '@/stores/profileStore'
import { onMounted } from 'vue'

const profileStore = useProfileStore()

onMounted(() => {
  profileStore.loadFromCloud()
})
</script>
```

---

### Phase 5: Update Cloud Functions

**Goal:** Ensure cloud functions work with new store data format

**Tasks:**

1. Update `functions/api/sync.ts` to work with setup stores
2. Ensure data serialization/deserialization compatibility
3. Test sync flow with new stores

---

### Phase 6: Testing & Validation

**Goal:** Verify all functionality works correctly

**Tasks:**

1. Test profile creation/selection
2. Test rewards system
3. Test sticker earning
4. Test analytics tracking
5. Test cloud sync
6. Test offline functionality
7. Test parent dashboard

---

## 📊 Timeline Estimate

| Phase     | Task                          | Estimated Time  |
| --------- | ----------------------------- | --------------- |
| 1         | Preparation & Type Definition | 2-3 hours       |
| 2         | Create Setup Stores           | 8-10 hours      |
| 3         | Store Registration            | 1-2 hours       |
| 4         | Update Components & Views     | 6-8 hours       |
| 5         | Update Cloud Functions        | 2-3 hours       |
| 6         | Testing & Validation          | 4-6 hours       |
| **Total** |                               | **23-32 hours** |

---

## 🔧 Technical Considerations

### 1. Persistence Configuration

```typescript
persist: {
  storage: localStorage,
  key: 'profileStore',
  pick: ['profiles', 'activeProfileId', 'selectedProfile'],
  paths: ['state'],
}
```

### 2. Store Names (for defineStore)

- authStore
- profileStore
- rewardStore
- stickerStore
- analyticsStore
- alphabetStore
- settingsStore
- syncStore

### 3. Migration Compatibility

- Keep backward compatibility during transition
- Gradual migration approach
- Test each store independently

### 4. Error Handling

- Add error boundaries around store operations
- Handle offline sync scenarios
- Graceful degradation

✅ Success Criteria
[x] All stores follow setup store pattern
[x] Stores are in src/stores/ directory
[x] All stores are properly typed
[x] Persistence is configured correctly
[x] All components use new store pattern
[x] Cloud sync works with new stores (Batch multi-profile)
[x] No regressions in existing features
[ ] All tests pass

## 🚀 Rollback Plan

If issues occur during migration:

1.  Keep old stores in src/utils/ temporarily
2.  Use feature flags to switch between implementations
3.  Rollback specific stores if needed
4.  Document issues for fix in next iteration

📚 References

Pinia Setup Stores
Pinia Persistence
Vue 3 Composition API

Document Version: 1.0
Last Updated: 2025-01-26
Project: ABELMA - Anak Belajar Mandiri
