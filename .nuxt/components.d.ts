
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


export const BubbleCard: typeof import("../app/components/BubbleCard.vue")['default']
export const DroppableComp: typeof import("../app/components/DroppableComp.vue")['default']
export const ErrorBoundary: typeof import("../app/components/ErrorBoundary.vue")['default']
export const GlobalHeader: typeof import("../app/components/GlobalHeader.vue")['default']
export const InteractionZone: typeof import("../app/components/InteractionZone.vue")['default']
export const LetterComp: typeof import("../app/components/LetterComp.vue")['default']
export const LoadingSkeleton: typeof import("../app/components/LoadingSkeleton.vue")['default']
export const LoadingSpinner: typeof import("../app/components/LoadingSpinner.vue")['default']
export const MenuCard: typeof import("../app/components/MenuCard.vue")['default']
export const SpellingChallenge: typeof import("../app/components/SpellingChallenge.vue")['default']
export const TracingCanvas: typeof import("../app/components/TracingCanvas.vue")['default']
export const AlphabetChallengeMode: typeof import("../app/components/alphabet/AlphabetChallengeMode.vue")['default']
export const AlphabetLearningMode: typeof import("../app/components/alphabet/AlphabetLearningMode.vue")['default']
export const AlphabetStoryOverlay: typeof import("../app/components/alphabet/AlphabetStoryOverlay.vue")['default']
export const UiButton: typeof import("../app/components/ui/Button.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
export const NuxtPicture: typeof import("../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyBubbleCard: LazyComponent<typeof import("../app/components/BubbleCard.vue")['default']>
export const LazyDroppableComp: LazyComponent<typeof import("../app/components/DroppableComp.vue")['default']>
export const LazyErrorBoundary: LazyComponent<typeof import("../app/components/ErrorBoundary.vue")['default']>
export const LazyGlobalHeader: LazyComponent<typeof import("../app/components/GlobalHeader.vue")['default']>
export const LazyInteractionZone: LazyComponent<typeof import("../app/components/InteractionZone.vue")['default']>
export const LazyLetterComp: LazyComponent<typeof import("../app/components/LetterComp.vue")['default']>
export const LazyLoadingSkeleton: LazyComponent<typeof import("../app/components/LoadingSkeleton.vue")['default']>
export const LazyLoadingSpinner: LazyComponent<typeof import("../app/components/LoadingSpinner.vue")['default']>
export const LazyMenuCard: LazyComponent<typeof import("../app/components/MenuCard.vue")['default']>
export const LazySpellingChallenge: LazyComponent<typeof import("../app/components/SpellingChallenge.vue")['default']>
export const LazyTracingCanvas: LazyComponent<typeof import("../app/components/TracingCanvas.vue")['default']>
export const LazyAlphabetChallengeMode: LazyComponent<typeof import("../app/components/alphabet/AlphabetChallengeMode.vue")['default']>
export const LazyAlphabetLearningMode: LazyComponent<typeof import("../app/components/alphabet/AlphabetLearningMode.vue")['default']>
export const LazyAlphabetStoryOverlay: LazyComponent<typeof import("../app/components/alphabet/AlphabetStoryOverlay.vue")['default']>
export const LazyUiButton: LazyComponent<typeof import("../app/components/ui/Button.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/@nuxt+image@2.0.0_db0@0.3.4_c431e0a9023360ac55e80e6ef3a3feb6/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.2_@babel+core@7.29_f93b87ab36dd678a7d1c33d9ec530cb5/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
