import {NativeModules} from 'react-native'

import {logError} from '../../../../utils/log.utils'

export type DebugLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error'

function getConsoleSign(level: DebugLevel) {
  switch (level) {
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    default:
      return ''
  }
}

export function logJS(
  level: DebugLevel = 'debug',
  message: string,
  ...data: any[]
) {
  if (__DEV__) console.log(getConsoleSign(level), message, ...data)
  const logString: string = `${message} ${data.join(', ')}`
  if (level === 'error') logError(new Error(logString))
  NativeModules.Logger.logJS(logString, level)
}
