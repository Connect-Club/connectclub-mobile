import React, {memo, useContext, useEffect, useRef} from 'react'
import {Platform} from 'react-native'
import {hasGms} from 'react-native-device-info'

import {api} from '../../../api/api'
import {
  appEventEmitter,
  goToClub,
  goToClubModerate,
  goToRoom,
  showEventDialog,
} from '../../../appEventEmitter'
import buildConfig from '../../../buildConfig'
import {storage} from '../../../storage'
import MyCountersStore from '../../../stores/MyCountersStore'
import {toastHelper} from '../../../utils/ToastHelper'
import {messaging} from '../../webSafeImports/webSafeImports'
import {
  NotificationClubJoinRequestApproved,
  NotificationEventSchedule,
  NotificationInvitedToClub,
  NotificationNewUserAskInvite,
  NotificationUserRegisteredByInviteCode,
  NotificationVideoRoom,
} from '../room/models/jsonModels'
import {logJS} from '../room/modules/Logger'

const PushHandler: React.FC = () => {
  const countersStore = useContext(MyCountersStore)

  const startedRoomRef = useRef<string | null>(null)

  useEffect(() => {
    let foreGround: (() => void) | undefined
    let openNotifApp: (() => void) | undefined

    const setupHandlers = async () => {
      if (Platform.OS === 'android' && !(await hasGms())) {
        return logJS('warning', 'GMS is not available to PushHandler')
      }
      const onNotificationOpenedApp = (message: any) => {
        const type = message?.data?.type
        if (type && !__DEV__) {
          api.notificationStatistics(message?.data?.notificationId ?? type)
        }
        logJS('debug', 'PushHandler', 'notification opened', type)
        const clubId = message?.data?.clubId
        switch (type) {
          case 'event-schedule':
          case 'registered-as-speaker':
            const eventScheduleId = message?.data?.eventScheduleId
            if (!eventScheduleId) return
            showEventDialog(eventScheduleId)
            return
          case 'new-club-invite':
          case 'join-request-was-approved':
            if (!clubId) return
            goToClub({clubId})
            return
          case 'new-join-request':
            if (!clubId) return
            goToClubModerate({clubId})
            return
        }
        const room = message.data?.videoRoomId
        const pswd = message.data?.videoRoomPassword
        if (!room || !pswd) {
          logJS('debug', 'PushHandler', 'notification data ignored')
          return
        }
        goToRoom({room, pswd, eventId: null})
      }

      const processMessage = (
        data: any,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (foreground) countersStore.updateCounters()
        let logMessage: string
        switch (data.type) {
          case 'event-schedule':
            logMessage = '📬'
            processEventScheduleNotification(data, notification, foreground)
            break
          case 'new-user-ask-invite':
            logMessage = '📬'
            processNewUserAskInviteNotification(data, notification, foreground)
            break
          case 'video-room':
            logMessage = '📬'
            processVideoRoomNotification(data, notification, foreground)
            break
          case 'join-the-room':
            logMessage = '📬'
            processVideoRoomNotification(data, notification, foreground)
            break
          case 'join-request-was-approved':
            logMessage = '📬'
            processApprovedToClubNotification(data, notification, foreground)
            break
          case 'let-you-in':
            logMessage = '📬'
            processInviteReceivedNotification(notification, foreground)
            break
          case 'new-join-request':
            logMessage = '📬'
            processClubRequestNotification(data, notification, foreground)
            break
          case 'registered-as-speaker':
            logMessage = '📬'
            processRegisteredAsSpeakerNotification(
              data,
              notification,
              foreground,
            )
            break
          case 'new-user-registered-by-invite-code':
            logMessage = '📬'
            processUserRegisteredByInviteCodeNotification(
              data,
              notification,
              foreground,
            )
            break
          case 'new-club-invite':
            logMessage = '📬'
            processInvitedToClubNotification(data, notification, foreground)
            break
          default:
            logMessage = 'Unknown event type'
        }
        logJS(
          'info',
          logMessage,
          'Foreground:',
          foreground,
          'Type',
          data.type,
          'Current user id:',
          storage.currentUser?.id,
          'data',
          data ? JSON.stringify(data) : data,
          JSON.stringify(notification),
        )
      }

      const processVideoRoomNotification = (
        data: NotificationVideoRoom,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processVideoRoomNotification because of in background',
          )
          return
        }
        if (
          startedRoomRef.current !== null &&
          data.videoRoomId === startedRoomRef.current
        ) {
          logJS(
            'info',
            'skip processVideoRoomNotification because of in current room',
          )
          return
        }
        logJS(
          'info',
          'processVideoRoomNotification',
          startedRoomRef.current,
          data,
        )
        toastHelper.showGoToRoomToast({
          roomParams: {
            room: data.videoRoomId,
            pswd: data.videoRoomPassword,
            eventId: null,
          },
          title: data.title,
          body: notification?.body,
          leftImage: data.largeIcon,
          rightImage: data.largeImage,
        })
      }

      const processNewUserAskInviteNotification = (
        data: NotificationNewUserAskInvite,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processNewUserAskInviteNotification because of in background',
          )
          return
        }
        toastHelper.showAskInviteToast({
          title: data.title,
          body: notification?.body,
          phone: data.phone,
          leftImage: data.largeIcon,
          rightImage: data.largeImage,
        })
      }

      const processEventScheduleNotification = (
        // @ts-ignore
        data: NotificationEventSchedule,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processEventScheduleNotification because of in background',
          )
          return
        }
        toastHelper.showEventScheduleToast(
          data?.eventScheduleId,
          notification?.body,
          data?.specific_key,
          data?.title,
          data.largeIcon,
          data.largeImage,
        )
      }

      const processRegisteredAsSpeakerNotification = (
        // @ts-ignore
        data: NotificationEventSchedule,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processRegisteredAsSpeakerNotification because of in background',
          )
          return
        }
        toastHelper.showEventScheduleToast(notification?.body, data?.title)
      }

      const processInviteReceivedNotification = (
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processInviteReceivedNotification because of in background',
          )
          return
        }
        toastHelper.success(notification.body, false)
      }

      const processApprovedToClubNotification = (
        // @ts-ignore
        data: NotificationClubJoinRequestApproved,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processApprovedToClubNotification because of in background',
          )
          return
        }
        toastHelper.showJoinRequestApprovedToast({
          body: notification.body,
          clubId: data.clubId,
          title: data.title,
          leftImage: data.largeIcon,
          rightImage: data.largeImage,
        })
      }

      const processClubRequestNotification = (
        // @ts-ignore
        data: NotificationClubJoinRequestApproved,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processClubRequestNotification because of in background',
          )
          return
        }
        toastHelper.showClubRequestToast({
          body: notification.body,
          clubId: data.clubId,
          title: data.title,
          leftImage: data.largeIcon,
          rightImage: data.largeImage,
        })
      }

      const processUserRegisteredByInviteCodeNotification = (
        data: NotificationUserRegisteredByInviteCode,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processUserRegisteredByInviteCodeNotification because of in background',
          )
          return
        }
        toastHelper.showUserRegisteredWithInviteCodeToast({
          body: notification.body,
          userId: data.userId,
          title: data.title,
          image: data.largeIcon,
        })
      }

      const processInvitedToClubNotification = (
        // @ts-ignore
        data: NotificationInvitedToClub,
        notification: any | undefined,
        foreground: boolean,
      ) => {
        if (!foreground) {
          logJS(
            'info',
            'skip processInvitedToClubNotification because of in background',
          )
          return
        }
        toastHelper.showInvitedToClubRequestToast({
          title: notification.title,
          body: notification.body,
          clubId: data.clubId,
          leftImage: data.largeImage,
          rightImage: data.largeIcon,
        })
      }

      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            onNotificationOpenedApp(remoteMessage)
          }
        })
      messaging().setBackgroundMessageHandler(async (message) => {
        if (!message.data) return
        if (buildConfig.releaseStage !== 'production') {
          logJS(
            'debug',
            'PushHandler',
            'received notification in background',
            JSON.stringify(message.data),
            JSON.stringify(message.notification),
          )
        }
        processMessage(message.data, message.notification, false)
      })
      foreGround = messaging().onMessage((message: any) => {
        if (!message.data) return
        if (buildConfig.releaseStage !== 'production') {
          logJS(
            'debug',
            'PushHandler',
            'received notification in foreground',
            JSON.stringify(message.data),
            JSON.stringify(message.notification),
          )
        }
        processMessage(message.data, message.notification, true)
      })
      openNotifApp = messaging().onNotificationOpenedApp(
        onNotificationOpenedApp,
      )
    }

    setupHandlers()

    const listener = appEventEmitter.once('setActiveRoom', (roomId: string) => {
      logJS('debug', 'setActiveRoom roomId:', roomId)
      startedRoomRef.current = roomId
    })

    const leaveListener = appEventEmitter.once('endRoom', () => {
      logJS('info', 'endRoom')
      startedRoomRef.current = null
    })

    return () => {
      foreGround?.()
      openNotifApp?.()
      leaveListener?.()
      listener()
    }
  }, [countersStore])

  return null
}

export default memo(PushHandler)
