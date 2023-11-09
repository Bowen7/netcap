import { type Page } from 'puppeteer'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { PassThrough } from 'node:stream'

ffmpeg.setFfmpegPath(ffmpegPath)

export class NetCap {
  private status: 'pending' | 'recording' | 'paused' = 'pending'
  page: Page
  pass: PassThrough
  constructor(page: Page) {
    this.page = page
    this.pass = new PassThrough()
  }

  start(): void {
    if (this.status !== 'pending') {
      console.error('NetCap is already started')
    }
    this.status = 'recording'
  }

  stop(): void {
    if (this.status !== 'recording') {
      console.error('NetCap is not recording')
    }
    this.status = 'pending'
  }

  pause(): void {
    if (this.status !== 'recording') {
      console.error('NetCap is not recording')
    }
    this.status = 'paused'
  }

  resume(): void {
    if (this.status !== 'paused') {
      console.error('NetCap is not paused')
    }
    this.status = 'recording'
  }
}
