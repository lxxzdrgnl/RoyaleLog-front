const BASE = '/api/v1'

async function get<T>(url: string): Promise<T> {
  const res = await fetch(BASE + url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  return json.data as T
}

export interface PlayerProfile {
  tag: string
  name: string
  expLevel: number
  trophies: number
  bestTrophies: number
  wins: number
  losses: number
  battleCount: number
  threeCrownWins: number
  currentDeck: CardEntry[]
  cards: CardEntry[]
  supportCards?: CardEntry[]
  clan?: { name: string; tag: string; badgeId: number; role?: string }
  arena?: { id: number; name: string }
  leagueStatistics?: {
    currentSeason?: { rank?: number; trophies: number; bestTrophies?: number }
    previousSeason?: { rank?: number; trophies: number; bestTrophies?: number }
    bestSeason?: { rank?: number; trophies: number }
  }
  // challenge / tournament
  challengeMaxWins?: number
  challengeCardsWon?: number
  tournamentCardsWon?: number
  tournamentBattleCount?: number
  // clan war
  warDayWins?: number
  clanCardsCollected?: number
  // misc
  totalDonations?: number
  starPoints?: number
  legacyTrophyRoadHighScore?: number
  badges?: Badge[]
}

export interface Badge {
  name: string
  level?: number
  maxLevel?: number
  progress?: number
  target?: number
  iconUrls?: { large: string }
}

export interface CardEntry {
  id: number
  name: string
  level: number
  maxLevel: number
  count: number
  rarity: string
  elixirCost?: number
  starLevel?: number
  evolutionLevel?: number
  maxEvolutionLevel?: number
  iconUrls?: { medium: string }
}

export interface BattleLog {
  battleTime: string
  type: string
  gameMode?: { id: number; name: string }
  arena?: { id: number; name: string }
  team: BattleParticipant[]
  opponent: BattleParticipant[]
}

export interface BattleParticipant {
  tag: string
  name: string
  startingTrophies?: number
  trophyChange?: number
  crowns: number
  kingTowerHitPoints?: number
  elixirLeaked?: number
  clan?: { name: string; tag: string }
  cards: BattleCard[]
  supportCards?: BattleCard[]
}

export interface BattleCard {
  id: number
  name: string
  level: number
  evolutionLevel?: number
  starLevel?: number
  elixirCost?: number
  iconUrls?: { medium: string }
}

export const fetchProfile = (tag: string) =>
  get<PlayerProfile>(`/players/${encodeURIComponent(tag)}`)

export const fetchBattles = (tag: string, offset = 0, limit = 25) =>
  get<BattleLog[]>(`/players/${encodeURIComponent(tag)}/battles?offset=${offset}&limit=${limit}`)

export const fetchMatches = (tag: string, offset = 0, limit = 25) =>
  get<any[]>(`/matches/${encodeURIComponent(tag)}?offset=${offset}&limit=${limit}`)

export const fetchMasteries = (tag: string) =>
  get<any[]>(`/players/${encodeURIComponent(tag)}/masteries`)
