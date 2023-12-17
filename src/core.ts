import { type Page, type CDPSession } from 'puppeteer'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { mergeFrames } from './frame'
import { type ScreenCastFrame } from './types'

ffmpeg.setFfmpegPath(ffmpegPath)

interface Options {
  width?: number
  height?: number
  fps?: number
}

const DEFAULT_OPTIONS: Options = {
  width: 1920,
  height: 1080,
  fps: 30
}

export class NetCap {
  private status: 'pending' | 'recording' = 'pending'
  page: Page
  options: Options
  client: CDPSession | null = null
  frames: ScreenCastFrame[] = []
  constructor(page: Page, options: Options = {}) {
    this.page = page
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  private async startScreenCast(): Promise<void> {
    const { width, height } = this.options
    return await this.client?.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 100,
      maxWidth: width,
      maxHeight: height,
      everyNthFrame: 1
    })
  }

  async start(): Promise<void> {
    if (this.status !== 'pending') {
      console.error('NetCap is already started')
    }
    this.status = 'recording'
    if (this.client === null) {
      this.client = await this.page.target().createCDPSession()
    }
    this.frames = []
    this.client?.on('Page.screencastFrame', (frameObject) => {
      const buff = Buffer.from(frameObject.data, 'base64')
      this.frames.push({
        buffer: buff,
        timestamp: frameObject.metadata.timestamp ?? Date.now() / 1000000
      })

      this.client
        ?.send('Page.screencastFrameAck', {
          sessionId: frameObject.sessionId
        })
        .catch((err) => {
          console.error(err)
        })
    })
    await this.startScreenCast()
  }

  async stop(): Promise<void> {
    if (this.status !== 'recording') {
      console.error('NetCap is not recording')
    }
    this.status = 'pending'
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
