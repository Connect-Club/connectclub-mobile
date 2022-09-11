import React from 'react'
import {useTranslation} from 'react-i18next'
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'

import AppIcon from '../../../../assets/AppIcon'
import {BottomPanelHeight} from '../../../../screens/MainFeedListScreenConsts'
import {useTheme} from '../../../../theme/appTheme'
import {bottomInset} from '../../../../utils/inset.utils'
import {ms} from '../../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../../utils/safeArea.utils'
import AppText from '../../../common/AppText'

interface Props {
  readonly isRefreshing: boolean
  readonly onRefresh: () => void
}

export const MainFeedEmptyListView: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const inset = useBottomSafeArea()
  const bottomContainerHeight = bottomInset(inset) + BottomPanelHeight

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: bottomContainerHeight,
        paddingHorizontal: ms(16),
      }}
      refreshControl={
        <RefreshControl
          refreshing={props.isRefreshing}
          onRefresh={props.onRefresh}
        />
      }>
      {props.children}
      {/* Если добавить цвет фона этой вью Huawei сломается ¯\_(ツ)_/¯ */}
      <View style={styles.base}>
        <AppIcon type={'icEmptyMainFeedCalendar'} />
        <AppText style={[styles.title, {color: colors.bodyText}]}>
          {t('mainFeedListEmpty')}
        </AppText>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  base: {
    height: ms(200),
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    textAlign: 'center',
    fontSize: ms(17),
    fontWeight: '600',
    lineHeight: ms(25),
  },
})
