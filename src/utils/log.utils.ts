import Bugsnag from '@bugsnag/react-native'

export function logError(error: any) {
  try {
    if (!__DEV__) Bugsnag.notify(error)
  } catch (e) {}
}
