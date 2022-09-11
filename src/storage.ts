import AsyncStorage from '@react-native-async-storage/async-storage'
import {KeyValuePair} from '@react-native-async-storage/async-storage/lib/typescript/types'
import {computed, makeAutoObservable, observable, runInAction} from 'mobx'
import moment from 'moment'

import {setDjMode} from './components/screens/room/modules/AppModuleSafe'
import {logJS} from './components/screens/room/modules/Logger'
import {
  CurrentUser,
  GoalModel,
  IndustryModel,
  InterestModel,
  LanguageModel,
  SkillModel,
} from './models'

const keys = [
  'user',
  'isSMSVerified',
  'isEventSubscriptionExplanationShown',
  'djModeEnabled',
  'isFestivalBannedHidden',
  'isLanguageChosen',
  'lastCreatedEventLanguageId',
  'isDirtyInstallRegistered',
  'isFirstLaunch',
  'isFinishedOnboarding',
  'bugsnagReportId',
  'lastShownRateAppDialog',
  'isGrowNetworkBlockClosed',
  'lastAppVersionInstalled',
  'isDiscordBannerHidden',
]

class Storage {
  constructor() {
    makeAutoObservable(this)
  }

  @observable
  currentUser?: CurrentUser

  @computed
  get currentUserId(): number {
    if (!this.currentUser) return -1
    return +this.currentUser!.id
  }

  @computed
  get isSkipNotification(): boolean {
    const untilTime = this.currentUser?.skipNotificationUntil
    return !!untilTime && moment.unix(untilTime).isAfter(moment())
  }

  isSMSVerified = false
  isEventSubscriptionExplanationShown = false
  djModeEnabled = false
  isFestivalBannedHidden = false
  isLanguageChosen = false
  isGrowNetworkBlockClosed = false
  phone?: string
  lastCreatedEventLanguageId?: number
  isDirtyInstallRegistered: boolean = false
  isFinishedOnboarding: boolean = false
  bugsnagReportId?: string
  lastShownRateAppDialog: number = -1
  lastAppVersionInstalled: string = ''
  isDiscordBannerHidden: boolean = false
  private _isFirstLaunch: boolean = false

  get isFirstLaunch() {
    return this._isFirstLaunch
  }

  async restore() {
    // await this.logout()
    let items = (await AsyncStorage.multiGet(keys)) as KeyValuePair[]
    items = items.filter((i) => i[1] !== null)
    // @ts-ignore
    const map = new Map<string, string | undefined>(items)

    this.isSMSVerified = map.get('isSMSVerified') === 'true'
    this.isEventSubscriptionExplanationShown =
      map.get('isEventSubscriptionExplanationShown') === 'true'
    this.djModeEnabled = map.get('djModeEnabled') === 'true'
    setDjMode(this.djModeEnabled)
    this.phone = map.get('phone') ?? undefined
    this.isFestivalBannedHidden = map.get('isFestivalBannedHidden') === 'true'
    this.isLanguageChosen = map.get('isLanguageChosen') === 'true'
    this.isGrowNetworkBlockClosed =
      map.get('isGrowNetworkBlockClosed') === 'true'
    const selectedLangIdValue = map.get('lastCreatedEventLanguageId')
    this.lastCreatedEventLanguageId = selectedLangIdValue
      ? parseInt(selectedLangIdValue, 10)
      : -1
    this._isFirstLaunch =
      !map.has('isFirstLaunch') || map.get('isFirstLaunch') === 'true'
    this.isDirtyInstallRegistered =
      map.get('isDirtyInstallRegistered') === 'true'
    this.isFinishedOnboarding = map.get('isFinishedOnboarding') === 'true'
    const savedLastShownRateAppDialog = map.get('lastShownRateAppDialog')
    this.lastShownRateAppDialog = savedLastShownRateAppDialog
      ? parseInt(savedLastShownRateAppDialog, 10)
      : -1
    this.bugsnagReportId = map.get('bugsnagReportId')
    this.lastAppVersionInstalled = map.get('lastAppVersionInstalled') ?? ''
    this.isDiscordBannerHidden = map.get('isDiscordBannerHidden') === 'true'

    const user = map.get('user') ?? undefined
    runInAction(() => {
      if (user) this.currentUser = JSON.parse(user)
      logJS('debug', 'Storage.restore', JSON.stringify(this, undefined, 2))
    })
  }

  get isAuthorized(): boolean {
    return this.currentUser?.state === 'verified'
  }

  async setSMSVerified() {
    await AsyncStorage.setItem('isSMSVerified', 'true')
  }

  async setEventSubscriptionExplanationShown() {
    this.isEventSubscriptionExplanationShown = true
    await AsyncStorage.setItem('isEventSubscriptionExplanationShown', 'true')
  }

  async setUserStateVerified() {
    if (!this.currentUser) return
    await this.saveUser({...this.currentUser, state: 'verified'})
  }

  async saveUser(user: CurrentUser) {
    logJS('debug', 'STORAGE:saveUser', JSON.stringify(user))
    await AsyncStorage.setItem('user', JSON.stringify(user))
    runInAction(() => {
      this.currentUser = user
    })
  }

  async saveAvatar(avatar: string) {
    if (!this.currentUser) return
    logJS('info', 'STORAGE:saveAvatar', avatar)
    this.currentUser.avatar = avatar
    await this.saveUser(this.currentUser)
  }

  async saveSkipUntilNotifications(time: number) {
    if (!this.currentUser) return
    logJS('info', 'STORAGE:saveSkipUntilNotifications', time)
    await this.saveUser({...this.currentUser, skipNotificationUntil: time})
  }

  async savePhone(phone: string) {
    await AsyncStorage.setItem('phone', phone)
  }

  async logout() {
    await AsyncStorage.multiRemove(keys)
    runInAction(() => {
      this.currentUser = undefined
    })
  }

  updateInterests = async (selected: Array<InterestModel>) => {
    if (!this.currentUser) throw new Error('user is undefined')
    await storage.saveUser({...this.currentUser, interests: [...selected]})
  }

  updateIndustries = async (selected: Array<IndustryModel>) => {
    if (!this.currentUser) throw new Error('user is undefined')
    await storage.saveUser({...this.currentUser, industries: [...selected]})
  }

  updateSkills = async (selected: Array<SkillModel>) => {
    if (!this.currentUser) throw new Error('user is undefined')
    await storage.saveUser({...this.currentUser, skills: [...selected]})
  }

  updateGoals = async (selected: Array<GoalModel>) => {
    if (!this.currentUser) throw new Error('user is undefined')
    await storage.saveUser({...this.currentUser, goals: [...selected]})
  }

  updateWallet = async (wallet: string | null) => {
    logJS('debug', 'storage', 'update wallet', wallet)
    if (!this.currentUser) throw new Error('user is undefined')
    await storage.saveUser({...this.currentUser, wallet: wallet})
  }

  updateLanguage = async (lang: LanguageModel) => {
    if (!this.currentUser) throw new Error('user is undefined')
    await storage.saveUser({...this.currentUser, language: lang})
  }

  async isDontAskPermissionDidSelected(): Promise<boolean> {
    return (
      (await AsyncStorage.getItem('dontAskPermissionDidSelected')) === 'true'
    )
  }

  async dontAskPermissionDidSelected(): Promise<void> {
    return AsyncStorage.setItem('dontAskPermissionDidSelected', 'true')
  }

  async clearDontAskPermissionDidSelected(): Promise<void> {
    return AsyncStorage.removeItem('dontAskPermissionDidSelected')
  }

  async djModeDidSelected(): Promise<void> {
    this.djModeEnabled = true
    setDjMode(true)
    return AsyncStorage.setItem('djModeEnabled', 'true')
  }

  async clearDjModeDidSelected(): Promise<void> {
    this.djModeEnabled = false
    setDjMode(false)
    return AsyncStorage.removeItem('djModeEnabled')
  }

  async setFestivalBannerHidden() {
    await AsyncStorage.setItem('isFestivalBannedHidden', 'true')
  }

  async setIsFirstLaunch(isFirstLaunch: boolean) {
    if (isFirstLaunch) this._isFirstLaunch = true
    await AsyncStorage.setItem(
      'isFirstLaunch',
      isFirstLaunch ? 'true' : 'false',
    )
  }

  async setIsDirtyInstallRegistered() {
    this.isDirtyInstallRegistered = true
    await AsyncStorage.setItem('isDirtyInstallRegistered', 'true')
  }

  async setLanguageChosen() {
    this.isLanguageChosen = true
    await AsyncStorage.setItem('isLanguageChosen', 'true')
  }
  async setGrowNetworkBlockClosed() {
    this.isGrowNetworkBlockClosed = true
    await AsyncStorage.setItem('isGrowNetworkBlockClosed', 'true')
  }

  async setLastCreatedEventLanguageId(id: number) {
    await AsyncStorage.setItem('lastCreatedEventLanguageId', String(id))
  }

  async setFinishedOnboarding(isFinished: boolean = true) {
    logJS('debug', 'set user finished onboarding')
    await AsyncStorage.setItem('isFinishedOnboarding', String(isFinished))
  }

  async setLastShownRateAppDialog(timestamp: number) {
    this.lastShownRateAppDialog = timestamp
    await AsyncStorage.setItem('lastShownRateAppDialog', String(timestamp))
  }

  async setBugsnagReportId(id: string) {
    logJS('debug', 'set bugsnag report id', id)
    this.bugsnagReportId = id
    await AsyncStorage.setItem('bugsnagReportId', id)
  }

  async setLastAppVersionInstalled(version: string) {
    logJS('debug', 'storage', 'set last app version installed', version)
    this.lastAppVersionInstalled = version
    await AsyncStorage.setItem('lastAppVersionInstalled', version)
  }

  async setDiscordBannerHidden() {
    this.isDiscordBannerHidden = true
    await AsyncStorage.setItem('isDiscordBannerHidden', 'true')
  }
}

export const storage = new Storage()
