import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub as typeof ResizeObserver
