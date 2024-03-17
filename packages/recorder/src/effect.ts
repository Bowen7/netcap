import { type CDPSession } from 'puppeteer'

export interface ZoomOptions {
  x: number
  y: number
  scale: number
  speed?: number
}
export const zoom = async (
  client: CDPSession,
  { x, y, scale, speed }: ZoomOptions
): Promise<void> => {
  await client.send('Input.synthesizePinchGesture', {
    x,
    y,
    scaleFactor: scale,
    relativeSpeed: speed,
    gestureSourceType: 'mouse'
  })
}
