function wait(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

interface IBackoff<T> {
  run(callbackFn: () => Promise<T>, retries: number, delay: number): Promise<T>
  clear(): void
}

export const ErrorDisposed = 'backoff component disposed'

export default class Backoff<T> implements IBackoff<T> {
  private disposed = false

  run = async (
    callbackFn: () => Promise<T>,
    retries: number,
    delay: number,
  ): Promise<T> => {
    let result: T
    try {
      result = await callbackFn()
    } catch (e: any) {
      if (this.disposed) throw ErrorDisposed
      if (retries > 1) {
        await wait(delay)
        if (this.disposed) throw ErrorDisposed
        result = await this.run(callbackFn, retries - 1, delay * 2)
      } else {
        throw e
      }
    }

    if (this.disposed) throw ErrorDisposed

    return result
  }

  clear(): void {
    this.disposed = true
  }
}
