import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {useEffect} from 'react'

import {
  appEventEmitter,
  hideLoading,
  showLoading,
} from '../../../appEventEmitter'
import {CreateEventDraft, MainFeedItemModel, Unknown} from '../../../models'
import {MainFeedStore} from '../../../stores/MainFeedStore'
import {logJS} from '../room/modules/Logger'

type ScreenProps = RouteProp<
  {Screen: {createEventDraft?: CreateEventDraft}},
  'Screen'
>

export const useCreateNewRoom = (store: MainFeedStore) => {
  const {params} = useRoute<ScreenProps>()
  const navigation = useNavigation()

  // called from StartRoomScreenModal
  useEffect(() => {
    if (!params?.createEventDraft) return
    showLoading()
    store.startNewRoom(params.createEventDraft).then(onRoomPress)
    // reset params after use
    navigation.setOptions({createEventDraft: undefined})
  }, [params?.createEventDraft, navigation, store])

  const onRoomPress = async (model: MainFeedItemModel | Unknown) => {
    if (!model) return hideLoading()
    logJS(
      'debug',
      'Open room with roomId:',
      model.roomId,
      'roomPass:',
      model.roomPass,
    )
    appEventEmitter.trigger(
      'openRoom',
      model.roomId,
      model.roomPass,
      model.eventScheduleId,
    )
  }
}
