import React from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet} from 'react-native'

import {ms} from '../../../utils/layout.utils'
import InviteBlockView from '../../common/InviteBlockView'
import Vertical from '../../common/Vertical'
import DiscordBannerView from './DiscordBannerView'
import FestivalBannerView from './FestivalBannerView'
import MainFeedSectionTitle from './MainFeedSectionTitle'

const MainFeedListHeader: React.FC = ({children}) => {
  const {t} = useTranslation()
  return (
    <Vertical>
      {Platform.OS !== 'web' && <FestivalBannerView />}
      <InviteBlockView
        style={styles.inviteBlock}
        title={t('growNetworkBlockTitle')}
        text={t('growNetworkBlockText')}
        closable
        icon={'icHasInvites'}
        accessibilitySuffix={'Main'}
      />
      <DiscordBannerView />

      {children}
      <MainFeedSectionTitle title={t('ongoing')} showGreenCircle />
    </Vertical>
  )
}

const styles = StyleSheet.create({
  inviteBlock: {
    marginTop: ms(12),
    marginBottom: ms(24),
  },
})

export default MainFeedListHeader
