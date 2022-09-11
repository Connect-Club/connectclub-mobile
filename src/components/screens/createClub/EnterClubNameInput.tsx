import React, {memo, useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, TextInput, View} from 'react-native'

import AppIconButton from '../../../components/common/AppIconButton'
import AppText from '../../../components/common/AppText'
import Horizontal from '../../../components/common/Horizontal'
import {storage} from '../../../storage'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {getUserNameWithClubSuffix} from '../../../utils/stringHelpers'

type Props = {
  onPress: (inputData: string) => void
  disabled: boolean
}

const inputLimit = 60

const EnterClubNameInput: React.FC<Props> = ({onPress, disabled}) => {
  const [inputData, setInputData] = useState(
    getUserNameWithClubSuffix(storage?.currentUser?.name),
  )
  const {colors} = useTheme()
  const {t} = useTranslation()

  const handleOnPress = useCallback(() => {
    onPress(inputData)
  }, [inputData, onPress])

  const onChangeText = (e: string) => {
    setInputData(e)
  }

  const iconStyle = {
    backgroundColor: colors.primaryClickable,
    opacity: inputData.length && !disabled ? 1 : 0.4,
  }

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={inputData}
        maxLength={inputLimit}
        placeholderTextColor={colors.supportBodyText}
        onChangeText={onChangeText}
        placeholder={t('createClubPlaceholder')}
        style={[styles.container, {backgroundColor: colors.skeleton}]}
      />
      <Horizontal style={styles.inputContainer}>
        <AppText
          style={[
            styles.counter,
            {color: colors.thirdBlack},
          ]}>{`${inputData.length}/${inputLimit}`}</AppText>
        <AppIconButton
          icon='icFullArrowRight'
          accessibilityLabel='inputButton'
          onPress={handleOnPress}
          tint={colors.skeleton}
          disabled={disabled || !inputData.length}
          style={[styles.button, iconStyle]}
        />
      </Horizontal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginLeft: ms(-16),
    marginRight: ms(-16),
  },
  container: {
    paddingLeft: ms(16),
    paddingRight: ms(110),
    paddingBottom: ms(14),
    height: ms(56),
    borderRadius: ms(48),
    ...makeTextStyle(ms(18), ms(28)),
  },
  inputContainer: {
    alignItems: 'center',
    position: 'absolute',
    right: ms(4),
    top: ms(4),
  },
  counter: {
    marginRight: ms(16),
    ...makeTextStyle(ms(12), ms(24)),
  },
  button: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
  },
})

export default memo(EnterClubNameInput)
