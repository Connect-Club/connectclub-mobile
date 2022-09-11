import {Linking, PermissionsAndroid, Platform, Rationale} from 'react-native'
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions'

import {analytics} from '../Analytics'
import {logJS} from '../components/screens/room/modules/Logger'
import {alert} from '../components/webSafeImports/webSafeImports'
import i18n from '../i18n/index'
import {Translation} from '../models'

const devicePermissionUtils = {
  checkHasCameraPermission: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        )
      } else if (Platform.Version === 'ios') {
        return (await check(PERMISSIONS.IOS.CAMERA)) === RESULTS.GRANTED
      }
    } catch (err) {
      logJS('error', 'camera permission:', JSON.stringify(err))
    }
    return false
  },

  requestCameraPermission: async (t: Translation): Promise<boolean> => {
    const rationale: Rationale = {
      title: t('cameraRequestPermissionsTitle'),
      message: t('cameraRequestPermissionsDescription'),
      buttonNegative: t('cameraPermissionsDialogAllow'),
      buttonPositive: t('cameraPermissionsDialogDeny'),
    }
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          rationale,
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          logJS('info', 'You can use the camera')
        } else {
          logJS('warning', 'Camera permission denied:', granted)
        }
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else if (Platform.OS === 'ios') {
        const granted = await request(PERMISSIONS.IOS.CAMERA, rationale)
        return granted === RESULTS.GRANTED
      } else {
        logJS('info', 'non mobile platform check')
        return false
      }
    } catch (error) {
      logJS('error', 'requestCameraPermission', JSON.stringify(error))
      analytics.sendEvent('camera_access_fail', {error})
      return false
    }
  },

  requestMicPermission: async (t: Translation): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: t('micRequestPermissionsTitle'),
            message: t('micRequestPermissionsDescription'),
            buttonNegative: t('micPermissionsDialogAllow'),
            buttonPositive: t('micPermissionsDialogDeny'),
          },
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          logJS('info', 'You can use the microphone')
        } else {
          logJS('warning', 'Microphone permission denied:', granted)
        }
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else if (Platform.OS === 'ios') {
        const granted = await request(PERMISSIONS.IOS.MICROPHONE)
        return granted === RESULTS.GRANTED
      } else {
        logJS('info', 'non mobile platform check')
        return false
      }
    } catch (err) {
      logJS('error', 'requestMicPermission:', JSON.stringify(err))
      return false
    }
  },

  requestBluetoothPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true
    if (Platform.Version < 31) return true
    try {
      // Use the new constant instead of string once become available
      // PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      const granted = await PermissionsAndroid.request(
        'android.permission.BLUETOOTH_CONNECT',
        {
          title: i18n.t('bluetoothRequestPermissionsTitle'),
          message: i18n.t('bluetoothRequestPermissionsDescription'),
          buttonNegative: i18n.t('bluetoothPermissionsDialogAllow'),
          buttonPositive: i18n.t('bluetoothPermissionsDialogDeny'),
        },
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        logJS('info', 'You can use the bluetooth headset')
      } else {
        logJS('warning', 'Bluetooth permission denied:', granted)
      }
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (err) {
      logJS('error', 'requestBluetoothPermission', JSON.stringify(err))
      return false
    }
  },

  requestInitialRoomPermissions: async (t: Translation): Promise<boolean> => {
    if (!(await devicePermissionUtils.requestCameraPermission(t))) {
      alert(t('cameraRequestPermissionsRejected'))
      return false
    }
    if (!(await devicePermissionUtils.requestMicPermission(t))) {
      alert(t('micRequestPermissionsRejected'))
      return false
    }
    return true
  },

  requestPhonePermission: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          {
            title: i18n.t('phonePermissionTitle'),
            message: i18n.t('phonePermissionMessage'),
            buttonNegative: i18n.t('okButton'),
            buttonPositive: i18n.t('dontAllowButton'),
          },
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          logJS('info', 'You can use the phone state')
        } else {
          logJS('warning', 'Phone permission denied:', granted)
        }
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else if (Platform.OS === 'ios') {
        return true
      } else {
        logJS('info', 'non mobile platform check')
        return true
      }
    } catch (err) {
      logJS('error', 'requestPhonePermission', JSON.stringify(err))
      return true
    }
  },

  checkCameraPermissions: async (t: Translation): Promise<boolean> => {
    if (!(await devicePermissionUtils.requestCameraPermission(t))) {
      alert(t('cameraRequestPermissionsRejected'), undefined, [
        {style: 'default', text: t('okButton')},
        {
          style: 'default',
          text: t('openAppSettings'),
          onPress: Linking.openSettings,
        },
      ])
      return false
    }
    return true
  },

  checkAudioPermissions: async (t: Translation): Promise<boolean> => {
    if (!(await devicePermissionUtils.requestMicPermission(t))) {
      alert(t('micRequestPermissionsRejected'), undefined, [
        {style: 'default', text: t('okButton')},
        {
          style: 'default',
          text: t('openAppSettings'),
          onPress: Linking.openSettings,
        },
      ])
      return false
    }
    return true
  },
}

export default devicePermissionUtils
