# RoyaleLog-front

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3.x-F7D336?style=flat-square&logo=pinia&logoColor=black)
![Vue Router](https://img.shields.io/badge/Vue%20Router-5.x-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![Status](https://img.shields.io/badge/Status-Phase%201-yellow?style=flat-square)

---

Vue 3 기반 SPA 클라이언트. 전적 검색, 플레이어 프로필, 배틀 기록 조회 UI를 제공하며 Spring Boot API(`RoyaleLog-api`)와 연동한다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Language | TypeScript 5.9 |
| Framework | Vue 3.5 (Composition API) |
| State | Pinia 3 |
| Routing | Vue Router 5 |
| Build | Vite 6 |
| 카드 에셋 | cr-api-assets (로컬 내장, `public/`) |

---

## 화면 구성

### `/` — 홈 (태그 검색)
- 전체 화면 검색 UI (OP.GG 스타일)
- `#` 포함/미포함 모두 입력 가능, Enter 또는 버튼으로 이동

### `/player/:tag` — 플레이어 프로필
플레이어 태그로 접근 시 4개 탭 구성:

| 탭 | 내용 |
|----|------|
| 전투 기록 | 최근 배틀 목록, 승/패, 크라운, 덱 카드 정보, 엘릭서 통계 |
| 사용한 덱 정리 | 덱 해시 기준 그룹핑, 덱별 승률 + 평균 엘릭서 |
| 카드 | 보유 카드별 등장 횟수, 레벨, 진화 여부 |
| 통계 | 전체 승률, 평균 엘릭서 누수, 킹타워 파괴율 |

---

## 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행 (http://localhost:5173)
npm run dev

# 3. 프로덕션 빌드
npm run build

# 4. 빌드 결과 미리보기
npm run preview
```

> **사전 조건**: `RoyaleLog-api`가 `http://localhost:8080`에서 실행 중이어야 합니다.
> Vite `server.proxy`가 `/api` 요청을 자동으로 백엔드로 포워딩합니다.

---

## 환경변수

Vite 기본 구조 사용. `.env.local` 생성 시 아래 변수를 덮어쓸 수 있습니다.

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_BASE` | _(proxy 사용)_ | API 베이스 URL (프로덕션 빌드 시 주입) |

---

## 프록시 설정

`vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

개발 중 CORS 이슈 없이 백엔드 API를 직접 호출합니다.

---

## 폴더 구조

```
src/
├── main.ts                  # 앱 진입점 (Pinia, Router 등록)
├── App.vue                  # RouterView 래퍼
│
├── api/
│   └── player.ts            # fetchProfile(), fetchBattles() — fetch 기반
│
├── assets/
│   └── main.css             # CR 다크 테마 CSS 변수 + 글로벌 스타일
│
├── components/
│   ├── BattleCard.vue        # 배틀 행 (양쪽 덱, 크라운, 엘릭서)
│   ├── CardChip.vue          # 카드 썸네일 (sm/md/lg, 레벨 뱃지)
│   ├── ElixirStat.vue        # 엘릭서 누수 + 킹타워 HP 표시
│   ├── StatBadge.vue         # 아이콘 + 수치 + 라벨 뱃지
│   └── WinRateBar.vue        # 승률 컬러 프로그레스 바
│
├── router/
│   └── index.ts             # / → HomeView, /player/:tag → PlayerView
│
├── stores/
│   └── player.ts            # Pinia 스토어 (profile + battles 병렬 로드)
│
├── utils/
│   └── cardAsset.ts         # cardImage(), arenaImage(), timeAgo() 등 헬퍼
│
└── views/
    ├── HomeView.vue          # 검색 진입점
    └── PlayerView.vue        # 플레이어 프로필 + 4탭 레이아웃
```

---

## 카드 에셋

`public/` 하위에 로컬 에셋을 내장합니다. 외부 CDN 의존 없이 오프라인에서도 렌더링됩니다.

| 경로 | 내용 | 출처 |
|------|------|------|
| `public/cards/` | 카드 이미지 150px (205종+) | [cr-api-assets](https://github.com/RoyaleAPI/cr-api-assets) |
| `public/arenas/` | 아레나 배경 이미지 | [cr-api-assets](https://github.com/RoyaleAPI/cr-api-assets) |
| `public/badges/` | 클랜/리그 뱃지 아이콘 | [cr-api-assets](https://github.com/RoyaleAPI/cr-api-assets) |
| `public/ui/` | UI 공통 아이콘 (엘릭서, 크라운 등) | [cr-api-assets](https://github.com/RoyaleAPI/cr-api-assets) |
| `public/trade-tokens/` | 희귀도별 교환 토큰 | [cr-api-assets](https://github.com/RoyaleAPI/cr-api-assets) |

> cr-api-assets는 커뮤니티에서 유지하는 오픈소스 에셋 저장소입니다.
> 카드 이름 → 파일명 변환 규칙: `name.toLowerCase().replace(/['.]/g,'').replace(/\s+/g,'-')`
> 진화 카드는 `-ev1` 접미사 추가 (예: `barbarians-ev1.png`)

---

## API 연동

백엔드(`RoyaleLog-api`)의 두 엔드포인트를 사용합니다:

```
GET /api/v1/players/{tag}          # 플레이어 프로필 (트로피, 아레나, 클랜 등)
GET /api/v1/matches/{tag}          # 배틀 로그 (카드 상세, 엘릭서, 승패 등)
```

- DB에 수집된 랭커: `battle_log_raw` 기반 분석 결과 반환
- 일반 유저 (DB 미수집): Clash Royale API 실시간 조회 → 인메모리 분석 → Redis 캐시 5분

---

## 배포

| 항목 | URL |
|------|-----|
| 개발 서버 | `http://localhost:5173` |
| API Proxy | `→ http://localhost:8080` |
| 프로덕션 | GitHub Pages / Vercel (정적 빌드) |

---

## 관련 프로젝트

| 저장소 | 역할 |
|--------|------|
| `RoyaleLog-api` | Spring Boot Main API (BFF) |
| `RoyaleLog-worker` | FastAPI AI/Data Worker (Phase 2) |
