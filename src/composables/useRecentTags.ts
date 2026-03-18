import { ref } from 'vue'

const STORAGE_KEY = 'royalelog_recent_tags'
const MAX = 10

export interface RecentTag {
  tag: string
  name: string
}

const tags = ref<RecentTag[]>(load())

function load(): RecentTag[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags.value))
}

export function useRecentTags() {
  function add(tag: string, name = '') {
    const clean = tag.replace(/^#/, '').toUpperCase()
    const entry: RecentTag = { tag: clean, name }
    tags.value = [entry, ...tags.value.filter(t => t.tag !== clean)].slice(0, MAX)
    save()
  }

  function remove(tag: string) {
    tags.value = tags.value.filter(t => t.tag !== tag)
    save()
  }

  return { tags, add, remove }
}
