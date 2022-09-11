import {RouteProp, useRoute} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import SecondaryButton from '../components/common/SecondaryButton'
import Vertical from '../components/common/Vertical'
import MatchedContactsList from '../components/screens/matchedContactsScreen/MatchedContactsList'
import {UserModel} from '../models'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {associateBy} from '../utils/array.utils'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {makeUserVerified} from '../utils/profile.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {tabletContainerWidthLimit} from '../utils/tablet.consts'
import {toastHelper} from '../utils/ToastHelper'

type Selected = {[key: string]: UserModel}

type ScreenRouteProp = RouteProp<
  {Screen: {recommendations: Array<UserModel>}},
  'Screen'
>

const MatchedContactsScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()

  const bottomContainerHeight = 132 + bottomInset(inset)
  const [recommended, setRecommended] = useState<Array<UserModel>>([])
  const [selected, setSelected] = useState<Selected>({})
  const selectedCount = Object.keys(selected).length

  useEffect(() => {
    initialize()
  }, [])

  const initialize = async () => {
    const data: Selected = {}
    analytics.sendEvent('follow_friends_screen_open')
    params.recommendations.forEach((c) => (data[c.id] = c))
    setSelected(data)
    setRecommended(params.recommendations)
    hideLoading()
  }

  const onToggleSelect = (model: UserModel) => {
    let newSelected: Selected
    if (selected[model.id]) {
      analytics.sendEvent('follow_friends_remove')
      newSelected = {...selected}
      delete newSelected[model.id]
    } else {
      analytics.sendEvent('follow_friends_select')
      newSelected = {...selected, [model.id]: model}
    }
    setSelected(newSelected)
  }

  const onSelectDeselectAll = () => {
    if (selectedCount > 0) {
      analytics.sendEvent('follow_friends_no_one_click')
      return setSelected({})
    }
    const allUser = associateBy<string, UserModel>(
      recommended,
      (item) => item.id,
    )
    setSelected(allUser)
  }

  const onFollowsPress = async () => {
    const ids = Object.keys(selected)
    const isAllSelected = ids.length === params.recommendations.length
    analytics.sendEvent('follow_friends_follow_click', {
      count: ids.length,
      all_selected: isAllSelected,
    })
    await runWithLoaderAsync(async () => {
      if (ids.length > 0) {
        const followResponse = await api.follow(Object.keys(selected))
        if (followResponse.error) return toastHelper.error(followResponse.error)
      }
      await makeUserVerified()
    })
  }

  const buttonTitle =
    selectedCount > 0 ? 'matchedContactsOkButton' : 'connectNoOneButton'
  const listStyle: StyleProp<ViewStyle> = {
    justifyContent:
      params.recommendations?.length === 1 ? 'flex-start' : 'center',
    ...commonStyles.flexOne,
  }

  return (
    <View style={styles.base}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: bottomContainerHeight}}>
        <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
          {t('matchedContactsTitle')}
        </AppText>

        <AppText style={[styles.hint, {color: colors.secondaryBodyText}]}>
          {t('matchedContactsHint')}
        </AppText>

        <MatchedContactsList
          style={listStyle}
          onToggleSelect={onToggleSelect}
          selected={selected}
          contacts={recommended}
        />
      </ScrollView>

      <BottomGradientView height={bottomContainerHeight}>
        <Vertical style={styles.buttonsContainer}>
          <PrimaryButton
            style={[commonStyles.wizardButton]}
            onPress={onFollowsPress}
            accessibilityLabel={buttonTitle}
            title={t(buttonTitle)}
          />
          <SecondaryButton
            style={commonStyles.wizardButton}
            onPress={onSelectDeselectAll}
            title={
              selectedCount > 0 ? t('deselectAll') : t('findPeopleSelectAll')
            }
          />
        </Vertical>
      </BottomGradientView>
    </View>
  )
}

export default MatchedContactsScreen
const styles = StyleSheet.create({
  base: {
    ...commonStyles.paddingHorizontal,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    marginTop: ms(16),
  },
  scrollView: {
    maxWidth: tabletContainerWidthLimit,
    width: '100%',
  },
  title: {
    width: '100%',
    fontSize: ms(24),
    textAlign: 'center',
    fontWeight: 'bold',
  },

  avatarContainer: {
    width: ms(150),
    height: ms(150),
    borderRadius: ms(10000),
    overflow: 'hidden',
  },

  avatar: {
    width: ms(150),
    height: ms(150),
  },

  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
  },

  hint: {
    width: '100%',
    ...makeTextStyle(16, 24, 'normal'),
    marginTop: ms(16),
    textAlign: 'center',
    marginBottom: ms(36),
  },
})
