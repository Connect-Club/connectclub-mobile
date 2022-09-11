import React from 'react'
import {useTranslation} from 'react-i18next'
import {ScrollView, StyleSheet, View} from 'react-native'
import {isTablet} from 'react-native-device-info'

import {ClubModel} from '../../../models'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'

interface Props {
  readonly onSignInPress: () => void
  readonly onExploreClubsPress: () => void
  readonly club: ClubModel
}

const WelcomeRequestSentView: React.FC<Props> = ({
  onSignInPress,
  onExploreClubsPress,
  club,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const inset = Math.max(useBottomSafeArea(), ms(16))

  return (
    <View style={styles.base}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Vertical
          style={[styles.contentContainer, commonStyles.wizardContentWrapper]}>
          <AppAvatar
            shortName={''}
            avatar={club.avatar}
            style={styles.avatar}
            size={ms(180)}
          />
          <AppText style={[styles.clubTitle, {color: colors.bodyText}]}>
            {t('clubRegistrationRequestClubTitle', {
              club: club.title,
            })}
          </AppText>

          <View style={styles.byContainer}>
            <AppText style={[styles.byText, {color: colors.bodyText}]}>
              {t('clubOwnerLabel')}
            </AppText>
            <AppAvatar
              style={styles.ownerAvatar}
              shortName={shortFromDisplayName(club.owner.displayName)}
              avatar={club.owner.avatar}
              size={ms(16)}
            />
            <AppText style={styles.ownerNameText}>
              {club.owner.displayName}
            </AppText>
          </View>

          <AppText style={[styles.subtitle, {color: colors.bodyText}]}>
            {t('clubRegistrationRequestTitle')}
          </AppText>

          <AppText style={[styles.requestNote, {color: colors.bodyText}]}>
            {t('clubRegistrationRequestNote')}
          </AppText>

          <Spacer vertical={ms(20)} />

          <PrimaryButton
            style={{backgroundColor: colors.accentSecondary}}
            textStyle={[styles.exportClubsText, {color: colors.accentPrimary}]}
            title={t('exploreClubsTitle')}
            onPress={onExploreClubsPress}
            accessibilityLabel={'exploreClubsButton'}
          />
          <Spacer vertical={ms(48)} />
        </Vertical>
      </ScrollView>
      <PrimaryButton
        style={styles.singInButton}
        title={t('check')}
        onPress={onSignInPress}
        accessibilityLabel={'waitingClubSignInButton'}
      />
      <Spacer vertical={ms(16)} />
      <AppText style={[styles.checkText, {color: colors.secondaryBodyText}]}>
        {t('checkRequestApproved')}
      </AppText>
      <Spacer vertical={inset} />
    </View>
  )
}

export default WelcomeRequestSentView

const styles = StyleSheet.create({
  base: {
    height: '100%',
  },
  scroll: {
    marginBottom: ms(56),
  },
  contentContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: isTablet() ? 'center' : 'flex-start',
    paddingTop: ms(100),
  },
  avatar: {
    width: ms(180),
    height: ms(180),
  },
  subtitle: {
    marginTop: ms(26),
    fontSize: ms(17),
    lineHeight: ms(22),
    fontWeight: 'bold',
  },
  clubTitle: {
    maxWidth: '100%',
    marginTop: ms(16),
    fontSize: ms(34),
    lineHeight: ms(40),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    width: '100%',
    marginTop: ms(16),
    fontSize: ms(15),
    lineHeight: ms(24),
  },
  requestNote: {
    fontSize: ms(15),
    lineHeight: ms(24),
    fontWeight: '400',
    marginTop: ms(8),
  },
  singInButtonText: {
    fontSize: ms(18),
  },
  singInButton: {
    maxWidth: ms(205),
    alignSelf: 'center',
  },
  byText: {
    ...makeTextStyle(ms(12), ms(16)),
  },
  ownerNameText: {
    ...makeTextStyle(ms(12), ms(16), 'bold'),
  },
  ownerAvatar: {
    marginHorizontal: ms(4),
  },
  byContainer: {
    flexDirection: 'row',
    marginTop: ms(5),
  },
  checkText: {
    ...makeTextStyle(14, 16, 'normal'),
    alignSelf: 'center',
  },
  exportClubsText: {
    ...makeTextStyle(18, 22, 'bold'),
  },
})
