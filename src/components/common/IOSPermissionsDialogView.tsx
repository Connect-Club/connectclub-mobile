import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {commonStyles, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import Horizontal from './Horizontal'
import Vertical from './Vertical'

interface Props {
  readonly onAllowPress: () => void
  readonly onDenyPress: () => void
  readonly title: string
  readonly description: string
}

const IosPermissionsDialogView: React.FC<Props> = ({
  onAllowPress,
  onDenyPress,
  title,
  description,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View style={styles.baseContainer}>
      <Vertical
        style={[
          styles.base,
          {
            backgroundColor: colors.floatingBackground,
            marginTop: -75,
          },
        ]}>
        <AppText style={[styles.titleText, {color: colors.bodyText}]}>
          {title}
        </AppText>
        <AppText style={[styles.descriptionText, {color: colors.bodyText}]}>
          {description}
        </AppText>
        <Horizontal
          style={[styles.buttonsContainer, {borderTopColor: colors.separator}]}>
          <AppTouchableOpacity style={styles.button} onPress={onDenyPress}>
            <AppText style={[styles.denyText, {color: colors.accentPrimary}]}>
              {t('contactsPermissionsDialogDeny')}
            </AppText>
          </AppTouchableOpacity>
          <View style={[styles.line, {backgroundColor: colors.separator}]} />
          <AppTouchableOpacity style={styles.button} onPress={onAllowPress}>
            <AppText style={[styles.allowText, {color: colors.accentPrimary}]}>
              {t('contactsPermissionsDialogAllow')}
            </AppText>
          </AppTouchableOpacity>
        </Horizontal>
      </Vertical>
    </View>
  )
}

export default IosPermissionsDialogView

const styles = StyleSheet.create({
  baseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignContent: 'center',
    justifyContent: 'center',
  },

  base: {
    width: ms(271),
    paddingTop: ms(16),
    borderRadius: ms(14),
    alignSelf: 'center',
  },

  titleText: {
    fontSize: ms(17),
    fontWeight: 'bold',
    lineHeight: ms(24),
    paddingHorizontal: ms(16),
    textAlign: 'center',
  },

  descriptionText: {
    fontSize: ms(13),
    textAlign: 'center',
    marginTop: ms(4),
    paddingHorizontal: ms(16),
    marginBottom: ms(20),
  },

  buttonsContainer: {
    borderTopWidth: ms(1),
  },

  button: {
    flex: 1,
    height: ms(43),
    ...commonStyles.flexCenter,
  },

  denyText: {
    fontSize: ms(17),
  },

  allowText: {
    fontSize: ms(17),
    fontWeight: '600',
  },

  line: {
    width: ms(1),
    height: '100%',
  },
})
