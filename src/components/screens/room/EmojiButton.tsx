import {observer} from 'mobx-react'
import React from 'react'
import {StyleSheet} from 'react-native'
import {CountdownCircleTimer} from 'react-native-countdown-circle-timer'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import UserReactionsStore from './store/UserReactionsStore'

interface Props {
  readonly currentUserId: string
  readonly onPress: () => void
  readonly reactionsStore?: UserReactionsStore
}

const EmojiButton: React.FC<Props> = ({
  currentUserId,
  onPress,
  reactionsStore,
}) => {
  const {colors} = useTheme()
  const reaction = reactionsStore?.reactions.get(currentUserId)
  const isInReaction = reaction !== undefined

  return (
    <AppTouchableOpacity
      accessibilityLabel={'EmojiButton'}
      shouldVibrateOnClick
      style={[styles.container, {backgroundColor: colors.floatingBackground}]}
      onPress={onPress}>
      {isInReaction && (
        <CountdownCircleTimer
          size={22}
          strokeWidth={2}
          isPlaying={isInReaction}
          duration={reaction?.duration ?? 10}
          trailStrokeWidth={0}
          onComplete={() => [true, 0]}
          colors={colors.secondaryIcon}>
          {({remainingTime}) => (
            <AppText style={[styles.counter, {color: colors.secondaryIcon}]}>
              {remainingTime}
            </AppText>
          )}
        </CountdownCircleTimer>
      )}
      {!isInReaction && <AppIcon type={'icEmoji'} tint={colors.accentIcon} />}
    </AppTouchableOpacity>
  )
}

export default observer(EmojiButton)

const styles = StyleSheet.create({
  container: {
    width: ms(48),
    height: ms(48),
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(56 / 2),
    marginStart: isNative ? ms(16) : 0,
  },
  button: {
    position: 'absolute',
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(56 / 2),
  },
  counter: {
    position: 'absolute',
    fontSize: ms(12),
    fontWeight: 'bold',
  },
})
