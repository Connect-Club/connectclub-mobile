import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

export type Selection = 'people' | 'requests'

type Props = {
  readonly selection: Selection
  readonly onSelectionChange?: (selection: Selection) => void
  readonly style?: StyleProp<ViewStyle>
  readonly counter: number
}

const ClubMembersTabs: React.FC<Props> = ({
  selection,
  onSelectionChange,
  style,
  counter,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const onPeoplePressed = useCallback(() => {
    if (selection === 'people') return
    onSelectionChange?.('people')
  }, [onSelectionChange, selection])

  const onClubsPressed = useCallback(() => {
    if (selection === 'requests') return
    onSelectionChange?.('requests')
  }, [onSelectionChange, selection])

  const activeTabUnderlineStyle = [
    styles.activeTabUnderline,
    {backgroundColor: colors.primaryClickable},
  ]

  const makeTabStyle = (tab: Selection) => {
    if (tab === selection) return {color: colors.accentPrimary}
    return {color: colors.thirdBlack}
  }

  return (
    <Horizontal style={[styles.container, style]}>
      <AppTouchableOpacity
        style={[styles.tab, commonStyles.flexCenter]}
        accessibilityLabel={'membersTabPeople'}
        onPress={onPeoplePressed}>
        <AppText style={[styles.tabText, makeTabStyle('people')]}>
          {t('membersTabPeople')}
        </AppText>
        {selection === 'people' && <View style={activeTabUnderlineStyle} />}
      </AppTouchableOpacity>
      <Horizontal style={[commonStyles.flexCenter]}>
        <AppTouchableOpacity
          style={[styles.tab, commonStyles.flexCenter]}
          accessibilityLabel={'membersTabModerate'}
          onPress={onClubsPressed}>
          <AppText style={[styles.tabText, makeTabStyle('requests')]}>
            {t('membersTabModerate')}
          </AppText>
          {selection === 'requests' && <View style={activeTabUnderlineStyle} />}
        </AppTouchableOpacity>
        {counter > 0 && (
          <View
            style={[
              styles.counter,
              {
                backgroundColor: colors.accentPrimary,
              },
            ]}>
            <AppText
              style={[
                styles.counterText,
                {
                  color: colors.floatingBackground,
                },
              ]}>
              {counter > 9 ? '9+' : counter}
            </AppText>
          </View>
        )}
      </Horizontal>
    </Horizontal>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: ms(42),
    justifyContent: 'center',
    borderRadius: ms(9),
    marginStart: ms(16),
    marginEnd: ms(16),
    marginTop: ms(12),
  },
  tabContainer: {},
  tab: {
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: ms(16),
  },
  tabTouchable: {
    height: '100%',
  },
  activeTabUnderline: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    height: ms(2),
  },
  tabText: {
    ...makeTextStyle(ms(15), ms(18), '600'),
  },
  counter: {
    width: ms(16),
    height: ms(16),
    borderRadius: ms(16),
    ...commonStyles.flexCenter,
    marginStart: ms(-10),
  },
  counterText: {
    fontSize: ms(9),
    fontWeight: '700',
    lineHeight: ms(10),
  },
})

export default observer(ClubMembersTabs)
