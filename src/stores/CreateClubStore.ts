import i18n from 'i18next'
import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from 'src/api/api'

import {toastHelper} from 'src/utils/ToastHelper'

import {appEventEmitter} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {ClubBody, ClubModel, InterestModel, UserModel} from '../models'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {FriendsStore} from './FriendsStore'

export class CreateClubStore {
  private friendsStore = new FriendsStore(undefined, true)
  private searchFriendsStore = new FriendsStore(undefined, true)
  private readonly clubUpdateSubscription?: () => void

  constructor() {
    makeAutoObservable(this)
    this.clubUpdateSubscription = appEventEmitter.on(
      'clubInterestsSelected',
      this.onClubInterestsSelected,
    )
  }

  @observable
  isLoading: boolean = false
  @observable
  isLoadingButton: boolean = false
  @observable
  userInviteInProgress: string = ''
  @observable
  club?: ClubModel
  @computed
  get network(): UserModel[] | undefined {
    return this.currentStore.list
  }
  @computed
  get totalCount(): number {
    return this.currentStore.totalCount ?? 0
  }
  @observable
  invitedList: string[] = []
  @observable
  error?: string = undefined
  @observable
  selectedInterests: Array<InterestModel> = []
  @observable
  searchMode: boolean = false
  @computed
  get isLoadingMore(): boolean {
    return (
      this.friendsStore.isLoadingMore || this.searchFriendsStore.isLoadingMore
    )
  }
  @observable
  currentStore: FriendsStore = this.friendsStore

  get selectedInterestIds(): Array<number> {
    return this.selectedInterests.map((interest) => interest.id)
  }

  fetchFriends = async () => this.friendsStore.load()

  fetchMore = async () => {
    if (this.isLoading || this.friendsStore.error) return
    await this.friendsStore.loadMore()
  }

  @action
  setSearchMode = async (mode: boolean) => {
    if (this.searchMode === mode) return
    this.searchMode = mode
    if (!mode) {
      this.currentStore = this.friendsStore
    } else {
      this.searchFriendsStore.clear()
      this.searchFriendsStore.query = null
      this.currentStore = this.searchFriendsStore
    }
  }

  @action
  search = async (query: string) => {
    if (!this.searchMode) return
    const q = query.trim()
    if (q.length < 2 || q === this.currentStore.query) return
    this.currentStore.query = q
    this.isLoading = true
    await this.currentStore.load(true)
    runInAction(() => (this.isLoading = false))
  }

  @action
  inviteAll = async (clubId: string): Promise<boolean> => {
    logJS('debug', 'CreateClubStore', 'invite all')
    if (!clubId) {
      logJS('debug', 'CreateClubStore', 'undefined club id', clubId)
      return false
    }
    return await runWithLoaderAsync(async () => {
      const response = await api.inviteToClubAllNetwork(clubId)
      if (response.error) {
        if (response.error === 'v1.invite.no_free_invites') {
          logJS('debug', 'CreateClubStore', 'no free invites')
          toastHelper.error(
            i18n.t('errorNetworkPartlyInvited', {
              peopleNum: response.data?.countNetwork ?? 0,
              freeInvitesNum: response.data?.freeInvites ?? 0,
            }),
            false,
          )
          return false
        }
        logJS('debug', 'CreateClubStore', 'generic error', response.error)
        toastHelper.error('somethingWentWrong')
        return false
      }
      toastHelper.success(i18n.t('invitedAllNetwork'))
      logJS('debug', 'CreateClubStore', 'invite all success')
      return true
    })
  }

  @action
  inviteToClub = async (clubId: string, userId: string) => {
    this.isLoadingButton = true
    this.userInviteInProgress = userId

    const response = await api.inviteToClubFromNetwork(clubId, userId)

    if (response.code === 200) {
      runInAction(() => {
        this.invitedList.push(userId)
        this.isLoadingButton = false
        this.error = undefined
        this.userInviteInProgress = ''
      })
    }

    if (response.error) {
      runInAction(() => {
        this.isLoadingButton = false
        this.error = response.error
        this.userInviteInProgress = ''
        toastHelper.error('somethingWentWrong')
        return
      })
    }
  }

  @action
  getClubInfo = async (clubId: string) => {
    this.isLoading = true

    const response = await api.getClub(clubId)

    runInAction(() => {
      this.club = response?.data
      this.selectedInterests = this.club?.interests ?? []
      this.isLoading = false
    })

    if (response.error) {
      runInAction(() => {
        toastHelper.error('somethingWentWrong')
        this.isLoading = false
        return
      })
    }
  }

  @action
  getNetwork = async (clubId: string) => {
    this.isLoading = true
    this.friendsStore.clear()
    this.friendsStore.updateParams({forInviteClub: clubId})

    await this.friendsStore.load(true)
    if (this.friendsStore.error) {
      toastHelper.error('somethingWentWrong')
    }

    runInAction(() => {
      this.isLoading = false
    })
  }

  @action
  updateClubAvatar = async (image: string, id: string) => {
    this.isLoading = true

    const response = await api.uploadClubAvatar(image, id)

    runInAction(() => {
      this.isLoading = false
    })

    if (response.error) {
      runInAction(() => {
        toastHelper.error('somethingWentWrong')
        return
      })
    }
  }

  @action
  updateClubInfo = async (clubId: string, body: ClubBody) => {
    this.isLoading = true

    const response = await api.updateClubInfo(clubId, {
      ...body,
      interests: this.selectedInterests,
    })

    runInAction(() => {
      this.isLoading = false
    })

    if (response.error) {
      runInAction(() => {
        this.isLoading = false
        toastHelper.error('somethingWentWrong')
        return
      })
    }
  }

  @action
  createNewClub = async (clubName: string) => {
    this.isLoading = true
    this.error = undefined

    const response = await api.addNewClub(clubName)

    if (response.code === 200) {
      runInAction(() => {
        this.isLoading = false
        this.club = response.data ?? {}
      })
    }
    if (response.error) {
      runInAction(() => {
        this.error = response.error
      })
    }
  }

  clear = () => {
    this.clubUpdateSubscription?.()
    runInAction(() => {
      this.error = undefined
    })
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
      runInAction(() => {
        this.selectedInterests = params.interests
      })
    }
  }
}
