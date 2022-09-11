import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx'
import moment from 'moment'

import {api} from '../api/api'
import {appEventEmitter, hideLoading, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {
  ClubInfoModel,
  EventModel,
  InterestModel,
  LanguageModel,
  TokenInfo,
  UserModel,
} from '../models'
import {storage} from '../storage'
import {toastHelper} from '../utils/ToastHelper'
import {FriendsStore} from './FriendsStore'
import {INTERESTS_LIMIT, InterestsSelectResult} from './InterestsStore'
import SearchUsersStore from './SearchUsersStore'

interface EventInterests {
  readonly interests: Array<InterestModel>
  readonly selected: Array<InterestModel>
}

export class CreateEventStore {
  private friendsStore = new FriendsStore(undefined, true)
  private searchStore = new SearchUsersStore(true)
  private noneClub: ClubInfoModel = {
    slug: '',
    clubRole: undefined,
    id: '',
    title: 'None',
    avatar: '',
  }

  constructor(oldEvent?: EventModel, privateEventUser?: UserModel) {
    makeAutoObservable(this)
    this.selectedLanguage = oldEvent?.language ?? storage.currentUser?.language
    if (!oldEvent) {
      if (!storage.currentUser) return
      if (privateEventUser) {
        this.isPrivate = true
        this.moderators = [storage.currentUser, privateEventUser]
        this.eventDate = moment().add(1, 'day').toDate()
        this.eventName =
          storage.currentUser.name +
          ' & ' +
          privateEventUser.name +
          `'s meeting`
      } else {
        this.moderators = [storage.currentUser]
      }
      this.ownerId = storage.currentUser.id
      const initialInterests = storage.currentUser?.interests ?? []
      this.eventInterests = {
        interests: initialInterests,
        selected: initialInterests,
      }
      return
    }
    this.eventId = oldEvent.id
    this.eventName = oldEvent.title
    this.eventDescription = oldEvent.description
    this.isPrivate = oldEvent.isPrivate
    this.moderators = Array.from(
      oldEvent.participants.filter((f) => f.isSpecialGuest !== true),
    )
    this.specialGuests = Array.from(
      oldEvent.participants.filter((f) => f.isSpecialGuest === true),
    )
    this.ownerId = oldEvent.participants.filter((p) => p.isOwner)[0].id
    const momentDate = moment.unix(oldEvent.date)
    this.eventDate = momentDate.toDate()
    this.eventTime = momentDate.toDate()
    if (oldEvent.forMembersOnly) this.forMembersOnly = oldEvent.forMembersOnly
    if (oldEvent.club) {
      this.hostedClub = oldEvent.club
      this.hostedClubTokens = oldEvent.tokens ?? undefined
      this.selectedClubTokenIds = this.hostedClubTokens?.map((t) => t.id)
    }
    if (oldEvent.withToken) {
      this.isEventRequiresToken = true
    }
  }

  isPrivate = false
  eventId: string | null = null
  forMembersOnly: boolean | undefined = undefined

  @observable
  searchMode: boolean = false

  @observable
  moderators: Array<UserModel> = []

  @observable
  specialGuests: Array<UserModel> = []

  @observable
  eventInterests: EventInterests = {
    interests: [],
    selected: [],
  }

  @observable
  selectedLanguage?: LanguageModel

  @observable
  hostedClub?: ClubInfoModel

  @observable
  error?: any

  @observable
  hostedClubTokens?: Array<TokenInfo>

  @observable
  selectedClubTokenIds?: Array<string>

  @observable
  myClubs: Array<ClubInfoModel> = []

  @computed
  get selectedInterestsIds(): Array<number> {
    return this.eventInterests.selected.map((value) => value.id)
  }

  @observable
  ownerId = ''

  @observable
  eventName = ''

  @observable
  eventDescription = ''

  @observable
  eventDate: Date = new Date()

  @observable
  eventTime: Date = moment().add(1, 'hour').toDate()

  @observable
  searchQuery: string | null = null

  @observable
  isFetchingClubTokens: boolean = false

  @observable
  isFetchingEvent: boolean = false

  private isEventRequiresToken = false

  @computed
  get hasHostedClubTokens(): boolean {
    return !!this.hostedClubTokens && this.hostedClubTokens.length > 0
  }

  @computed
  get coHosts(): Array<UserModel> {
    return this.moderators.slice().sort((a, b) => {
      if (a.id === this.ownerId) return -1
      if (b.id === this.ownerId) return 1
      return 0
    })
  }

  @computed
  get specialSpeakers(): Array<UserModel> {
    return this.specialGuests
  }

  @computed
  get excludedParticipants(): Array<UserModel> {
    const moderatorsIds = new Set(this.moderators.map((item) => item.id))
    const speakersIds = new Set(this.specialGuests.map((item) => item.id))
    return (this.searchMode ? this.searchStore : this.friendsStore).list.filter(
      (f) => !moderatorsIds.has(f.id) && !speakersIds.has(f.id),
    )
  }

  @computed
  get isFirstLoading(): boolean {
    return this.friendsStore.isFirstLoading ?? false
  }

  @computed
  get isInProgress(): boolean {
    return (
      this.isFetchingEvent ||
      this.isFetchingClubTokens ||
      this.friendsStore.isInProgress
    )
  }

  @computed
  get isSearchStoreInRefreshing(): boolean {
    return this.searchStore.isRefreshing
  }

  @action
  setSearchMode = (enabled: boolean) => {
    this.searchMode = enabled
    if (!enabled) {
      this.searchQuery = null
      this.searchStore.query = null
      this.searchStore.clear()
    }
  }

  @action
  fetch = async () => {
    this.error = undefined

    if (!this.eventId) return
    if (!this.isEventRequiresToken) return

    this.isFetchingEvent = true

    const response = await api.fetchUpcomingEvent(this.eventId)
    runInAction(() => {
      this.isFetchingEvent = false
      if (response.error) {
        this.error = response.error
        return
      }
      const event = response.data!
      if (event.club) {
        if (!event.tokens || event.tokens.length === 0) {
          this.setHostedClub(event.club)
        } else {
          this.hostedClub = event.club
          this.hostedClubTokens = event.tokens ?? undefined
          this.selectedClubTokenIds = this.hostedClubTokens?.map((t) => t.id)
        }
      }
    })
  }

  @action
  setName = (name: string) => {
    this.eventName = name
  }

  @action
  setDescription = (description: string) => {
    this.eventDescription = description
  }

  @action
  setDate = (date: Date) => {
    this.eventDate = date
  }

  @action
  setTime = (time: Date) => {
    this.eventTime = time
  }

  @action
  setModerator = (moderator: UserModel) => {
    this.moderators.push(moderator)
  }

  @action
  setSpeaker = (speaker: UserModel) => {
    this.specialGuests.push(speaker)
  }

  @action
  setHostedClub = (club: ClubInfoModel) => {
    if (club.id === this.noneClub.id) {
      this.hostedClub = undefined
      this.hostedClubTokens = undefined
      this.selectedClubTokenIds = undefined
      return
    }
    this.isFetchingClubTokens = true
    logJS('debug', 'CreateEventStore', 'fetch club tokens')
    api.getClubTokens(club.id).then((response) => {
      runInAction(() => {
        this.isFetchingClubTokens = false
        logJS('debug', 'CreateEventStore', 'fetched club tokens')
        if (response.error) {
          logJS('warning', 'CreateEventStore', response.error)
          this.error = response.error
          return
        }
        this.selectedClubTokenIds = []
        this.hostedClub = club
        this.hostedClubTokens = response.data
      })
    })
  }

  isTokenSelected(id: string): boolean {
    if (!this.selectedClubTokenIds) return false
    return this.selectedClubTokenIds.indexOf(id) > -1
  }

  @action
  setClubTokenSelected(id: string, selected: boolean) {
    if (!this.hostedClub) return
    if (this.selectedClubTokenIds === undefined) {
      this.selectedClubTokenIds = []
    }
    if (selected) {
      this.selectedClubTokenIds.push(id)
    } else {
      const index = this.selectedClubTokenIds.indexOf(id)
      if (index > -1) this.selectedClubTokenIds.splice(index, 1)
    }
  }

  @action
  setForMembersOnly = (membersOnly: boolean) => {
    this.forMembersOnly = membersOnly
  }

  @action
  removeModerator = (model: UserModel) => {
    this.moderators = this.moderators.filter((item) => item.id !== model.id)
  }

  @action
  removeSpeaker = (model: UserModel) => {
    this.specialGuests = this.specialGuests.filter(
      (item) => item.id !== model.id,
    )
  }

  @action
  setEventInterests = (interests: Array<InterestModel>) => {
    this.eventInterests = {
      interests: interests ?? [],
      selected: interests ?? [],
    }
  }

  @action
  setEventLanguage = (language: LanguageModel) => {
    this.selectedLanguage = language
  }

  toggleInterest = (item: InterestModel): Promise<InterestsSelectResult> =>
    new Promise<InterestsSelectResult>((resolve) => {
      runInAction(() => {
        const isSelected = this.selectedInterestsIds.includes(item.id)
        let newSelected = Array.from(this.eventInterests.selected)
        if (isSelected) {
          newSelected = newSelected.filter((i) => i.id !== item.id)
        } else {
          if (this.selectedInterestsIds.length >= INTERESTS_LIMIT)
            return resolve('limit')
          newSelected.push(item)
        }
        this.eventInterests = {
          ...this.eventInterests,
          selected: newSelected,
        }
        resolve('ok')
      })
    })

  search = (query: string | null) => {
    runInAction(() => (this.searchQuery = query))
    this.searchStore.query = query
    if (!query) {
      this.searchStore.clear()
    } else {
      this.searchStore.refresh()
    }
  }

  fetchMyClubs = async () => {
    const response = await api.fetchMyClubs(true)
    if (response.error) {
      logJS('error', 'fetchMyClubs:', response.error)
      return
    }
    runInAction(() => {
      if (response.data?.items && response.data.items.length > 0) {
        this.myClubs = [this.noneClub, ...response.data.items]
      }
    })
  }

  fetchFriends = async () => this.friendsStore.load()

  fetchMore = async () => this.friendsStore.loadMore()

  @action
  createEvent = async (): Promise<boolean> => {
    showLoading()

    let moderators = [...this.moderators]
    moderators.push(storage.currentUser!)
    const response = await api.createEvent(
      this.makeEventDate(),
      this.eventName,
      this.eventDescription,
      moderators,
      this.specialGuests,
      this.eventInterests.selected,
      this.isPrivate,
      this.selectedLanguage?.id,
      this.hostedClub?.id,
      this.forMembersOnly,
      this.selectedClubTokenIds,
    )
    hideLoading()
    if (response.error) {
      toastHelper.error(response.error)
      return false
    }
    appEventEmitter.trigger('eventCreated')
    return true
  }

  @action
  saveEvent = async (): Promise<boolean> => {
    showLoading()

    let moderators = [...toJS(this.moderators)]
    const response = await api.updateEvent(
      this.eventId!,
      this.makeEventDate(),
      this.eventName,
      this.eventDescription,
      moderators,
      this.specialGuests,
      this.eventInterests.selected,
      this.isPrivate,
      this.selectedLanguage?.id,
      this.hostedClub?.id,
      this.forMembersOnly,
      this.selectedClubTokenIds,
    )
    hideLoading()
    if (response.error) {
      toastHelper.error(response.error)
      return false
    }
    appEventEmitter.trigger('eventUpdated')
    return true
  }

  private makeEventDate = (): number => {
    const eventDate = moment(this.eventDate)
    const eventTime = moment(this.eventTime)
    return eventDate
      .set({
        hours: eventTime.get('hours'),
        minutes: eventTime.get('minutes'),
      })
      .unix()
  }

  clearSearchOnly() {
    runInAction(() => (this.searchQuery = null))
    this.searchMode = false
    this.searchStore.query = null
    this.searchStore.clear()
  }

  clear() {
    runInAction(() => (this.searchQuery = null))
    this.searchMode = false
    this.searchStore.query = null
    this.friendsStore.clear()
    this.searchStore.clear()
  }
}
