import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useContext} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, View} from 'react-native'

import AppNavigationHeader from '../components/common/AppNavigationHeader'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import TopContentGradientView from '../components/common/TopContentGradientView'
import WebModalHeader from '../components/common/WebModalHeader'
import InterestCategoriesList from '../components/screens/interests/InterestCategoriesList'
import NavigationTextButton from '../components/screens/mainFeed/NavigationTextButton'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import InterestsStore from '../stores/InterestsStore'
import {commonStyles} from '../theme/appTheme'
import {isNative, isWebOrTablet} from '../utils/device.utils'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {popupHeight} from '../utils/tablet.consts'

type ScreenRouteProp = RouteProp<
  {Screen: {navigationRoot?: string; isModal?: boolean}},
  'Screen'
>

const CommonSelectInterestsScreenModal: React.FC = () => {
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const inset = useBottomSafeArea()
  const store = useContext(InterestsStore)
  const {t} = useTranslation()

  const bottomContainerHeight =
    bottomInset(inset) + (isWebOrTablet() ? ms(88) : ms(70))

  const onAddPress = useCallback(() => {
    navigation.navigate('LocalCreateEventScreen', {
      selectedInterests: Array.from(store.selected.values()),
    })
  }, [])

  const clearButton = () => (
    <NavigationTextButton
      onPress={onClearPress}
      title={t('clearButton')}
      isEnabled={true}
    />
  )

  const onClearPress = useCallback(() => {
    store.resetSelection()
  }, [])

  const renderHeader = () => {
    return isNative ? (
      <AppNavigationHeader
        topInset={!params.isModal ?? true}
        headerRight={clearButton()}
        title={t('eventInterestsTitle')}
      />
    ) : (
      <WebModalHeader
        title={t('eventInterestsTitle')}
        subtitle={t('eventInterestsSubtitle')}
        headerRight={clearButton()}
      />
    )
  }

  return (
    <AppModal
      navigationRoot={params?.navigationRoot}
      transparent={false}
      contentStyle={styles.modal}>
      {renderHeader()}
      <View style={[commonStyles.wizardContainer, styles.container]}>
        <TopContentGradientView style={styles.base}>
          <InterestCategoriesList
            contentStyle={{
              ...commonStyles.wizardContainer,
              paddingBottom: bottomContainerHeight,
            }}
          />
        </TopContentGradientView>
      </View>
      <BottomGradientView height={bottomContainerHeight}>
        <View style={[styles.buttonsContainer, commonStyles.wizardContainer]}>
          <PrimaryButton
            style={[commonStyles.wizardButton]}
            onPress={onAddPress}
            title={t('saveButton')}
          />
        </View>
      </BottomGradientView>
    </AppModal>
  )
}

export default observer(CommonSelectInterestsScreenModal)

const styles = StyleSheet.create({
  modal: {
    padding: 0,
  },
  container: {
    ...Platform.select({
      web: {
        maxHeight: popupHeight,
      },
    }),
  },
  base: {
    width: '100%',
  },

  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
    ...Platform.select({
      web: {
        marginBottom: ms(32),
        marginTop: ms(32),
      },
      native: {
        height: ms(30),
      },
    }),
  },
  buttonText: {
    fontWeight: '500',
    fontSize: ms(18),
    lineHeight: ms(24),
    paddingEnd: ms(16),
  },
})
