import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
  readonly isFollowing: boolean
  readonly isDisabled?: boolean
  readonly height?: number
  readonly style?: StyleProp<ViewStyle>
  readonly textStyle?: StyleProp<TextStyle>
}

const FollowButton: React.FC<Props> = ({
  onPress,
  isFollowing,
  isDisabled,
  style,
  textStyle,
  height = 38,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const background = {
    backgroundColor: isFollowing
      ? colors.accentSecondary
      : colors.accentPrimary,
    height: ms(height),
    borderRadius: ms(height) / 2,
  }

  const color = {color: isFollowing ? colors.accentPrimary : colors.textPrimary}

  let title = isFollowing ? t('followingButton') : t('followButton')
  const label = isFollowing ? 'followingButton' : 'followButton'
  if (isDisabled) title = t('loading')

  return (
    <AppTouchableOpacity
      accessibilityLabel={label}
      disabled={isDisabled}
      style={[styles.followButton, background, style]}
      activeOpacity={0.9}
      onPress={onPress}>
      <AppText style={[styles.followButtonText, color, textStyle]}>
        {title}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default FollowButton

const styles = StyleSheet.create({
  followButton: {
    paddingHorizontal: ms(32),
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    end: 0,
  },

  followButtonText: {
    fontSize: ms(15),
    fontWeight: '600',
  },
})
