export interface ScreenCastFrame {
  buffer: Buffer
  timestamp: number
}

export type Cursors = Record<
  string,
  {
    image: string
    offset?: [number, number]
  }
>

export interface RecorderOptions {
  width?: number
  height?: number
  fps?: number
}

export interface DataCollectedPayload {
  cat?: string
  pid: number
  tid: number
  ts: number
  name: string
  args: {
    sort_index: number
    name: string
  }
  dur: number
  id: string
  id2?: {
    global: string | undefined
    local: string | undefined
  }
  scope: string
}
export interface DataCollectedEvent {
  value: DataCollectedPayload[]
}
