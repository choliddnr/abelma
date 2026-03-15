import { profileState } from './profileStore'
import { profilePointsMap, profileRewardsMap } from './rewardStore'
import { profileStickersMap } from './stickerStore'
import { analyticsMap } from './analyticsStore'
import { profileAlphabetMap } from './alphabetStore'

export const triggerSync = async () => {
    // Collect everything
    const data = profileState.profiles.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        points: profilePointsMap[p.id] || 0,
        rewards: profileRewardsMap[p.id] || [],
        stickers: (profileStickersMap[p.id] || []).map(id => ({ stickerId: id })),
        analytics: Object.entries(analyticsMap[p.id] || {}).map(([targetId, meta]) => ({
            type: targetId.length === 1 ? 'letter' : 'word', // Simple heuristic
            targetId,
            mistakes: meta.mistakes,
            lastAttempt: meta.lastAttempt
        })),
        alphabetProgress: profileAlphabetMap[p.id] ? {
            score: profileAlphabetMap[p.id].score,
            level: profileAlphabetMap[p.id].level,
            weights: JSON.stringify(profileAlphabetMap[p.id].weights)
        } : null
    }))

    try {
        const res = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        return res.ok
    } catch (e) {
        console.error('Sync failed', e)
        return false
    }
}

export const loadFromCloud = async () => {
    try {
        const res = await fetch('/api/sync')
        if (!res.ok) return false
        const cloudData = await res.json() as any[]
        
        // Merge strategy: Cloud wins for now
        cloudData.forEach(p => {
            // Update profile
            const localP = profileState.profiles.find(lp => lp.id === p.id)
            if (localP) {
                localP.name = p.name
                localP.avatar = p.avatar
            } else {
                profileState.profiles.push({ id: p.id, name: p.name, avatar: p.avatar })
            }

            // Update maps
            profilePointsMap[p.id] = p.points
            profileRewardsMap[p.id] = p.rewards || []
            profileStickersMap[p.id] = (p.stickers || []).map((s: any) => s.stickerId)
            
            const pAnalytics: Record<string, any> = {}
            if (p.analytics) {
                p.analytics.forEach((a: any) => {
                    pAnalytics[a.targetId] = { mistakes: a.mistakes, lastAttempt: a.lastAttempt }
                })
            }
            analyticsMap[p.id] = pAnalytics

            if (p.alphabetProgress) {
                profileAlphabetMap[p.id] = {
                    score: p.alphabetProgress.score,
                    level: p.alphabetProgress.level,
                    weights: JSON.parse(p.alphabetProgress.weights)
                }
            }
        })
        return true
    } catch (e) {
        console.error('Fetch failed', e)
        return false
    }
}
