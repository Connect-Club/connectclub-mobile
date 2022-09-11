import {Platform} from 'react-native'
import {Amplitude, Identify} from 'react-native-amplitude'

import {api} from './api/api'
import buildConfig from './buildConfig'
import {logJS} from './components/screens/room/modules/Logger'
import {CurrentUser, Unknown, UtmLabels} from './models'
import {delay} from './utils/date.utils'
import {isWeb} from './utils/device.utils'

export interface AnalyticsSender {
  sendEvent(eventType: string, eventProps?: Record<string, unknown>): void
}

type Property = [string, any]

type PendingEvent = [eventType: string, eventProps?: Record<string, unknown>]

const amplitudeKey =
  buildConfig.releaseStage === 'staging'
    ? '4b60a0a8667ea48921f95986cf1e2e55'
    : '9eaaf824819a859f6180b3125d8e876b'

class Analytics implements AnalyticsSender {
  private ampInstance = Amplitude.getInstance()

  private isInitialized = false
  private isInitializing = false
  private pendingEvents: Array<PendingEvent> = []
  private _utmLabels?: UtmLabels
  private _landingDeviceId: string | undefined

  get utmLabels(): UtmLabels | undefined {
    return this._utmLabels
  }

  init = async (
    user: CurrentUser | Unknown,
    landingDeviceId: string | undefined = undefined,
  ) => {
    if (__DEV__ || isWeb) return
    if (this.isInitialized) {
      return logJS('debug', 'Analytics already initialized')
    }
    if (this.isInitializing) {
      return logJS('debug', 'Analytics already initializing')
    }
    logJS('debug', 'Analytics start init', 'device id', landingDeviceId)
    try {
      this.isInitializing = true
      await this.ampInstance.setMinTimeBetweenSessionsMillis(5000)
      await this.ampInstance.trackingSessionEvents(true)
      await this.ampInstance.init(amplitudeKey)
      await delay(1500)
      if (landingDeviceId) {
        logJS(
          'debug',
          'Analytics set landing device id to analytics',
          landingDeviceId,
        )
        this._landingDeviceId = landingDeviceId
        await this.ampInstance.setDeviceId(landingDeviceId)
      }
      await this.ampInstance.setUserId(user?.id ?? null, true)
      await delay(1500)
      logJS('info', 'Analytics', 'Amplitude key & user are set')
      if (user) {
        await analytics.updateUserParams(['languageApp', user?.language?.name])
      }

      const sessionId = await this.ampInstance.getSessionId()
      const deviceId = await this.ampInstance.getDeviceId()
      api.setAmplitudeIds(sessionId.toString(), deviceId)

      this.isInitialized = true
      this.pendingEvents.forEach((e) => this.sendEvent(e[0], e[1]))
      this.pendingEvents = []
      this.isInitializing = false
      logJS('debug', 'Analytics finished init')
    } catch (e) {
      logJS('error', 'Analytics', 'Amplitude init error:', e)
    }
  }

  setLandingDeviceIdIfNeeded = async (landingDeviceId: string | undefined) => {
    logJS('debug', 'Analytics', 'set landing device id', landingDeviceId)
    if (!landingDeviceId) {
      logJS('debug', 'Analytics', 'empty device id value ignored')
      return
    }
    if (this._landingDeviceId) return logJS('debug', 'already set')
    this._landingDeviceId = landingDeviceId
    await this.ampInstance.setDeviceId(landingDeviceId)
    logJS('debug', 'Analytics', 'updated landing device id')
  }

  setUserId = async (userId: string | Unknown) => {
    await this.ampInstance.setUserId(userId ?? null)
  }

  setUtmLabels = (labels?: UtmLabels) => {
    logJS('debug', 'set utm labels', JSON.stringify(labels))
    if (!labels || (!labels?.content && !labels?.source && !labels.campaign)) {
      logJS('debug', 'set empty utm labels')
      this._utmLabels = undefined
      return
    }
    this._utmLabels = labels
  }

  updateUserParams = async (...properties: Array<Property>) => {
    const identify = new Identify()
    properties.forEach((p) => identify.set(p[0], p[1]))
    await this.ampInstance.identify(identify)
    logJS(
      'debug',
      'Analytics',
      'updated user params',
      JSON.stringify(properties),
    )
  }

  sendEvent(eventType: string, eventProps?: Record<string, unknown>): void {
    const updatedProps = this.utmLabels
      ? {
          ...eventProps,
          utm_campaign: this.utmLabels.campaign,
          utm_source: this.utmLabels.source,
          utm_content: this.utmLabels.content,
          platform: Platform.OS,
        }
      : {...eventProps, platform: Platform.OS}
    if (__DEV__) {
      this.logEvent(eventType, updatedProps)
    }
    if (this.isInitialized) {
      if (__DEV__) return
      this.sendToAmplitude(eventType, updatedProps)
      return
    }
    this.pendingEvents.push([eventType, updatedProps])
  }

  private sendToAmplitude = async (
    eventType: string,
    eventProps?: Record<string, unknown>,
  ) => {
    if (__DEV__) return
    try {
      await this.ampInstance.logEvent(eventType, eventProps)
    } catch (e) {
      logJS('error', 'Analytics', 'send event error:', e)
    }
  }

  private logEvent = (
    eventType: string,
    eventProps?: Record<string, unknown>,
  ) => {
    logJS(
      'debug',
      'Analytics',
      this.isInitialized ? '' : '(delayed)',
      'send event to amplitude',
      eventType,
      'props:',
      JSON.stringify(eventProps, null, 2),
    )
  }
}

export const analytics = new Analytics()
