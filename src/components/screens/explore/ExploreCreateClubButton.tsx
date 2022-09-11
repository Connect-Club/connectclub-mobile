import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppText from 'src/components/common/AppText'
import AppTouchableOpacity from 'src/components/common/AppTouchableOpacity'
import Horizontal from 'src/components/common/Horizontal'

import {ms} from 'src/utils/layout.utils'

import AppIcon from 'src/assets/AppIcon'
import {commonStyles, makeTextStyle, useTheme} from 'src/theme/appTheme'

type Props = {
  onPress: () => void
}

const ExploreCreateClubButton: React.FC<Props> = ({onPress}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <AppTouchableOpacity
      onPress={onPress}
      style={[
        styles.clickableContainer,
        {backgroundColor: colors.floatingBackground},
      ]}>
      <Horizontal style={styles.content}>
        <Horizontal style={commonStyles.alignCenter}>
          <AppIcon
            type='icCreateClub'
            tint={colors.primaryClickable}
            style={styles.contentIcon}
          />
          <AppText style={styles.text}>{t('createClubButton')}</AppText>
        </Horizontal>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: colors.secondaryClickable},
          ]}>
          <AppIcon type='icArrowRight' tint={colors.primaryClickable} />
        </View>
      </Horizontal>
    </AppTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clickableContainer: {
    marginBottom: ms(16),
    borderRadius: ms(8),
    height: ms(52),
  },
  content: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    paddingLeft: ms(21.07),
    paddingRight: ms(12),
  },
  contentIcon: {
    marginRight: ms(20.93),
  },
  text: {
    ...makeTextStyle(ms(16), ms(16), 'bold'),
  },
  iconContainer: {
    borderRadius: ms(50),
    width: ms(28),
    height: ms(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ExploreCreateClubButton
