import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import {ExploreSearchMode} from '../../../stores/ExploreSearchStore'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

type Props = {
  readonly selectedMode: ExploreSearchMode
  readonly onSearchModeChange?: (mode: ExploreSearchMode) => void
  readonly style?: StyleProp<ViewStyle>
}

const makeTabStyle = (isActivated: boolean) => {
  if (isActivated) {
    return {backgroundColor: 'white'}
  }
  return {}
}

const ExploreTabsView: React.FC<Props> = ({
  selectedMode,
  onSearchModeChange,
  style,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const onPeoplePressed = useCallback(() => {
    if (selectedMode === 'people') return
    onSearchModeChange?.('people')
  }, [selectedMode, onSearchModeChange])

  const onClubsPressed = useCallback(() => {
    if (selectedMode === 'clubs') return
    onSearchModeChange?.('clubs')
  }, [selectedMode, onSearchModeChange])

  const containerStyle: StyleProp<ViewStyle> = {
    backgroundColor: colors.separator,
    ...styles.container,
  }

  return (
    <Horizontal style={[containerStyle, style]}>
      <View style={commonStyles.flexOne}>
        <AppTouchableOpacity
          style={[
            styles.tab,
            commonStyles.flexCenter,
            makeTabStyle(selectedMode === 'people'),
          ]}
          accessibilityLabel={'tabSearchPeople'}
          onPress={onPeoplePressed}>
          <AppText style={[styles.tabText]}>{t('People')}</AppText>
        </AppTouchableOpacity>
      </View>
      <View style={commonStyles.flexOne}>
        <AppTouchableOpacity
          style={[
            styles.tab,
            commonStyles.flexCenter,
            makeTabStyle(selectedMode === 'clubs'),
          ]}
          accessibilityLabel={'tabSearchClubs'}
          onPress={onClubsPressed}>
          <AppText style={styles.tabText}>{t('Clubs')}</AppText>
        </AppTouchableOpacity>
      </View>
    </Horizontal>
  )
}

const styles = StyleSheet.create({
  container: {
    height: ms(32),
    borderRadius: ms(9),
    marginStart: ms(16),
    marginEnd: ms(16),
    marginTop: ms(12),
    marginBottom: ms(24),
  },
  tab: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    margin: ms(2),
    borderRadius: ms(7),
    shadowOpacity: 0.12,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: ms(3)},
    shadowRadius: ms(2),
  },
  tabText: {
    ...makeTextStyle(ms(13), ms(20), '600'),
  },
})

export default observer(ExploreTabsView)
