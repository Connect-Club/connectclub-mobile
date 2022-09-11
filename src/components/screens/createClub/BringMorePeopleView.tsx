import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  onShareLink?: () => void
}

const BringMorePeopleView: React.FC<Props> = ({onShareLink}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  return (
    <View
      style={[
        commonStyles.alignCenter,
        styles.badge,
        {backgroundColor: colors.skeleton},
      ]}>
      <AppIcon
        style={styles.icon}
        type='icAddPeople'
        tint={colors.primaryClickable}
      />
      <AppText style={styles.badgeTitle}>
        {t('bringMorePeopleToTheClub')}
      </AppText>
      <AppTouchableOpacity
        onPress={onShareLink}
        style={[
          styles.badgeButton,
          {backgroundColor: colors.secondaryClickable},
        ]}>
        <AppText
          style={[styles.badgeSubtitle, {color: colors.primaryClickable}]}>
          {t('shareLinkToTheClub')}
        </AppText>
      </AppTouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  icon: {
    marginBottom: ms(6.67),
  },
  badge: {
    borderRadius: ms(8),
    paddingBottom: ms(16),
    paddingTop: ms(18.67),
    width: '100%',
    height: ms(127),
  },
  badgeTitle: {
    ...makeTextStyle(ms(15), ms(22.5), 'bold'),
    marginBottom: ms(8),
  },
  badgeSubtitle: {
    ...makeTextStyle(ms(12), ms(18), '600'),
  },
  badgeButton: {
    paddingHorizontal: ms(12),
    paddingVertical: ms(5),
    borderRadius: ms(100),
  },
})

export default memo(BringMorePeopleView)
