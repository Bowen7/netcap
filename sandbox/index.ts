import puppeteer from 'puppeteer'
import { resolve } from 'node:path'
import { Recorder } from '../src/recorder'
import { enableMouse } from '../src/preload/mouse'

const width = 1920
const height = 1080

// const later = async (delay): Promise<void> => {
//   await new Promise((resolve) => setTimeout(resolve, delay))
// }

const main = async (): Promise<void> => {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await enableMouse(page)
  await page.goto('https://developer.mozilla.org/en-US/docs/Web/CSS/animation')

  const recorder = new Recorder(page, { width, height })
  await recorder.start()
  console.time('recording')
  await page.mouse.move(100, 100)
  await page.mouse.move(400, 400, { steps: 200 })
  await page.mouse.move(0, 0, { steps: 20 })
  console.timeEnd('recording')
  await recorder.stop()
  await browser.close()
  await recorder.save(resolve(__dirname, '../dist/output.mp4'))
}

main().catch((error) => {
  console.error(error)
})
