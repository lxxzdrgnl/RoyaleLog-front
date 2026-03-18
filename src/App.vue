<template>
  <div class="app-wrap">
    <main class="app-main">
      <RouterView />
    </main>
    <footer class="app-footer">
      <div class="app-footer-inner">
        <p>&copy; 2026 RoyaleLog. All rights reserved.</p>
        <p class="footer-sub">This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell.</p>
        <div class="footer-social">
          <a href="https://www.instagram.com/lxxzdrgnl" target="_blank" rel="noopener noreferrer" class="footer-social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="https://github.com/lxxzdrgnl" target="_blank" rel="noopener noreferrer" class="footer-social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
.app-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main { flex: 1; }

.app-footer {
  margin-top: 48px;
  padding: 24px 32px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}

.app-footer-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.app-footer-inner p {
  margin: 0;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.footer-sub {
  font-size: 0.72rem !important;
  opacity: 0.6;
  text-align: center;
}

.footer-social {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.footer-social-link {
  color: var(--text-dim);
  opacity: 0.5;
  transition: opacity 0.2s;
}
.footer-social-link:hover { opacity: 1; }
</style>
