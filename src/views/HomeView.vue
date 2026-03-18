<template>
  <div class="home">
    <div class="bg-pattern" />
    <div class="content">
      <div class="logo-wrap">
        <img src="/arenas/legendary.png" class="logo-img" alt="" />
        <h1 class="logo-text">RoyaleLog</h1>
        <p class="logo-sub">클래시 로얄 전적 검색</p>
      </div>

      <form class="search-form" @submit.prevent="search">
        <div class="search-box">
          <span class="search-hash">#</span>
          <input
            v-model="tag"
            class="search-input"
            placeholder="플레이어 태그 입력 (예: PGR9PPG)"
            autocomplete="off"
            autofocus
          />
          <button class="search-btn" type="submit">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
        <p v-if="error" class="search-error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const tag = ref('')
const error = ref('')
const router = useRouter()

function search() {
  const clean = tag.value.trim().replace(/^#/, '').toUpperCase()
  if (!clean) { error.value = '태그를 입력해주세요'; return }
  if (!/^[0-9A-Z]{3,12}$/.test(clean)) { error.value = '올바른 태그 형식이 아닙니다'; return }
  router.push(`/player/%23${clean}`)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
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
  gap: 12px;
}

.logo-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(245,196,24,0.5));
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

.search-box {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.search-box:focus-within { border-color: var(--gold); }

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

.search-error {
  text-align: center;
  color: var(--loss);
  font-size: 0.9rem;
  font-family: 'Rajdhani', sans-serif;
}
</style>
