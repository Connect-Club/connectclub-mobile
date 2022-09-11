import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {appEventEmitter} from '../appEventEmitter'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import ContentLoadingView from '../components/common/ContentLoadingView'
import Spacer from '../components/common/Spacer'
import TopContentGradientView from '../components/common/TopContentGradientView'
import InterestCategoriesList from '../components/screens/interests/InterestCategoriesList'
import NavigationTextButton from '../components/screens/mainFeed/NavigationTextButton'
import {logJS} from '../components/screens/room/modules/Logger'
import ClubStore from '../stores/ClubStore'
import InterestsStore from '../stores/InterestsStore'
import {commonStyles} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {useViewModel} from '../utils/useViewModel'

interface Props {
  isModal?: boolean
  clubId: string
  isEditAllowed?: boolean
  preselectedIds?: Array<number>
}

type ScreenRouteProp = RouteProp<{Screen: Props}, 'Screen'>

const SelectClubInterestsScreen: React.FC = () => {
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const store = useViewModel(() => new ClubStore())
  const interestsStore = useContext(InterestsStore)
  const {t} = useTranslation()
  const isEditAllowed = params.isEditAllowed ?? true

  const onSavePress = async () => {
    logJS('debug', 'SelectClubInterestsScreen', 'save interests')
    analytics.sendEvent('save_club_interests_click', {clubId: params.clubId})
    if (interestsStore.selected.size === 0) {
      return logJS(
        'debug',
        'SelectClubInterestsScreen',
        'no interests selected',
      )
    }
    if (!isEditAllowed) {
      logJS('debug', 'SelectClubInterestsScreen', 'only selection is allowed')
      appEventEmitter.trigger('clubInterestsSelected', {
        clubId: params.clubId,
        interests: Array.from(interestsStore.selected.values()),
      })
      navigation.goBack()
      return
    }

    await runWithLoaderAsync(async () => {
      await store.updateClubInterests(
        Array.from(interestsStore.selected.values()),
      )
    })

    logJS(
      'debug',
      'SelectClubInterestsScreen',
      'save complete, error?',
      store.error,
    )
    if (!store.error) navigation.goBack()
  }

  const init = async () => {
    const initClub = store.initializeWithClubId(params.clubId)
    interestsStore.resetSelection()
    const initInterests = interestsStore.fetch(false)
    await Promise.all([initClub, initInterests])

    if (params.preselectedIds) {
      // use provided selection
      const selection = interestsStore.interests.filter((interest) => {
        return params.preselectedIds!.indexOf(interest.id) >= 0
      })
      interestsStore.addSelected(selection)
    } else {
      // set selection from club's interests
      interestsStore.addSelected(store.club?.interests ?? [])
    }
  }

  useEffect(() => {
    init()
    return () => interestsStore.cleanup()
  }, [])

  return (
    <ContentLoadingView
      loading={store.isLoading || interestsStore.isLoading}
      showLoader={false}
      error={store.error}
      onRetry={init}>
      <Spacer vertical={ms(16)} />
      <AppNavigationHeader
        topInset={!params.isModal ?? true}
        headerRight={
          <NavigationTextButton
            onPress={onSavePress}
            title={t('saveButton')}
            isEnabled={interestsStore.selected.size > 0}
            style={styles.buttonSave}
          />
        }
        title={t('clubSelectInterestsScreenTitle')}
        subtitle={t('clubInterestsSubtitle')}
      />
      <View style={[commonStyles.wizardContainer]}>
        <TopContentGradientView style={styles.base}>
          <InterestCategoriesList
            contentStyle={commonStyles.wizardContainer}
            standalone={false}
          />
        </TopContentGradientView>
      </View>
    </ContentLoadingView>
  )
}

export default observer(SelectClubInterestsScreen)

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
  buttonSave: {
    justifyContent: 'flex-start',
  },
})
