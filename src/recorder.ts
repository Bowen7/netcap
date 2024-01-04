import type { CDPSession, Page } from 'puppeteer'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { mergeFrames } from './frame'
import { type RecorderOptions, type DataCollectedEvent } from './types'

ffmpeg.setFfmpegPath(ffmpegPath)

const DEFAULT_OPTIONS: RecorderOptions = {
  width: 1920,
  height: 1080,
  fps: 30
}

export class Recorder {
  private readonly options: RecorderOptions
  private readonly page: Page
  private client: CDPSession
  private isRecording = false
  private buffers: Buffer[] = []
  private timeline: number[] = []
  private tracingPromise: Promise<void> | null = null
  private screencastPromise: Promise<void> | null = null
  constructor(page: Page, options: RecorderOptions = {}) {
    this.page = page
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  private bindEvents(): void {
    this.client?.on(
      'Tracing.dataCollected',
      ({ value: payloads }: DataCollectedEvent): void => {
        for (const payload of payloads) {
          if (payload.cat === 'disabled-by-default-devtools.screenshot') {
            // convert microsecond to millisecond
            this.timeline.push(payload.ts / 1000)
          }
        }
      }
    )

    this.tracingPromise = new Promise((resolve) => {
      this.client?.on('Tracing.tracingComplete', (): void => {
        resolve()
      })
    })

    this.screencastPromise = new Promise((resolve) => {
      this.client?.on('Page.screencastFrame', (frameObject): void => {
        this.client
          ?.send('Page.screencastFrameAck', {
            sessionId: frameObject.sessionId
          })
          .catch((err) => {
            console.error(err)
          })
        const buff = Buffer.from(frameObject.data, 'base64')
        this.buffers.push(buff)
        if (
          !this.isRecording &&
          this.timeline.length > 0 &&
          this.buffers.length >= this.timeline.length
        ) {
          resolve()
        }
      })
    })
  }

  private async unbindEvents(): Promise<void> {
    this.client?.removeAllListeners()
  }

  private async startTracing(): Promise<void> {
    await this.client?.send('Tracing.start', {
      traceConfig: {
        includedCategories: ['disabled-by-default-devtools.screenshot'],
        excludedCategories: ['*']
      },
      transferMode: 'ReportEvents'
    })
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

  private async endTracing(): Promise<void> {
    await this.client?.send('Tracing.end')
  }

  async start(): Promise<void> {
    if (this.isRecording) {
      console.error('Recorder is already started')
    }
    this.client = await this.page.target().createCDPSession()
    this.isRecording = true
    this.buffers = []
    this.timeline = []
    this.bindEvents()

    await this.startTracing()
    await this.startScreenCast()
  }

  async stop(): Promise<void> {
    if (!this.isRecording) {
      console.error('Recorder is not recording')
    }
    const movePromise = this.page.waitForFunction(
      'window._cursor_move_finished === true'
    )
    await movePromise
    await this.endTracing()
    await this.tracingPromise
    this.isRecording = false
    await this.screencastPromise
    await this.client?.send('Page.stopScreencast')
    await this.unbindEvents()
  }

  async save(path: string): Promise<void> {
    const { fps } = this.options
    const passThrough = mergeFrames(this.buffers, this.timeline, fps)
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
