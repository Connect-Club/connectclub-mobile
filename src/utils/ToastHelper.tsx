import {TFunction} from 'i18next'
import React, {PropsWithChildren, ReactNode, useState} from 'react'
import {StatusBar, StyleSheet, View} from 'react-native'
import {Notifier, NotifierComponents} from 'react-native-notifier'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {QueueMode} from 'react-native-notifier/src/types'

import AskGoToRoomToastView from '../components/common/AskGoToRoomToastView'
import AskInviteToastView from '../components/common/AskInviteToastView'
import ClubRequestToastView from '../components/common/ClubRequestToastView'
import CustomImageToastView from '../components/common/CustomImageToastView'
import EventScheduleToastView from '../components/common/EventScheduleToastView'
import InvitedToClubToastView from '../components/common/InvitedToClubToastView'
import JoinRequestApprovedToastView from '../components/common/JoinRequestApprovedToastView'
import ReleaseNotesToastView from '../components/common/ReleaseNotesToastView'
import UserRegisteredByInviteToastView from '../components/common/UserRegisteredByInviteCodeToastView'
import HandRequestToastView from '../components/screens/room/HandRequestToastView'
import {RaiseHandRequestType} from '../components/screens/room/jitsi/WsDelegate'
import ReconnectingToastView from '../components/screens/room/ReconnectingToastView'
import i18n from '../i18n'
import {
  AskGoToRoomParams,
  AskInviteParams,
  InvitedToClubToastParams,
  JoinRequestApprovedToastParams,
  UserRegisteredWithInviteCodeToastParams,
} from '../models'
import {INTERESTS_LIMIT} from '../stores/InterestsStore'
import {useTheme} from '../theme/appTheme'
import {decodeHtmlEntities} from './stringHelpers'

const SHOW_ANIMATION_DURATION = 200
const DEFAULT_SUCCESS_TOAST_ID = 'successId'
const DEFAULT_ERROR_TOAST_ID = 'errorId'
const DEFAULT_CUSTOM_TOAST_ID = 'customId'
const HAND_REQUEST_TOAST_ID = 'handRequestToastId'
const ASK_GO_TO_ROOM_TOAST_ID = 'askGoToRoomToastId'
const ASK_INVITE_TOAST_ID = 'askInviteToastId'
const RECONNECTING_TOAST_ID = 'reconnectingToastId'

type AlertType = 'success' | 'error' | 'info'

interface AlertOptions {
  readonly id: string
  /** @default false */
  readonly strong?: boolean
  readonly title?: string
  readonly message: string
  readonly queueMode: QueueMode
  readonly type: AlertType
  readonly translate: boolean
  /** @default false */
  readonly hideOnPress?: boolean
  /** @default [DEFAULT_DURATION] */
  readonly duration?: number
  /** @default false */
  readonly swipeEnabled?: boolean
  /** @default [<NotifierComponents.Alert />] */
  readonly content?: ReactNode
  /** @default depends on [type] */
  readonly backgroundColor?: string
  /**
   * It won't hide current toast if a toast with same id is already shown
   * @default false */
  readonly skipAlreadyShown?: boolean
  /** It won't hide current toast if a toast with same id is already in queue
   * @default false */
  skipAlreadyInQueue?: boolean
}

interface CustomOptions {
  /** @default [DEFAULT_CUSTOM_TOAST_ID] */
  readonly id?: string
  /** @default false */
  readonly strong?: boolean
  /** @default 'standby' */
  readonly queueMode?: QueueMode
  /** @default [DEFAULT_DURATION] */
  readonly duration?: number
  /** @default 'success' */
  readonly type?: AlertType
  /** @default false */
  readonly translate?: boolean
  /** @default false */
  readonly hideOnPress?: boolean
  /** @default false */
  readonly swipeEnabled?: boolean
  /** @default depends on [type] */
  readonly backgroundColor?: string
  /**
   * It won't hide current toast if a toast with same id is already shown
   * @default true if an id is defined, otherwise false */
  readonly skipAlreadyShown?: boolean
  /** It won't hide current toast if a toast with same id is already in queue
   * @default false */
  skipAlreadyInQueue?: boolean
}

interface AlertComponentProps {
  alertType: AlertType
  backgroundColor?: string
  textColor?: string
}

const CCAlert: React.FC<PropsWithChildren<AlertComponentProps>> = (props) => {
  const inset = useSafeAreaInsets()
  const {colors} = useTheme()
  const [bgColors] = useState<{[key: string]: string}>(() => ({
    error: colors.warning,
    warn: colors.warning,
    info: colors.accentPrimary,
    success: colors.success,
  }))
  const children = props.children
  const bgColor =
    props.backgroundColor ?? bgColors[props.alertType] ?? colors.success
  return (
    <View
      style={{
        paddingTop: inset.top,
        backgroundColor: bgColor,
      }}>
      {!children && (
        <NotifierComponents.Alert
          titleStyle={styles.description}
          descriptionStyle={styles.description}
          {...props}
          backgroundColor={'transparent'}
        />
      )}
      {children && children}
      <StatusBar
        barStyle='light-content'
        translucent={true}
        backgroundColor={'transparent'}
      />
    </View>
  )
}

const DEFAULT_DURATION = 4000

class ToastHelper {
  private t: TFunction = (key: string, options?: any) => i18n.t(key, options)

  success = (
    message: string,
    translate: boolean = false,
    extraOptions?: {
      id?: string
      duration?: number
      queueMode?: QueueMode
      strong?: boolean
    },
  ) => {
    this.alert({
      id: extraOptions?.id ?? DEFAULT_SUCCESS_TOAST_ID,
      message: decodeHtmlEntities(message),
      queueMode: extraOptions?.queueMode ?? 'standby',
      type: 'success',
      translate,
      hideOnPress: true,
      swipeEnabled: true,
      duration: extraOptions?.duration,
      strong: extraOptions?.strong,
    })
  }

  error = (message: string, translate: boolean = true) => {
    this.alert({
      id: DEFAULT_ERROR_TOAST_ID,
      message: message.toString(),
      queueMode: 'immediateMoveOnlyStrong',
      type: 'error',
      translate,
      hideOnPress: true,
      swipeEnabled: true,
    })
  }

  warn = (message: string, translate: boolean = true) => {
    this.alert({
      id: DEFAULT_ERROR_TOAST_ID,
      message,
      queueMode: 'immediateMoveOnlyStrong',
      type: 'error',
      translate,
      hideOnPress: true,
      swipeEnabled: true,
    })
  }

  interestsLimit = () => {
    this.error(
      this.t('upToLimitInterestsMessage', {limit: INTERESTS_LIMIT}),
      false,
    )
  }

  custom = (content: ReactNode, options?: CustomOptions) => {
    this.alert({
      id: options?.id ?? DEFAULT_CUSTOM_TOAST_ID,
      strong: options?.strong,
      message: '',
      queueMode: options?.queueMode ?? 'standby',
      type: options?.type ?? 'success',
      translate: options?.translate ?? false,
      hideOnPress: options?.hideOnPress ?? false,
      swipeEnabled: options?.swipeEnabled ?? false,
      duration: options?.duration ?? DEFAULT_DURATION,
      content: content,
      backgroundColor: options?.backgroundColor,
      skipAlreadyShown: options?.skipAlreadyShown ?? false,
      skipAlreadyInQueue: options?.skipAlreadyInQueue,
    })
  }

  clearAll = () => {
    Notifier.clearQueue(true)
  }

  clearByToastId = (toastId: string) => {
    Notifier.clearNotificationById(toastId, true)
  }

  hideByToastId = (toastId: string) => {
    Notifier.hideNotificationById(toastId)
  }

  showAbsoluteSpeakerToast = (name: string) => {
    this.success(this.t('becomeAbsoluteSpeakerToast', {name}))
  }

  showHandRequestToast = (
    id: string,
    name: string,
    type: RaiseHandRequestType,
    callToStage: () => void,
    moveToStage: () => void,
    declineStageCall: (id: string) => void,
  ) => {
    this.custom(
      <HandRequestToastView
        id={id}
        name={name}
        type={type}
        callToStage={callToStage}
        moveToStage={moveToStage}
        declineStageCall={declineStageCall}
      />,
      {
        id: `${HAND_REQUEST_TOAST_ID}-${id}`,
        duration: type === 'request' ? 10000 : 0,
        queueMode: 'immediate',
        strong: type !== 'request',
        skipAlreadyShown: true,
      },
    )
  }

  hideHandRequestToast = (userId: string) => {
    this.clearByToastId(`${HAND_REQUEST_TOAST_ID}-${userId}`)
  }

  showDeclineStageCallToast = (userId: string, name: string) => {
    this.custom(
      <CustomImageToastView
        toastId={`${HAND_REQUEST_TOAST_ID}-${userId}`}
        body={this.t('toastRaisedHandDecline', {name: name})}
      />,
      {
        id: `${HAND_REQUEST_TOAST_ID}-${userId}`,
        queueMode: 'immediateMoveOnlyStrong',
        type: 'info',
        translate: true,
        duration: 10000,
        swipeEnabled: true,
        backgroundColor: 'rgba(158, 158, 158, 1)',
        skipAlreadyShown: true,
        skipAlreadyInQueue: true,
        strong: false,
      },
    )
  }

  showEventScheduleToast = (
    eventId: string,
    message: string,
    eventType?: string,
    title?: string,
    leftImage?: any,
    rightImage?: any,
  ) => {
    this.custom(
      <EventScheduleToastView
        toastId={DEFAULT_SUCCESS_TOAST_ID}
        title={title ?? ''}
        body={message}
        leftImage={leftImage}
        rightImage={rightImage}
        eventId={eventId}
        eventType={eventType}
      />,
      {
        id: DEFAULT_SUCCESS_TOAST_ID,
        queueMode: 'next',
        type: 'success',
        translate: false,
        hideOnPress: true,
        swipeEnabled: true,
        duration: 10000,
      },
    )
  }

  showGoToRoomToast = (params: AskGoToRoomParams) => {
    const toastId = ASK_GO_TO_ROOM_TOAST_ID
    this.custom(<AskGoToRoomToastView toastId={toastId} {...params} />, {
      id: toastId,
      duration: 0,
      queueMode: 'immediate',
      strong: true,
    })
  }

  showAskInviteToast = (params: AskInviteParams) => {
    const toastId = ASK_INVITE_TOAST_ID
    this.custom(<AskInviteToastView toastId={toastId} {...params} />, {
      id: toastId,
      duration: 0,
      queueMode: 'next',
      strong: true,
    })
  }

  showJoinRequestApprovedToast = (params: JoinRequestApprovedToastParams) => {
    this.custom(
      <JoinRequestApprovedToastView
        {...params}
        toastId={DEFAULT_SUCCESS_TOAST_ID}
      />,
      {
        id: DEFAULT_SUCCESS_TOAST_ID,
        queueMode: 'immediate',
        type: 'success',
        translate: false,
        hideOnPress: true,
        swipeEnabled: true,
        duration: 10000,
      },
    )
  }

  showClubRequestToast = (params: JoinRequestApprovedToastParams) => {
    const toastId = DEFAULT_SUCCESS_TOAST_ID
    this.custom(<ClubRequestToastView toastId={toastId} {...params} />, {
      id: toastId,
      queueMode: 'immediate',
      type: 'success',
      translate: false,
      hideOnPress: true,
      swipeEnabled: true,
      duration: 10000,
    })
  }

  showReleaseNotesToast = () => {
    const toastId = DEFAULT_SUCCESS_TOAST_ID
    this.custom(<ReleaseNotesToastView toastId={toastId} />, {
      id: toastId,
      queueMode: 'next',
      type: 'success',
      translate: false,
      hideOnPress: false,
      swipeEnabled: true,
      duration: 0,
    })
  }

  showInvitedToClubRequestToast = (params: InvitedToClubToastParams) => {
    const toastId = DEFAULT_SUCCESS_TOAST_ID
    this.custom(<InvitedToClubToastView toastId={toastId} {...params} />, {
      id: toastId,
      queueMode: 'immediate',
      type: 'success',
      translate: false,
      hideOnPress: true,
      swipeEnabled: true,
      duration: 10000,
    })
  }

  showUserRegisteredWithInviteCodeToast = (
    params: UserRegisteredWithInviteCodeToastParams,
  ) => {
    const toastId = DEFAULT_SUCCESS_TOAST_ID
    this.custom(
      <UserRegisteredByInviteToastView toastId={toastId} {...params} />,
      {
        id: toastId,
        queueMode: 'immediate',
        type: 'success',
        translate: false,
        hideOnPress: true,
        swipeEnabled: true,
        duration: 10000,
      },
    )
  }

  showSilentModeOn = (message: string) => {
    this.custom(
      <CustomImageToastView
        toastId={DEFAULT_CUSTOM_TOAST_ID}
        title={this.t('silentModeOnToast')}
        body={this.t(message)}
      />,
      {
        queueMode: 'immediate',
        type: 'info',
        translate: true,
        duration: 10000,
        skipAlreadyShown: false,
        backgroundColor: 'rgba(158, 158, 158, 1)',
        swipeEnabled: true,
      },
    )
  }

  showSilentModeOff = (message: string) => {
    this.custom(
      <CustomImageToastView
        toastId={DEFAULT_CUSTOM_TOAST_ID}
        title={this.t('silentModeOffToast')}
        body={this.t(message)}
      />,
      {
        queueMode: 'immediate',
        type: 'success',
        translate: true,
        duration: 10000,
        skipAlreadyShown: false,
        hideOnPress: true,
        swipeEnabled: true,
      },
    )
  }

  showReconnectingToast = () => {
    this.custom(<ReconnectingToastView />, {
      id: RECONNECTING_TOAST_ID,
      queueMode: 'immediateMoveOnlyStrong',
      type: 'info',
      translate: true,
      duration: 0,
      backgroundColor: 'rgba(158, 158, 158, 1)',
      skipAlreadyShown: true,
      skipAlreadyInQueue: true,
      strong: true,
    })
  }

  hideReconnectingToast = () => {
    this.clearByToastId(RECONNECTING_TOAST_ID)
  }

  private alert = (options: AlertOptions) => {
    let text: string = options.message
    if (options.translate) {
      const replaced = options.message.replace(/\.|:/g, '_')
      text = this.t(replaced)
    }
    Notifier.showNotification({
      id: options.id,
      strong: options.strong,
      showAnimationDuration: SHOW_ANIMATION_DURATION,
      Component: CCAlert,
      componentProps: {
        alertType: options.type,
        children: options.content,
        backgroundColor: options.backgroundColor,
      },
      hideOnPress: options.hideOnPress ?? false,
      title: options.title,
      description: text,
      duration: options.duration ?? DEFAULT_DURATION,
      queueMode: options.queueMode,
      swipeEnabled: options.swipeEnabled ?? false,
      skipAlreadyShown: options.skipAlreadyShown,
      skipAlreadyInQueue: options.skipAlreadyInQueue,
    })
  }
}

export const toastHelper = new ToastHelper()

const styles = StyleSheet.create({
  description: {
    textAlign: 'left',
  },
})
