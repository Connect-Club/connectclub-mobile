import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Dimensions, Platform, StyleSheet, View} from 'react-native'

import {draftIndexType, DraftType, LanguageModel} from '../../../models'
import {commonStyles} from '../../../theme/appTheme'
import {maxWidth, ms} from '../../../utils/layout.utils'
import {
  resetKeyboardMode,
  setKeyboardMode,
} from '../../common/DecorConfigModule'
import FlexSpace from '../../common/FlexSpace'
import {prompt} from '../../webSafeImports/webSafeImports'
import ChooseRoomTypeDescription from './ChooseRoomTypeDescription'
import CloseButton from './CloseButton'
import DraftPreviewView from './DraftPreviewView'
import DraftTypeDescription from './DraftTypeDescription'
import {FadeViewOnStart} from './FadeViewOnStart'

interface Props {
  readonly eventTitle?: string
  readonly onCreatePress: (
    type: DraftType,
    roomName: string,
    isPrivate: boolean,
  ) => void
  readonly isPrivateDefault: boolean
  readonly language?: LanguageModel
  readonly onLanguageSelect: () => void
}

const screenLeft = (Dimensions.get('window').width - maxWidth()) / 2

const StartRoomBottomSheetView: React.FC<Props> = (props) => {
  const {t} = useTranslation()

  const [roomName, setRoomName] = useState(props.eventTitle ?? '')
  const [selectedType, setSelectedType] = useState<DraftType>(draftIndexType[0])
  const [isPrivate, setPrivate] = useState(props.isPrivateDefault)

  const addRoomNameAlert = () => {
    prompt(t('startRoomAddRoomNameTitle'), undefined, setRoomName, {
      type: 'plain-text',
      defaultValue: roomName,
    })
  }

  const onCreatePress = useCallback(
    () => props.onCreatePress(selectedType, roomName, isPrivate),
    [props, roomName, isPrivate, selectedType],
  )

  useEffect(() => {
    setKeyboardMode('overlay')
    return resetKeyboardMode
  })

  return (
    <FadeViewOnStart
      style={[commonStyles.flexOne, {backgroundColor: 'rgb(10, 27, 75)'}]}
      delay={350}>
      <FadeViewOnStart style={styles.viewPagerWrapper} delay={700}>
        <DraftPreviewView selected={selectedType} />
        <CloseButton style={styles.closeButton} />
      </FadeViewOnStart>

      <FlexSpace pointerEvent={'none'} />
      <View>
        {!selectedType && <ChooseRoomTypeDescription />}

        <DraftTypeDescription
          onDraftSelect={setSelectedType}
          onCreatePress={onCreatePress}
          roomName={roomName}
          onAddRoomNamePress={addRoomNameAlert}
          draftType={selectedType}
          isPrivateDefault={props.isPrivateDefault}
          isPrivate={isPrivate}
          onSetPrivate={setPrivate}
          language={props.language}
          onLanguageSelect={props.onLanguageSelect}
        />
      </View>
    </FadeViewOnStart>
  )
}

export default StartRoomBottomSheetView

const styles = StyleSheet.create({
  viewPagerWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  closeButton: {
    top: ms(28),
    position: 'absolute',
    ...Platform.select({
      web: {
        left: ms(16),
      },
      default: {
        left: ms(screenLeft + 16),
      },
    }),
  },
})
