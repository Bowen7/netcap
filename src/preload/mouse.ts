/// <reference lib="dom" />
import { type Page } from 'puppeteer'
import { type Cursors } from '../types'

export interface CursorOptions {
  cursorScale?: number
}

// from https://www.figma.com/community/file/905067239318782670
const cursors: Cursors = {
  default: {
    image: /* svg */ `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_2_333)">
<path d="M15.9231 18.0296C16.0985 18.4505 15.9299 20.0447 15 20.4142C14.0701 20.7837 12.882 20.4142 12.882 20.4142L10.726 16.1024L7 19.8284V3L18.4142 14.4142H14.1615C14.3702 14.8144 15.7003 17.4948 15.9231 18.0296Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8 5.41422V17.4142L11 14.4142L13.5 19.4142C13.5 19.4142 14.1763 19.63 14.5 19.4142C14.8237 19.1984 15.1457 18.7638 15 18.4142C14.3123 16.7638 12.5 13.4142 12.5 13.4142H16L8 5.41422Z" fill="black"/>
</g>
<defs>
<filter id="filter0_d_2_333" x="5.2" y="2.2" width="15.0142" height="21.1784" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="0.9"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_333"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_333" result="shape"/>
</filter>
</defs>
</svg>
  `,
    offset: [7, 3]
  },
  pointer: {
    image: /* svg */ `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_2_270)">
<path d="M8.27 16.28C7.99 15.92 7.64 15.19 7.03 14.28C6.68 13.78 5.82 12.83 5.56 12.34C5.37257 12.0422 5.31819 11.6797 5.41 11.34C5.56696 10.6942 6.17956 10.2658 6.84 10.34C7.3508 10.4426 7.82022 10.693 8.19 11.06C8.44818 11.3032 8.68567 11.5674 8.9 11.85C9.06 12.05 9.1 12.13 9.28 12.36C9.46 12.59 9.58 12.82 9.49 12.48C9.42 11.98 9.3 11.14 9.13 10.39C9 9.82 8.97 9.73 8.85 9.3C8.73 8.87 8.66 8.51 8.53 8.02C8.41117 7.53858 8.31771 7.05124 8.25 6.56C8.12395 5.93171 8.21566 5.27922 8.51 4.71C8.8594 4.38137 9.37193 4.29464 9.81 4.49C10.2506 4.81534 10.5791 5.26966 10.75 5.79C11.0121 6.43039 11.187 7.10307 11.27 7.79C11.43 8.79 11.74 10.25 11.75 10.55C11.75 10.18 11.68 9.4 11.75 9.05C11.8194 8.68513 12.073 8.38232 12.42 8.25C12.7178 8.15863 13.0328 8.13808 13.34 8.19C13.65 8.25482 13.9247 8.43315 14.11 8.69C14.3417 9.2734 14.4703 9.8926 14.49 10.52C14.5168 9.97059 14.6108 9.42653 14.77 8.9C14.9371 8.66455 15.1811 8.49479 15.46 8.42C15.7906 8.35956 16.1294 8.35956 16.46 8.42C16.7311 8.51063 16.9682 8.68152 17.14 8.91C17.3518 9.44035 17.48 10.0003 17.52 10.57C17.52 10.71 17.59 10.18 17.81 9.83C17.9243 9.4906 18.211 9.23797 18.5621 9.16728C18.9132 9.09659 19.2754 9.21857 19.5121 9.48728C19.7489 9.75599 19.8243 10.1306 19.71 10.47C19.71 11.12 19.71 11.09 19.71 11.53C19.71 11.97 19.71 12.36 19.71 12.73C19.6736 13.3152 19.5933 13.8968 19.47 14.47C19.296 14.9771 19.0538 15.4582 18.75 15.9C18.2645 16.44 17.8633 17.0502 17.56 17.71C17.4848 18.0378 17.4512 18.3738 17.46 18.71C17.459 19.0206 17.4994 19.33 17.58 19.63C17.1711 19.6732 16.7589 19.6732 16.35 19.63C15.96 19.57 15.48 18.79 15.35 18.55C15.2857 18.4211 15.154 18.3397 15.01 18.3397C14.866 18.3397 14.7343 18.4211 14.67 18.55C14.45 18.93 13.96 19.62 13.62 19.66C12.95 19.74 11.57 19.66 10.48 19.66C10.48 19.66 10.66 18.66 10.25 18.3C9.84 17.94 9.42 17.52 9.11 17.24L8.27 16.28Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.27 16.28C7.99 15.92 7.64 15.19 7.03 14.28C6.68 13.78 5.82 12.83 5.56 12.34C5.37257 12.0422 5.31819 11.6797 5.41 11.34C5.56696 10.6942 6.17956 10.2658 6.84 10.34C7.3508 10.4426 7.82022 10.693 8.19 11.06C8.44818 11.3032 8.68567 11.5674 8.9 11.85C9.06 12.05 9.1 12.13 9.28 12.36C9.46 12.59 9.58 12.82 9.49 12.48C9.42 11.98 9.3 11.14 9.13 10.39C9 9.82 8.97 9.73 8.85 9.3C8.73 8.87 8.66 8.51 8.53 8.02C8.41117 7.53858 8.31771 7.05124 8.25 6.56C8.12395 5.93171 8.21566 5.27922 8.51 4.71C8.85939 4.38137 9.37193 4.29464 9.81 4.49C10.2506 4.81534 10.5791 5.26966 10.75 5.79C11.0121 6.43039 11.187 7.10307 11.27 7.79C11.43 8.79 11.74 10.25 11.75 10.55C11.75 10.18 11.68 9.4 11.75 9.05C11.8194 8.68513 12.073 8.38232 12.42 8.25C12.7178 8.15863 13.0328 8.13808 13.34 8.19C13.65 8.25482 13.9247 8.43315 14.11 8.69C14.3417 9.2734 14.4703 9.8926 14.49 10.52C14.5168 9.97059 14.6108 9.42653 14.77 8.9C14.9371 8.66455 15.1811 8.49479 15.46 8.42C15.7906 8.35956 16.1294 8.35956 16.46 8.42C16.7311 8.51063 16.9682 8.68152 17.14 8.91C17.3518 9.44035 17.48 10.0003 17.52 10.57C17.52 10.71 17.59 10.18 17.81 9.83C17.9243 9.4906 18.211 9.23797 18.5621 9.16728C18.9132 9.09659 19.2754 9.21857 19.5121 9.48728C19.7489 9.75599 19.8243 10.1306 19.71 10.47C19.71 11.12 19.71 11.09 19.71 11.53C19.71 11.97 19.71 12.36 19.71 12.73C19.6736 13.3152 19.5933 13.8968 19.47 14.47C19.296 14.9771 19.0538 15.4582 18.75 15.9C18.2644 16.44 17.8633 17.0502 17.56 17.71C17.4848 18.0378 17.4512 18.3738 17.46 18.71C17.459 19.0206 17.4994 19.33 17.58 19.63C17.1711 19.6732 16.7589 19.6732 16.35 19.63C15.96 19.57 15.48 18.79 15.35 18.55C15.2857 18.4211 15.154 18.3397 15.01 18.3397C14.866 18.3397 14.7343 18.4211 14.67 18.55C14.45 18.93 13.96 19.62 13.62 19.66C12.95 19.74 11.57 19.66 10.48 19.66C10.48 19.66 10.66 18.66 10.25 18.3C9.84 17.94 9.42 17.52 9.11 17.24L8.27 16.28Z" stroke="black" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.75 16.8259V13.3741C16.75 13.1675 16.5821 13 16.375 13C16.1679 13 16 13.1675 16 13.3741V16.8259C16 17.0325 16.1679 17.2 16.375 17.2C16.5821 17.2 16.75 17.0325 16.75 16.8259Z" fill="black"/>
<path d="M14.77 16.8246L14.75 13.3711C14.7488 13.1649 14.5799 12.9988 14.3728 13C14.1657 13.0012 13.9988 13.1693 14 13.3754L14.02 16.8289C14.0212 17.035 14.1901 17.2012 14.3972 17.2C14.6043 17.1988 14.7712 17.0307 14.77 16.8246Z" fill="black"/>
<path d="M12 13.379L12.02 16.8254C12.0212 17.0335 12.1901 17.2012 12.3972 17.2C12.6043 17.1988 12.7712 17.0291 12.77 16.821L12.75 13.3746C12.7488 13.1665 12.5799 12.9988 12.3728 13C12.1657 13.0012 11.9988 13.1709 12 13.379Z" fill="black"/>
</g>
<defs>
<filter id="filter0_d_2_270" x="4.19134" y="4.01178" width="16.7461" height="17.8588" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="0.4"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_270"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_270" result="shape"/>
</filter>
</defs>
</svg>  
  `,
    offset: [5, 4]
  },
  text: {
    image: /* svg */ `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.4513 11.0217H12.9513V6.50335C13.1261 6.12098 13.3824 5.7809 13.7029 5.50727C13.9067 5.36018 14.155 5.22637 14.4205 5.12707C14.7005 5.07973 15.0497 5.05786 15.3986 5.07976L15.8976 5.11108L15.929 4.61207L15.9916 3.61403L16.0229 3.11501L15.5239 3.08369C14.9888 3.0501 14.4515 3.08618 13.9257 3.19103L13.892 3.19776L13.8595 3.20904C13.322 3.39565 12.8802 3.63021 12.4779 3.92679L12.465 3.93631L12.4527 3.94663C12.2777 4.09381 12.1147 4.25037 11.9641 4.4156C11.831 4.26106 11.6888 4.11404 11.5379 3.97539L11.5215 3.96036L11.5039 3.94684C11.0607 3.60689 10.6003 3.36902 10.1068 3.21638L10.0834 3.20916L10.0595 3.20425C9.48069 3.08552 8.93841 3.04888 8.3969 3.0838L7.89794 3.11598L7.93012 3.61494L7.99448 4.61287L8.02666 5.11183L8.52562 5.07965C8.88074 5.05675 9.2373 5.07929 9.58663 5.1467C9.79094 5.21545 10.0245 5.33523 10.2367 5.49321C10.5269 5.76706 10.7832 6.12847 10.9613 6.53415V11.0217H10.4613H9.96126V11.5217V12.5017V13.0017H10.4613H10.9613V16.5291C10.7836 16.9329 10.5258 17.2967 10.2031 17.5983C10.0262 17.7272 9.79356 17.8475 9.54223 17.9281C9.23911 17.9841 8.88262 18.007 8.52613 17.9838L8.02718 17.9514L7.99475 18.4503L7.92988 19.4482L7.89745 19.9472L8.39639 19.9796C8.93599 20.0147 9.47786 19.9786 10.008 19.8722L10.0315 19.8675L10.0545 19.8605C10.5934 19.6974 11.0556 19.4608 11.4673 19.1471L11.4852 19.1335L11.5018 19.1184C11.669 18.9654 11.8245 18.8053 11.9682 18.6383C12.1149 18.7985 12.2726 18.9493 12.4403 19.0893L12.4513 19.0984L12.4627 19.1069C12.8844 19.4202 13.3254 19.6559 13.7951 19.8235L13.8256 19.8344L13.8573 19.8413C14.4453 19.9687 14.9806 20.0096 15.516 19.9802L16.0153 19.9528L15.9879 19.4536L15.9331 18.4551L15.9057 17.9558L15.4065 17.9832C15.0605 18.0022 14.7135 17.9778 14.3737 17.9105C14.166 17.8283 13.9172 17.6945 13.6883 17.5269C13.3865 17.271 13.1289 16.933 12.9513 16.5486V13.0017H13.4513H13.9513V12.5017V11.5217V11.0217H13.4513Z" fill="black" stroke="white"/>
</svg>  
`,
    offset: [8, 3]
  }
}
interface CursorFuncArgs {
  cursors: Cursors
  cursorScale: number
}
// ScreenCast will not record the cursor, so we need to mock it.
export const enableCursor = async (
  page: Page,
  options: CursorOptions = {}
): Promise<void> => {
  // page.on('console', (log) => {
  //   console.log(log.text())
  // })
  const { cursorScale = 1 } = options
  await page.evaluateOnNewDocument(
    ({ cursors, cursorScale }: CursorFuncArgs) => {
      const isPointInRect = (
        point: [number, number],
        rect: DOMRect
      ): boolean => {
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
    },
    { cursors, cursorScale }
  )
}
