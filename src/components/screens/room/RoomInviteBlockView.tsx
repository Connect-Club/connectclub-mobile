import {observer} from 'mobx-react'
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {useTranslation} from 'react-i18next'
import {LayoutChangeEvent, Platform, StyleSheet} from 'react-native'
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import RasterIcon from '../../../assets/RasterIcon'
import RoomInviteStore from '../../../stores/RoomInviteStore'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {animateNumberValues} from '../../../utils/reanimated.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import {useViewModel} from '../../../utils/useViewModel'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import {RoomSettings} from './models/jsonModels'
import {logJS} from './modules/Logger'
import ClickableView from './nativeview/RTCClickableView'

interface Props {
  readonly userManager: UserManager
  readonly roomManager: RoomManager
  readonly roomSettings: RoomSettings | undefined
  readonly onInvitePress?: () => void
}

const hide = async (
  isAnimating: MutableRefObject<boolean>,
  layoutHeight: MutableRefObject<number>,
  opacityValue: SharedValue<number>,
  translateValue: SharedValue<number>,
) => {
  isAnimating.current = true
  await animateNumberValues(
    {
      from: 1,
      to: 0,
      duration: 140,
      sharedValue: opacityValue,
      easing: Easing.out(Easing.quad),
    },
    {
      from: 0,
      to: ms(layoutHeight.current),
      duration: 140,
      sharedValue: translateValue,
      easing: Easing.out(Easing.quad),
    },
  )
  isAnimating.current = false
}

const reveal = async (
  isAnimating: MutableRefObject<boolean>,
  layoutHeight: MutableRefObject<number>,
  opacityValue: SharedValue<number>,
  translateValue: SharedValue<number>,
) => {
  isAnimating.current = true
  await animateNumberValues(
    {
      from: 0,
      to: 1,
      duration: 140,
      sharedValue: opacityValue,
      easing: Easing.out(Easing.quad),
    },
    {
      from: ms(layoutHeight.current),
      to: 0,
      duration: 140,
      sharedValue: translateValue,
      easing: Easing.out(Easing.quad),
    },
  )
  isAnimating.current = false
}

const vPadding = 16
const marginBottom = 16
const blockHeight = 135

const RoomInviteBlockView: React.FC<Props> = ({
  userManager,
  roomManager,
  roomSettings,
  onInvitePress,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const backgroundStyle = {backgroundColor: colors.card}
  const isAnimating = useRef(false)
  const layoutHeight = useRef(0)
  const store = useViewModel(
    () => new RoomInviteStore(userManager, roomManager),
  )
  const makeInviteStore = store.makeInviteStore
  const [visible, setVisible] = useState(false)

  const onViewLayout = useCallback((e: LayoutChangeEvent) => {
    //Layout height doesn't count paddings
    layoutHeight.current = e.nativeEvent.layout.height + vPadding * 2
  }, [])

  const opacityValue = useSharedValue(0)
  const translateValue = useSharedValue(0)

  const fadeAnim = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
      marginTop: translateValue.value,
    }
  })

  useEffect(() => {
    if (!makeInviteStore.error) return
    logJS(
      'debug',
      'RoomInviteBlockView',
      'displaying error',
      makeInviteStore.error,
    )
    toastHelper.error('somethingWentWrong')
  }, [makeInviteStore.error])

  useEffect(() => {
    if (store.isInviteBlockVisible) {
      setVisible(true)
      reveal(isAnimating, layoutHeight, opacityValue, translateValue)
    } else {
      hide(isAnimating, layoutHeight, opacityValue, translateValue)
      setVisible(false)
    }
  }, [opacityValue, store.isInviteBlockVisible, translateValue])

  const onInvitePressInternal = useCallback(async () => {
    logJS('debug', 'RoomInviteBlockView', 'invite pressed')
    analytics.sendEvent('room_invite_block_invite_click')
    onInvitePress?.()
  }, [onInvitePress])

  const onHidePress = async () => {
    analytics.sendEvent('room_invite_block_dismiss_click')
    store.dismissInvite()
  }

  const buttonBackground = {backgroundColor: colors.accentPrimary}
  const buttonText = {color: colors.textPrimary}

  if (!roomSettings || (!visible && !isAnimating.current)) return null

  const animatedStyle =
    Platform.OS === 'ios' ? {top: -ms(blockHeight + marginBottom)} : {}

  return (
    <Animated.View
      style={[styles.base, backgroundStyle, fadeAnim, animatedStyle]}
      accessibilityLabel={'RoomInviteBlockView'}>
      <Vertical onLayout={onViewLayout}>
        <Horizontal>
          <RasterIcon
            type={'ic_flame'}
            style={styles.icon}
            scaleType={'fitCenter'}
          />
          <Vertical>
            <AppText style={styles.text}>{t('roomInvitationReminder')}</AppText>
          </Vertical>
        </Horizontal>
        <ClickableView
          onClick={onInvitePressInternal}
          style={[
            commonStyles.primaryButtonSmall,
            styles.button,
            buttonBackground,
          ]}>
          <AppText style={[styles.buttonText, buttonText]}>
            {t('inviteFriends')}
          </AppText>
        </ClickableView>
      </Vertical>
      <ClickableView onClick={onHidePress} style={styles.closeButton}>
        <AppIcon type={'icClear'} />
      </ClickableView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    height: ms(blockHeight),
    borderRadius: ms(8),
    paddingVertical: ms(vPadding),
    paddingStart: ms(20),
    paddingEnd: ms(16),
    marginHorizontal: ms(16),
  },
  icon: {
    width: ms(28),
    height: ms(48),
  },
  text: {
    paddingStart: ms(16),
    ...makeTextStyle(14, 21, 'bold'),
  },
  closeButton: {
    padding: ms(12),
    position: 'absolute',
    end: ms(0),
  },
  button: {
    marginTop: ms(12),
    marginStart: ms(42),
    justifyContent: 'center',
  },
  buttonText: {
    ...makeTextStyle(12, 16, 'bold'),
  },
})

export default observer(RoomInviteBlockView)
