import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import InterestCategoriesList from '../components/screens/interests/InterestCategoriesList'
import {InitialLinkProp} from '../models'
import {storage} from '../storage'
import InterestsStore, {INTERESTS_LIMIT} from '../stores/InterestsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {resetTo} from '../utils/navigation.utils'
import {hasNotificationPermissions} from '../utils/permissions.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {tabletContainerWidthLimit} from '../utils/tablet.consts'
import useOnboardingNavigation from '../utils/useOnboardingNavigation'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const RegistrationSelectInterestsScreen: React.FC = () => {
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const store = useContext(InterestsStore)
  const {finishOnboarding} = useOnboardingNavigation(params)

  const bottomContainerHeight = bottomInset(inset) + 48 + 8 + 14 + 32 + 32

  useEffect(() => {
    const userInterests = storage.currentUser?.interests ?? []
    store.resetSelection()
    store.addSelected(userInterests)
    analytics.sendEvent('interests_screen_open')
    store.analyticsSender = analytics
    return () => (store.analyticsSender = undefined)
  }, [store])

  const onNextPress = async () => {
    const selectedInterests = Array.from(store.selected.values())
    if (store.selected.size === 0) {
      analytics.sendEvent('interests_skip_click')
    } else {
      const interests = JSON.stringify(selectedInterests)
      analytics.sendEvent('interests_find_people_click', {
        interests_list: interests,
      })
    }
    showLoading()
    try {
      const result = await store.updateUserInterests()
      if (result) {
        await storage.updateInterests(selectedInterests)
        if (!(await hasNotificationPermissions())) {
          return await proceedIOS()
        }
        await finishOnboarding()
      }
    } finally {
      hideLoading()
    }
  }

  const proceedIOS = async () => {
    navigation.dispatch(
      resetTo('RequestPermissionNotificationsScreen', {
        initialLink: params?.initialLink,
      }),
    )
  }

  return (
    <View style={styles.base}>
      <InterestCategoriesList
        contentStyle={[
          {paddingBottom: bottomContainerHeight},
          commonStyles.paddingHorizontal,
        ]}
        headerComponent={
          <Vertical>
            <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
              {t('selectInterestsTitle')}
            </AppText>
            <AppText
              style={[styles.subtitle, {color: colors.secondaryBodyText}]}>
              {t('chooseInterestsSubtitle', {limit: INTERESTS_LIMIT})}
            </AppText>
          </Vertical>
        }
      />

      <BottomGradientView height={bottomContainerHeight}>
        {store.selected.size > 0 && (
          <PrimaryButton
            onPress={onNextPress}
            accessibilityLabel={'nextButton'}
            title={t('saveSelectionButton')}
          />
        )}
        {store.selected.size === 0 && <Spacer vertical={ms(48)} />}
        <AppText style={[styles.hintText, {color: colors.secondaryBodyText}]}>
          {t('selectInterestsHint')}
        </AppText>
      </BottomGradientView>
    </View>
  )
}

export default observer(RegistrationSelectInterestsScreen)
const styles = StyleSheet.create({
  base: {
    flex: 1,
    width: '100%',
    maxWidth: ms(tabletContainerWidthLimit),
    alignSelf: 'center',
  },
  title: {
    width: '100%',
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: ms(16),
  },
  subtitle: {
    fontSize: ms(20),
    lineHeight: ms(28),
    textAlign: 'center',
    marginTop: ms(16),
    marginBottom: ms(24),
    ...commonStyles.paddingHorizontal,
  },

  hintText: {
    fontSize: ms(12),
    marginTop: ms(16),
    maxWidth: ms(306),
    paddingHorizontal: ms(16),
    textAlign: 'center',
  },

  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
  },
})
