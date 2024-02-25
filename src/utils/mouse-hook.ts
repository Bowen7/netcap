import { type Page, type Point } from 'puppeteer'
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
            case 'click':
            case 'move':
              return (x: number, y: number, ...rest) => {
                callback(x, y)
                return value.call(target, x, y, ...rest)
              }
            case 'drag':
            case 'dragAndDrop':
              return (start: Point, end: Point) => {
                callback(end.x, end.y)
                return value.call(target, start, end)
              }
            case 'dragEnter':
            case 'dragOver':
            case 'drop':
              return (target: Point) => {
                callback(target.x, target.y)
                return value.call(target, target)
              }
            case 'reset':
              return () => {
                // eslint-disable-next-line n/no-callback-literal
                callback(0, 0)
                return value.call(target)
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
