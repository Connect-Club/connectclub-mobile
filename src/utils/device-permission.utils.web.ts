import {Translation} from '../models'

const devicePermissionUtils = {
  checkHasCameraPermission: async (): Promise<boolean> => {
    return Promise.resolve(true)
  },

  requestCameraPermission: async (t: Translation): Promise<boolean> => {
    return Promise.resolve(true)
  },

  requestMicPermission: async (t: Translation): Promise<boolean> => {
    return Promise.resolve(true)
  },

  requestInitialRoomPermissions: async (t: Translation): Promise<boolean> => {
    return Promise.resolve(true)
  },

  checkAudioPermissions: async (t: Translation): Promise<boolean> => {
    return Promise.resolve(true)
  },

  requestPhonePermission: async (): Promise<boolean> => {
    return Promise.resolve(true)
  },
}

export default devicePermissionUtils
