<template>
  <div class="home">
    <div class="bg-pattern" />
    <div class="content">
      <div class="logo-wrap">
        <img :src="heroImg" class="logo-img" alt="" />
        <h1 class="logo-text">RoyaleLog</h1>
        <p class="logo-sub">클래시 로얄 전적 검색</p>
      </div>

      <form class="search-form" @submit.prevent="search">
        <div class="search-wrap" ref="wrapRef">
          <div class="search-box" :class="{ focused: isFocused }">
            <span class="search-hash">#</span>
            <input
              v-model="tag"
              class="search-input"
              placeholder="플레이어 태그 입력 (예: PGR9PPG)"
              autocomplete="off"
              autofocus
              @focus="isFocused = true"
              @blur="onBlur"
            />
            <button class="search-btn" type="submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>

          <!-- 최근 검색 드롭다운 -->
          <div v-if="isFocused && filteredTags.length" class="dropdown">
            <div v-for="t in filteredTags" :key="t.tag" class="dropdown-item"
              @mousedown.prevent="pickTag(t.tag)">
              <div class="dropdown-info">
                <span v-if="t.name" class="dropdown-name">{{ t.name }}</span>
                <span class="dropdown-tag">#{{ t.tag }}</span>
              </div>
              <button class="dropdown-remove" type="button" @mousedown.stop.prevent="remove(t.tag)">✕</button>
            </div>
          </div>
        </div>
        <p v-if="error" class="search-error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecentTags } from '@/composables/useRecentTags'

const CHR_IMAGES = [
  'archers','baby_dragon','balloon','bandit','barbarian_barrel','barbarians','bats',
  'battle_healer','battle_ram','bomber','bowler','cannon_cart','dark_prince','dart_goblin',
  'electro_dragon','electro_giant','electro_spirit','electro_wizard','elixir_golem',
  'firecracker','fisherman','flying_machine','giant_skeleton','goblin_barrel','goblin_drill',
  'goblin_giant','goblins_gang','golem','graveyard','guards','heal_spirit','hog_rider',
  'hunter','ice_golem','ice_spirit','ice_wizard','inferno_dragon','lava_hound','lumberjack',
  'magic_archer','mega_knight','mega_minion','miner','minions','minions_horde','mini_pekka',
  'mother_witch','musketeer','night_witch','pekka','phoenix','prince','princess','ram_rider',
  'rocket','royal_ghost','royal_giant','royal_hogs','skeleton_army','skeleton_barrel',
  'skeleton_dragon','skeletons','sparky','three_musketeers','tornado','valkyrie',
  'wall_breakers','witch','wizard','zappies',
]
const heroImg = `/chr/${CHR_IMAGES[Math.floor(Math.random() * CHR_IMAGES.length)]}_dl.png`

const tag = ref('')
const error = ref('')
const isFocused = ref(false)
const router = useRouter()
const { tags, add, remove } = useRecentTags()

const filteredTags = computed(() => {
  const q = tag.value.replace(/^#/, '').toUpperCase()
  return q ? tags.value.filter(t => t.tag.includes(q) || t.name.toUpperCase().includes(q)) : tags.value
})

function onBlur() {
  setTimeout(() => { isFocused.value = false }, 150)
}

function pickTag(t: string) {
  tag.value = t
  navigate(t)
}

function search() {
  const clean = tag.value.trim().replace(/^#/, '').toUpperCase()
  if (!clean) { error.value = '태그를 입력해주세요'; return }
  if (!/^[0-9A-Z]{3,12}$/.test(clean)) { error.value = '올바른 태그 형식이 아닙니다'; return }
  navigate(clean)
}

function navigate(clean: string) {
  error.value = ''
  add(clean)
  router.push(`/player/%23${clean}`)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6vh;
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgba(45,107,228,0.18) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(245,196,24,0.08) 0%, transparent 50%);
}

.bg-pattern::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(42,58,85,0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(42,58,85,0.3) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  padding: 24px;
  width: 100%;
  max-width: 600px;
}

.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.logo-img {
  width: 280px;
  height: 280px;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 8px 32px rgba(45,107,228,0.5));
  margin-bottom: -28px;
}

.logo-text {
  font-family: 'Cinzel', serif;
  font-size: 3.5rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #f5c418 0%, #fde678 50%, #c49a10 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.logo-sub {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.search-form { width: 100%; display: flex; flex-direction: column; gap: 12px; }

.search-wrap { position: relative; width: 100%; }

.search-box {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.search-box.focused { border-color: var(--gold); }

.search-hash {
  padding: 0 6px 0 20px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--gold);
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  padding: 18px 12px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text);
}
.search-input::placeholder { color: var(--text-dim); font-weight: 400; letter-spacing: 0; }

.search-btn {
  width: 60px;
  height: 60px;
  background: var(--gold);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg);
  transition: background 0.2s;
  flex-shrink: 0;
}
.search-btn:hover { background: #fde678; }

/* 드롭다운 */
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.dropdown-item:hover { background: var(--surface); }

.dropdown-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.dropdown-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.dropdown-tag {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.dropdown-remove {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}
.dropdown-remove:hover { color: var(--loss); background: rgba(231,76,60,0.1); }

.search-error {
  text-align: center;
  color: var(--loss);
  font-size: 0.9rem;
  font-family: 'Rajdhani', sans-serif;
}
</style>
