import puppeteer from 'puppeteer'
import { resolve } from 'node:path'
import { NetCap } from '../src'

const width = 1920
const height = 1080

const later = async (delay): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, delay))
}

const main = async (): Promise<void> => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.goto('https://fanyi.baidu.com/')

  const netCap = new NetCap(page, { width, height })
  await netCap.start()
  await later(5000)
  await netCap.stop()
  await browser.close()
  await netCap.save(resolve(__dirname, '../dist/output.mp4'))
}

void main()
