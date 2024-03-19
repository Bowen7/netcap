import { type Page } from 'puppeteer'
import defaultSvg from '../assets/cursors/default.svg'
import pointerSvg from '../assets/cursors/pointer.svg'
import textSvg from '../assets/cursors/text.svg'

type Cursors = Record<
  string,
  {
    image: string
    offset?: [number, number]
  }
>

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
const cursors: Cursors = {
  default: {
    image: defaultSvg,
    offset: [7, 3]
  },
  pointer: {
    image: pointerSvg,
    offset: [5, 4]
  },
  text: {
    image: textSvg,
    offset: [8, 3]
  }
}

// ScreenCast will not record the cursor, so we need to mock it.
export const cursorEffect = (options: CursorOptions = {}): void => {
  const { cursorScale = 1 } = options
  window._cursorX = 0
  window._cursorY = 0

  const isPointInRect = (point: [number, number], rect: DOMRect): boolean => {
    const [x, y] = point
    const { left, right, top, bottom } = rect
    return x > left && x < right && y > top && y < bottom
  }

  const moveCursor = (
    cursorContainer: HTMLDivElement,
    event: MouseEvent
  ): void => {
    const { clientX: x, clientY: y } = event
    cursorContainer.style.left = `${x}px`
    cursorContainer.style.top = `${y}px`
    window._cursorX = x
    window._cursorY = y
  }

  const getCursorType = (event: MouseEvent): string => {
    let cursorType = 'default'
    const target = event.target as HTMLElement
    if (!target) {
      return cursorType
    }
    cursorType =
      target.style.cursor || getComputedStyle(target).cursor || 'default'
    // If `cursorType` is 'auto', we should further detect the cursor style.
    if (cursorType === 'auto') {
      cursorType = 'default'
      try {
        const { clientX: x, clientY: y } = event
        const range = document.caretRangeFromPoint(x, y)
        if (range) {
          const textNode = range.startContainer
          if (textNode?.nodeType === Node.TEXT_NODE) {
            // If the cursor is in the blank space of a text node (such as word wrap or the end of a paragraph), it should not be the 'text' cursor.
            const index = range.startOffset
            range.setStart(textNode, index === 0 ? 0 : index - 1)
            range.setEnd(textNode, index + 1)
            const rects = range.getClientRects()
            const isPointInRects = Array.from(rects).some((rect) =>
              isPointInRect([x, y], rect)
            )
            if (isPointInRects) {
              cursorType = 'text'
            }
          }
        }
      } catch (error) {}
    }
    return cursorType
  }

  const setCursorStyle = (
    cursorContainer: HTMLDivElement,
    cursorType: string
  ): void => {
    const scale = cursorScale
    const cursor = cursors[cursorType] || cursors.default
    const { image, offset = [0, 0] } = cursor
    const [offsetX, offsetY] = offset
    const transformX = -scale * offsetX
    const transformY = -scale * offsetY
    cursorContainer.innerHTML = image
    cursorContainer.style.transformOrigin = '0 0'
    cursorContainer.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`
  }

  const createCursorContainer = (): HTMLDivElement => {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.pointerEvents = 'none'
    container.style.left = '-999px'
    container.style.top = '-999px'
    // max z-index
    container.style.zIndex = '2147483647'
    setCursorStyle(container, 'default')
    document.body.appendChild(container)
    return container
  }

  if (window === window.parent) {
    window.addEventListener('DOMContentLoaded', () => {
      let prevMouseEvent: MouseEvent | null = null
      let latestMouseEvent: MouseEvent | null = null
      let latestCursorType = 'default'

      const container = createCursorContainer()

      document.addEventListener(
        'mousemove',
        (event) => {
          latestMouseEvent = event
        },
        true
      )

      const rafCallback = (): void => {
        requestAnimationFrame(rafCallback)
        if (latestMouseEvent && latestMouseEvent !== prevMouseEvent) {
          prevMouseEvent = latestMouseEvent
          moveCursor(container, latestMouseEvent)
          const cursorType = getCursorType(latestMouseEvent)
          if (cursorType !== latestCursorType) {
            setCursorStyle(container, cursorType)
            latestCursorType = cursorType
          }
        }
      }
      rafCallback()
    })
  }
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
