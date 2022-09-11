import {Event} from '@bugsnag/react-native'
import {toJS} from 'mobx'
import {useEffect, useRef} from 'react'
import {NativeModules} from 'react-native'
import uuid from 'react-native-uuid'

import buildConfig from '../buildConfig'
import {logJS} from '../components/screens/room/modules/Logger'
import {storage} from '../storage'

const isDev = buildConfig.buildType === 'dev'

const useWhyDidYouUpdateInternal = (name: string, props: any) => {
  const previousProps = useRef<any>({})
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({...previousProps.current, ...props})
      const changesObj: {[key: string]: any} = {}
      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: toJS(previousProps.current[key]),
            to: toJS(props[key]),
          }
        }
      })
      if (Object.keys(changesObj).length) {
        logJS(
          'warning',
          '[why-did-you-update]',
          name,
          JSON.stringify(changesObj),
        )
      }
    }
    // Finally update previousProps with current props for next hook call
    previousProps.current = props
  })
}

/**
 * Print props comparison on every component update
 * https://usehooks.com/useWhyDidYouUpdate/
 * @param name component name
 * @param props current component props
 */
const useWhyDidYouUpdate = (name: string, props: any) => {
  if (!isDev) {
    return console.warn(
      'useWhyDidYouUpdate should not be used in non-development environment',
    )
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useWhyDidYouUpdateInternal(name, props)
}

const useLogRenderCountDev = (name: string) => {
  const counter = useRef(0)
  if (counter.current === 0) {
    console.log('🌷 --- \n')
  }
  counter.current++
  console.log(`🌷 render ${name} , times: ${counter.current}`)
  useEffect(() => {
    return () => {
      console.log(`🌷 removed ${name}\n🌷 ---`)
    }
  }, [name])
}
const useLogRenderCount = isDev ? useLogRenderCountDev : () => {}

export const attachLogToBugsnag = async (event: Event) => {
  if (event.severity !== 'error') return
  logJS(
    'debug',
    'attachLogToBugsnag',
    'received error event from bugsnag; generate report id',
  )
  const reportId = String(uuid.v4())
  logJS(
    'debug',
    'attachLogToBugsnag',
    'attach log id to bugsnag report; unhandled?',
    event.unhandled,
    'severity',
    event.severity,
    ';uuid',
    reportId,
  )
  event.addMetadata('log', 'id', reportId)
  storage.setBugsnagReportId(reportId)
  const {AppModule} = NativeModules
  await AppModule.preserveLogFile()
  logJS('debug', 'attachLogToBugsnag', 'preserved log file')
}

export default useWhyDidYouUpdate
export {useLogRenderCount}
