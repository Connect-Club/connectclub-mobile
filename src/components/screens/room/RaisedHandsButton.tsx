import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {WsCurrentUser} from './models/jsonModels'

interface Props {
  readonly onPress: () => void
  readonly currentUser: WsCurrentUser
  readonly raisedHandsCount: number
  readonly handDown: (type: 'admin' | 'user') => void
  readonly handUp: () => void
  readonly roomId: string | undefined
  readonly eventId: string | undefined
  readonly silentMode: boolean
}

const RaisedHandsButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const isHandRaised = props.currentUser.isHandRaised

  if (!props.currentUser.isAdmin && props.currentUser.mode === 'room')
    return null

  const buttonEnabled = props.currentUser.isAdmin || !props.silentMode

  const onPress = () => {
    if (!buttonEnabled) return
    if (props.currentUser.isAdmin) {
      analytics.sendEvent('click_admin_raised_hands_button', {
        roomId: props.roomId,
        eventId: props.eventId,
      })
      props.onPress()
      return
    }
    if (isHandRaised) {
      analytics.sendEvent('click_hand_down_button', {
        roomId: props.roomId,
        eventId: props.eventId,
      })
      props.handDown('user')
    } else {
      analytics.sendEvent('click_raise_hand_button', {
        roomId: props.roomId,
        eventId: props.eventId,
      })
      props.handUp()
      toastHelper.success('requestToMoveToStageSentToast', true)
    }
  }

  const background = {
    backgroundColor: isHandRaised
      ? colors.accentPrimary
      : colors.floatingBackground,
  }

  const hPadding = {
    paddingHorizontal: props.currentUser.isAdmin ? 0 : ms(12),
  }

  const textColor = {
    color: isHandRaised ? colors.textPrimary : colors.bodyText,
  }

  return (
    <AppTouchableOpacity
      accessibilityLabel={'raisedHandsButton'}
      style={[styles.button, background]}
      shouldVibrateOnClick={buttonEnabled}
      onPress={onPress}>
      <View
        style={[
          styles.container,
          hPadding,
          {opacity: buttonEnabled ? 1 : 0.4},
        ]}>
        <AppIcon
          type={'icRaisedHand'}
          tint={isHandRaised ? colors.textPrimary : colors.bodyText}
        />
        {!props.currentUser.isAdmin && (
          <AppText style={[styles.title, textColor]}>
            {t('sceneButton')}
          </AppText>
        )}
      </View>
      {props.currentUser.isAdmin && props.raisedHandsCount > 0 && (
        <AppText
          style={[
            styles.raisedHandsCount,
            {
              backgroundColor: colors.accentPrimary,
              color: colors.textPrimary,
            },
          ]}>
          {props.raisedHandsCount}
        </AppText>
      )}
    </AppTouchableOpacity>
  )
}

export default observer(RaisedHandsButton)

const styles = StyleSheet.create({
  button: {
    height: ms(48),
    minWidth: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(48) / 2,
    marginStart: ms(16),
  },

  container: {
    paddingHorizontal: isNative ? ms(19) : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    paddingStart: ms(4),
    ...makeTextStyle(ms(15), ms(18), 'bold'),
  },

  raisedHandsCount: {
    fontSize: ms(11),
    fontWeight: 'bold',
    overflow: 'hidden',
    textAlign: 'center',
    height: ms(20),
    minWidth: ms(20),
    lineHeight: ms(20),
    borderRadius: ms(20) / 2,
    position: 'absolute',
    top: 0,
    end: 0,
  },
})
