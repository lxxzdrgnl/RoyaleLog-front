const BASE = '/batch'

async function get<T>(url: string): Promise<T> {
  const res = await fetch(BASE + url)
  if (!res.ok) throw new Error(`Batch API error ${res.status}`)
  const json = await res.json()
  return json.data as T
}

export interface MonitorResponse {
  jobName: string
  executionId: number
  status: string
  startTime: string | null
  endTime: string | null
  steps: StepProgress[]
  brackets: BracketCount[]
}

export interface StepProgress {
  name: string
  status: string
  read: number
  write: number
  skip: number
  totalTarget: number | null
}

export interface BracketCount {
  bracket: string
  current: number
  limit: number
}

export const fetchMonitor = () => get<MonitorResponse | null>('/monitor')

export interface JobResult {
  jobId: number
  executionId: number
  status: string
  date: string
  startTime: string | null
}

export const fetchHistory = (jobName: string) =>
  get<JobResult[]>(`/history/${jobName}`)

export interface ExecutionDetail {
  executionId: number
  status: string
  jobParameters: { date: string; runId: number | null }
  startTime: string | null
  endTime: string | null
  exitCode: string
  exitMessage: string
  steps: StepDetail[]
  bracketCounts: Record<string, number> | null
}

export interface StepDetail {
  stepName: string
  status: string
  readCount: number
  writeCount: number
  skipCount: number
  exitMessage: string
}

export const fetchExecution = (id: number) =>
  get<ExecutionDetail>(`/execution/${id}`)

export interface DbStats {
  totalPlayers: number
  totalBattles: number
  dbSizeBytes: number
  tables: { name: string; bytes: number }[]
  brackets: { bracket: string; count: number }[]
  battleTypes: { type: string; count: number }[]
}

export const fetchDbStats = () => get<DbStats>('/db-stats')
