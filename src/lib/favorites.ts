const FAVORITES_STORAGE_KEY = 'verse:favorites:v1'

/** Favorite ids are stored oldest-first; callers reverse for "most recent first" display. */
export function loadFavoriteIds(): string[] {
  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function saveFavoriteIds(ids: string[]) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage can be unavailable (private mode, quota) — favoriting just won't persist.
  }
}
