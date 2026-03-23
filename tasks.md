📋 ABELMA State Management Migration Checklist
Based on the migration plan, here is a comprehensive task checklist to monitor progress:

## ✅ Phase 1: Preparation & Type Definition

[ ] Create src/types/stores.ts

- [ ] Define Profile interface
- [ ] Define Reward interface
- [ ] Define DefaultReward interface
- [ ] Define Sticker interface
- [ ] Define DefaultSticker interface
- [ ] Define Analytics interface
- [ ] Define AlphabetProgress interface
- [ ] Define User interface
- [ ] Define Cloud sync types from functions/api/sync.ts
- [ ] Define persistence types for localStorage

[ ] Review existing data structures

- [ ] Extract current state shapes from src/utils/ stores
- [ ] Ensure compatibility with existing cloud functions
- [ ] Document any breaking changes

## ✅ Phase 2: Create Setup Stores

🏬 Auth Store (src/stores/authStore.ts)
[ ] Create new authStore.ts with setup store pattern
[ ] Define AuthState interface
[ ] Implement session management
[ ] Add auth state persistence
[ ] Integrate with authentication logic

### 👤 Profile Store (src/stores/profileStore.ts)

[ ] Migrate from src/utils/profileStore.ts
[ ] Define ProfileState and ProfileActions interfaces
[ ] Use defineStore('profile') setup pattern
[ ] Add persist configuration
[ ] Separate sync logic (move to syncStore)
[ ] Implement selectProfile, createProfile, deleteProfile
[ ] Add loadFromCloud and triggerSync methods

### 💎 Reward Store (src/stores/rewardStore.ts)

[ ] Migrate from src/utils/rewardStore.ts
[ ] Define RewardState and RewardActions interfaces
[ ] Use defineStore('reward') setup pattern
[ ] Add points persistence with localStorage
[ ] Implement addPoints, deductPoints, claimReward, fulfillReward
[ ] Add loadFromCloud and triggerSync methods

### 🎨 Sticker Store (src/stores/stickerStore.ts)

[ ] Migrate from src/utils/stickerStore.ts
[ ] Define StickerState and StickerActions interfaces
[ ] Use defineStore('sticker') setup pattern
[ ] Implement addSticker, getEarnableStickers
[ ] Add loadFromCloud and triggerSync methods

### 📊 Analytics Store (src/stores/analyticsStore.ts)

[ ] Migrate from src/utils/analyticsStore.ts
[ ] Define AnalyticsState and AnalyticsActions interfaces
[ ] Use defineStore('analytics') setup pattern
[ ] Implement recordMistake, getProfileAnalytics
[ ] Add loadFromCloud and triggerSync methods

### 🔤 Alphabet Store (src/stores/alphabetStore.ts)

[ ] Migrate from src/utils/alphabetStore.ts
[ ] Define AlphabetState and AlphabetActions interfaces
[ ] Use defineStore('alphabet') setup pattern
[ ] Implement getAlphabetState, updateProgress
[ ] Add loadFromCloud and triggerSync methods

### ⚙️ Settings Store (src/stores/settingsStore.ts)

[ ] Migrate from src/utils/wordSettings.ts
[ ] Define SettingsState and SettingsActions interfaces
[ ] Use defineStore('settings') setup pattern
[ ] Implement setTimerDuration, setLetterCase
[ ] Add local persistence (no cloud sync)
[ ] Add loadFromCloud method (for consistency)

### 🔄 Sync Store (src/stores/syncStore.ts)

[ ] Create new syncStore.ts
[ ] Define SyncState and SyncActions interfaces
[ ] Use defineStore('sync') setup pattern
[ ] Implement centralized triggerSync with retry logic
[ ] Implement loadFromCloud
[ ] Add handleSyncError with exponential backoff
[ ] Add sync status tracking (isSyncing, lastSync, syncError)
[ ] Verify all stores have proper TypeScript typing
[ ] Ensure all stores are in src/stores/ directory

## ✅ Phase 3: Store Registration

[ ] Create src/stores/index.ts
[ ] Import and register all stores with Pinia
[ ] Verify proper store names and IDs
[ ] Ensure Pinia instance is properly exported

## ✅ Phase 4: Update Components & Views

[ ] Update all src/components/ to use new store pattern
[ ] Update all src/views/ to use new store pattern
[ ] Replace direct localStorage access with store methods
[ ] Update sync triggers in appropriate views
[ ] Test each component after migration
[ ] Document any component-specific issues

### Migration Pattern Checklist:

[ ] Import using useStoreName() from @/stores/storeName
[ ] Replace import { storeName } from @/utils/storeName
[ ] Remove direct localStorage calls
[ ] Ensure reactive state is properly accessed

## ✅ Phase 5: Update Cloud Functions

[ ] Update functions/api/sync.ts to work with setup stores
[ ] Ensure data serialization/deserialization compatibility
[ ] Test sync flow with new stores
[ ] Verify cloud data format matches new store structure

## ✅ Phase 6: Testing & Validation

### 🔍 Functional Testing

[ ] Test profile creation/selection
[ ] Test rewards system (add, deduct, claim)
[ ] Test sticker earning and tier progression
[ ] Test analytics tracking
[ ] Test cloud sync functionality
[ ] Test offline functionality
[ ] Test parent dashboard

### 📝 Test Scenarios

[ ] Create new user profile
[ ] Switch between profiles
[ ] Earn points and claim rewards
[ ] Collect stickers
[ ] Record mistakes/analytics
[ ] Progress through alphabet
[ ] Modify settings (timer, letter case)
[ ] Trigger manual sync
[ ] Test offline mode
[ ] Test cloud sync restoration

### 🐛 Bug Verification

[ ] No console errors
[ ] No TypeScript errors
[ ] No runtime warnings
[ ] Store state persists correctly
[ ] Cloud sync works bidirectionally
[ ] All features accessible

### ✅ Success Criteria Verification

[ ] All stores follow setup store pattern
[ ] Stores are in src/stores/ directory
[ ] All stores are properly typed
[ ] Persistence is configured correctly
[ ] All components use new store pattern
[ ] Cloud sync works with new stores
[ ] No regressions in existing features
[ ] All tests pass

## 🔄 Rollback Plan (If Needed)

[ ] Keep old stores in src/utils/ temporarily
[ ] Implement feature flags to switch implementations
[ ] Document issues for fix in next iteration

## 📊 Progress Tracking

Phase Completion Notes
Phase 1 0%
Phase 2 0%
Phase 3 0%
Phase 4 0%
Phase 5 0%
Phase 6 0%

Last Updated: 2025-01-26
Project: ABELMA - Anak Belajar Mandiri
