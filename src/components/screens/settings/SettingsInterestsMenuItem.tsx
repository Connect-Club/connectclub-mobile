import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {storage} from '../../../storage'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly navigationRoot?: string
}

const SettingsInterestsMenuItem: React.FC<Props> = ({navigationRoot}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()

  return (
    <AppTouchableOpacity
      style={[styles.base, {backgroundColor: colors.floatingBackground}]}
      onPress={() =>
        navigation.navigate('SettingsSelectInterestsScreen', {navigationRoot})
      }>
      <AppText style={[styles.title, {color: colors.bodyText}]}>
        {t('settingsScreenInterests')}
      </AppText>
      <Horizontal style={commonStyles.alignCenter}>
        <AppText style={[styles.countText, {color: colors.secondaryBodyText}]}>
          {storage.currentUser?.interests?.length ?? 0}
        </AppText>
        <AppIcon type={'icArrowRight'} />
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default observer(SettingsInterestsMenuItem)

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
    height: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: ms(17),
    flex: 1,
  },

  countText: {
    fontSize: ms(17),
  },
})
