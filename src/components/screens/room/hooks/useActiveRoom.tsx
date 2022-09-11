import {useEffect} from 'react'

import {appEventEmitter} from '../../../../appEventEmitter'

export const useActiveRoom = (roomId: string) => {
  useEffect(() => {
    appEventEmitter.trigger('setActiveRoom', roomId)

    return () => {
      appEventEmitter.trigger('endRoom')
    }
  }, [])
}
