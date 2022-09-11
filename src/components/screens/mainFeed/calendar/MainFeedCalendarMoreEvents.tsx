import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../../assets/AppIcon'
import {useTheme} from '../../../../theme/appTheme'
import {maxWidth, ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'
import AppTouchableOpacity from '../../../common/AppTouchableOpacity'
import Vertical from '../../../common/Vertical'

export const MainFeedCalendarMoreEvents: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()

  const floatingBackground = {backgroundColor: colors.floatingBackground}
  const textPrimary = {color: colors.thirdBlack}
  const buttonBackground = {backgroundColor: colors.accentSecondary}
  const buttonTitleColor = {color: colors.accentPrimary}

  return (
    <View style={[styles.base, {backgroundColor: colors.systemBackground}]}>
      <Vertical style={[styles.listItem, floatingBackground]}>
        <AppIcon type={'icEvent'} tint={colors.thirdBlack} />
        <AppText style={[styles.title, textPrimary]} numberOfLines={2}>
          {t('mainFeedCalendarMoreEventsTitle')}
        </AppText>
        <AppTouchableOpacity
          style={[styles.button, buttonBackground]}
          onPress={() => {
            navigation.navigate('UpcomingEventsScreen')
          }}>
          <AppText style={[styles.buttonTitle, buttonTitleColor]}>
            {t('goToUpcoming')}
          </AppText>
        </AppTouchableOpacity>
      </Vertical>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    width: maxWidth(),
    paddingHorizontal: ms(16),
  },

  listItem: {
    width: maxWidth() - ms(32),
    height: '100%',
    borderRadius: ms(12),
    padding: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: ms(13),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: ms(18),
    marginTop: ms(16),
  },

  button: {
    height: ms(28),
    paddingHorizontal: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(28) / 2,
    marginTop: ms(16),
  },

  buttonTitle: {
    fontSize: ms(12),
    fontWeight: '600',
  },
})
