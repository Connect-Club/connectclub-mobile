import React from 'react'
import {useTranslation} from 'react-i18next'
import {Linking, StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {faqLink, privacyPolicyLink, termsLink} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Vertical from '../../common/Vertical'

const SettingsLinksList: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const border = {borderBottomColor: colors.separator, borderBottomWidth: 1}
  const color = {color: colors.bodyText}

  return (
    <Vertical
      style={[styles.base, {backgroundColor: colors.floatingBackground}]}>
      <AppTouchableOpacity
        style={[styles.listItem, border]}
        onPress={() => Linking.openURL(faqLink)}>
        <AppText style={[styles.title, color]}>
          {t('settingsScreenFaq')}
        </AppText>
        <AppIcon type={'icExternalLink'} tint={colors.thirdIcons} />
      </AppTouchableOpacity>

      <AppTouchableOpacity
        style={[styles.listItem, border]}
        onPress={() => Linking.openURL(termsLink)}>
        <AppText style={[styles.title, color]}>
          {t('settingsScreenTerms')}
        </AppText>
        <AppIcon type={'icExternalLink'} tint={colors.thirdIcons} />
      </AppTouchableOpacity>

      <AppTouchableOpacity
        style={styles.listItem}
        onPress={() => Linking.openURL(privacyPolicyLink)}>
        <AppText style={[styles.title, color]}>
          {t('settingsScreenPolicy')}
        </AppText>
        <AppIcon type={'icExternalLink'} tint={colors.thirdIcons} />
      </AppTouchableOpacity>
    </Vertical>
  )
}

export default SettingsLinksList

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
  },

  title: {
    fontSize: ms(17),
    flex: 1,
  },

  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ms(48),
  },
})
