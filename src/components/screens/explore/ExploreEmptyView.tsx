import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'

const ExploreEmptyView: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View style={styles.base}>
      <AppIcon type={'icEmptyExplore'} />
      <AppText style={[styles.title, {color: colors.bodyText}]}>
        {t('exploreEmptyTitle')}
      </AppText>
      <AppText style={[styles.text, {color: colors.secondaryBodyText}]}>
        {t('exploreEmptyText')}
      </AppText>
    </View>
  )
}

export default ExploreEmptyView

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...makeTextStyle(ms(17), ms(22), '600'),
    width: ms(271),
    lineHeight: ms(25),
    marginTop: ms(40),
    textAlign: 'center',
  },
  text: {
    width: ms(310),
    fontSize: ms(15),
    lineHeight: ms(22),
    marginTop: ms(16),
    textAlign: 'center',
  },
})
