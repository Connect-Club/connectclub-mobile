import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {appEventEmitter} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {ClubModel, InterestModel} from '../models'
import ClubStore from './ClubStore'

class EditClubSettingsStore {
  @observable
  isPublic = false

  @observable
  isPublicToggleEnabled = false

  @observable
  inputDescription = ''

  @observable
  isInOperation = false

  @observable
  clubAvatar?: string

  @observable
  clubTitle?: string

  @observable
  isInitialized = false

  @computed
  get error(): string | undefined {
    return this.clubStore.error
  }

  @computed
  get isInProgress(): boolean {
    return this.isInOperation || this.clubStore.isInProgress
  }

  get isChanged(): boolean {
    return this._isChanged
  }

  private selectedInterests: Array<InterestModel> = []
  private clubStore = new ClubStore()
  private readonly clubInterestsUpdateSubscription?: () => void
  private _isChanged = false

  constructor() {
    makeAutoObservable(this)
    this.clubInterestsUpdateSubscription = appEventEmitter.on(
      'clubInterestsSelected',
      this.onClubInterestsSelected,
    )
  }

  get selectedInterestIds(): Array<number> {
    return this.selectedInterests.map((interest) => interest.id)
  }

  private get club(): ClubModel | undefined {
    return this.clubStore.club!
  }

  @action
  init = (club: ClubModel) => {
    logJS('debug', 'EditClubSettingsStore', 'init')
    this.isInitialized = false
    this.clubStore.initializeWithClub(club)
    this.inputDescription = this.club?.description ?? ''
    this.isPublic = this.club?.isPublic ?? false
    this.selectedInterests = this.club?.interests ?? []
    this.clubTitle = this.club?.title
    this.clubAvatar = this.club?.avatar
    this.isPublicToggleEnabled =
      this.clubStore.club?.togglePublicModeEnabled ?? false
    this.isInitialized = true
  }

  @action
  onUpdatePublic = (isPublic: boolean) => {
    if (this.isPublic === isPublic) return
    logJS(
      'debug',
      'EditClubSettingsStore',
      'public property updated to',
      isPublic,
    )
    this._isChanged = true
    this.isPublic = isPublic
  }

  @action
  onDescriptionChange = (inputDescription: string) => {
    this.inputDescription = inputDescription
    this._isChanged = true
  }

  @action
  onInterestsSelected = (selectedInterests: Array<InterestModel>) => {
    logJS('debug', 'EditClubSettingsStore', 'interests selected')
    this.selectedInterests = selectedInterests
    this._isChanged = true
  }

  @action
  updateClubAvatar = async (image: string) => {
    logJS('debug', 'EditClubSettingsStore', 'update club avatar')
    this.clubAvatar = image
    this._isChanged = true
  }

  @action
  updateClubInfo = async () => {
    if (this.isInProgress || !this.club) return
    logJS('debug', 'EditClubSettingsStore', 'update club info')
    this.isInOperation = true

    if (this.clubAvatar && this.clubAvatar !== this.club!.avatar) {
      logJS('debug', 'EditClubSettingsStore', 'update club avatar')
      await this.clubStore.updateClubAvatar(this.clubAvatar)
      if (this.clubStore.error) {
        logJS('debug', 'EditClubSettingsStore', 'set new avatar error')
        runInAction(() => {
          this.isInOperation = false
        })
        return
      } else {
        logJS('debug', 'EditClubSettingsStore', 'set new avatar')
      }
    }

    await this.clubStore.updateClubInfo({
      description: this.inputDescription.trim(),
      interests: this.selectedInterests,
      isPublic: this.isPublic,
    })
    logJS(
      'debug',
      'EditClubSettingsStore',
      'updated club info',
      '; error?',
      this.clubStore.error,
    )
    runInAction(() => {
      this.isInOperation = false
    })
    if (!this.clubStore.error) {
      this._isChanged = false
      appEventEmitter.trigger('clubUpdated', this.club!.id)
    }
  }

  clear = () => {
    this.clubInterestsUpdateSubscription?.()
  }

  private onClubInterestsSelected = (params: {
    clubId: string
    interests: Array<InterestModel>
  }) => {
    logJS(
      'debug',
      'CreateClubStore',
      'handle on club interests selected',
      params.clubId,
      JSON.stringify(params.interests),
    )
    if (this.club?.id === params.clubId) {
      this.onInterestsSelected(params.interests)
    }
  }
}

export default EditClubSettingsStore
