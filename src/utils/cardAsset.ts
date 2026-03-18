export function cardImage(name: string, evolutionLevel = 0): string {
  const base = name
    .toLowerCase()
    .replace(/['.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const filename = evolutionLevel > 0 ? `${base}-ev1` : base
  return `/cards/${filename}.png`
}

export function arenaImage(arenaId: number): string {
  return `/arenas/arena${arenaId}.png`
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
