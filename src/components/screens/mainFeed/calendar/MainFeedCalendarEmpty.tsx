import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../../assets/AppIcon'
import {useTheme} from '../../../../theme/appTheme'
import {maxWidth, ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'

const MainFeedCalendarEmpty: React.FC = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  return (
    <View style={[styles.base, {backgroundColor: colors.systemBackground}]}>
      <AppIcon type={'icEmptyMainFeedCalendar'} />
      <AppText style={[styles.title, {color: colors.bodyText}]}>
        {t('mainFeedCalendarEmpty')}
      </AppText>
    </View>
  )
}

export default MainFeedCalendarEmpty

const styles = StyleSheet.create({
  base: {
    width: maxWidth(),
    height: ms(200),
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: -ms(16),
  },

  title: {
    textAlign: 'center',
    fontSize: ms(17),
    fontWeight: '600',
    lineHeight: ms(25),
  },
})
