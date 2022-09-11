import React, {memo, useCallback} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {LanguageModel} from '../../../models'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly language?: LanguageModel
  readonly onPress: () => void
}

const StartRoomLanguageButton: React.FC<Props> = (props) => {
  const onPress = useCallback(() => {
    props.onPress()
  }, [props.language, props.onPress])

  if (!props.language) return null
  const langName = props.language.name
  const index = langName.indexOf(' ')
  if (index === -1) return null
  const flagEmoji = langName.substr(0, index)

  return (
    <AppTouchableOpacity
      style={[styles.clickable, props.style]}
      onPress={onPress}>
      <AppText style={styles.text}>{flagEmoji}</AppText>
    </AppTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clickable: {
    height: ms(56),
    justifyContent: 'center',
  },
  text: {
    fontSize: ms(24),
    lineHeight: ms(28),
    alignSelf: 'center',
  },
})

export default memo(StartRoomLanguageButton)
