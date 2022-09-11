import {BottomSheetModalProvider} from '@gorhom/bottom-sheet'
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {hideLoading, showLoading} from '../appEventEmitter'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../components/BaseInlineBottomSheet'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppText from '../components/common/AppText'
import BaseFlatList from '../components/common/BaseFlatList'
import BottomGradientView from '../components/common/BottomGradientView'
import InlineButton from '../components/common/InlineButton'
import PrimaryButton from '../components/common/PrimaryButton'
import ClubView from '../components/screens/club/ClubView'
import SelectableClubListItem from '../components/screens/exploreClubs/SelectableClubListItem'
import {ClubModel, InitialLinkProp} from '../models'
import {storage} from '../storage'
import {ExploreClubsStore} from '../stores/ExploreClubsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {resetTo} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {useViewModel} from '../utils/useViewModel'

type Props = {
  readonly canSkip?: boolean
}
type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp & Props}, 'Screen'>

const ExploreClubsScreen: React.FC = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const {params} = useRoute<ScreenRouteProp>()
  const [selectedClubId, setSelectedClubId] = useState<string | undefined>()
  const bottomSheetRef = useRef<AppBottomSheet>(null)
  const navigation = useNavigation()
  const inset = useBottomSafeArea()

  const onClubSelect = useCallback((club) => {
    setSelectedClubId(club.id)
  }, [])

  const nextScreen = useCallback(() => {
    const state = storage.currentUser?.state
    const next =
      state === 'invited' ? 'RegistrationJoinedByScreen' : 'WaitingInviteScreen'
    navigation.dispatch(
      resetTo(next, {
        initialLink: params?.initialLink,
      }),
    )
  }, [navigation, params?.initialLink])

  const onJoinPress = async () => {
    analytics.sendEvent('explore_join_club_pressed', {})
    exploreStore.joinSelected()
    nextScreen()
  }

  const onSelectNonePress = useCallback(() => {
    nextScreen()
  }, [nextScreen])

  const closeClubBottomSheet = useCallback(() => {
    setSelectedClubId(undefined)
  }, [])

  const exploreStore = useViewModel(() => new ExploreClubsStore())

  const bottomContainerHeight = bottomInset(inset) + 48 + 16 + 32

  useEffect(() => {
    if (selectedClubId) return bottomSheetRef.current?.present()
    bottomSheetRef.current?.dismiss()
  }, [selectedClubId])

  useEffect(() => {
    exploreStore.load()
  }, [exploreStore])

  useEffect(() => {
    analytics.sendEvent('explore_clubs_screen_open')
    if (exploreStore.loading) showLoading()
    else hideLoading()
    if (!exploreStore.loading && exploreStore.clubs.length === 0)
      onSelectNonePress()
  }, [
    exploreStore.clubs,
    exploreStore.selected,
    exploreStore.loading,
    onSelectNonePress,
  ])

  const headerRight = useMemo(() => {
    if (params.canSkip === false) return undefined
    return (
      <InlineButton
        textStyle={[styles.buttonText]}
        title={t('skipButton')}
        onPress={onSelectNonePress}
        accessibilityLabel={'skipButton'}
      />
    )
  }, [onSelectNonePress, params.canSkip, t])

  return (
    <BottomSheetModalProvider>
      <View style={[commonStyles.wizardContainer, styles.container]}>
        <AppNavigationHeader topInset headerRight={headerRight} />
        <BaseFlatList<ClubModel>
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <AppText
                style={[
                  commonStyles.registrationBigTitle,
                  {color: colors.secondaryBodyText},
                ]}>
                {t('exploreClubsTitle')}
              </AppText>

              <AppText
                style={[styles.screenText, {color: colors.secondaryBodyText}]}>
                {t('exploreClubsText')}
              </AppText>
            </>
          }
          contentContainerStyle={{
            paddingBottom: bottomContainerHeight,
            marginHorizontal: ms(16),
            paddingTop: ms(40),
          }}
          data={exploreStore.clubs}
          renderItem={({item}) => (
            <SelectableClubListItem
              club={item}
              isSelected={exploreStore.isSelected(item)}
              onCheckSelect={exploreStore.onToggleSelect}
              onClubSelect={onClubSelect}
            />
          )}
        />

        <BottomGradientView height={bottomContainerHeight}>
          <View style={styles.buttonsContainer}>
            <PrimaryButton
              isEnabled={exploreStore.hasSelection()}
              style={commonStyles.wizardButton}
              accessibilityLabel={'joinButton'}
              onPress={onJoinPress}
              title={t('joinSelectedButton')}
            />
          </View>
        </BottomGradientView>

        <BaseInlineBottomSheet
          ref={bottomSheetRef}
          onDismiss={closeClubBottomSheet}>
          <ClubView
            clubId={selectedClubId ?? ''}
            isModal
            disabledLinks
            withCustomToolbar
            onGoBackPress={closeClubBottomSheet}
          />
        </BaseInlineBottomSheet>
      </View>
    </BottomSheetModalProvider>
  )
}

export default observer(ExploreClubsScreen)

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },

  screenText: {
    fontSize: ms(13),
    lineHeight: ms(21),
    textAlign: 'center',
    marginBottom: ms(24),
    paddingHorizontal: ms(16),
  },

  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
    marginBottom: 0,
  },

  secondaryButton: {
    ...commonStyles.wizardButton,
    marginTop: ms(16),
  },
  buttonText: {
    fontSize: ms(18),
    marginEnd: ms(10),
    fontWeight: '500',
  },
})
