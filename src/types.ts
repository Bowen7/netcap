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
