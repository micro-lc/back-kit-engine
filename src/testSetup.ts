import '@testing-library/jest-dom'
import fetch from 'jest-fetch-mock'

jest.mock('./engine')
const globalThis = global
Object.defineProperty(globalThis, 'fetch', {
  writable: true, value: fetch
})
