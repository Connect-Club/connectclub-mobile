import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../../../Analytics'
import {FullUserModel} from '../../../models'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {useOpenUrl} from '../../../utils/deeplink/deeplink.utils'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import MarkdownHyperlink from './MarkdownHyperlink'

interface Props {
  readonly user: FullUserModel
  readonly allowToEdit: boolean
  readonly onPress: () => void
}

const BioView: React.FC<Props> = ({user, onPress, allowToEdit}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const about = user.about?.trim()
  const secondaryColor = {color: colors.secondaryBodyText}
  const openUrl = useOpenUrl()
  const onLinkPress = useCallback(
    (url) => {
      analytics.sendEvent('bio_link_open', {url})
      openUrl(url)
    },
    [openUrl],
  )

  if (!allowToEdit) {
    return (
      <MarkdownHyperlink
        linkStyle={commonStyles.link}
        style={[styles.button, secondaryColor]}
        onPress={onLinkPress}
        accessibilityLabel={'bio'}>
        <AppText style={styles.bioText}>{about}</AppText>
      </MarkdownHyperlink>
    )
  }

  return (
    <AppTouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityLabel={'addBioButton'}>
      {about?.length === 0 && (
        <AppText style={[styles.buttonText, {color: colors.accentPrimary}]}>
          {t('addBioButton')}
        </AppText>
      )}

      {!!about && about.length > 0 && (
        <MarkdownHyperlink linkStyle={commonStyles.link} onPress={onLinkPress}>
          <AppText style={[styles.bioText, {color: colors.bodyText}]}>
            {about}
          </AppText>
        </MarkdownHyperlink>
      )}
    </AppTouchableOpacity>
  )
}

export default observer(BioView)

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
    marginTop: ms(16),
    paddingBottom: ms(16),
    marginBottom: ms(16),
  },

  buttonText: {
    fontWeight: '600',
    fontSize: ms(15),
  },

  bioText: {
    fontSize: ms(15),
    lineHeight: ms(24),
  },

  base: {},

  container: {
    height: '100%',
    paddingTop: ms(100),
  },
})
