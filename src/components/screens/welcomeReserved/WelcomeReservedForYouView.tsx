import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {storage} from '../../../storage'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import AppText from '../../common/AppText'
import FlexSpace from '../../common/FlexSpace'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'

interface Props {
  readonly onSignInPress: () => void
  readonly onExploreClubsPress: () => void
}

const WelcomeReservedForYouView: React.FC<Props> = ({
  onSignInPress,
  onExploreClubsPress,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const inset = Math.max(useBottomSafeArea(), ms(16))

  return (
    <View style={styles.base}>
      <Vertical style={commonStyles.wizardContentWrapper}>
        <AppText style={[styles.title, {color: colors.accentPrimary}]}>
          @{storage.currentUser?.username}
        </AppText>
        <AppText style={[styles.title, {color: colors.bodyText}]}>
          {t('waitingReservedForYou')}
        </AppText>

        <AppText
          style={[styles.description, {color: colors.secondaryBodyText}]}>
          {t('waitingDescription')}
        </AppText>

        <Spacer vertical={ms(20)} />

        <PrimaryButton
          style={{backgroundColor: colors.accentSecondary}}
          textStyle={[styles.exportClubsText, {color: colors.accentPrimary}]}
          title={t('exploreClubsTitle')}
          onPress={onExploreClubsPress}
          accessibilityLabel={'exploreClubsButton'}
        />

        <FlexSpace />

        <PrimaryButton
          title={t('check')}
          onPress={onSignInPress}
          accessibilityLabel={'waitingSignInButton'}
        />
        <Spacer vertical={ms(16)} />
        <AppText style={[styles.checkText, {color: colors.secondaryBodyText}]}>
          {t('checkRequestApproved')}
        </AppText>
        <Spacer vertical={inset} />
      </Vertical>
    </View>
  )
}

export default WelcomeReservedForYouView

const styles = StyleSheet.create({
  base: {
    height: '100%',
    paddingTop: ms(130),
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: ms(34),
    fontWeight: 'bold',
  },
  description: {
    fontSize: ms(13),
    textAlign: 'center',
    lineHeight: ms(21),
    marginTop: ms(32),
    marginHorizontal: ms(32),
  },
  exportClubsText: {
    ...makeTextStyle(18, 22, 'bold'),
  },
  checkText: {
    ...makeTextStyle(14, 16, 'normal'),
  },
})
