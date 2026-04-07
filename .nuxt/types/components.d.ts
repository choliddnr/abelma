
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  BubbleCard: typeof import("../../app/components/BubbleCard.vue")['default']
  DroppableComp: typeof import("../../app/components/DroppableComp.vue")['default']
  ErrorBoundary: typeof import("../../app/components/ErrorBoundary.vue")['default']
  GlobalHeader: typeof import("../../app/components/GlobalHeader.vue")['default']
  InteractionZone: typeof import("../../app/components/InteractionZone.vue")['default']
  LetterComp: typeof import("../../app/components/LetterComp.vue")['default']
  LoadingSkeleton: typeof import("../../app/components/LoadingSkeleton.vue")['default']
  LoadingSpinner: typeof import("../../app/components/LoadingSpinner.vue")['default']
  MenuCard: typeof import("../../app/components/MenuCard.vue")['default']
  SpellingChallenge: typeof import("../../app/components/SpellingChallenge.vue")['default']
  TracingCanvas: typeof import("../../app/components/TracingCanvas.vue")['default']
  AlphabetChallengeMode: typeof import("../../app/components/alphabet/AlphabetChallengeMode.vue")['default']
  AlphabetLearningMode: typeof import("../../app/components/alphabet/AlphabetLearningMode.vue")['default']
  AlphabetStoryOverlay: typeof import("../../app/components/alphabet/AlphabetStoryOverlay.vue")['default']
  UiButton: typeof import("../../app/components/ui/Button.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
  NuxtPicture: typeof import("../../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
  NuxtPage: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyBubbleCard: LazyComponent<typeof import("../../app/components/BubbleCard.vue")['default']>
  LazyDroppableComp: LazyComponent<typeof import("../../app/components/DroppableComp.vue")['default']>
  LazyErrorBoundary: LazyComponent<typeof import("../../app/components/ErrorBoundary.vue")['default']>
  LazyGlobalHeader: LazyComponent<typeof import("../../app/components/GlobalHeader.vue")['default']>
  LazyInteractionZone: LazyComponent<typeof import("../../app/components/InteractionZone.vue")['default']>
  LazyLetterComp: LazyComponent<typeof import("../../app/components/LetterComp.vue")['default']>
  LazyLoadingSkeleton: LazyComponent<typeof import("../../app/components/LoadingSkeleton.vue")['default']>
  LazyLoadingSpinner: LazyComponent<typeof import("../../app/components/LoadingSpinner.vue")['default']>
  LazyMenuCard: LazyComponent<typeof import("../../app/components/MenuCard.vue")['default']>
  LazySpellingChallenge: LazyComponent<typeof import("../../app/components/SpellingChallenge.vue")['default']>
  LazyTracingCanvas: LazyComponent<typeof import("../../app/components/TracingCanvas.vue")['default']>
  LazyAlphabetChallengeMode: LazyComponent<typeof import("../../app/components/alphabet/AlphabetChallengeMode.vue")['default']>
  LazyAlphabetLearningMode: LazyComponent<typeof import("../../app/components/alphabet/AlphabetLearningMode.vue")['default']>
  LazyAlphabetStoryOverlay: LazyComponent<typeof import("../../app/components/alphabet/AlphabetStoryOverlay.vue")['default']>
  LazyUiButton: LazyComponent<typeof import("../../app/components/ui/Button.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
