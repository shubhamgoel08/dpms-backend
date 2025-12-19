import {AsyncLocalStorage} from 'async_hooks'

export interface IQueryInfo {
  sql: string
  duration: number
}

export interface IAsyncLocalStore {
  queries: IQueryInfo[]
  requestId?: string
}

export const PerformanceLogStore = {
  storage: new AsyncLocalStorage<IAsyncLocalStore>(),
  get() {
    return this.storage.getStore()
  },
}

