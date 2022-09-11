import {alert} from '../components/webSafeImports/webSafeImports'
import {Translation} from '../models'

export type LeaveDialogResult = 'cancel' | 'quietly' | 'end'

export const askLeaveAsLastModerator = async (
  t: Translation,
): Promise<LeaveDialogResult> => {
  return new Promise((resolve) => {
    alert(
      t('dialogLastModeratorLeaveRoomTitle'),
      t('dialogLastModeratorLeaveRoomDescription'),
      [
        {
          text: t('dialogLastModeratorLeaveRoomButton'),
          style: 'destructive',
          onPress: () => resolve('end'),
        },
        {
          text: t('cancelButton'),
          onPress: () => resolve('cancel'),
        },
      ],
      {
        onDismiss: () => resolve('cancel'),
      },
    )
  })
}

export const askLeaveAsLastModeratorWithSpeakers = async (
  t: Translation,
): Promise<LeaveDialogResult> => {
  return new Promise((resolve) => {
    alert(
      t('dialogLastModeratorLeaveRoomTitle'),
      t('dialogLastModeratorWithSpeakersLeaveRoomDescription'),
      [
        {
          text: t('dialogLastModeratorLeaveRoomQuietlyButton'),
          onPress: () => resolve('quietly'),
        },
        {
          text: t('dialogLastModeratorEndRoomButton'),
          style: 'destructive',
          onPress: () => resolve('end'),
        },
        {
          text: t('cancelButton'),
          onPress: () => resolve('cancel'),
        },
      ],
      {
        onDismiss: () => resolve('cancel'),
      },
    )
  })
}

export const alertNoNetworkConnection = (callback: () => void) =>
  alert(
    // t('errorNetworkTitle'),
    'Network error',
    // t('errorNetworkDescription'),
    'Please check your network connection',
    [
      {
        // t('retryButton'),
        text: 'Retry',
        style: 'default',
        onPress: callback,
      },
    ],
    {cancelable: false},
  )

export const alertOpenAppSettingsAsk = async (
  t: Translation,
): Promise<boolean> => {
  return new Promise((resolve) => {
    alert(
      t('alertOpenContactSettingsTitle'),
      t('alertOpenContactSettingsDescription'),
      [
        {
          style: 'default',
          text: t('cancelButton'),
          onPress: () => resolve(false),
        },
        {
          style: 'default',
          text: t('toToSettingsButton'),
          onPress: () => resolve(true),
        },
      ],
    )
  })
}

export const askBlockUser = async (t: Translation): Promise<boolean> => {
  return new Promise((resolve, _) => {
    alert(
      t('dialogBlockThisUserTitle'),
      t('dialogBlockThisUserDescription'),
      [
        {
          text: t('cancelButton'),
          onPress: () => resolve(false),
        },
        {
          text: t('blockButton'),
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      {
        onDismiss: () => resolve(false),
      },
    )
  })
}

export const askMakeRoomPublic = async (t: Translation): Promise<boolean> => {
  return new Promise((resolve, _) => {
    alert(
      t('dialogMakeRoomPublicTitle'),
      t('dialogMakeRoomPublicDescription'),
      [
        {
          text: t('cancelButton'),
          onPress: () => resolve(false),
        },
        {
          text: t('ok'),
          onPress: () => resolve(true),
        },
      ],
      {
        onDismiss: () => resolve(false),
      },
    )
  })
}
