import {observer} from 'mobx-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native'

import {analytics} from '../../../Analytics'
import {storage} from '../../../storage'
import UpcomingEventStore from '../../../stores/UpcomingEventStore'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {useOpenUrl} from '../../../utils/deeplink/deeplink.utils'
import {ms} from '../../../utils/layout.utils'
import {useNftWallet} from '../../../utils/NftWalletProvider'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import SecondaryButton from '../../common/SecondaryButton'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'
import {logJS} from '../room/modules/Logger'

interface Props {
  readonly store: UpcomingEventStore
}

const EventNftNoticeView: React.FC<Props> = ({store}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const wallet = useNftWallet()
  const event = store.event
  const eventId = event?.id
  const openUrl = useOpenUrl()

  // refresh event information once wallet is bound
  useEffect(() => {
    if (store.isInitializing) return
    if (store.isReset || !eventId || !wallet.isBound) return
    logJS('debug', 'EventNftNoticeView', 'refresh event because become bound')
    store.init(eventId, true)
  }, [eventId, store, wallet.isBound])

  if (!event) return null
  if (!event.withToken) return null

  const hasWalletConnected = !!storage.currentUser?.wallet

  const baseBgColor: StyleProp<ViewStyle> = {
    backgroundColor: colors.accentSecondary,
  }
  const textColor: StyleProp<TextStyle> = {
    color: colors.primaryClickable,
  }
  const showActions = !hasWalletConnected || !event.isOwnerToken
  let subtitle: string
  if (hasWalletConnected && event.isOwnerToken) {
    subtitle = 'eventForClubsNftHoldersHasAccess'
  } else if (hasWalletConnected) {
    subtitle = 'eventForClubsNftHoldersNoToken'
  } else {
    subtitle = 'eventForClubsNftHoldersSubtitle'
  }
  const primaryActionTitle = hasWalletConnected
    ? t('moreDetails')
    : t('addWallet')
  const secondaryButtonColor = {
    backgroundColor: colors.secondaryClickable,
  }

  const onAddWalletPress = async () => {
    logJS('debug', 'EventNftNoticeView', 'add wallet click')
    analytics.sendEvent('click_add_wallet')
    await wallet.ref.current!.connect()
    await wallet.ref.current!.bind()
    logJS('debug', 'EventNftNoticeView', 'wallet connection finished')
  }

  const onViewDetailsPress = () => {
    logJS('debug', 'EventNftNoticeView', 'view nft holders details info')
    analytics.sendEvent('click_view_nft_holders_details')
    if (!event.tokenLandingUrlInformation) {
      logJS('warning', 'EventNftNoticeView', 'no nft holders link to follow!')
      return
    }
    logJS(
      'debug',
      'EventNftNoticeView',
      'follow link',
      event.tokenLandingUrlInformation,
    )
    openUrl(event.tokenLandingUrlInformation)
  }

  const onPrimaryActionPress = () => {
    logJS('debug', 'EventNftNoticeView', 'primary action click')
    if (hasWalletConnected) {
      onViewDetailsPress()
      return
    }
    onAddWalletPress()
  }

  return (
    <Vertical style={[styles.base, baseBgColor]}>
      <AppText style={[styles.title, textColor]}>
        {t('eventForClubsNftHoldersTitle')}
      </AppText>
      <AppText style={[styles.subtitle, textColor]}>{t(subtitle)}</AppText>
      {showActions && (
        <Horizontal style={styles.buttonsContainer}>
          <PrimaryButton
            style={styles.accentButton}
            textStyle={styles.accentButtonText}
            onPress={onPrimaryActionPress}
            title={primaryActionTitle}
          />
          {!hasWalletConnected && (
            <>
              <Spacer horizontal={ms(8)} />
              <SecondaryButton
                style={[styles.secondaryButton, secondaryButtonColor]}
                textStyle={styles.accentButtonText}
                title={t('moreDetails')}
                onPress={onViewDetailsPress}
              />
            </>
          )}
        </Horizontal>
      )}
    </Vertical>
  )
}

export default observer(EventNftNoticeView)

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(8),
    padding: ms(16),
    alignItems: 'center',
    marginTop: ms(8),
    marginHorizontal: ms(14),
  },
  title: {
    ...makeTextStyle(14, 16, 'bold'),
  },
  subtitle: {
    ...makeTextStyle(12, 18, 'normal'),
    marginTop: ms(8),
    textAlign: 'center',
    paddingHorizontal: ms(16),
  },
  buttonsContainer: {
    marginTop: ms(17),
  },
  accentButton: {
    borderRadius: ms(14),
    maxHeight: ms(28),
    minWidth: undefined,
  },
  secondaryButton: {
    borderRadius: ms(14),
    maxHeight: ms(28),
    minWidth: undefined,
  },
  accentButtonText: {
    ...makeTextStyle(12, 18, 'normal'),
  },
})
