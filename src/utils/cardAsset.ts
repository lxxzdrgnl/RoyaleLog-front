export function cardImage(name: string, evolutionLevel = 0, starLevel = 0): string {
  const base = name
    .toLowerCase()
    .replace(/['.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const filename = evolutionLevel > 0 ? `${base}-ev1` : base
  const folder = starLevel >= 1 ? 'cards-gold' : 'cards'
  return `/${folder}/${filename}.png`
}

// CR API returns relative levels per rarity (Common starts at 1, Rare at 1=actual 3, etc.)
// API returns rarity in lowercase ("common", "rare", "epic", "legendary", "champion")
const RARITY_OFFSET: Record<string, number> = {
  common: 0,
  rare: 2,
  epic: 5,
  legendary: 8,
  champion: 10,
}

export function rarityOffset(rarity: string): number {
  return RARITY_OFFSET[rarity?.toLowerCase()] ?? 0
}

export function displayLevel(level: number, rarity: string): number {
  return level + rarityOffset(rarity)
}

export function arenaImage(arenaId: number): string {
  // CR API returns large IDs like 54000047 → extract offset
  const n = arenaId >= 54000000 ? arenaId - 54000000 : arenaId
  return `/arenas/arena${Math.min(Math.max(0, n), 24)}.png`
}

export function rarityColor(rarity: string): string {
  const map: Record<string, string> = {
    Common: 'var(--rarity-common)',
    Rare: 'var(--rarity-rare)',
    Epic: 'var(--rarity-epic)',
    Legendary: 'var(--rarity-legendary)',
    Champion: 'var(--rarity-champion)',
  }
  return map[rarity] ?? 'var(--rarity-common)'
}

export function rarityToken(rarity: string): string {
  const map: Record<string, string> = {
    Common: '/trade-tokens/tt-common.png',
    Rare: '/trade-tokens/tt-rare.png',
    Epic: '/trade-tokens/tt-epic.png',
    Legendary: '/trade-tokens/tt-legendary.png',
  }
  return map[rarity] ?? '/trade-tokens/tt-common.png'
}

export function timeAgo(battleTime: string): string {
  const d = new Date(
    battleTime.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).*/, '$1-$2-$3T$4:$5:$6Z')
  )
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return `${sec}초 전`
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`
  return `${Math.floor(sec / 86400)}일 전`
}
