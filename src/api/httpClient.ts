import {sendUnAuthorized} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {
  checkNetwork,
  nativeHttpClient,
} from '../components/webSafeImports/webSafeImports'
import i18n from '../i18n'
import {Unknown} from '../models'
import {logError} from '../utils/log.utils'
import {replaceAll} from '../utils/stringHelpers'

export interface RestResponse<T> {
  readonly data?: T
  readonly error?: string
  readonly code?: number
}

export interface Paginated<T> {
  readonly items: Array<T>
  readonly lastValue: string | Unknown
  readonly totalCount?: number
}

function addToQuery(name: string, value?: string, query?: string): string {
  let q = query ?? ''
  if (value === undefined || value.length === 0) return q
  if (q.length > 0) q += '&'
  return `${q}${name}=${value}`
}

function addAllToQuery(
  params: Array<Record<string, string>>,
  query?: string,
): string {
  let q = query ?? ''
  for (const param of params) {
    const name = Object.keys(param)[0]
    q = addToQuery(name, param[name], q)
  }
  return q
}

interface Request {
  endpoint: string
  method?: MethodType
  useAuthorizeHeader?: boolean
  generateJwt?: boolean
  query?: string
  body?: string | object | null
  file?: string
}

export type NetworkStateListener = (isReachable: boolean) => void

export interface HttpClient {
  onNetworkStateChanged?: NetworkStateListener
  isAuthorized(): Promise<boolean>
  initialize(endpoint: string): Promise<any>
  setAmplitudeIds(sessionId: string, deviceId: string): void
  request<T>(request: Request): Promise<RestResponse<T>>
  authorize<T>(
    phone: string,
    code: string,
    clubId: string,
    inviteCode: string,
    utmCampaign: string,
    utmContent: string,
    utmSource: string,
  ): Promise<RestResponse<T>>
  authorizeWithWallet<T>(
    message: string,
    address: string,
    signature: string,
    deviceId: string,
    clubId: string,
    inviteCode: string,
    utmCampaign: string,
    utmContent: string,
    utmSource: string,
  ): Promise<RestResponse<T>>
  startListenNetwork(): Promise<void>
  stopListenNetwork(): void
  connectedToNetwork(): boolean
  sendLogFile(body: string): Promise<boolean>
  sendPreservedLogFile(body: string): Promise<boolean>
}

export interface NativeHttpClient {
  isAuthorized(): Promise<boolean>
  initialize(endpoint: string): Promise<any>
  setAmplitudeIds(sessionId: string, deviceId: string): void
  request(
    endpoint: string,
    method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE',
    useAuthorizeHeader: boolean,
    generateJwt: boolean,
    query: string | null,
    body: string | null,
    file: string | null,
  ): Promise<string>
  queryAuthorize(query: string): Promise<string>
  sendLogFile(body: string): Promise<string>
  sendPreservedLogFile(body: string): Promise<string>
}

interface CheckNetwork {
  isReachable(): Promise<boolean>
  startListen(listener: (isReachable: {isReachable: boolean}) => void): void
  stopListen(): void
}

const normalizeErrorKey = (key: string): string => {
  const k = replaceAll(key, '.', '_')
  return i18n.exists(k) ? k : key
}

type MethodType = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'
class HttpClientClass implements HttpClient {
  private networkUnAvailable = {error: 'networkUnAvailable'}
  private isNetworkAvailable = true

  onNetworkStateChanged?: NetworkStateListener

  constructor(
    private nativeClient: NativeHttpClient,
    private checkNetwork: CheckNetwork,
  ) {}

  get isConnectedToNetwork(): boolean {
    return this.isNetworkAvailable
  }

  connectedToNetwork(): boolean {
    return this.isConnectedToNetwork
  }

  async startListenNetwork() {
    this.isNetworkAvailable = await this.checkNetwork.isReachable()
    this.checkNetwork.startListen((s) => {
      this.isNetworkAvailable = s.isReachable
      this.onNetworkStateChanged?.(s.isReachable)
    })
  }

  stopListenNetwork() {
    this.checkNetwork.stopListen()
  }

  isAuthorized(): Promise<boolean> {
    return this.nativeClient.isAuthorized()
  }

  async initialize(endpoint: string): Promise<any> {
    return this.nativeClient.initialize(endpoint)
  }

  setAmplitudeIds(sessionId: string, deviceId: string): void {
    this.nativeClient.setAmplitudeIds(sessionId, deviceId)
  }

  async authorize<T>(
    phone: string,
    code: string,
    clubId: string,
    inviteCode: string,
    utmCampaign: string,
    utmContent: string,
    utmSource: string,
  ): Promise<RestResponse<T>> {
    if (!this.isNetworkAvailable) return this.networkUnAvailable
    const query = addAllToQuery([
      {phone},
      {code},
      {clubId},
      {inviteCode},
      {utm_campaign: utmCampaign},
      {utm_content: utmContent},
      {utm_source: utmSource},
      {grant_type: 'https://connect.club/sms'},
    ])

    const response = await this.nativeClient.queryAuthorize(query)
    if (response === '') return {error: 'emptyResponse'}
    const json = JSON.parse(response)
    if (json.error) {
      return {error: normalizeErrorKey(json.error), code: json.code}
    }
    return {data: json.response}
  }

  async authorizeWithWallet<T>(
    message: string,
    address: string,
    signature: string,
    deviceId: string,
    clubId: string,
    inviteCode: string,
    utmCampaign: string,
    utmContent: string,
    utmSource: string,
  ): Promise<RestResponse<T>> {
    const query = addAllToQuery([
      {text: message},
      {address},
      {signature},
      {clubId},
      {inviteCode},
      {device_id: deviceId},
      {utm_campaign: utmCampaign},
      {utm_content: utmContent},
      {utm_source: utmSource},
      {grant_type: 'https://connect.club/metamask'},
    ])
    const response = await this.nativeClient.queryAuthorize(query)
    if (response === '') return {error: 'emptyResponse'}
    const json = JSON.parse(response)
    if (json.error) {
      return {error: normalizeErrorKey(json.error), code: json.code}
    }
    return {data: json.response}
  }

  async request<T>(request: Request): Promise<RestResponse<T>> {
    try {
      if (!this.isNetworkAvailable) return this.networkUnAvailable
      let body: string | object | null = request.body ?? null
      if (!body) body = null
      if (typeof body === 'object' && body !== null) body = JSON.stringify(body)
      const response = await this.nativeClient.request(
        request.endpoint,
        request.method ?? 'GET',
        request.useAuthorizeHeader ?? true,
        request.generateJwt ?? false,
        request.query ?? null,
        body,
        request.file ?? null,
      )
      if (response === '') return {error: 'emptyResponse'}
      let code = -1
      const json = JSON.parse(response)
      if (json.error) {
        if (json.error !== 'unauthorized') {
          logJS(
            'error',
            'HttpClient request error:',
            json.error,
            JSON.stringify(request),
            JSON.stringify(response),
          )
        }
        if (json.error === 'unauthorized') {
          logJS('debug', 'HttpClient', 'send unauthorized')
          sendUnAuthorized()
        }
        return {error: normalizeErrorKey(json.error), code: json.code ?? -1}
      }
      code = json.code
      return {data: json.body.response as T, code}
    } catch (e) {
      logJS('error', 'HttpClient request error:', JSON.stringify(e))
    }
    return {error: 'unknownError', code: -1}
  }

  async sendLogFile(body: string): Promise<boolean> {
    try {
      const response = await this.nativeClient.sendLogFile(body)
      if (response === '') return false
      const json = JSON.parse(response)
      if (json.error) return false
      return json.code === 200
    } catch (e) {
      logError(e)
    }
    return false
  }

  async sendPreservedLogFile(body: string): Promise<boolean> {
    try {
      const response = await this.nativeClient.sendPreservedLogFile(body)
      if (response === '') return false
      const json = JSON.parse(response)
      if (json.error) return false
      return json.code === 200
    } catch (e) {
      logError(e)
    }
    return false
  }
}

export const httpClient = new HttpClientClass(
  nativeHttpClient as NativeHttpClient,
  checkNetwork as CheckNetwork,
)
