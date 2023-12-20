import { type CDPSession } from 'puppeteer'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { mergeFrames } from './frame'
import { type ScreenCastFrame, type RecorderOptions } from './types'

ffmpeg.setFfmpegPath(ffmpegPath)

const DEFAULT_OPTIONS: RecorderOptions = {
  width: 1920,
  height: 1080,
  fps: 30
}

const STOP_DELAY_TIME = 0.5

const getTimestamp = (): number => Date.now() / 1000

const later = async (delay): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, delay))
}
export class Recorder {
  private readonly options: RecorderOptions
  private readonly client: CDPSession
  private status: 'pending' | 'recording' = 'pending'
  private frames: ScreenCastFrame[] = []
  private stopTimestamp: number = 0
  private recordPromise: Promise<void> | null = null
  constructor(client: CDPSession, options: RecorderOptions = {}) {
    this.client = client
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  private async startScreenCast(): Promise<void> {
    const { width, height } = this.options
    await this.client?.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 100,
      maxWidth: width,
      maxHeight: height,
      everyNthFrame: 1
    })
  }

  async start(): Promise<void> {
    if (this.status !== 'pending') {
      console.error('Recorder is already started')
    }
    this.status = 'recording'
    this.frames = []

    this.recordPromise = new Promise((resolve) => {
      this.client?.on('Page.screencastFrame', (frameObject) => {
        const timestamp = frameObject.metadata.timestamp ?? getTimestamp()
        this.client
          ?.send('Page.screencastFrameAck', {
            sessionId: frameObject.sessionId
          })
          .catch((err) => {
            console.error(err)
          })

        if (this.status === 'pending' && this.stopTimestamp < timestamp) {
          resolve()
          return
        }

        const buff = Buffer.from(frameObject.data, 'base64')
        this.frames.push({
          buffer: buff,
          timestamp
        })
      })
    })
    await this.startScreenCast()
  }

  async stop(): Promise<void> {
    if (this.status !== 'recording') {
      console.error('Recorder is not recording')
    }
    this.status = 'pending'
    this.stopTimestamp = getTimestamp() + STOP_DELAY_TIME
    await this.recordPromise
    await later(1000)
    await this.client?.send('Page.stopScreencast')
  }

  async save(path: string): Promise<void> {
    const { fps } = this.options
    const passThrough = mergeFrames(this.frames, fps)
    await new Promise<void>((resolve, reject) => {
      ffmpeg({
        source: passThrough,
        priority: 20
      })
        .videoCodec('libx264')
        .size('100%')
        .aspect('4:3')
        .inputFormat('image2pipe')
        .inputFPS(fps)
        .videoCodec('libx264')
        .output(path)
        .on('end', function () {
          resolve()
        })
        .on('error', function (err) {
          console.error(err)
          reject(err)
        })
        .run()
    })
  }
}
