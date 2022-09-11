import React, {memo, useCallback, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {LayoutChangeEvent, StyleProp, StyleSheet, ViewStyle} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import {analytics} from '../../Analytics'
import AppIcon, {AppIconType} from '../../assets/AppIcon'
import {storage} from '../../storage'
import MakeInviteStore from '../../stores/MakeInviteStore'
import {makeTextStyle, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {runWithLoaderAsync} from '../../utils/navigation.utils'
import {animateNumberValues} from '../../utils/reanimated.utils'
import {getProfileLink, shareLink} from '../../utils/sms.utils'
import {toastHelper} from '../../utils/ToastHelper'
import {useViewModel} from '../../utils/useViewModel'
import {logJS} from '../screens/room/modules/Logger'
import {Clipboard} from '../webSafeImports/webSafeImports'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import Horizontal from './Horizontal'
import PrimaryButton from './PrimaryButton'
import SecondaryButton from './SecondaryButton'
import Spacer from './Spacer'
import Vertical from './Vertical'

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly title: string
  readonly text: string
  readonly icon: AppIconType
  readonly closable?: boolean
  readonly onShareLink?: (inviteCode?: string) => void
  readonly onCopyLink?: (inviteCode?: string) => void
  readonly accessibilitySuffix?: string /* for testing purposes */
  readonly roomId?: string /* statistics  */
  readonly eventId?: string /* statistics  */
}

const InviteBlockView: React.FC<Props> = ({
  style,
  title,
  text,
  icon,
  onShareLink,
  onCopyLink,
  accessibilitySuffix,
  closable = false,
  roomId,
  eventId,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const containerStyle = {backgroundColor: colors.card}
  const copyButtonStyle = {
    backgroundColor: colors.secondaryClickable,
  }
  const contentStyle = {paddingEnd: ms(closable ? 36 : 16)}
  const [closed, setClosed] = useState(storage.isGrowNetworkBlockClosed)
  const isAnimating = useRef(false)
  const layoutHeight = useRef(0)
  const store = useViewModel(() => new MakeInviteStore())

  const onViewLayout = useCallback((e: LayoutChangeEvent) => {
    layoutHeight.current = e.nativeEvent.layout.height
  }, [])

  const opacityValue = useSharedValue(1)
  const translateValue = useSharedValue(-1)

  const fadeAnim = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
      height: translateValue.value > -1 ? translateValue.value : undefined,
    }
  })

  const onClose = async () => {
    logJS('debug', 'InviteBlockView', 'on close invite block')
    analytics.sendEvent('click_close_invite_block')
    await storage.setGrowNetworkBlockClosed()
    isAnimating.current = true
    await animateNumberValues(
      {
        from: 1,
        to: 0,
        duration: 300,
        sharedValue: opacityValue,
        easing: Easing.out(Easing.quad),
      },
      {
        from: layoutHeight.current,
        to: 0,
        duration: 300,
        sharedValue: translateValue,
        easing: Easing.out(Easing.quad),
      },
    )
    isAnimating.current = false
    setClosed(true)
  }

  useEffect(() => {
    if (!store.error) return
    logJS('debug', 'InviteBlockView', 'displaying error', store.error)
    toastHelper.error('somethingWentWrong')
  }, [store.error])

  const onCopy = async () => {
    logJS('debug', 'InviteBlockView', 'on copy invite link')
    analytics.sendEvent('click_copy_invite_link', {roomId, eventId})
    const username = storage.currentUser?.username
    if (!username) return
    await runWithLoaderAsync(store.createInviteCode)
    if (store.inviteCode) {
      if (onCopyLink) {
        onCopyLink(store.inviteCode)
      } else {
        Clipboard.setString(
          getProfileLink(username, store.inviteCode, 'share_invite'),
        )
      }
      toastHelper.success('linkCopied', true)
    }
  }

  const onSendLink = async () => {
    logJS('debug', 'InviteBlockView', 'on send invite link')
    analytics.sendEvent('click_send_invite_link', {roomId, eventId})
    const username = storage.currentUser?.username
    if (!username) return
    await runWithLoaderAsync(store.createInviteCode)
    if (store.inviteCode) {
      if (onShareLink) {
        onShareLink(store.inviteCode)
      } else {
        shareLink(getProfileLink(username, store.inviteCode, 'share_invite'))
      }
    }
  }

  if (closable && closed && !isAnimating.current) return null

  return (
    <Animated.View
      style={[styles.container, containerStyle, fadeAnim, style]}
      onLayout={onViewLayout}>
      <AppIcon type={icon} style={styles.icon} />
      <Vertical style={[styles.contentBase, contentStyle]}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.text}>{text}</AppText>
        <Horizontal>
          <SecondaryButton
            accessibilityLabel={'copyToBufferButton' + accessibilitySuffix}
            style={[styles.copyButton, copyButtonStyle]}
            textStyle={styles.buttonText}
            iconLeft={
              <AppIcon
                type={'icCopyToBuffer'}
                style={styles.copyIcon}
                tint={colors.primaryClickable}
              />
            }
            title={t('copy')}
            onPress={onCopy}
          />
          <PrimaryButton
            accessibilityLabel={'sendLinkButton' + accessibilitySuffix}
            style={[styles.sendButton]}
            textStyle={styles.buttonText}
            title={t('sendLink')}
            onPress={onSendLink}
          />
        </Horizontal>
        <Spacer vertical={ms(16)} />
      </Vertical>
      {closable && (
        <AppTouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AppIcon type={'icClear'} />
        </AppTouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: ms(8),
    paddingHorizontal: ms(18),
  },
  contentBase: {
    paddingTop: ms(16),
    paddingStart: ms(14),
  },
  icon: {
    width: ms(24),
    height: ms(24),
    marginTop: ms(20),
  },
  title: {
    paddingEnd: ms(18),
    ...makeTextStyle(18, 20, 'bold'),
  },
  text: {
    paddingEnd: ms(18),
    ...makeTextStyle(14, 21, 'normal'),
  },
  copyButton: {
    height: ms(28),
    marginTop: ms(12),
    minWidth: 0,
    paddingHorizontal: ms(12),
    borderRadius: ms(14),
  },
  buttonText: {
    ...makeTextStyle(12, 18, 'bold'),
  },
  sendButton: {
    height: ms(28),
    marginTop: ms(12),
    minWidth: 0,
    marginStart: ms(12),
    borderRadius: ms(14),
    paddingHorizontal: ms(12),
  },
  copyIcon: {
    marginEnd: ms(4),
  },
  closeButton: {
    position: 'absolute',
    right: ms(16),
    top: ms(16),
  },
})

export default memo(InviteBlockView)
