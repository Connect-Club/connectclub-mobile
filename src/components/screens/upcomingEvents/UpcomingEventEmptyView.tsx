import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Vertical from '../../common/Vertical'

interface Props {
  readonly isRefreshing: boolean
  readonly onRefresh: () => void
}

const UpcomingEventEmptyView: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  return (
    <Vertical style={commonStyles.flexOne}>
      <ScrollView
        contentContainerStyle={commonStyles.flexOne}
        refreshControl={
          <RefreshControl
            refreshing={props.isRefreshing}
            onRefresh={props.onRefresh}
          />
        }>
        <View style={styles.container}>
          <AppIcon type={'icOpenedHands'} />
          <AppText style={[styles.title, {color: colors.bodyText}]}>
            {t('upcomingEventsScreenEmptyViewTitle')}
          </AppText>
        </View>
      </ScrollView>
    </Vertical>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ms(90),
  },
  title: {
    fontSize: ms(17),
    lineHeight: ms(25),
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: ms(234),
    marginTop: ms(12),
  },
})

export default memo(UpcomingEventEmptyView)
