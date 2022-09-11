import {RouteProp, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {Paginated} from '../api/httpClient'
import {showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import BaseFlatList from '../components/common/BaseFlatList'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import SecondaryButton from '../components/common/SecondaryButton'
import FindPeopleListItem from '../components/screens/findPeople/FindPeopleListItem'
import {UserModel} from '../models'
import {FindPeopleStore} from '../stores/FindPeopleStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {makeUserVerified} from '../utils/profile.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<
  {Screen: {data: Paginated<UserModel>}},
  'Screen'
>

const FindPeopleScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const usersStore = useViewModel(() => new FindPeopleStore(params.data))
  const bottomContainerHeight = bottomInset(inset) + 48 + 16 + 48 + 32

  useEffect(() => {
    analytics.sendEvent('follow_people_screen_open')
  }, [])

  const onNextPress = async () => {
    if (usersStore.selectedCount > 0) {
      analytics.sendEvent('follow_people_follow_click', {
        count: usersStore.selectedCount,
        all_selected: usersStore.selectedCount === usersStore.users.length,
      })
    } else {
      analytics.sendEvent('follow_people_no_one_click')
    }
    showLoading()
    await usersStore.sendFollowPeople()
    await makeUserVerified()
  }

  let buttonTitle = 'connectNoOneButton'
  let secondaryButtonTitle = 'findPeopleSelectAll'
  if (usersStore.selectedCount > 0) {
    buttonTitle = 'findPeopleConnectButton'
    secondaryButtonTitle = 'deselectAll'
  }

  const onSelectPress = () => {
    if (usersStore.selectedCount > 0) {
      analytics.sendEvent('follow_people_individually_click')
      usersStore.resetSelection()
      return
    }
    analytics.sendEvent('follow_people_all_click')
    usersStore.selectAll()
  }
  return (
    <View style={commonStyles.wizardContainer}>
      <BaseFlatList<UserModel>
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
            {t('findPeopleTitle')}
          </AppText>
        }
        contentContainerStyle={{
          paddingBottom: bottomContainerHeight,
          marginHorizontal: ms(16),
        }}
        data={usersStore.users.slice()}
        renderItem={({item}) => (
          <FindPeopleListItem
            onSelect={usersStore.onToggleSelect}
            user={item}
            isSelected={usersStore.isSelected(item)}
          />
        )}
      />

      <BottomGradientView height={bottomContainerHeight}>
        <View style={styles.buttonsContainer}>
          <PrimaryButton
            style={commonStyles.wizardButton}
            onPress={onNextPress}
            accessibilityLabel={buttonTitle}
            title={t(buttonTitle)}
          />
          <SecondaryButton
            style={styles.secondaryButton}
            onPress={onSelectPress}
            accessibilityLabel={secondaryButtonTitle}
            title={t(secondaryButtonTitle)}
          />
        </View>
      </BottomGradientView>
    </View>
  )
}

export default observer(FindPeopleScreen)
const styles = StyleSheet.create({
  title: {
    width: '100%',
    fontSize: ms(24),
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: ms(32),
  },
  hintText: {
    fontSize: ms(12),
    marginTop: ms(8),
  },
  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
  },
  secondaryButton: {
    ...commonStyles.wizardButton,
    marginTop: ms(16),
  },
})
