import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {AppIconType} from '../../../assets/AppIcon.native'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface SettingsProps {
  readonly titleKey: string
  readonly icon: AppIconType
  readonly onPress: () => void
  readonly hintKey?: string
}

const RoomSettingsButton: React.FC<SettingsProps> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <>
      <AppTouchableOpacity
        style={[
          styles.makePublicButton,
          {backgroundColor: colors.secondaryClickable},
        ]}
        onPress={props.onPress}>
        <AppIcon type={props.icon} tint={colors.accentPrimary} />
        <AppText
          style={[
            styles.makePublicButtonText,
            {color: colors.primaryClickable},
          ]}>
          {t(props.titleKey)}
        </AppText>
      </AppTouchableOpacity>
      {props.hintKey && (
        <AppText style={[styles.settingsHintText, {color: colors.thirdBlack}]}>
          {t(props.hintKey)}
        </AppText>
      )}
    </>
  )
}

export default RoomSettingsButton

const styles = StyleSheet.create({
  makePublicButton: {
    marginTop: ms(24),
    width: '80%',
    flexDirection: 'row',
    height: ms(38),
    borderRadius: ms(38 / 2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  makePublicButtonText: {
    marginStart: ms(10),
    ...makeTextStyle(ms(15), ms(18), '600'),
  },

  settingsHintText: {
    ...makeTextStyle(ms(12), ms(16), 'normal'),
    marginTop: ms(8),
  },
})
