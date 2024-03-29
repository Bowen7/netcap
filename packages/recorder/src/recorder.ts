import type { CDPSession, Page, Viewport } from 'puppeteer'
import type { Protocol } from 'devtools-protocol'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { mergeFrames } from './frame'
import type {
  RecorderStatus,
  RecorderOptions,
  DataCollectedEvent
} from './types'

ffmpeg.setFfmpegPath(ffmpegPath)

const DEFAULT_OPTIONS: RecorderOptions = {
  width: 1920,
  height: 1080,
  fps: 30
}

// Unlike Puppeteer, we don't use `frameObject.data.timestamp` from the `Page.screencastFrame` event. It is not accurate.
// It is the timestamp when the frame is sent to the client, not the timestamp when the frame is captured.
// Instead, we use the ts from Tracing disabled-by-default-devtools.screenshot event
export class Recorder {
  private readonly options: RecorderOptions
  private readonly page: Page
  private status: RecorderStatus = 'uninitialized'
  private client: CDPSession
  private buffers: Buffer[] = []
  private timeline: number[] = []
  private tracingPromise: Promise<void> | null = null
  private screencastPromise: Promise<void> | null = null
  constructor(page: Page, options: RecorderOptions = {}) {
    this.page = page
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  public async init(): Promise<void> {
    this.status = 'initialized'
    this.client = await this.page.target().createCDPSession()

    // If use the headless mode, the client doesn't extend the page viewport
    // So we need to set the viewport manually
    const viewport: Viewport = this.page.viewport() ?? { width: 0, height: 0 }
    const {
      hasTouch = false,
      isMobile = false,
      deviceScaleFactor = 1,
      width,
      height,
      isLandscape
    } = viewport

    const screenOrientation: Protocol.Emulation.ScreenOrientation = isLandscape
      ? { angle: 90, type: 'landscapePrimary' }
      : { angle: 0, type: 'portraitPrimary' }
    await Promise.all([
      this.client.send('Emulation.setDeviceMetricsOverride', {
        mobile: isMobile,
        width,
        height,
        deviceScaleFactor,
        screenOrientation
      }),
      this.client.send('Emulation.setTouchEmulationEnabled', {
        enabled: hasTouch
      })
    ])
  }

  // We should call `init()` when calling `start()` for the first time.
  // Also, allow the developer to call `init()` manually.
  async start(): Promise<void> {
    if (this.status !== 'uninitialized' && this.status !== 'initialized') {
      return
    }
    if (this.status === 'uninitialized') {
      await this.init()
    }
    this.status = 'recording'
    this.buffers = []
    this.timeline = []
    this.bindEvents()

    await this.startTracing()
    await this.startScreenCast()
  }

  private async endTracing(): Promise<void> {
    await this.client?.send('Tracing.end')
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
          this.status === 'completed' &&
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

  async stop(): Promise<void> {
    this.status = 'completed'
    await this.endTracing()
    await this.tracingPromise
    await this.screencastPromise
    await this.client?.send('Page.stopScreencast')
    await this.unbindEvents()
  }

  async save(path: string): Promise<void> {
    const { fps } = this.options
    const passThrough = mergeFrames(this.buffers, this.timeline, fps)
    // TODO: more options
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
