import {PermissionsAndroid, Platform} from 'react-native'
import Contacts, {PhoneNumber} from 'react-native-contacts'

import {ContactModel} from '../models'
import {storage} from '../storage'
import {profileFullName} from './userHelper'

let contactsCache: Array<ContactModel> = []

const contactsUtils = {
  checkContactsPermissions: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      return PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      )
    }

    return (await Contacts.checkPermission()) === 'authorized'
  },

  requestContactsPermissions: async (): Promise<
    'authorized' | 'denied' | 'never_ask_again'
  > => {
    const response:
      | 'granted'
      | 'denied'
      | 'never_ask_again'
      | 'authorized'
      | 'undefined' =
      Platform.OS === 'android'
        ? await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          )
        : await Contacts.requestPermission()

    console.log('🐔 per:', response)
    switch (response) {
      case 'authorized':
      case 'granted':
        storage.clearDontAskPermissionDidSelected()
        return 'authorized'
      case 'denied':
      case 'undefined':
        storage.dontAskPermissionDidSelected()
        return 'denied'
      case 'never_ask_again':
        storage.dontAskPermissionDidSelected()
        return 'never_ask_again'
    }
  },

  fetchContactsFromPhone: async (
    force: boolean,
  ): Promise<Array<ContactModel>> => {
    if (!force && contactsCache.length > 0) return [...contactsCache]
    const contacts = await Contacts.getAll()

    const phones = (p: PhoneNumber) => p.number
    const id = (p: PhoneNumber) => p.number
    const data = contacts.map((c) => ({
      fullName: profileFullName(c.givenName, c.familyName),
      phoneNumbers: c.phoneNumbers.map(phones),
      id: c.phoneNumbers.map(id).join(','),
      thumbnail: c.hasThumbnail ? c.thumbnailPath : undefined,
    }))
    contactsCache = [...data]
    return [...data]
  },
}

export default contactsUtils
