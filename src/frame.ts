import { PassThrough } from 'node:stream'
import { type ScreenCastFrame } from './types'

export const mergeFrames = (
  frames: ScreenCastFrame[],
  fps = 30
): PassThrough => {
  const result = new PassThrough()
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]
    if (i === frames.length - 1) {
      result.write(frame.buffer)
    } else {
      const nextTimestamp = frames[i + 1].timestamp
      const duration = nextTimestamp - frame.timestamp
      // Need to fill in repeated frames
      const times = Math.max(1, Math.floor(duration * fps))
      for (let j = 0; j < times; j++) {
        result.write(frame.buffer)
      }
    }
  }
  result.end()
  return result
}
