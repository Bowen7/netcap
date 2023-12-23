import { PassThrough } from 'node:stream'

// CDP doesn't send every frame; it only sends the frame that is different from the previous one
// So, we need to fill in the missing frames
export const mergeFrames = (
  buffers: Buffer[],
  timeline: number[],
  fps = 30
): PassThrough => {
  const result = new PassThrough()
  for (let i = 0; i < timeline.length; i++) {
    const ts = timeline[i]
    const buffer = buffers[i]
    if (i === timeline.length - 1) {
      result.write(buffer)
    } else {
      const nextTs = timeline[i + 1]
      const duration = nextTs / 1000 / 1000 - ts / 1000 / 1000
      // Need to fill in repeated frames
      const times = Math.max(1, Math.floor(duration * fps))
      for (let j = 0; j < times; j++) {
        result.write(buffer)
      }
    }
  }
  result.end()
  return result
}
