import { type Page } from 'puppeteer'
import { DeepProxy } from '@qiwi/deep-proxy'

export const withMouseHook = (
  page: Page,
  callback: (x: number, y: number) => void
): Page => {
  return new DeepProxy(
    page,
    ({ target, trapName, value, DEFAULT, PROXY, path }) => {
      if (trapName === 'get') {
        if (path.length === 2 && path[0] === 'mouse') {
          switch (path[1]) {
            case 'move':
              return (
                x: number,
                y: number,
                options: { steps?: number } = {}
              ) => {
                callback(x, y)
                return value.call(target, x, y, options)
              }
            default:
              break
          }
        }
        if (typeof value === 'object' && value !== null) {
          return PROXY
        }
      }

      return DEFAULT
    }
  )
}
