import { type Page } from 'puppeteer'

const preload = (): void => {}

// ScreenCast will not record the cursor, so we need to mock it.
export const enableMouse = async (page: Page): Promise<void> => {
  page.on('console', (msg) => {
    console.log('PAGE LOG:', msg.text())
  })
  await page.evaluateOnNewDocument(() => {
    if (window === window.parent) {
      window.addEventListener('DOMContentLoaded', () => {
        // from https://www.figma.com/community/file/905067239318782670
        const defaultCursorSVG = /* svg */ `
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
    `
        const cursor = document.createElement('div')
        cursor.innerHTML = defaultCursorSVG
        cursor.style.position = 'absolute'
        cursor.style.pointerEvents = 'none'
        cursor.style.left = '200px'
        cursor.style.top = '200px'
        cursor.style.zIndex = '2147483647'
        document.body.appendChild(cursor)
      })
    }
  })
}
