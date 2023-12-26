import { PassThrough } from 'node:stream'

// CDP doesn't send every frame;
// It only sends the frame that is different from the previous one
// So, we need to fill in the missing frames
export const mergeFrames = (
  buffers: Buffer[],
  timeline: number[],
  fps = 30
): PassThrough => {
  // console.log(
  //   buffers.length,
  //   timeline.length,
  //   timeline[timeline.length - 1] - timeline[0]
  // )
  const result = new PassThrough()
  const frameDuration = 1000 / fps
  const length = Math.min(buffers.length, timeline.length)
  buffers = buffers.slice(0, length)
  timeline = timeline.slice(0, length)
  let lastFrameTimestamp = timeline[0] - frameDuration
  for (let i = 0; i < timeline.length; i++) {
    const ms = timeline[i]
    const duration = ms - lastFrameTimestamp
    if (duration >= frameDuration) {
      const times = Math.round(duration / frameDuration)
      lastFrameTimestamp += frameDuration * times
      // We need to fill in repeated frames
      // when the duration is longer than the frame duration x 2
      for (let j = 0; j < times; j++) {
        result.write(buffers[i])
      }
    }
  }
  result.end()
  return result
}
