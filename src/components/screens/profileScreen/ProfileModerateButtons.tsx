import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onAccept: () => void
  readonly onReject: () => void
}

const ProfileModerateButtons: React.FC<Props> = ({onAccept, onReject}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View style={styles.base}>
      <AppTouchableOpacity
        style={[
          styles.buttonBase,
          styles.buttonSkip,
          {backgroundColor: colors.secondaryClickable},
        ]}
        onPress={onReject}>
        <AppText style={[styles.buttonText, {color: colors.primaryClickable}]}>
          {t('skipButton')}
        </AppText>
      </AppTouchableOpacity>
      <AppTouchableOpacity
        style={[
          styles.buttonBase,
          styles.buttonAccept,
          {backgroundColor: colors.primaryClickable},
        ]}
        onPress={onAccept}>
        <AppText
          style={[styles.buttonText, {color: colors.floatingBackground}]}>
          {t('letInButton')}
        </AppText>
      </AppTouchableOpacity>
    </View>
  )
}

export default memo(ProfileModerateButtons)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    end: 0,
  },
  buttonBase: {
    height: ms(38),
    alignSelf: 'center',
    borderRadius: ms(100),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonSkip: {
    minWidth: ms(81),
  },
  buttonAccept: {
    minWidth: ms(131),
    marginStart: ms(12),
  },
  buttonText: {
    alignSelf: 'center',
    ...makeTextStyle(ms(15), ms(18), 'bold'),
  },
})
