import {useEffect, useRef} from 'react'

export const useViewModel = <T>(creator: () => T): T => {
  const ref = useRef<T>()
  if (!ref.current) ref.current = creator()

  useEffect(() => {
    return () => {
      // @ts-ignore
      if (ref.current && typeof ref.current.clear === 'function') {
        // @ts-ignore
        ref.current.clear()
      }
    }
  }, [])
  return ref.current
}
