import {observer} from 'mobx-react'
import React, {useCallback, useContext, useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native'

import {api} from '../../../api/api'
import {hideLoading, showLoading} from '../../../appEventEmitter'
import AppIcon, {AppIconType} from '../../../assets/AppIcon'
import {UserModel} from '../../../models'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {DialogContext} from '../../common/AskDialog'

export type ConnectionState =
  | 'NotConnected'
  | 'IRequested'
  | 'TheyRequested'
  | 'Connected'
interface Option {
  readonly title: string
  readonly buttonStyle: StyleProp<ViewStyle>
  readonly textStyle: StyleProp<TextStyle>
  readonly icon: AppIconType | undefined
}

export type CustomTitles = {[key in ConnectionState]?: string}

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly mode: 'profile' | 'list' | 'activity'
  readonly user: UserModel
  readonly onFollowingStateChanged?: (isFollowing: boolean) => void
  readonly onConnectEstablished?: () => void
  readonly customTitles?: CustomTitles
}

const ConnectButton: React.FC<Props> = ({
  style,
  mode,
  user,
  onFollowingStateChanged,
  customTitles,
  onConnectEstablished,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const [isLoading, setLoading] = useState(false)

  const askUnfollowDialog = useContext(DialogContext)
  const {baseButtonStyle, baseTextStyle} = useMemo(
    () => ({
      baseButtonStyle: {
        minWidth: mode === 'profile' ? ms(136) : ms(102),
        height: mode === 'profile' ? ms(38) : ms(28),
      },
      baseTextStyle: makeTextStyle(
        ms(mode === 'profile' ? 15 : 12),
        ms(18),
        '600',
      ),
    }),
    [mode],
  )
  const variants = useMemo(
    () =>
      new Map<ConnectionState, Option>([
        [
          'NotConnected',
          {
            title:
              customTitles?.NotConnected ?? t('connectButtonStateNotConnected'),
            buttonStyle: {
              ...baseButtonStyle,
              backgroundColor: colors.primaryClickable,
            },
            textStyle: {...baseTextStyle, color: colors.floatingBackground},
            icon: 'icConnectStatusNotConnected',
          },
        ],
        [
          'IRequested',
          {
            title:
              customTitles?.IRequested ?? t('connectButtonStateIRequested'),
            buttonStyle: {
              ...baseButtonStyle,
              backgroundColor: colors.secondaryClickable,
            },
            textStyle: {...baseTextStyle, color: colors.primaryClickable},
            icon: 'icConnectStatusIRequested',
          },
        ],
        [
          'TheyRequested',
          {
            title:
              customTitles?.TheyRequested ??
              t('connectButtonStateTheyRequested'),
            buttonStyle: {
              ...baseButtonStyle,
              backgroundColor: colors.primaryClickable,
            },
            textStyle: {...baseTextStyle, color: colors.floatingBackground},
            icon: 'icConnectStatusTheyRequested',
          },
        ],
        [
          'Connected',
          {
            title: customTitles?.Connected ?? t('connectButtonStateConnected'),
            buttonStyle: {
              ...baseButtonStyle,
              backgroundColor: colors.secondaryClickable,
            },
            textStyle: {...baseTextStyle, color: colors.primaryClickable},
            icon: 'icConnectStatusConnected',
          },
        ],
      ]),
    [customTitles, baseButtonStyle, baseTextStyle, colors, t],
  )

  const doUnFollow = useCallback(async () => {
    const isAllow = await askUnfollowDialog?.showAskUnfollow?.({
      avatar: user.avatar ?? '',
      displayName: user.displayName,
    })
    if (!isAllow) return
    setLoading(true)
    showLoading()
    const response = await api.unfollow(user.id)
    hideLoading()
    setLoading(false)
    if (response.error) return toastHelper.error(response.error)
    onFollowingStateChanged?.(false)
  }, [user, onFollowingStateChanged, askUnfollowDialog])

  const doFollow = useCallback(async () => {
    setLoading(true)
    showLoading()
    const response = await api.follow([user.id])
    hideLoading()
    setLoading(false)
    if (response.error) return toastHelper.error(response.error)
    onFollowingStateChanged?.(true)
  }, [user, onFollowingStateChanged])

  const state = getConnectionState(user)
  const {title, buttonStyle, textStyle, icon} = variants.get(state)!

  const onPress = useCallback(() => {
    switch (state) {
      case 'NotConnected':
        return doFollow()
      case 'IRequested':
        return doUnFollow()
      case 'TheyRequested':
        onConnectEstablished?.()
        return doFollow()
      case 'Connected':
        return doUnFollow()
    }
  }, [state, doFollow, doUnFollow, onConnectEstablished])

  return (
    <AppTouchableOpacity
      style={[styles.button, buttonStyle, style]}
      onPress={onPress}>
      <AppText style={[styles.buttonText, textStyle]}>
        {isLoading ? t('loading') : title}
      </AppText>
      {!!icon && mode !== 'activity' && (
        <AppIcon type={icon} style={styles.icon} />
      )}
    </AppTouchableOpacity>
  )
}

export default observer(ConnectButton)

const styles = StyleSheet.create({
  button: {
    borderRadius: ms(100),
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    alignSelf: 'center',
    lineHeight: ms(18),
  },
  icon: {
    alignSelf: 'center',
    marginStart: ms(8),
  },
})

export const getConnectionState = (user: UserModel): ConnectionState => {
  if (user.isFollowing && user.isFollows) return 'Connected'
  if (!user.isFollowing && !user.isFollows) return 'NotConnected'
  if (user.isFollowing) return 'IRequested'
  return 'TheyRequested'
}
