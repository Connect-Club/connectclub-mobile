import {useCallback, useEffect, useMemo} from 'react'

type Func = () => void

export const useDisposables = () => {
  const disposables: Array<Func> = useMemo(() => [], [])
  const dispose = useCallback(() => {
    disposables.forEach((e) => e())
  }, [disposables])

  useEffect(() => {
    return dispose
  }, [disposables, dispose])

  return useMemo(() => {
    return {
      add: (disposable: Func) => {
        disposables.push(disposable)
      },
      dispose: () => {
        disposables.forEach((e) => e())
      },
    }
  }, [disposables])
}
