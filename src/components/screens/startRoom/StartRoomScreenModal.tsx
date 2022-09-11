import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useCallback, useEffect, useState} from 'react'
import {StyleSheet} from 'react-native'

import {CreateEventDraft, LanguageModel} from '../../../models'
import {LanguageSelectorScreenProps} from '../../../screens/LanguageSelectorScreen'
import {storage} from '../../../storage'
import {
  resetKeyboardMode,
  setKeyboardMode,
} from '../../common/DecorConfigModule'
import {AppModal} from '../../webSafeImports/webSafeImports'
import StartRoomBottomSheetView from './StartRoomBottomSheetView'

type ScreenProps = RouteProp<
  {
    Screen: {
      eventId?: string
      eventTitle?: string
      userId?: string
      isPrivate?: boolean
      selectedLanguage?: LanguageModel
      backScreen: string
    }
  },
  'Screen'
>

const StartRoomScreenModal: React.FC = () => {
  const {params} = useRoute<ScreenProps>()
  const navigation = useNavigation()
  const [selectedLanguage, setLanguage] = useState(() => {
    let selectedLang = storage.currentUser?.languages?.find(
      (lang) => lang.id === storage.lastCreatedEventLanguageId,
    )
    if (!selectedLang) {
      selectedLang = storage.currentUser?.language
    }
    return selectedLang
  })

  useEffect(() => {
    setKeyboardMode('overlay')
    return resetKeyboardMode
  }, [])

  useEffect(() => {
    const lang = params?.selectedLanguage
    if (!lang) return
    setLanguage(lang)
    navigation.setOptions({selectedLanguage: undefined})
  }, [params?.selectedLanguage])

  const onCreatePress = useCallback(
    (type, roomName, isPrivate) => {
      if (selectedLanguage?.id) {
        storage.lastCreatedEventLanguageId = selectedLanguage.id
      }
      const createEventDraft: CreateEventDraft = {
        type,
        roomName,
        isPrivate,
        eventId: params.eventId,
        userId: params.userId,
        languageId: selectedLanguage?.id,
      }
      navigation.navigate(params.backScreen, {createEventDraft})
    },
    [
      navigation,
      params.backScreen,
      params.eventId,
      params.userId,
      selectedLanguage,
    ],
  )

  const onLanguageSelect = useCallback(() => {
    const screenProps: LanguageSelectorScreenProps = {
      backScreen: 'StartRoomScreenModal',
      selection: selectedLanguage,
    }
    navigation.navigate('LanguageSelectorScreen', screenProps)
  }, [selectedLanguage])

  return (
    <AppModal contentStyle={styles.content}>
      <StartRoomBottomSheetView
        eventTitle={params.eventTitle}
        isPrivateDefault={params.isPrivate ?? false}
        onCreatePress={onCreatePress}
        language={selectedLanguage}
        onLanguageSelect={onLanguageSelect}
      />
    </AppModal>
  )
}

export default StartRoomScreenModal

const styles = StyleSheet.create({
  content: {
    padding: 0,
    minHeight: 680,
  },
})
