import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'

const AddModeratorsEmptyView: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View style={styles.base}>
      <AppIcon type={'icCommunity24'} tint={colors.thirdBlack} />
      <AppText style={[styles.text, {color: colors.secondaryBodyText}]}>
        {t('createEventAddModeratorsEmptyText')}
      </AppText>
    </View>
  )
}

export default memo(AddModeratorsEmptyView)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    width: ms(271),
    fontSize: ms(13),
    lineHeight: ms(18),
    marginTop: ms(22),
    textAlign: 'center',
  },
})
