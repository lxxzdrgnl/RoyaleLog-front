import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchProfile, fetchBattles, type PlayerProfile, type BattleLog } from '@/api/player'

const PAGE_SIZE = 25

export const usePlayerStore = defineStore('player', () => {
  const profile = ref<PlayerProfile | null>(null)
  const battles = ref<BattleLog[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const error = ref<string | null>(null)
  const offset = ref(0)

  async function load(tag: string) {
    loading.value = true
    error.value = null
    battles.value = []
    offset.value = 0
    hasMore.value = true
    try {
      const normalized = tag.startsWith('#') ? tag : `#${tag}`;
      [profile.value, ] = await Promise.all([
        fetchProfile(normalized),
        _loadBattles(normalized, true),
      ])
    } catch (e: any) {
      error.value = e.message ?? '오류가 발생했습니다'
    } finally {
      loading.value = false
    }
  }

  async function loadMore(tag: string) {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const normalized = tag.startsWith('#') ? tag : `#${tag}`
      await _loadBattles(normalized, false)
    } finally {
      loadingMore.value = false
    }
  }

  async function _loadBattles(normalizedTag: string, reset: boolean) {
    const currentOffset = reset ? 0 : offset.value
    const page = await fetchBattles(normalizedTag, currentOffset, PAGE_SIZE)
    if (reset) {
      battles.value = page
    } else {
      battles.value = [...battles.value, ...page]
    }
    offset.value = currentOffset + page.length
    hasMore.value = page.length === PAGE_SIZE
  }

  return { profile, battles, loading, loadingMore, hasMore, error, load, loadMore }
})
