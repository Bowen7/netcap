/// <reference lib="dom" />
import { type Page } from 'puppeteer'
import { cursorEffect } from '@vtape/effects'

// import { type Cursors } from '../types'

export interface CursorOptions {
  cursorScale?: number
}

declare global {
  interface Window {
    _cursorX: number
    _cursorY: number
  }
}

// from https://www.figma.com/community/file/905067239318782670
// const cursors: Cursors = {
//   default: {
//     image: defaultSvg,
//     offset: [7, 3]
//   },
//   pointer: {
//     image: pointerSvg,
//     offset: [5, 4]
//   },
//   text: {
//     image: textSvg,
//     offset: [8, 3]
//   }
// }
// interface CursorFuncArgs {
//   cursors: Cursors
//   cursorScale: number
// }
// ScreenCast will not record the cursor, so we need to mock it.
export const enableCursor = async (
  page: Page,
  options: CursorOptions = {}
): Promise<void> => {
  // page.on('console', (log) => {
  //   console.log(log.text())
  // })
  // const { cursorScale = 1 } = options
  await page.evaluateOnNewDocument((cursorEffectFunc: typeof cursorEffect) => {
    cursorEffectFunc()
  }, cursorEffect)
}

export const waitForMouse = async (
  page: Page,
  x: number,
  y: number
): Promise<void> => {
  await page.waitForFunction(
    () => window._cursorX === x && window._cursorY === y
  )
}
