import { type CDPSession } from 'puppeteer'

export interface PinchZoomOptions {
  x: number
  y: number
  scale: number
  speed?: number
}
export const pinchZoom = async (
  client: CDPSession,
  { x, y, scale, speed }: PinchZoomOptions
): Promise<void> => {
  await client.send('Input.synthesizePinchGesture', {
    x,
    y,
    scaleFactor: scale,
    relativeSpeed: speed,
    gestureSourceType: 'mouse'
  })
}
