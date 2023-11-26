import { type Page, type CDPSession } from 'puppeteer'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { PassThrough } from 'node:stream'

ffmpeg.setFfmpegPath(ffmpegPath)

interface Options {
  width?: number
  height?: number
}

const DEFAULT_OPTIONS: Options = {
  width: 1920,
  height: 1080
}

export class NetCap {
  private status: 'pending' | 'recording' | 'paused' = 'pending'
  page: Page
  options: Options
  client: CDPSession | null = null
  pass: PassThrough
  constructor(page: Page, options: Options = {}) {
    this.page = page
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  private async startScreencast(): Promise<void> {
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
    if (this.client !== null) {
      this.client = await this.page.target().createCDPSession()
    }
    this.pass = new PassThrough()
    this.client?.on('Page.screencastFrame', (frameObject) => {
      const buff = Buffer.from(frameObject.data, 'base64')
      this.pass.write(buff)
      this.client
        ?.send('Page.screencastFrameAck', {
          sessionId: frameObject.sessionId
        })
        .catch((err) => {
          console.error(err)
        })
    })
    await this.startScreencast()
  }

  async stop(): Promise<void> {
    if (this.status !== 'recording') {
      console.error('NetCap is not recording')
    }
    this.status = 'pending'
    await this.client?.send('Page.stopScreencast')
  }

  async pause(): Promise<void> {
    if (this.status !== 'recording') {
      console.error('NetCap is not recording')
    }
    this.status = 'paused'
    await this.client?.send('Page.stopScreencast')
  }

  async resume(): Promise<void> {
    if (this.status !== 'paused') {
      console.error('NetCap is not paused')
    }
    this.status = 'recording'
    await this.startScreencast()
  }

  async save(path: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.pass.end()
      ffmpeg({
        source: this.pass,
        priority: 20
      })
        .videoCodec('libx264')
        .size('100%')
        .aspect('4:3')
        .inputFormat('image2pipe')
        .inputFPS(30)
        .videoCodec('libx264')
        .output(path)
        .on('end', function () {
          resolve()
        })
        .on('error', function (err) {
          reject(err)
        })
        .run()
    })
  }
}
