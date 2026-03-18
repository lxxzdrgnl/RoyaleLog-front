import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchProfile, fetchBattles, type PlayerProfile, type BattleLog } from '@/api/player'

export const usePlayerStore = defineStore('player', () => {
  const profile = ref<PlayerProfile | null>(null)
  const battles = ref<BattleLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(tag: string) {
    loading.value = true
    error.value = null
    try {
      const normalized = tag.startsWith('#') ? tag : `#${tag}`
      ;[profile.value, battles.value] = await Promise.all([
        fetchProfile(normalized),
        fetchBattles(normalized)
      ])
    } catch (e: any) {
      error.value = e.message ?? '오류가 발생했습니다'
    } finally {
      loading.value = false
    }
  }

  return { profile, battles, loading, error, load }
})
