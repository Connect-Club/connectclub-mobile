import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {BottomPanelHeight} from '../../../screens/MainFeedListScreenConsts'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {bottomInset} from '../../../utils/inset.utils'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import AppText from '../../common/AppText'

interface Props {
  readonly isRefreshing: boolean
  readonly onRefresh: () => void
}

const MainFeedEmptyView: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const inset = useBottomSafeArea()
  const bottomContainerHeight = bottomInset(inset) + BottomPanelHeight

  return (
    <ScrollView
      contentContainerStyle={commonStyles.flexOne}
      refreshControl={
        <RefreshControl
          refreshing={props.isRefreshing}
          onRefresh={props.onRefresh}
        />
      }>
      <View style={commonStyles.flexOne}>
        <View style={[styles.container, {marginBottom: bottomContainerHeight}]}>
          <AppIcon type={'icWaveHand'} />
          <AppText style={[styles.title, {color: colors.bodyText}]}>
            {t('mainScreenEmptyViewTitle')}
          </AppText>
          <AppText style={[styles.description, {color: colors.bodyText}]}>
            {t('mainScreenEmptyViewDescription')}
          </AppText>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: ms(17),
    lineHeight: ms(25),
    fontWeight: 'bold',
    marginTop: ms(16),
  },
  description: {
    fontSize: ms(15),
    lineHeight: ms(24),
    marginTop: ms(8),
    maxWidth: ms(260),
    textAlign: 'center',
  },
})

export default memo(MainFeedEmptyView)
